/**
 * FarolV3 - Weather Contracts
 * Schemas para dados climáticos
 */

export interface Location {
    lat: number;
    lon: number;
    name: string;
    uf: string;
}

export interface WeatherData {
    temp: number;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    description: string;
    windSpeed: number;
}

export interface WeatherResult {
    location: Location;
    current: WeatherData;
    alerts?: string[];
}
