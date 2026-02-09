/**
 * FarolV3 - Cotacoes API Contracts
 * Matching workflow: FarolV3 - API Cotacoes (kqNuQ5UatwETzN3A)
 * Endpoint: GET /webhook/cotacoes
 */

// ============= REQUEST =============

export interface CotacoesRequest {
    product?: string;   // Filter by product slug (e.g., 'boi_gordo', 'soja')
    praca?: string;     // Filter by praça (e.g., 'SP', 'MT')
    days?: number;      // Limit to last N days (default: 7)
    limit?: number;     // Max quotes to return (default: 50)
}

// ============= RESPONSE =============

export interface QuotePublic {
    id: string;
    product: string;           // boi_gordo, soja, milho, cafe_arabica, leite
    praca: string;             // SP, MT, MS, GO, etc.
    region: string;            // Região descritiva
    unit: string;              // @/kg, R$/sc, R$/L
    price: number;             // Preço atual
    currency: string;          // BRL
    quote_date: string;        // YYYY-MM-DD
    change_day: number | null; // Variação % dia
    change_week: number | null;// Variação % semana
    source_url: string;
}

export interface CotacoesFilters {
    product?: string;
    praca?: string;
    days: number;
}

export interface CotacoesMeta {
    filters: CotacoesFilters;
    count: number;
    limit: number;
}

export interface CotacoesResponse {
    success: boolean;
    data: QuotePublic[];
    grouped: Record<string, QuotePublic[]>;  // Quotes grouped by product
    meta: CotacoesMeta;
    error?: string;
}
