/**
 * FarolV3 - Service Interfaces
 * Interfaces para todos os serviços do backend
 */

import { QuoteParams, QuoteResult } from '../contracts/quote.types';
import { Location, WeatherResult } from '../contracts/weather.types';
import { RagResult } from '../contracts/rag.types';
import { ClassifyResult, Intent, Source } from '../contracts/search.types';

// ============= QUOTE SERVICE =============

export interface IQuoteService {
    /**
     * Busca cotação de um produto em uma praça
     */
    getQuote(params: QuoteParams): Promise<QuoteResult>;

    /**
     * Lista todas as cotações disponíveis
     */
    listQuotes(product?: string): Promise<QuoteResult[]>;
}

// ============= WEATHER SERVICE =============

export interface IWeatherService {
    /**
     * Busca clima atual para uma localização
     */
    getWeather(location: Location): Promise<WeatherResult>;

    /**
     * Resolve nome de cidade para coordenadas
     */
    resolveLocation(query: string): Location;
}

// ============= RAG SERVICE =============

export interface IRagService {
    /**
     * Busca documentos relevantes para a query
     */
    search(query: string, category?: string): Promise<RagResult>;

    /**
     * Monta contexto formatado para LLM
     */
    buildContext(documents: any[]): string;
}

// ============= CARDS SERVICE =============

export interface ICardsService {
    /**
     * Busca cards relacionados ao intent/categoria
     */
    getRelated(intent: Intent, tags?: string[]): Promise<any[]>;

    /**
     * Busca cards por categoria
     */
    getByCategory(category: string, limit?: number): Promise<any[]>;
}

// ============= TELEMETRY SERVICE =============

export interface ITelemetryService {
    /**
     * Registra evento de busca
     */
    logEvent(event: {
        sessionKey: string;
        eventType: string;
        payload: Record<string, unknown>;
    }): Promise<void>;

    /**
     * Salva output de AI
     */
    saveAiOutput(output: {
        sessionKey: string;
        intent: Intent;
        model: string;
        promptTokens: number;
        completionTokens: number;
        response: string;
    }): Promise<void>;
}

// ============= INTENT CLASSIFIER =============

export interface IIntentClassifier {
    /**
     * Classifica intent da query
     */
    classify(query: string): ClassifyResult;

    /**
     * Extrai entidades da query (produto, praça, etc)
     */
    extractEntities(query: string, intent: Intent): Record<string, string>;
}
