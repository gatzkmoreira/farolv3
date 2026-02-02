/**
 * FarolRural 2.0 - API Proxy (Cloudflare Pages Function)
 * 
 * This function proxies /api/* requests to n8n webhooks.
 * Path: /functions/api/[[path]].ts
 * 
 * Matches: /api/search, /api/cards, /api/weather, /api/session, etc.
 */

interface Env {
    // Add environment variables here if needed
}

const N8N_WEBHOOK_BASE = "https://n8n.olhonoagro.com.br/webhook";

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request } = context;
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // Special handling for /api/ping (health check)
    if (url.pathname === "/api/ping") {
        return new Response(
            JSON.stringify({
                success: true,
                message: "FarolRural API Proxy is running",
                timestamp: new Date().toISOString(),
                n8n_base: N8N_WEBHOOK_BASE,
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }

    // Build n8n webhook URL
    const n8nUrl = `${N8N_WEBHOOK_BASE}${url.pathname}${url.search}`;

    try {
        // Forward the request to n8n
        const n8nResponse = await fetch(n8nUrl, {
            method: request.method,
            headers: {
                "Content-Type": request.headers.get("Content-Type") || "application/json",
                "Accept": "application/json",
            },
            body: request.method !== "GET" ? await request.text() : undefined,
        });

        // Get the response body
        const responseBody = await n8nResponse.text();

        // Return the response with CORS headers
        return new Response(responseBody, {
            status: n8nResponse.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    } catch (error) {
        // Return error response
        return new Response(
            JSON.stringify({
                success: false,
                error: {
                    code: "PROXY_ERROR",
                    message: error instanceof Error ? error.message : "Failed to reach backend",
                },
            }),
            {
                status: 502,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
};
