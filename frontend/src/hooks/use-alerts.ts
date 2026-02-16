import { useState, useEffect, useCallback } from "react";

export interface MarketAlert {
    id: string;
    alert_type: "price_anomaly" | "trend" | "exchange" | "weather";
    severity: "info" | "warning" | "critical";
    commodity: string;
    location: string;
    title: string;
    description: string;
    data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    expires_at: string;
}

interface AlertsResponse {
    success: boolean;
    data: MarketAlert[];
    count: number;
}

const CACHE_KEY = "farol_alerts_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function getCachedAlerts(): MarketAlert[] | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function setCachedAlerts(data: MarketAlert[]) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch {
        // quota exceeded — ignore
    }
}

export function useAlerts() {
    const [alerts, setAlerts] = useState<MarketAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        // Try cache first
        const cached = getCachedAlerts();
        if (cached) {
            setAlerts(cached);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/alerts", { signal: AbortSignal.timeout(8000) });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const json: AlertsResponse = await res.json();
            const validAlerts = (json.data || []).filter(
                (a) => a.location && a.title && new Date(a.expires_at) > new Date()
            );

            setAlerts(validAlerts);
            setCachedAlerts(validAlerts);
            setError(null);
        } catch (err) {
            console.warn("[Farol] Alerts fetch failed:", err);
            setError("Não foi possível carregar alertas");
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    return { alerts, loading, error, refetch: fetchAlerts };
}
