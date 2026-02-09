/**
 * FarolV3 - Healthcheck API Contracts
 * Matching workflow: FarolV3 - Healthcheck (SJOAtSRB8XlGCJpl)
 * Endpoint: GET /webhook/ping
 */

// ============= RESPONSE =============

export interface ServiceCheck {
    status: 'ok' | 'error' | 'unknown';
    latency: number;        // ms
    error?: string;         // Present if status is 'error'
}

export interface HealthchecksMap {
    supabase: ServiceCheck;
    openweather: ServiceCheck;
    timestamp: string;      // ISO 8601
    version: string;        // e.g., 'v4.0'
}

export interface HealthcheckResponse {
    healthy: boolean;       // All services OK
    checks: HealthchecksMap;
}
