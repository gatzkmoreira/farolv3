// Supabase data hooks for SEO pages
// Uses direct REST API calls (same pattern as CotacoesPanel)

import { useState, useEffect } from "react";

const SUPABASE_URL = "https://uvrvlesjgyimspdsghmw.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cnZsZXNqZ3lpbXNwZHNnaG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzEzOTMsImV4cCI6MjA4NTgwNzM5M30.mQfxFpaI7EPsZqW6FtPows7i9M6hbz6jugC5dMH0TFc";

const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

async function supabaseGet<T>(path: string): Promise<T> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return res.json();
}

async function supabaseRpc<T>(fnName: string, params: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Supabase RPC ${res.status}`);
    return res.json();
}

// --- Types ---

export interface QuoteRow {
    product: string;
    praca: string;
    region: string;
    price: string;
    unit: string;
    quote_date: string;
    change_day: number | null;
    change_week: number | null;
    market_type: string;
    a_vista: boolean;
}

export interface PriceHistoryRow {
    recorded_date: string;
    product: string;
    location: string;
    price: number;
    unit: string;
    source: string | null;
}

export interface ProductionRow {
    commodity: string;
    state_code: string;
    year: number;
    area_planted_ha: number;
    production_tonnes: number;
    yield_kg_per_ha: number;
}

export interface ExportRow {
    commodity: string;
    year: number;
    month: number;
    quantity_kg: number;
    value_usd: number;
}

// --- Hooks ---

function useSupabaseQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetcher()
            .then((result) => {
                if (!cancelled) setData(result);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error };
}

/** Fetch latest quotes for a commodity (all praças) */
export function useCotacoes(commodity: string) {
    return useSupabaseQuery<QuoteRow[]>(
        () => supabaseGet<QuoteRow[]>(
            `quotes?product=eq.${commodity}&order=quote_date.desc,praca.asc&limit=50`
        ),
        [commodity]
    );
}

/** Fetch price history for a commodity */
export function useHistorico(commodity: string) {
    return useSupabaseQuery<PriceHistoryRow[]>(
        () => supabaseGet<PriceHistoryRow[]>(
            `price_history?product=eq.${commodity}&order=recorded_date.desc&limit=365`
        ),
        [commodity]
    );
}

/** Fetch production ranking for a commodity (latest year) */
export function useProducao(commodity: string) {
    return useSupabaseQuery<ProductionRow[]>(
        () => supabaseGet<ProductionRow[]>(
            `production_stats?commodity=eq.${commodity}&order=year.desc,production_tonnes.desc&limit=30`
        ),
        [commodity]
    );
}

/** Fetch export data for a commodity */
export function useExportacao(commodity: string) {
    return useSupabaseQuery<ExportRow[]>(
        () => supabaseGet<ExportRow[]>(
            `comex_exports?commodity=eq.${commodity}&order=year.desc,month.desc&limit=24`
        ),
        [commodity]
    );
}

/** Fetch commodity briefing via RPC */
export function useBriefing(commodity: string) {
    return useSupabaseQuery<Record<string, unknown>>(
        () => supabaseRpc("get_commodity_briefing", { p_commodity: commodity }),
        [commodity]
    );
}

export { supabaseGet, supabaseRpc };
