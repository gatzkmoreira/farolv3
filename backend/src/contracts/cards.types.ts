/**
 * FarolV3 - Cards API Contracts
 * Matching workflow: FarolV3 - API Cards (7VDcXh6dY9GC8DFx)
 * Endpoint: GET /webhook/cards
 */

// ============= REQUEST =============

export interface CardsRequest {
    category?: string;  // Filter by category (e.g., 'cotacao', 'mercado')
    limit?: number;     // Max cards to return (default: 20)
    offset?: number;    // Pagination offset (default: 0)
}

// ============= RESPONSE =============

export interface CardPublic {
    id: string;
    category: string;
    title: string;
    deck: string;                    // Subtítulo/descrição curta
    chips: string[];                 // Tags clicáveis
    tags: string[];                  // Categorização interna
    image_url: string | null;
    source_name: string;
    source_url: string;
    published_at: string;            // ISO 8601
}

export interface CardsMeta {
    limit: number;
    offset: number;
    count: number;                   // Cards returned in this response
}

export interface CardsResponse {
    success: boolean;
    data: CardPublic[];
    meta: CardsMeta;
    error?: string;
}
