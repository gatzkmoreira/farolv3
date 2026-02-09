/**
 * FarolV3 - Normalizers
 * Funções de normalização para praça, produto, localização
 */

import { ProductSlug, Praca, Intent } from '../contracts/search.types';
import { Location } from '../contracts/weather.types';

// ============= MAPEAMENTOS =============

export const PRODUTO_MAP: Record<string, ProductSlug> = {
    'boi gordo': 'boi_gordo',
    'boi': 'boi_gordo',
    'arroba': 'boi_gordo',
    'soja': 'soja',
    'milho': 'milho',
    'cafe': 'cafe_arabica',
    'café': 'cafe_arabica',
    'leite': 'leite',
    'trigo': 'trigo'
};

export const PRACA_MAP: Record<string, Praca> = {
    'sp': 'SP',
    'são paulo': 'SP',
    'sao paulo': 'SP',
    'ms': 'MS',
    'mato grosso do sul': 'MS',
    'mt': 'MT',
    'mato grosso': 'MT',
    'go': 'GO',
    'goiás': 'GO',
    'goias': 'GO',
    'pr': 'PR',
    'paraná': 'PR',
    'parana': 'PR',
    'rs': 'RS',
    'rio grande do sul': 'RS',
    'mg': 'MG',
    'minas gerais': 'MG',
    'ba': 'BA',
    'bahia': 'BA'
};

export const PRACA_DEFAULT: Record<ProductSlug, Praca> = {
    'boi_gordo': 'SP',
    'soja': 'PR',
    'milho': 'SP',
    'cafe_arabica': 'SP',
    'leite': 'MG',
    'trigo': 'PR'
};

export const LOCATION_MAP: Record<string, Location> = {
    'sao paulo': { lat: -23.55, lon: -46.63, name: 'São Paulo', uf: 'SP' },
    'sp': { lat: -23.55, lon: -46.63, name: 'São Paulo', uf: 'SP' },
    'cuiaba': { lat: -15.60, lon: -56.10, name: 'Cuiabá', uf: 'MT' },
    'sorriso': { lat: -12.55, lon: -55.71, name: 'Sorriso', uf: 'MT' },
    'campo grande': { lat: -20.44, lon: -54.65, name: 'Campo Grande', uf: 'MS' },
    'ms': { lat: -20.44, lon: -54.65, name: 'Campo Grande', uf: 'MS' },
    'goiania': { lat: -16.68, lon: -49.25, name: 'Goiânia', uf: 'GO' },
    'go': { lat: -16.68, lon: -49.25, name: 'Goiânia', uf: 'GO' },
    'ribeirao preto': { lat: -21.17, lon: -47.81, name: 'Ribeirão Preto', uf: 'SP' },
    'londrina': { lat: -23.31, lon: -51.16, name: 'Londrina', uf: 'PR' },
    'pr': { lat: -25.43, lon: -49.27, name: 'Curitiba', uf: 'PR' },
    'uberaba': { lat: -19.75, lon: -47.93, name: 'Uberaba', uf: 'MG' },
    'mg': { lat: -19.92, lon: -43.94, name: 'Belo Horizonte', uf: 'MG' },
    'rio verde': { lat: -17.80, lon: -50.92, name: 'Rio Verde', uf: 'GO' },
    'sinop': { lat: -11.86, lon: -55.50, name: 'Sinop', uf: 'MT' },
    'lucas do rio verde': { lat: -13.05, lon: -55.91, name: 'Lucas do Rio Verde', uf: 'MT' },
    'mt': { lat: -15.60, lon: -56.10, name: 'Cuiabá', uf: 'MT' }
};

// ============= NORMALIZERS =============

/**
 * Normaliza nome de produto para slug
 */
export function normalizeProduto(query: string): ProductSlug {
    const q = query.toLowerCase();
    for (const [key, value] of Object.entries(PRODUTO_MAP)) {
        if (q.includes(key)) return value;
    }
    return 'boi_gordo'; // default
}

/**
 * Normaliza nome de praça para código
 */
export function normalizePraca(query: string, produto?: ProductSlug): Praca {
    const q = query.toLowerCase();
    for (const [key, value] of Object.entries(PRACA_MAP)) {
        if (q.includes(key)) return value;
    }
    // Retorna praça default do produto
    return produto ? PRACA_DEFAULT[produto] : 'SP';
}

/**
 * Resolve localização a partir da query
 */
export function resolveLocation(query: string): Location {
    const q = query.toLowerCase();
    for (const [key, value] of Object.entries(LOCATION_MAP)) {
        if (q.includes(key)) return value;
    }
    return LOCATION_MAP['sp']; // default São Paulo
}

/**
 * Extrai entidades de cotação da query
 */
export function extractCotacaoEntities(query: string): { produto: ProductSlug; praca: Praca } {
    const produto = normalizeProduto(query);
    const praca = normalizePraca(query, produto);
    return { produto, praca };
}
