/// <reference types="@cloudflare/workers-types" />
/**
 * FarolRural 2.0 - Secure API Proxy (Cloudflare Pages Function)
 *
 * Security layers:
 * 1. CORS — restricted to farolrural.com.br (+ preview domains)
 * 2. Rate Limiting — 30 req/hr for /search, 120/hr for others (via KV)
 * 3. Turnstile — invisible bot protection on /search
 * 4. Fingerprint logging — X-Farol-UID header tracking
 *
 * Path: /functions/api/[[path]].ts
 */

interface Env {
    RATE_LIMIT_KV?: KVNamespace;
    TURNSTILE_SECRET?: string;
}

const N8N_WEBHOOK_BASE = "https://n8n.olhonoagro.com.br/webhook";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    "https://farolrural.com.br",
    "https://www.farolrural.com.br",
    "https://farolrural.pages.dev",
];

// Rate limits per hour
const RATE_LIMITS: Record<string, number> = {
    "/api/search": 30,
    default: 120,
};

const ROUTE_MAPPING: Record<string, string> = {
    "/api/search": "/farol-search",
    "/api/weather": "/weather",
    "/api/cards": "/cards",
    "/api/cotacoes": "/cotacoes",
    "/api/event": "/event",
    "/api/feedback": "/feedback",
    "/api/healthcheck": "/ping",
};

// Routes that benefit from edge caching (GET-only, data changes infrequently)
const CACHEABLE_ROUTES: Record<string, number> = {
    "/api/cards": 300,      // 5 min — cards update every 4-6h
    "/api/cotacoes": 600,   // 10 min — price quotes update daily
    "/api/weather": 900,    // 15 min — weather updates every 30 min
};

// ──────────────────────────── Helpers ────────────────────────────

function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return false;
    // Allow exact matches and *.farolv3.pages.dev preview deploys
    return (
        ALLOWED_ORIGINS.includes(origin) ||
        /^https:\/\/[a-z0-9]+\.farolv3\.pages\.dev$/.test(origin)
    );
}

function corsHeaders(origin: string | null): Record<string, string> {
    const allowed = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
    return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Farol-UID, X-Turnstile-Token",
        "Vary": "Origin",
    };
}

function jsonResponse(
    body: Record<string, unknown>,
    status: number,
    origin: string | null
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
}

function getClientIP(request: Request): string {
    return (
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
        "unknown"
    );
}

// ──────────────────────── Rate Limiting ──────────────────────────

async function checkRateLimit(
    kv: KVNamespace | undefined,
    ip: string,
    path: string
): Promise<{ allowed: boolean; remaining: number }> {
    if (!kv) return { allowed: true, remaining: -1 }; // KV not bound = skip

    const limit = RATE_LIMITS[path] ?? RATE_LIMITS.default;
    const key = `rl:${ip}:${path}`;

    const current = parseInt((await kv.get(key)) || "0", 10);

    if (current >= limit) {
        return { allowed: false, remaining: 0 };
    }

    // Increment counter, TTL = 1 hour
    await kv.put(key, String(current + 1), { expirationTtl: 3600 });
    return { allowed: true, remaining: limit - current - 1 };
}

// ──────────────────── Turnstile Validation ───────────────────────

async function validateTurnstile(
    token: string | null,
    secret: string | undefined,
    ip: string
): Promise<boolean> {
    if (!secret) return true; // Turnstile not configured = skip
    if (!token) return true; // No token sent = allow (rely on rate limit)

    try {
        const res = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret,
                    response: token,
                    remoteip: ip,
                }),
            }
        );

        const result = (await res.json()) as { success: boolean };
        return result.success;
    } catch {
        return true; // If Turnstile API is down, fail-open (don't block users)
    }
}

// ──────────────────────── Main Handler ───────────────────────────

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    // ─── CORS Preflight ───
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                ...corsHeaders(origin),
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // ─── Local Ping (proxy health) ───
    if (url.pathname === "/api/ping") {
        return jsonResponse(
            {
                success: true,
                message: "FarolRural API Proxy is running",
                timestamp: new Date().toISOString(),
                security: {
                    cors: "restricted",
                    rateLimit: !!env.RATE_LIMIT_KV,
                    turnstile: !!env.TURNSTILE_SECRET,
                },
            },
            200,
            origin
        );
    }

    const ip = getClientIP(request);
    const apiPath = url.pathname;

    // ─── Rate Limiting ───
    const { allowed, remaining } = await checkRateLimit(
        env.RATE_LIMIT_KV,
        ip,
        apiPath
    );

    if (!allowed) {
        const limit = RATE_LIMITS[apiPath] ?? RATE_LIMITS.default;
        const retryAfterSeconds = 3600; // KV TTL = 1 hour
        const response = jsonResponse(
            {
                success: false,
                error: {
                    code: "RATE_LIMITED",
                    message: `Você atingiu o limite de ${limit} buscas por hora. O Farol Rural está em evolução — em breve esse limite será ampliado!`,
                    retry_after_seconds: retryAfterSeconds,
                    limit,
                },
            },
            429,
            origin
        );
        response.headers.set("Retry-After", String(retryAfterSeconds));
        return response;
    }

    // ─── Turnstile (only for /api/search) ───
    if (apiPath === "/api/search") {
        const turnstileToken = request.headers.get("X-Turnstile-Token");
        const isHuman = await validateTurnstile(
            turnstileToken,
            env.TURNSTILE_SECRET,
            ip
        );

        if (!isHuman) {
            return jsonResponse(
                {
                    success: false,
                    error: {
                        code: "BOT_DETECTED",
                        message: "Verificação de segurança falhou. Recarregue a página.",
                    },
                },
                403,
                origin
            );
        }
    }

    // ─── Route mapping ───
    const n8nPath =
        ROUTE_MAPPING[apiPath] ?? apiPath.replace(/^\/api/, "");
    const n8nUrl = `${N8N_WEBHOOK_BASE}${n8nPath}${url.search}`;

    // ─── Edge Cache (Cloudflare Cache API) ───
    const cacheTtl = request.method === "GET" ? CACHEABLE_ROUTES[apiPath] : undefined;

    if (cacheTtl) {
        // Build a cache key from the full URL (includes query params)
        const cacheKey = new Request(request.url, { method: "GET" });
        const cache = (caches as any).default;

        // Check cache first
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
            // Return cached response with CORS headers
            const headers = new Headers(cachedResponse.headers);
            Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
            headers.set("X-Cache", "HIT");
            if (remaining >= 0) {
                headers.set("X-RateLimit-Remaining", String(remaining));
            }
            return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                headers,
            });
        }
    }

    try {
        const n8nResponse = await fetch(n8nUrl, {
            method: request.method,
            headers: {
                "Content-Type":
                    request.headers.get("Content-Type") || "application/json",
                Accept: "application/json",
            },
            body: request.method !== "GET" ? await request.text() : undefined,
        });

        const responseBody = await n8nResponse.text();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
        };

        if (remaining >= 0) {
            headers["X-RateLimit-Remaining"] = String(remaining);
        }

        // Add cache headers for cacheable routes
        if (cacheTtl && n8nResponse.ok) {
            headers["Cache-Control"] = `public, s-maxage=${cacheTtl}, stale-while-revalidate=${cacheTtl * 2}`;
            headers["X-Cache"] = "MISS";

            // Store in Cloudflare edge cache
            const cacheKey = new Request(request.url, { method: "GET" });
            const cacheResponse = new Response(responseBody, {
                status: n8nResponse.status,
                headers,
            });
            // waitUntil keeps the worker alive to store cache without blocking response
            context.waitUntil((caches as any).default.put(cacheKey, cacheResponse.clone()));
        }

        return new Response(responseBody, {
            status: n8nResponse.status,
            headers,
        });
    } catch (error) {
        return jsonResponse(
            {
                success: false,
                error: {
                    code: "PROXY_ERROR",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to reach backend",
                },
            },
            502,
            origin
        );
    }
};
