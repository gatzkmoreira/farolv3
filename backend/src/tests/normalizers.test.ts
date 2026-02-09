/**
 * FarolV3 - Normalizers Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
    normalizePraca,
    normalizeProduto,
    resolveLocation,
    extractCotacaoEntities,
    PRACA_MAP,
    PRODUTO_MAP,
    LOCATION_MAP
} from '../utils/normalizers';
import { classifyIntent } from '../utils/intent-classifier';

describe('normalizePraca', () => {
    it('should normalize MS variations', () => {
        expect(normalizePraca('MS')).toBe('MS');
        expect(normalizePraca('Mato Grosso do Sul')).toBe('MS');
        expect(normalizePraca('mato grosso do sul')).toBe('MS');
    });

    it('should normalize MT variations', () => {
        expect(normalizePraca('MT')).toBe('MT');
        expect(normalizePraca('Mato Grosso')).toBe('MT');
    });

    it('should normalize GO variations', () => {
        expect(normalizePraca('GO')).toBe('GO');
        expect(normalizePraca('Goiás')).toBe('GO');
        expect(normalizePraca('goias')).toBe('GO');
    });

    it('should normalize SP variations', () => {
        expect(normalizePraca('SP')).toBe('SP');
        expect(normalizePraca('São Paulo')).toBe('SP');
        expect(normalizePraca('sao paulo')).toBe('SP');
    });

    it('should normalize PR variations', () => {
        expect(normalizePraca('PR')).toBe('PR');
        expect(normalizePraca('Paraná')).toBe('PR');
    });

    it('should return default for unknown', () => {
        expect(normalizePraca('XYZ')).toBe('SP'); // default
        expect(normalizePraca('')).toBe('SP');
    });
});

describe('normalizeProduto', () => {
    it('should normalize boi gordo variations', () => {
        expect(normalizeProduto('boi gordo')).toBe('boi_gordo');
        expect(normalizeProduto('boi')).toBe('boi_gordo');
        expect(normalizeProduto('arroba do boi')).toBe('boi_gordo');
        expect(normalizeProduto('BOI GORDO')).toBe('boi_gordo');
    });

    it('should normalize soja variations', () => {
        expect(normalizeProduto('soja')).toBe('soja');
        expect(normalizeProduto('Soja')).toBe('soja');
    });

    it('should normalize milho variations', () => {
        expect(normalizeProduto('milho')).toBe('milho');
        expect(normalizeProduto('MILHO')).toBe('milho');
    });

    it('should normalize cafe variations', () => {
        expect(normalizeProduto('café')).toBe('cafe_arabica');
        expect(normalizeProduto('cafe arabica')).toBe('cafe_arabica');
    });

    it('should return default for unknown', () => {
        expect(normalizeProduto('desconhecido')).toBe('boi_gordo'); // default
    });
});

describe('resolveLocation', () => {
    it('should extract location from query', () => {
        const result = resolveLocation('clima em Cuiabá MT');
        expect(result.name).toBe('Cuiabá');
        expect(result.uf).toBe('MT');
    });

    it('should handle UF shortcodes', () => {
        const result = resolveLocation('tempo em SP');
        expect(result.uf).toBe('SP');
    });

    it('should return default São Paulo for unknown', () => {
        const result = resolveLocation('qual o preço');
        expect(result.name).toBe('São Paulo');
    });
});

describe('extractCotacaoEntities', () => {
    it('should extract produto and praca from query', () => {
        const result = extractCotacaoEntities('cotação do boi em MS');
        expect(result.produto).toBe('boi_gordo');
        expect(result.praca).toBe('MS');
    });

    it('should use default praca when not specified', () => {
        const result = extractCotacaoEntities('preço da soja');
        expect(result.produto).toBe('soja');
        expect(result.praca).toBe('PR'); // default for soja
    });
});

describe('classifyIntent', () => {
    it('should classify cotacao intent', () => {
        expect(classifyIntent('qual o preço do boi gordo').intent).toBe('cotacao');
        expect(classifyIntent('cotação da soja hoje').intent).toBe('cotacao');
        expect(classifyIntent('valor do milho').intent).toBe('cotacao');
        expect(classifyIntent('quanto custa a arroba').intent).toBe('cotacao');
    });

    it('should classify clima intent', () => {
        expect(classifyIntent('como está o clima em Cuiabá').intent).toBe('clima');
        expect(classifyIntent('previsão do tempo para amanhã').intent).toBe('clima');
        expect(classifyIntent('vai chover em SP').intent).toBe('clima');
        expect(classifyIntent('temperatura em Goiânia').intent).toBe('clima');
    });

    it('should classify geral intent', () => {
        expect(classifyIntent('quais as novidades do agro').intent).toBe('geral');
        expect(classifyIntent('dicas para plantio').intent).toBe('geral');
        expect(classifyIntent('mercado de grãos').intent).toBe('geral');
    });

    it('should have confidence scores', () => {
        const result = classifyIntent('cotação do boi');
        expect(result.confidence).toBeGreaterThan(0.5);
    });
});
