import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json({ limit: "1mb" }));

// === VPS Config (1 core / 4GB) ===
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY || "1", 10);
const NAV_TIMEOUT_MS = parseInt(process.env.NAV_TIMEOUT_MS || "35000", 10);
const PORT = parseInt(process.env.PORT || "3005", 10);

// === Persistent Browser ===
// One browser for the entire process lifetime. No launch/close per request.
let browserInstance = null;

async function killBrowser() {
  if (browserInstance) {
    try { await browserInstance.close(); } catch (_) { /* ignore */ }
    browserInstance = null;
  }
}

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  // Kill dead instance if any
  await killBrowser();
  console.log("[scraper] Launching persistent browser...");
  browserInstance = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--mute-audio",
      "--no-first-run",
      "--no-zygote",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--js-flags=--max-old-space-size=512"
    ]
  });
  browserInstance.on("disconnected", () => {
    console.log("[scraper] Browser disconnected, will relaunch on next request");
    browserInstance = null;
  });
  console.log("[scraper] Browser ready.");
  return browserInstance;
}

// Concurrency limiter (in-memory queue)
let active = 0;
const queue = [];
function runWithLimit(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    pump();
  });
}
async function pump() {
  if (active >= MAX_CONCURRENCY) return;
  const job = queue.shift();
  if (!job) return;
  active++;
  try {
    const out = await job.fn();
    job.resolve(out);
  } catch (e) {
    job.reject(e);
  } finally {
    active--;
    pump();
  }
}

function normalizeText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

app.get("/health", async (req, res) => {
  const connected = browserInstance?.isConnected() ?? false;
  res.json({ ok: true, active, queued: queue.length, max: MAX_CONCURRENCY, browserConnected: connected });
});

// Helper: scrape a single URL with a given browser instance
async function doScrape(browser, url, mode, opts = {}) {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
  page.setDefaultTimeout(NAV_TIMEOUT_MS);

  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
    const status = resp?.status?.() ?? null;
    await page.waitForTimeout(800);

    if (mode === "cotacao") {
      // Wait for the price table to render (JS-loaded)
      await page.waitForSelector("table", { timeout: 15000 }).catch(() => { });
      await page.waitForTimeout(1500); // extra time for data hydration

      const data = await page.evaluate(() => {
        const tables = document.querySelectorAll("table");
        if (!tables.length) return { rows: [], updated: null, unit: null, title: null };

        // Get page title for context
        const pageTitle = document.querySelector("h1, h2, .titulo-cotacao, .title")?.textContent?.trim() || "";

        // Find the main cotação table (the one with price data)
        let bestTable = null;
        for (const t of tables) {
          const headerText = t.querySelector("thead, tr:first-child")?.textContent || "";
          if (/pre[çc]o|praça|estados/i.test(headerText)) {
            bestTable = t;
            break;
          }
        }
        if (!bestTable) bestTable = tables[0];

        // Extract unit from header (e.g., "Preço (R$/sc)" → "R$/sc")
        const headerCells = bestTable.querySelectorAll("thead th, thead td, tr:first-child th, tr:first-child td");
        let unit = null;
        for (const th of headerCells) {
          const m = th.textContent.match(/\(([^)]+)\)/);
          if (m) { unit = m[1].trim(); break; }
        }

        // Extract data rows (skip header row)
        const rows = [];
        const allRows = bestTable.querySelectorAll("tbody tr, tr");
        for (const tr of allRows) {
          const cells = tr.querySelectorAll("td");
          if (cells.length < 2) continue;

          const praca = (cells[0]?.textContent || "").trim();
          const priceText = (cells[1]?.textContent || "").trim();
          const changeText = cells[2] ? (cells[2]?.textContent || "").trim() : "0";

          // Skip header-like rows or empty rows
          if (!praca || /praça|estados|pre[çc]o/i.test(praca)) continue;
          // Skip date/footer rows
          if (/atualizado|referência|histórico/i.test(praca)) continue;

          rows.push({ praca, price: priceText, change: changeText });
        }

        // Extract update date
        const pageText = document.body.innerText || "";
        const dateMatch = pageText.match(/atualizado\s+em[:\s]*([\d\/]+)/i);
        const updated = dateMatch ? dateMatch[1] : null;

        return { rows, updated, unit, title: pageTitle };
      });

      // Parse Brazilian number format: "65,00" → 65.00
      const parseNum = (s) => {
        if (!s) return null;
        const clean = s.replace(/\./g, "").replace(",", ".").replace(/[^\d.\-]/g, "");
        const n = parseFloat(clean);
        return isNaN(n) ? null : n;
      };

      // Parse date: "11/02/2026" → "2026-02-11"
      const parseDate = (s) => {
        if (!s) return null;
        const parts = s.split("/");
        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        return s;
      };

      const parsedRows = data.rows.map(r => ({
        praca: r.praca,
        price: parseNum(r.price),
        change_pct: parseNum(r.change),
      }));

      // If a specific praca was requested, filter
      const target = opts.praca;
      let filtered = parsedRows;
      if (target) {
        const needle = target.toLowerCase();
        filtered = parsedRows.filter(r =>
          r.praca.toLowerCase().includes(needle)
        );
      }

      return {
        ok: true, mode, url, status,
        title: data.title,
        unit: data.unit,
        quote_date: parseDate(data.updated),
        all_rows: target ? undefined : parsedRows,
        rows: filtered,
        total_rows: parsedRows.length,
      };
    }

    if (mode === "links") {
      const links = await page.evaluate(() => {
        const out = [];
        const aTags = Array.from(document.querySelectorAll("a[href]"));
        for (const a of aTags) {
          const href = a.getAttribute("href") || "";
          const text = (a.textContent || "").trim();
          if (!href) continue;
          if (text.length < 15) continue;
          out.push({ href, text });
        }
        return out.slice(0, 200);
      });
      return { ok: true, mode, url, status, links };
    }

    // Article mode — evaluated inside page context, same as before
    const data = await page.evaluate(() => {
      const title =
        document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
        document.querySelector("h1")?.textContent?.trim() ||
        document.title || "";
      const canonical =
        document.querySelector("link[rel='canonical']")?.getAttribute("href") || "";
      const published =
        document.querySelector("meta[property='article:published_time']")?.getAttribute("content") ||
        document.querySelector("time[datetime]")?.getAttribute("datetime") || "";
      const author =
        document.querySelector("meta[name='author']")?.getAttribute("content") ||
        document.querySelector("meta[property='article:author']")?.getAttribute("content") ||
        document.querySelector(".author, .autor, [rel='author']")?.textContent?.trim() || "";
      const description =
        document.querySelector("meta[property='og:description']")?.getAttribute("content") ||
        document.querySelector("meta[name='description']")?.getAttribute("content") || "";

      const noiseSelectors = [
        "nav", "header", "footer", "aside",
        "[role='navigation']", "[role='banner']", "[role='complementary']",
        "[role='contentinfo']",
        "script", "style", "noscript", "iframe", "svg", "canvas",
        "video", "audio",
        "form", "button", "input", "select", "textarea",
        ".sidebar", ".side-bar", ".widget", ".widgets",
        ".ad", ".ads", ".advertisement", ".banner-ad",
        ".newsletter", ".newsletter-signup", ".subscribe",
        ".social-share", ".share-buttons", ".social-links", ".social",
        ".related-posts", ".related-articles", ".relacionadas",
        ".comments", ".comment-section", "#comments",
        ".breadcrumb", ".breadcrumbs",
        ".menu", ".nav-menu", ".top-bar", ".navbar",
        ".cookie-banner", ".cookie-notice", ".lgpd",
        ".popup", ".modal", ".overlay",
        ".pagination", ".pager",
        ".tags", ".tag-list",
        ".author-box", ".author-info",
        ".whatsapp-cta", ".whatsapp",
      ];
      for (const sel of noiseSelectors) {
        document.querySelectorAll(sel).forEach(el => el.remove());
      }

      const container =
        document.querySelector("article .entry-content") ||
        document.querySelector("article .post-content") ||
        document.querySelector("article .article-content") ||
        document.querySelector("article .content") ||
        document.querySelector("article") ||
        document.querySelector("[role='main'] .content") ||
        document.querySelector("[role='main']") ||
        document.querySelector("main .content") ||
        document.querySelector("main") ||
        document.querySelector(".post-content") ||
        document.querySelector(".entry-content") ||
        document.querySelector(".article-content") ||
        document.querySelector(".article-body") ||
        document.querySelector(".news-content") ||
        document.querySelector(".noticia-content") ||
        document.querySelector(".texto-noticia") ||
        document.querySelector(".content-area") ||
        document.querySelector("#content") ||
        document.body;
      const text = container.innerText || "";
      return { title, text, canonical, published, author, description };
    });

    return {
      ok: true, mode, url, status,
      title: normalizeText(data.title),
      canonical: data.canonical,
      published: data.published,
      author: normalizeText(data.author),
      description: normalizeText(data.description),
      text: normalizeText(data.text).slice(0, 50000)
    };
  } finally {
    await context.close().catch(() => { });
  }
}

app.post("/scrape", async (req, res) => {
  const { url, mode = "article", praca } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ ok: false, error: "Missing 'url' (string)" });
  }

  const opts = {};
  if (praca) opts.praca = praca;

  try {
    const result = await runWithLimit(async () => {
      let browser = await getBrowser();
      try {
        return await doScrape(browser, url, mode, opts);
      } catch (firstErr) {
        // If browser crashed, relaunch and retry once
        const isCrash = /closed|disconnected|crashed|disposed/i.test(firstErr.message);
        if (!isCrash) throw firstErr;
        console.log(`[scraper] Browser crash detected for ${url}, relaunching...`);
        await killBrowser();
        browser = await getBrowser();
        return await doScrape(browser, url, mode, opts);
      }
    });

    res.json(result);
  } catch (e) {
    console.error(`[scraper] Error scraping ${url}:`, e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`[scraper] ${signal} received, shutting down...`);
  if (browserInstance) {
    await browserInstance.close().catch(() => { });
  }
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Pre-warm browser on startup
app.listen(PORT, async () => {
  console.log(`[scraper] listening on :${PORT} | max_concurrency=${MAX_CONCURRENCY}`);
  try {
    await getBrowser();
  } catch (e) {
    console.error("[scraper] Failed to pre-warm browser:", e.message);
  }
});
