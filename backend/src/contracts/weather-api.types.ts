/**
 * FarolV3 - Weather API Contracts (Public Endpoint)
 * Matching workflow: FarolV3 - API Weather (i4qszmtXiii1VBpo)
 * Endpoint: GET /webhook/weather
 * 
 * Note: This is the PUBLIC API response shape.
 * For internal service types, see weather.types.ts
 */

// ============= REQUEST =============

export interface WeatherApiRequest {
    city?: string;      // City name (e.g., 'Sorriso', 'Cuiaba')
    cidade?: string;    // Alias for city (pt-BR)
    uf?: string;        // State code (e.g., 'MT', 'SP')
}

// ============= SUPPORTED LOCATIONS =============

export const SUPPORTED_CITIES = [
    'sao paulo', 'cuiaba', 'sorriso', 'campo grande', 'goiania',
    'ribeirao preto', 'londrina', 'curitiba', 'belo horizonte',
    'uberaba', 'rio verde', 'sinop', 'lucas do rio verde',
    'rondonopolis', 'dourados', 'chapeco', 'passo fundo'
] as const;

export type SupportedCity = typeof SUPPORTED_CITIES[number];

// ============= RESPONSE =============

export interface WeatherLocation {
    name: string;
    uf: string;
    lat: number;
    lon: number;
}

export interface WeatherCurrent {
    temp: number;           // Celsius (rounded)
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;       // %
    condition: string;      // e.g., 'céu limpo', 'nublado'
    wind_speed: number;     // km/h
    clouds: number;         // %
}

export interface WeatherForecastDay {
    date: string;           // YYYY-MM-DD
    temp_min: number;
    temp_max: number;
    condition: string;
    humidity: number;
    rain_prob: number;      // 0-100%
}

export interface WeatherApiData {
    location: WeatherLocation;
    current: WeatherCurrent;
    forecast: WeatherForecastDay[];  // 5 days
    source: 'OpenWeather';
    updated_at: string;              // ISO 8601
}

export interface WeatherApiMeta {
    requestedCity: string;
    requestedUf: string;
    matchedLocation: string;
}

export interface WeatherApiResponse {
    success: boolean;
    data: WeatherApiData;
    meta: WeatherApiMeta;
    error?: string;
}
