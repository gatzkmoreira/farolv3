/**
 * FarolV3 - Search API Contracts
 * Schemas para request/response do /api/search
 */

// ============= ENUMS =============

export type Intent = 'cotacao' | 'clima' | 'geral';

export type ProductSlug =
    | 'boi_gordo'
    | 'soja'
    | 'milho'
    | 'cafe_arabica'
    | 'leite'
    | 'trigo';

export type Praca =
    | 'SP' | 'MS' | 'MT' | 'GO'
    | 'PR' | 'RS' | 'MG' | 'BA';

// ============= REQUEST =============

export interface SearchRequest {
    query: string;
    session_id?: string;
    user_id?: string;
    client_meta?: {
        platform?: 'web' | 'whatsapp' | 'api';
        user_agent?: string;
    };
}

// ============= RESPONSE =============

export interface Source {
    name: string;
    url: string;
    date?: string;
}

export interface SearchResponseData {
    intent: Intent;
    confidence: number;
    answer: string;
    chips: string[];
    sources: Source[];
    timingMs: number;
    relatedCards?: string[];
}

export interface SearchResponseMeta {
    sessionKey: string;
    handler: string;
    version: string;
    requestId?: string;
}

export interface SearchResponse {
    success: boolean;
    data: SearchResponseData;
    meta: SearchResponseMeta;
    error?: {
        code: string;
        message: string;
    };
}

// ============= INTERNAL =============

export interface ClassifyResult {
    intent: Intent;
    confidence: number;
    extracted?: {
        produto?: ProductSlug;
        praca?: Praca;
        location?: string;
    };
}

export interface SessionContext {
    sessionKey: string;
    startTime: number;
    query: string;
    clientMeta?: Record<string, unknown>;
}
