import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import https from "https";
import { componentTagger } from "lovable-tagger";

/**
 * Custom API proxy plugin using Node.js https module.
 * Node.js fetch (undici) hangs on chunked responses from Caddy/n8n.
 * https.request handles chunked encoding correctly.
 */
function n8nApiProxy(): Plugin {
  const ROUTE_MAP: Record<string, string> = {
    "/api/search": "/farol-search",
    "/api/weather": "/weather",
    "/api/cards": "/cards",
    "/api/cotacoes": "/cotacoes",
    "/api/event": "/event",
    "/api/feedback": "/feedback",
    "/api/healthcheck": "/ping",
  };

  function proxyToN8n(method: string, n8nPath: string, body?: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: "n8n.olhonoagro.com.br",
        port: 443,
        path: `/webhook${n8nPath}`,
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
        },
      };

      const req = https.request(opts, (upstream) => {
        const chunks: Buffer[] = [];
        upstream.on("data", (chunk: Buffer) => chunks.push(chunk));
        upstream.on("end", () => {
          resolve({
            status: upstream.statusCode ?? 502,
            body: Buffer.concat(chunks).toString("utf-8"),
          });
        });
      });

      req.on("error", reject);
      req.setTimeout(30000, () => { req.destroy(new Error("Timeout 30s")); });
      if (body) req.write(body);
      req.end();
    });
  }

  return {
    name: "n8n-api-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) return next();

        // Local ping
        if (url === "/api/ping") {
          res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({ success: true, message: "Vite dev proxy OK", timestamp: new Date().toISOString() }));
          return;
        }

        // CORS preflight
        if (req.method === "OPTIONS") {
          res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          });
          res.end();
          return;
        }

        // Parse path + query
        const [pathname, query] = url.split("?");
        const n8nPath = (ROUTE_MAP[pathname] ?? pathname.replace(/^\/api/, "")) + (query ? "?" + query : "");

        try {
          // Read incoming body for POST
          let body: string | undefined;
          if (req.method !== "GET" && req.method !== "HEAD") {
            body = await new Promise<string>((resolve) => {
              const chunks: Buffer[] = [];
              req.on("data", (c: Buffer) => chunks.push(c));
              req.on("end", () => resolve(Buffer.concat(chunks).toString()));
            });
          }

          console.log(`[n8n-proxy] ${req.method} → ${n8nPath}`);
          const upstream = await proxyToN8n(req.method ?? "GET", n8nPath, body);
          console.log(`[n8n-proxy] ← ${upstream.status} (${upstream.body.length} bytes)`);

          res.writeHead(upstream.status, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });
          res.end(upstream.body);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Proxy error";
          console.error(`[n8n-proxy] ERROR:`, msg);
          res.writeHead(502, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({ success: false, error: { code: "PROXY_ERROR", message: msg } }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    n8nApiProxy(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
