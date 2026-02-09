/**
 * FarolV3 - Intent Classifier
 * Classificação de intent via regex (mirrors n8n logic)
 */

import { Intent, ClassifyResult } from '../contracts/search.types';

// ============= PATTERNS =============

const COTACAO_PATTERNS = [
    /\b(preco|cotacao|quanto|valor|custa|arroba|saca)\b.*\b(boi|vaca|bezerro|soja|milho|cafe|leite|trigo|algodao)\b/i,
    /\b(boi|vaca|bezerro|soja|milho|cafe|leite|trigo|algodao)\b.*\b(preco|cotacao|quanto|valor|custa|arroba|saca)\b/i,
    /\b(boi gordo|arroba|indicador|cepea)\b/i
];

const CLIMA_PATTERNS = [
    /\b(tempo|clima|previsao|chuva|chuvas|temperatura|sol|nublado|frio|calor|geada|seca|umidade)\b/i,
    /\b(chover|chove|vai chover)\b.*\b(hoje|amanha|semana|proximos dias)\b/i
];

// ============= CLASSIFIER =============

/**
 * Classifica intent da query
 */
export function classifyIntent(query: string): ClassifyResult {
    const q = query.toLowerCase();

    // Testar COTACAO
    for (const pattern of COTACAO_PATTERNS) {
        if (pattern.test(q)) {
            return {
                intent: 'cotacao',
                confidence: 0.95
            };
        }
    }

    // Testar CLIMA
    for (const pattern of CLIMA_PATTERNS) {
        if (pattern.test(q)) {
            return {
                intent: 'clima',
                confidence: 0.92
            };
        }
    }

    // Default: GERAL
    return {
        intent: 'geral',
        confidence: 0.6
    };
}

/**
 * Retorna patterns usados para classificação
 */
export function getPatterns(): { cotacao: RegExp[]; clima: RegExp[] } {
    return {
        cotacao: COTACAO_PATTERNS,
        clima: CLIMA_PATTERNS
    };
}
