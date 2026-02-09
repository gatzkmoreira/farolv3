/**
 * FarolV3 - Contract Validation Tests
 * Stubs for future type validation
 */

import {
    // Search
    SearchRequest,
    SearchResponse,
    Intent,

    // Cards
    CardsRequest,
    CardsResponse,
    CardPublic,

    // Cotacoes
    CotacoesRequest,
    CotacoesResponse,
    QuotePublic,

    // Weather API
    WeatherApiRequest,
    WeatherApiResponse,
    WeatherApiData,

    // Healthcheck
    HealthcheckResponse,
    ServiceCheck,

    // Events
    EventRequest,
    EventResponse,
    EventType,

    // Feedback
    FeedbackRequest,
    FeedbackResponse,
    FeedbackRating,
} from '../contracts';

describe('Contract Type Validation', () => {
    describe('SearchRequest', () => {
        it('should accept valid search request', () => {
            const request: SearchRequest = {
                query: 'preço da soja',
                session_id: 'abc-123',
            };
            expect(request.query).toBeDefined();
        });
    });

    describe('CardsRequest', () => {
        it('should accept valid cards request', () => {
            const request: CardsRequest = {
                category: 'mercado',
                limit: 20,
                offset: 0,
            };
            expect(request).toBeDefined();
        });
    });

    describe('CotacoesRequest', () => {
        it('should accept valid cotacoes request', () => {
            const request: CotacoesRequest = {
                product: 'soja',
                praca: 'MT',
                days: 7,
                limit: 50,
            };
            expect(request).toBeDefined();
        });
    });

    describe('WeatherApiRequest', () => {
        it('should accept valid weather request', () => {
            const request: WeatherApiRequest = {
                city: 'sorriso',
                uf: 'MT',
            };
            expect(request).toBeDefined();
        });
    });

    describe('EventRequest', () => {
        it('should accept valid event request', () => {
            const request: EventRequest = {
                session_id: 'sess_123',
                event_type: 'chip_clicked',
                payload: { chip: 'soja' },
            };
            expect(request.event_type).toBe('chip_clicked');
        });

        it('should enforce valid event types', () => {
            const validTypes: EventType[] = [
                'search_submitted',
                'chip_clicked',
                'card_clicked',
                'external_link_clicked',
                'feedback_given',
                'page_view',
                'error',
            ];
            expect(validTypes).toHaveLength(7);
        });
    });

    describe('FeedbackRequest', () => {
        it('should accept valid feedback request', () => {
            const request: FeedbackRequest = {
                ai_output_id: 'out_abc123',
                rating: 'positive',
                comment: 'Great response!',
            };
            expect(request.rating).toBe('positive');
        });

        it('should enforce valid rating values', () => {
            const validRatings: FeedbackRating[] = ['positive', 'negative'];
            expect(validRatings).toHaveLength(2);
        });
    });
});

describe('Response Shape Validation', () => {
    describe('CardsResponse', () => {
        it('should have correct shape', () => {
            const response: CardsResponse = {
                success: true,
                data: [],
                meta: { limit: 20, offset: 0, count: 0 },
            };
            expect(response.success).toBe(true);
        });
    });

    describe('HealthcheckResponse', () => {
        it('should have correct shape', () => {
            const response: HealthcheckResponse = {
                healthy: true,
                checks: {
                    supabase: { status: 'ok', latency: 100 },
                    openweather: { status: 'ok', latency: 200 },
                    timestamp: new Date().toISOString(),
                    version: 'v4.0',
                },
            };
            expect(response.healthy).toBe(true);
        });
    });
});
