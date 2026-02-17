import { Helmet } from "react-helmet-async";

/**
 * Reusable SEO head component for dynamic meta tags per page.
 * Includes Open Graph, Twitter Cards, canonical, and JSON-LD schema.
 */

interface SEOProps {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: "website" | "article";
    schema?: Record<string, unknown> | Record<string, unknown>[];
    noindex?: boolean;
}

const SITE_NAME = "Farol Rural";
const BASE_URL = "https://farolrural.com.br";
const DEFAULT_DESCRIPTION =
    "Busca inteligente de informações do agronegócio brasileiro. Notícias, cotações, clima e análises em um só lugar.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    image = DEFAULT_IMAGE,
    type = "website",
    schema,
    noindex = false,
}: SEOProps) {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Inteligência para o Agro`;
    const canonicalUrl = `${BASE_URL}${path}`;

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Farol Rural",
        alternateName: "FarolRural",
        url: BASE_URL,
        description: DEFAULT_DESCRIPTION,
        parentOrganization: {
            "@type": "Organization",
            name: "Olho no Agro",
            url: "https://www.youtube.com/@olhonoagro",
            sameAs: [
                "https://www.youtube.com/@olhonoagro",
                "https://www.instagram.com/olhonoagro",
            ],
        },
        sameAs: [
            "https://www.instagram.com/olhonoagro",
            "https://www.youtube.com/@olhonoagro",
        ],
    };

    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Farol Rural",
        url: BASE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: DEFAULT_DESCRIPTION,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
        },
        provider: orgSchema,
    };

    const allSchemas = [orgSchema, webAppSchema, ...(Array.isArray(schema) ? schema : schema ? [schema] : [])];

    return (
        <Helmet>
            {/* Core */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="pt_BR" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@olhonoagro" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(allSchemas)}
            </script>
        </Helmet>
    );
}
