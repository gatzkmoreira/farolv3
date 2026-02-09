/**
 * FarolV3 - Quote Contracts
 * Schemas para cotações
 */

import { ProductSlug, Praca } from './search.types';

export interface Quote {
    id: string;
    product: ProductSlug;
    praca: Praca;
    price: number;
    unit: string;
    quote_date: string;
    change_day?: number;
    change_week?: number;
    source_id?: string;
    source_url?: string;
}

export interface QuoteParams {
    produto: ProductSlug;
    praca?: Praca;
}

export interface QuoteResult {
    quote: Quote | null;
    allQuotes: Quote[];
    extracted: {
        produto: ProductSlug;
        praca: Praca;
    };
}
