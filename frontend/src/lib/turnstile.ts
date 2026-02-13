// Cloudflare Turnstile (invisible) integration
// This module handles the invisible bot challenge

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                    size?: "invisible" | "compact" | "normal";
                    execution?: "render" | "execute";
                }
            ) => string;
            execute: (container: string | HTMLElement, options?: object) => void;
            remove: (widgetId: string) => void;
        };
    }
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

/**
 * Gets a Turnstile token. Returns null if Turnstile is not configured.
 * Tokens are cached for 4 minutes (they expire after 5).
 */
export async function getTurnstileToken(): Promise<string | null> {
    // Not configured = skip (graceful degradation)
    if (!SITE_KEY || !window.turnstile) return null;

    // Return cached token if still valid
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

    return new Promise<string | null>((resolve) => {
        // Create invisible container if it doesn't exist
        let container = document.getElementById("turnstile-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "turnstile-container";
            container.style.display = "none";
            document.body.appendChild(container);
        } else {
            container.innerHTML = "";
        }

        try {
            window.turnstile!.render(container, {
                sitekey: SITE_KEY,
                size: "invisible",
                callback: (token: string) => {
                    cachedToken = token;
                    tokenExpiry = Date.now() + 4 * 60 * 1000; // 4 min cache
                    resolve(token);
                },
                "error-callback": () => resolve(null), // fail-open
                "expired-callback": () => {
                    cachedToken = null;
                    tokenExpiry = 0;
                },
            });
        } catch {
            resolve(null); // fail-open
        }
    });
}
