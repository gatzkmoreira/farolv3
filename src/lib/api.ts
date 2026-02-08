// API utilities for Farol Rural 2.0

/**
 * Fire-and-forget event tracking
 * Sends events to /api/event without blocking the UI
 */
export const trackEvent = (eventType: string, payload: Record<string, unknown>) => {
  fetch("/api/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    }),
  }).catch((err) => {
    console.warn("[Farol] Event tracking failed:", err);
  });
};

/**
 * Generic fetch wrapper that handles the backend's response format
 * Backend may return data directly or wrapped: { success: true, data: ... }
 */
export const apiFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[Farol] API ${res.status} ${res.statusText}`, { url, contentType, body: body.slice(0, 500) });
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  if (!contentType.includes("application/json")) {
    const body = await res.text();
    console.error("[Farol] Non-JSON response", { url, contentType, body: body.slice(0, 300) });
    throw new Error(`Expected JSON but got ${contentType}`);
  }

  const json = await res.json();
  console.debug("[Farol] apiFetch OK", { url, hasData: "data" in json, keys: Object.keys(json) });
  // Handle both direct response and wrapped { success, data } format
  return (json?.data ?? json) as T;
};
