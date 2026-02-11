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

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
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
      "--single-process",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--js-flags=--max-old-space-size=256"
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

app.post("/scrape", async (req, res) => {
  const { url, mode = "article" } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ ok: false, error: "Missing 'url' (string)" });
  }

  try {
    const result = await runWithLimit(async () => {
      const browser = await getBrowser();
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

        // ─── MODE: LINKS ─────────────────────────────────
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

        // ─── MODE: ARTICLE ───────────────────────────────
        const data = await page.evaluate(() => {
          const title =
            document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
            document.querySelector("h1")?.textContent?.trim() ||
            document.title ||
            "";

          const canonical =
            document.querySelector("link[rel='canonical']")?.getAttribute("href") || "";

          const published =
            document.querySelector("meta[property='article:published_time']")?.getAttribute("content") ||
            document.querySelector("time[datetime]")?.getAttribute("datetime") ||
            "";

          const author =
            document.querySelector("meta[name='author']")?.getAttribute("content") ||
            document.querySelector("meta[property='article:author']")?.getAttribute("content") ||
            document.querySelector(".author, .autor, [rel='author']")?.textContent?.trim() ||
            "";

          const description =
            document.querySelector("meta[property='og:description']")?.getAttribute("content") ||
            document.querySelector("meta[name='description']")?.getAttribute("content") ||
            "";

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
          ok: true,
          mode,
          url,
          status,
          title: normalizeText(data.title),
          canonical: data.canonical,
          published: data.published,
          author: normalizeText(data.author),
          description: normalizeText(data.description),
          text: normalizeText(data.text).slice(0, 50000)
        };
      } finally {
        // Always close context+page, never the browser
        await context.close().catch(() => { });
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
