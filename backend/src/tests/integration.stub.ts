/**
 * FarolV3 - Integration Test Stubs
 * Estrutura para testes de integração futuros
 */

// ============= BASE CONFIG =============

const BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.olhonoagro.com.br/webhook';

interface TestResult {
    endpoint: string;
    method: string;
    status: 'pass' | 'fail' | 'skip';
    responseTime?: number;
    error?: string;
}

// ============= ENDPOINT TESTS =============

export const integrationTests = {
    /**
     * Testa GET /webhook/ping (healthcheck)
     */
    async testHealthcheck(): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/ping`);
            const data = await res.json();
            return {
                endpoint: '/webhook/ping',
                method: 'GET',
                status: data.healthy ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/ping', method: 'GET', status: 'fail', error: err.message };
        }
    },

    /**
     * Testa POST /webhook/farol-search
     */
    async testSearch(query: string = 'preço da soja'): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/farol-search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            return {
                endpoint: '/webhook/farol-search',
                method: 'POST',
                status: data.success ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/farol-search', method: 'POST', status: 'fail', error: err.message };
        }
    },

    /**
     * Testa GET /webhook/cards
     */
    async testCards(): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/cards?limit=5`);
            const data = await res.json();
            return {
                endpoint: '/webhook/cards',
                method: 'GET',
                status: data.success ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/cards', method: 'GET', status: 'fail', error: err.message };
        }
    },

    /**
     * Testa GET /webhook/cotacoes
     */
    async testCotacoes(): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/cotacoes?product=soja&days=7`);
            const data = await res.json();
            return {
                endpoint: '/webhook/cotacoes',
                method: 'GET',
                status: data.success ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/cotacoes', method: 'GET', status: 'fail', error: err.message };
        }
    },

    /**
     * Testa GET /webhook/weather
     */
    async testWeather(): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/weather?city=sorriso`);
            const data = await res.json();
            return {
                endpoint: '/webhook/weather',
                method: 'GET',
                status: data.success ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/weather', method: 'GET', status: 'fail', error: err.message };
        }
    },

    /**
     * Testa POST /webhook/event
     */
    async testEvent(): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type: 'page_view',
                    payload: { page: '/test' },
                }),
            });
            const data = await res.json();
            return {
                endpoint: '/webhook/event',
                method: 'POST',
                status: data.success ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/event', method: 'POST', status: 'fail', error: err.message };
        }
    },

    /**
     * Testa POST /webhook/feedback
     */
    async testFeedback(): Promise<TestResult> {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ai_output_id: 'test_output_123',
                    rating: 'positive',
                }),
            });
            const data = await res.json();
            return {
                endpoint: '/webhook/feedback',
                method: 'POST',
                status: data.success ? 'pass' : 'fail',
                responseTime: Date.now() - start,
            };
        } catch (err: any) {
            return { endpoint: '/webhook/feedback', method: 'POST', status: 'fail', error: err.message };
        }
    },

    /**
     * Executa todos os testes
     */
    async runAll(): Promise<TestResult[]> {
        return Promise.all([
            this.testHealthcheck(),
            this.testSearch(),
            this.testCards(),
            this.testCotacoes(),
            this.testWeather(),
            this.testEvent(),
            this.testFeedback(),
        ]);
    },
};

// ============= CLI RUNNER =============

if (require.main === module) {
    integrationTests.runAll().then((results) => {
        console.log('\n=== FarolV3 Integration Tests ===\n');
        for (const r of results) {
            const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
            console.log(`${icon} ${r.method} ${r.endpoint} - ${r.responseTime || '?'}ms`);
            if (r.error) console.log(`   Error: ${r.error}`);
        }
        const passed = results.filter((r) => r.status === 'pass').length;
        console.log(`\n${passed}/${results.length} tests passed\n`);
    });
}
