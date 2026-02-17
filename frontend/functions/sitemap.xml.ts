/// <reference types="@cloudflare/workers-types" />
/**
 * Dynamic Sitemap Generator — Cloudflare Pages Function
 *
 * Generates sitemap.xml with all indexable URLs from commodity data.
 * Accessed at: /sitemap.xml
 */

interface Env { }

const BASE_URL = "https://farolrural.com.br";

const COMMODITY_SLUGS = [
    "soja", "milho", "boi_gordo", "cafe", "arroz", "trigo",
    "algodao", "feijao", "cana_de_acucar", "acucar",
    "frango", "suino", "leite", "novilha_gorda", "vaca_gorda", "carne_bovina",
];

// Commodities with export data in comex_exports
const EXPORT_SLUGS = ["soja", "milho", "cafe", "algodao", "carne_bovina", "frango"];

const today = () => new Date().toISOString().split("T")[0];

interface SitemapEntry {
    loc: string;
    changefreq: string;
    priority: string;
    lastmod?: string;
}

function buildEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    const date = today();

    // Static pages
    entries.push(
        { loc: `${BASE_URL}/`, changefreq: "daily", priority: "1.0", lastmod: date },
        { loc: `${BASE_URL}/sobre`, changefreq: "monthly", priority: "0.3" },
        { loc: `${BASE_URL}/privacidade`, changefreq: "monthly", priority: "0.2" },
        { loc: `${BASE_URL}/contato`, changefreq: "monthly", priority: "0.3" },
    );

    // Cotações index
    entries.push({ loc: `${BASE_URL}/cotacoes`, changefreq: "daily", priority: "0.9", lastmod: date });

    // Per-commodity pages
    for (const slug of COMMODITY_SLUGS) {
        entries.push(
            { loc: `${BASE_URL}/cotacoes/${slug}`, changefreq: "daily", priority: "0.8", lastmod: date },
            { loc: `${BASE_URL}/historico/${slug}`, changefreq: "weekly", priority: "0.7" },
            { loc: `${BASE_URL}/producao/${slug}`, changefreq: "monthly", priority: "0.6" },
        );
    }

    // Export pages (only for commodities with COMEX data)
    for (const slug of EXPORT_SLUGS) {
        entries.push(
            { loc: `${BASE_URL}/exportacao/${slug}`, changefreq: "monthly", priority: "0.6" },
        );
    }

    return entries;
}

function generateXml(entries: SitemapEntry[]): string {
    const urls = entries
        .map((e) => {
            let xml = `  <url>\n    <loc>${e.loc}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>`;
            if (e.lastmod) xml += `\n    <lastmod>${e.lastmod}</lastmod>`;
            xml += `\n  </url>`;
            return xml;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const onRequest: PagesFunction<Env> = async () => {
    const entries = buildEntries();
    const xml = generateXml(entries);

    return new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
};
