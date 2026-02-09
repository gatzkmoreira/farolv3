/**
 * FarolV3 — Endpoint Healthcheck Script
 * 
 * Testa todos os endpoints do backend para validar integração.
 * 
 * Uso:
 *   npx tsx scripts/test-endpoints.ts
 *   # ou
 *   node --loader ts-node/esm scripts/test-endpoints.ts
 * 
 * Requisitos:
 *   - n8n rodando em https://n8n.olhonoagro.com.br
 *   - Todos os workflows FarolV3 ativos
 */

const N8N_BASE = "https://n8n.olhonoagro.com.br/webhook";

// n8n webhook paths (NOT /api/* pattern)
const PATHS = {
    SEARCH: "/farol-search",
    WEATHER: "/weather",
    CARDS: "/cards",
    COTACOES: "/cotacoes",
    EVENT: "/event",
    FEEDBACK: "/feedback",
    HEALTHCHECK: "/ping",
};

interface TestResult {
    name: string;
    endpoint: string;
    method: string;
    status: number;
    passed: boolean;
    duration: number;
    error?: string;
    validation?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
    name: string,
    endpoint: string,
    method: "GET" | "POST",
    body?: object,
    validate?: (data: any) => string | null
): Promise<TestResult> {
    const url = `${N8N_BASE}${endpoint}`;
    const start = Date.now();

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const duration = Date.now() - start;
        const data = await response.json().catch(() => null);

        let validationError: string | null = null;
        if (validate && data) {
            validationError = validate(data);
        }

        const passed = response.ok && !validationError;

        return {
            name,
            endpoint,
            method,
            status: response.status,
            passed,
            duration,
            error: validationError || undefined,
            validation: validationError ? "FAIL" : "OK",
        };
    } catch (err) {
        return {
            name,
            endpoint,
            method,
            status: 0,
            passed: false,
            duration: Date.now() - start,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

// Validators
function validateHealthcheck(data: any): string | null {
    if (!data?.success) return "Missing success field";
    if (!data?.timestamp) return "Missing timestamp";
    return null;
}

function validateSearch(data: any): string | null {
    // Response pode ser wrapped em { success, data } ou direto
    const payload = data?.data || data;
    if (!payload?.intent) return "Missing intent field";
    if (!payload?.answer_markdown && !payload?.answer) return "Missing answer field";
    return null;
}

function validateCards(data: any): string | null {
    const payload = data?.data || data;
    if (!Array.isArray(payload?.cards) && !Array.isArray(payload)) {
        return "Expected cards array";
    }
    return null;
}

function validateCotacoes(data: any): string | null {
    const payload = data?.data || data;
    if (!Array.isArray(payload?.quotes) && !Array.isArray(payload)) {
        return "Expected quotes array";
    }
    return null;
}

function validateWeather(data: any): string | null {
    const payload = data?.data || data;
    if (!payload?.location && !payload?.current) {
        return "Missing location or current weather data";
    }
    return null;
}

function validateEvent(data: any): string | null {
    if (data?.success !== true && data?.received !== true) {
        return "Expected success/received confirmation";
    }
    return null;
}

function validateFeedback(data: any): string | null {
    if (data?.success !== true && data?.received !== true) {
        return "Expected success/received confirmation";
    }
    return null;
}

async function runTests() {
    console.log("🚀 FarolV3 Endpoint Healthcheck\n");
    console.log(`Base URL: ${N8N_BASE}\n`);
    console.log("─".repeat(60));

    // 1. Healthcheck (may need manual activation in n8n UI)
    results.push(await testEndpoint(
        "Healthcheck",
        PATHS.HEALTHCHECK,
        "GET",
        undefined,
        validateHealthcheck
    ));

    // 2. Cards
    results.push(await testEndpoint(
        "Cards (limit=5)",
        `${PATHS.CARDS}?limit=5`,
        "GET",
        undefined,
        validateCards
    ));

    // 3. Cotações
    results.push(await testEndpoint(
        "Cotações",
        PATHS.COTACOES,
        "GET",
        undefined,
        validateCotacoes
    ));

    // 4. Weather (may need OPENWEATHER_API_KEY env var)
    results.push(await testEndpoint(
        "Weather (Sorriso-MT)",
        `${PATHS.WEATHER}?city=Sorriso&uf=MT`,
        "GET",
        undefined,
        validateWeather
    ));

    // 5. Search - Cotação
    results.push(await testEndpoint(
        "Search (intent: cotacao)",
        PATHS.SEARCH,
        "POST",
        { query: "cotação do boi gordo hoje" },
        validateSearch
    ));

    // 6. Search - Clima
    results.push(await testEndpoint(
        "Search (intent: clima)",
        PATHS.SEARCH,
        "POST",
        { query: "previsão do tempo em Sorriso MT" },
        validateSearch
    ));

    // 7. Search - Geral
    results.push(await testEndpoint(
        "Search (intent: geral)",
        PATHS.SEARCH,
        "POST",
        { query: "como melhorar a produtividade da soja" },
        validateSearch
    ));

    // 8. Event (telemetria - may need manual activation)
    results.push(await testEndpoint(
        "Event (telemetria)",
        PATHS.EVENT,
        "POST",
        {
            event_type: "healthcheck_test",
            payload: { source: "test-script" },
            timestamp: new Date().toISOString()
        },
        validateEvent
    ));

    // 9. Feedback (telemetria - may need manual activation)
    results.push(await testEndpoint(
        "Feedback (telemetria)",
        PATHS.FEEDBACK,
        "POST",
        {
            session_id: "test-session",
            rating: 5,
            comment: "Teste automatizado",
            timestamp: new Date().toISOString()
        },
        validateFeedback
    ));

    // Print results
    console.log("\n📊 Results:\n");

    for (const result of results) {
        const icon = result.passed ? "✅" : "❌";
        const statusText = result.status > 0 ? `${result.status}` : "ERR";
        console.log(
            `${icon} ${result.name.padEnd(25)} ${result.method.padEnd(5)} ${statusText.padEnd(4)} ${result.duration}ms${result.error ? ` (${result.error})` : ""}`
        );
    }

    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log("\n" + "─".repeat(60));
    console.log(`\n📈 Summary: ${passed}/${results.length} passed, ${failed} failed\n`);

    if (failed > 0) {
        console.log("❌ FAILED TESTS:");
        for (const result of results.filter(r => !r.passed)) {
            console.log(`   - ${result.name}: ${result.error || `HTTP ${result.status}`}`);
        }
        process.exit(1);
    } else {
        console.log("🎉 All tests passed!\n");
        process.exit(0);
    }
}

runTests().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
