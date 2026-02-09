/**
 * FarolV3 - RAG Contracts
 * Schemas para Retrieval-Augmented Generation
 */

export interface Document {
    id: string;
    title: string;
    content: string;
    category: string;
    source_name?: string;
    source_url?: string;
    published_at?: string;
    embedding?: number[];
}

export interface RagContext {
    documents: Document[];
    category?: string;
    query: string;
    contextText: string;
}

export interface RagResult {
    context: RagContext;
    sources: Array<{
        name: string;
        url: string;
        date?: string;
    }>;
}
