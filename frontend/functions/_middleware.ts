/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Pages Middleware — SSR-lite for crawlers
 *
 * Intercepts all page requests (non-API). If the User-Agent is a known crawler,
 * injects dynamic <meta> tags into the HTML before serving.
 * For regular users, passes through to the SPA.
 */

interface Env { }

// Crawler UA patterns
const CRAWLER_PATTERNS = [
    "googlebot", "bingbot", "yandex", "baiduspider",
    "facebookexternalhit", "twitterbot", "linkedinbot",
    "whatsapp", "telegrambot", "slackbot", "discordbot",
    "applebot", "duckduckbot", "semrushbot", "ahrefsbot",
    "rogerbot", "embedly", "quora", "pinterest",
    "outbrain", "vkshare", "w3c_validator",
];

function isCrawler(ua: string): boolean {
    const lower = ua.toLowerCase();
    return CRAWLER_PATTERNS.some((p) => lower.includes(p));
}

// --- Commodity metadata (kept in sync with frontend commodity-utils.ts) ---
const COMMODITY_META: Record<string, { displayName: string; seoTitle: string; seoDescription: string }> = {
    soja: { displayName: "Soja", seoTitle: "Preço da Soja Hoje", seoDescription: "Cotação da soja hoje em todas as praças. Preços atualizados diariamente, variação diária e comparativo por estado." },
    milho: { displayName: "Milho", seoTitle: "Preço do Milho Hoje", seoDescription: "Cotação do milho hoje em todas as praças. Preços atualizados diariamente com variação e comparativo regional." },
    boi_gordo: { displayName: "Boi Gordo", seoTitle: "Preço do Boi Gordo Hoje", seoDescription: "Cotação do boi gordo hoje (@/arroba). Preços à vista e a prazo por estado, variação diária e tendência." },
    cafe: { displayName: "Café", seoTitle: "Preço do Café Hoje", seoDescription: "Cotação do café arábica e robusta hoje. Preços por saca, variação diária e comparativo por praça." },
    arroz: { displayName: "Arroz", seoTitle: "Preço do Arroz Hoje", seoDescription: "Cotação do arroz hoje. Preços atualizados diariamente por praça com variação e tendência." },
    trigo: { displayName: "Trigo", seoTitle: "Preço do Trigo Hoje", seoDescription: "Cotação do trigo hoje em todas as praças. Preços atualizados com variação diária." },
    algodao: { displayName: "Algodão", seoTitle: "Preço do Algodão Hoje", seoDescription: "Cotação do algodão hoje. Preço por arroba atualizado diariamente." },
    feijao: { displayName: "Feijão", seoTitle: "Preço do Feijão Hoje", seoDescription: "Cotação do feijão hoje por tipo e praça. Preços atualizados com variação." },
    cana_de_acucar: { displayName: "Cana-de-açúcar", seoTitle: "Preço da Cana-de-açúcar Hoje", seoDescription: "Cotação da cana-de-açúcar hoje. ATR e preço por tonelada atualizados." },
    acucar: { displayName: "Açúcar", seoTitle: "Preço do Açúcar Hoje", seoDescription: "Cotação do açúcar cristal e VHP hoje. Preços por saca atualizados diariamente." },
    frango: { displayName: "Frango", seoTitle: "Preço do Frango Hoje", seoDescription: "Cotação do frango vivo e resfriado hoje. Preços atualizados por praça." },
    suino: { displayName: "Suíno", seoTitle: "Preço do Suíno Hoje", seoDescription: "Cotação do suíno vivo hoje. Preço por kg atualizado diariamente." },
    leite: { displayName: "Leite", seoTitle: "Preço do Leite Hoje", seoDescription: "Cotação do leite ao produtor hoje. Preço por litro atualizado." },
    novilha_gorda: { displayName: "Novilha Gorda", seoTitle: "Preço da Novilha Gorda Hoje", seoDescription: "Cotação da novilha gorda hoje (@/arroba). Preços à vista por estado." },
    vaca_gorda: { displayName: "Vaca Gorda", seoTitle: "Preço da Vaca Gorda Hoje", seoDescription: "Cotação da vaca gorda hoje (@/arroba). Preços à vista por estado." },
    carne_bovina: { displayName: "Carne Bovina", seoTitle: "Preço da Carne Bovina Hoje", seoDescription: "Cotação da carne bovina atacado hoje. Preços por kg atualizados." },
};

const BASE_URL = "https://farolrural.com.br";
const SITE_NAME = "Farol Rural";
const DEFAULT_TITLE = "Farol Rural — Inteligência para o Agro";
const DEFAULT_DESC = "Busca inteligente de informações do agronegócio brasileiro. Notícias, cotações, clima e análises em um só lugar.";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

interface PageMeta {
    title: string;
    description: string;
    url: string;
}

function getMetaForPath(pathname: string): PageMeta {
    // /cotacoes/:commodity
    const cotacoesMatch = pathname.match(/^\/cotacoes\/([a-z_]+)$/);
    if (cotacoesMatch) {
        const slug = cotacoesMatch[1];
        const meta = COMMODITY_META[slug];
        if (meta) {
            return {
                title: `${meta.seoTitle} — ${SITE_NAME}`,
                description: meta.seoDescription,
                url: `${BASE_URL}${pathname}`,
            };
        }
    }

    // /cotacoes (index)
    if (pathname === "/cotacoes") {
        return {
            title: `Cotações do Agronegócio — ${SITE_NAME}`,
            description: "Cotações atualizadas de todas as commodities agrícolas do Brasil — soja, milho, boi gordo, café, trigo e mais.",
            url: `${BASE_URL}/cotacoes`,
        };
    }

    // /historico/:commodity
    const historicoMatch = pathname.match(/^\/historico\/([a-z_]+)$/);
    if (historicoMatch) {
        const slug = historicoMatch[1];
        const meta = COMMODITY_META[slug];
        if (meta) {
            return {
                title: `Histórico de Preços ${meta.displayName} — ${SITE_NAME}`,
                description: `Evolução dos preços de ${meta.displayName} nos últimos 12 meses. Gráfico interativo com preços diários e médias móveis.`,
                url: `${BASE_URL}${pathname}`,
            };
        }
    }

    // /producao/:commodity
    const producaoMatch = pathname.match(/^\/producao\/([a-z_]+)$/);
    if (producaoMatch) {
        const slug = producaoMatch[1];
        const meta = COMMODITY_META[slug];
        if (meta) {
            return {
                title: `Produção de ${meta.displayName} por Estado — ${SITE_NAME}`,
                description: `Ranking dos estados produtores de ${meta.displayName}. Área plantada, produção e produtividade por UF.`,
                url: `${BASE_URL}${pathname}`,
            };
        }
    }

    // /exportacao/:commodity
    const exportacaoMatch = pathname.match(/^\/exportacao\/([a-z_]+)$/);
    if (exportacaoMatch) {
        const slug = exportacaoMatch[1];
        const meta = COMMODITY_META[slug];
        if (meta) {
            return {
                title: `Exportação de ${meta.displayName} — ${SITE_NAME}`,
                description: `Dados de exportação de ${meta.displayName}. Volume, valor e tendências mensais.`,
                url: `${BASE_URL}${pathname}`,
            };
        }
    }

    // Static pages
    const STATIC_PAGES: Record<string, PageMeta> = {
        "/": { title: DEFAULT_TITLE, description: DEFAULT_DESC, url: BASE_URL },
        "/sobre": { title: `Sobre — ${SITE_NAME}`, description: "Conheça o Farol Rural — plataforma de inteligência do agronegócio brasileiro.", url: `${BASE_URL}/sobre` },
        "/privacidade": { title: `Privacidade — ${SITE_NAME}`, description: "Política de privacidade do Farol Rural.", url: `${BASE_URL}/privacidade` },
        "/contato": { title: `Contato — ${SITE_NAME}`, description: "Entre em contato com a equipe do Farol Rural.", url: `${BASE_URL}/contato` },
    };

    return STATIC_PAGES[pathname] ?? {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESC,
        url: `${BASE_URL}${pathname}`,
    };
}

function injectMetaTags(html: string, meta: PageMeta): string {
    // Replace the static fallback title
    html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${meta.title}</title>`
    );

    // Replace meta description
    html = html.replace(
        /<meta name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${meta.description}" />`
    );

    // Replace OG tags
    html = html.replace(
        /<meta property="og:title" content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${meta.title}" />`
    );
    html = html.replace(
        /<meta property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${meta.description}" />`
    );
    html = html.replace(
        /<meta property="og:url" content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${meta.url}" />`
    );

    // Replace Twitter tags
    html = html.replace(
        /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${meta.title}" />`
    );
    html = html.replace(
        /<meta name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${meta.description}" />`
    );

    // Add canonical link if not present
    if (!html.includes('rel="canonical"')) {
        html = html.replace(
            '</head>',
            `  <link rel="canonical" href="${meta.url}" />\n</head>`
        );
    }

    return html;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request } = context;
    const url = new URL(request.url);

    // Skip API routes — let them go to the api/[[path]].ts handler
    if (url.pathname.startsWith("/api/")) {
        return context.next();
    }

    // Skip static assets
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|json|xml|txt|map)$/)) {
        return context.next();
    }

    // Check if crawler
    const ua = request.headers.get("User-Agent") || "";
    if (!isCrawler(ua)) {
        return context.next();
    }

    // Crawler detected — get the SPA HTML and inject meta tags
    const response = await context.next();
    const html = await response.text();
    const meta = getMetaForPath(url.pathname);
    const modifiedHtml = injectMetaTags(html, meta);

    return new Response(modifiedHtml, {
        status: response.status,
        headers: {
            ...Object.fromEntries(response.headers.entries()),
            "Content-Type": "text/html; charset=utf-8",
        },
    });
};
