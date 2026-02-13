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
        // Remove noise elements BEFORE extracting links (same as article mode)
        const noiseSelectors = [
          "nav", "header", "footer", "aside",
          "[role='navigation']", "[role='banner']", "[role='complementary']",
          "[role='contentinfo']",
          "script", "style", "noscript", "iframe", "svg",
          "form", "button",
          ".sidebar", ".side-bar", ".widget", ".widgets",
          ".ad", ".ads", ".advertisement", ".banner-ad",
          ".newsletter", ".newsletter-signup", ".subscribe",
          ".social-share", ".share-buttons", ".social-links", ".social",
          ".comments", ".comment-section", "#comments",
          ".breadcrumb", ".breadcrumbs",
          ".menu", ".nav-menu", ".top-bar", ".navbar",
          ".cookie-banner", ".cookie-notice", ".lgpd",
          ".popup", ".modal", ".overlay",
          ".pagination", ".pager",
          ".tags", ".tag-list", ".tag-cloud", ".tagcloud",
          ".author-box", ".author-info",
          ".whatsapp-cta", ".whatsapp",
        ];
        for (const sel of noiseSelectors) {
          document.querySelectorAll(sel).forEach(el => el.remove());
        }

        // URL patterns to reject (navigation, categories, non-article pages)
        const REJECT_PATHS = [
          /\/tag\//i, /\/tags\//i, /\/autor\//i, /\/author\//i,
          /\/pagina\//i, /\/page\/\d/i,
          /\/categoria\//i, /\/category\//i, /\/categories\//i,
          /\/login/i, /\/cadastro/i, /\/register/i,
          /\/assine/i, /\/subscribe/i, /\/newsletter/i,
          /\/privacidade/i, /\/privacy/i,
          /\/termos/i, /\/terms/i,
          /\/contato/i, /\/contact/i,
          /\/sobre/i, /\/about/i,
          /\/anuncie/i, /\/advertise/i,
          /\/fale-conosco/i,
          /\/search/i, /\/busca/i,
          /\/wp-content\//i, /\/wp-admin/i,
          /\.(jpg|jpeg|png|gif|svg|pdf|mp4|mp3)$/i,
          /^mailto:/i, /^tel:/i, /^javascript:/i,
          /^#/,
          // BeefPoint section/category pages (not articles)
          /\/agrotalento/i, /\/universidade-beefpoint/i,
          /\/eventos/i, /\/agenda/i, /\/webinars?/i,
          /\/parceiros/i, /\/patrocinadores/i,
          /\/cursos/i, /\/treinamentos/i,
          // Generic index/section patterns
          /\/arquivo/i, /\/archives/i,
          /\/especiais/i, /\/especial\//i,
          /\/colunistas/i, /\/colunas\//i,
          /\/editorias/i, /\/editoria\//i,
          /\/indicadores/i, /\/cotacoes$/i,
          /\/faq/i, /\/ajuda/i, /\/help/i,
          /\/galeria/i, /\/gallery/i, /\/fotos/i, /\/videos/i,
          /\/podcast/i, /\/radio/i,
          /\/classificados/i, /\/leiloes/i, /\/leilao/i,
          /\/safras-e-mercado$/i,
        ];

        // Heuristic: prefer URLs that look like actual articles
        // Article URLs typically have a slug with words separated by hyphens
        // and often include dates or numeric IDs in the path
        const ARTICLE_SIGNALS = [
          /\/noticia/i, /\/noticias\//i,
          /\/\d{4,}\//, // numeric ID or year in path
          /\/\d{4}\/\d{2}\//,     // date pattern /2026/02/
          /\/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i, // slug with 3+ words
        ];

        // Domains to reject (external non-article links)
        const REJECT_DOMAINS = [
          /facebook\.com/i, /twitter\.com/i, /instagram\.com/i,
          /youtube\.com/i, /linkedin\.com/i, /whatsapp\.com/i,
          /t\.me/i, /pinterest\.com/i, /tiktok\.com/i,
          /play\.google\.com/i, /apps\.apple\.com/i,
          /mykajabi\.com/i, /agrotalento\.com/i,
        ];

        const seen = new Set();
        const out = [];
        const aTags = Array.from(document.querySelectorAll("a[href]"));

        for (const a of aTags) {
          const href = a.getAttribute("href") || "";
          const text = (a.textContent || "").trim().replace(/\s+/g, " ");
          if (!href || href === "/" || href === "#") continue;
          if (text.length < 20) continue;
          if (text.length > 300) continue;

          // Check URL rejection patterns
          if (REJECT_PATHS.some(rx => rx.test(href))) continue;
          if (REJECT_DOMAINS.some(rx => rx.test(href))) continue;

          // Resolve to absolute URL for dedup
          let absUrl;
          try { absUrl = new URL(href, document.location.origin).href; } catch { continue; }

          // Reject same-domain index/root pages (path too short = probably a section)
          try {
            const u = new URL(absUrl);
            const pathParts = u.pathname.split("/").filter(Boolean);
            if (pathParts.length < 2) continue; // e.g. /pecuaria or /cafe = section
          } catch { continue; }

          // Dedup by URL
          const normalized = absUrl.toLowerCase().replace(/\/+$/, "");
          if (seen.has(normalized)) continue;
          seen.add(normalized);

          // Score: if URL matches article signals, prioritize
          const score = ARTICLE_SIGNALS.filter(rx => rx.test(absUrl)).length;
          out.push({ href: absUrl, text, _score: score });
        }
        // Sort by article signals (most article-like first), then truncate
        out.sort((a, b) => b._score - a._score);
        return out.slice(0, 50).map(({ href, text }) => ({ href, text }));
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
      // === Date extraction with multiple fallbacks ===
      let published = "";
      // 1. Meta tag (most reliable, used by InfoMoney, Agrolink, TheAgriBiz, etc.)
      published = document.querySelector("meta[property='article:published_time']")?.getAttribute("content") || "";
      // 2. <time datetime> element (widely used)
      if (!published) {
        published = document.querySelector("time[datetime]")?.getAttribute("datetime") || "";
      }
      // 3. JSON-LD structured data (used by Estadão, CNA, Portal do Agronegócio, etc.)
      if (!published) {
        const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of ldScripts) {
          try {
            const ld = JSON.parse(script.textContent);
            const items = Array.isArray(ld) ? ld : [ld];
            for (const item of items) {
              if (item.datePublished) { published = item.datePublished; break; }
              if (item["@graph"]) {
                for (const g of item["@graph"]) {
                  if (g.datePublished) { published = g.datePublished; break; }
                }
              }
              if (published) break;
            }
          } catch (e) { /* ignore malformed JSON-LD */ }
          if (published) break;
        }
      }
      // 4. Visible text date patterns (last resort for sites like NovaCana, SuiSite)
      if (!published) {
        const bodyText = (document.querySelector("article") || document.querySelector("main") || document.body).innerText || "";
        const datePatterns = [
          /Publicado\s+em\s+(\d{2}\/\d{2}\/\d{4})/i,
          /(\d{2}\/\d{2}\/\d{4})\s*[\-–]\s*\d{2}h\d{2}/,
          /(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}/,
          /(\d{2})\/(\d{2})\/(\d{4})/
        ];
        for (const rx of datePatterns) {
          const m = bodyText.match(rx);
          if (m) {
            if (m[3] && m[2] && m[1] && !m[0].includes("Publicado")) {
              published = `${m[3]}-${m[2]}-${m[1]}`;
            } else if (m[1] && m[1].includes("/")) {
              const parts = m[1].split("/");
              if (parts.length === 3) published = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            if (published) break;
          }
        }
      }
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

    const cleanText = normalizeText(data.text);
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const cleanTitle = normalizeText(data.title);

    // Guard: reject index/category pages that aren't real articles
    const INDEX_TITLE_PATTERNS = /\b(archives?|categorias?|categories|index|home|safras\s+e?\s*mercado)\b/i;
    const isIndex = INDEX_TITLE_PATTERNS.test(cleanTitle) || wordCount < 150;

    return {
      ok: true, mode, url, status,
      title: cleanTitle,
      canonical: data.canonical,
      published: data.published,
      author: normalizeText(data.author),
      description: normalizeText(data.description),
      text: cleanText.slice(0, 50000),
      word_count: wordCount,
      is_index: isIndex,
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
