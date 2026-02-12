/**
 * Brazilian cities search utility
 * Fetches all municipalities from IBGE API and caches in localStorage for 7 days.
 */

const CITIES_CACHE_KEY = "farol_br_cities";
const CITIES_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface BRCity {
    name: string;
    uf: string;
}

let citiesCache: BRCity[] | null = null;

const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export async function loadBrazilianCities(): Promise<BRCity[]> {
    if (citiesCache) return citiesCache;

    // Check localStorage cache
    try {
        const cached = localStorage.getItem(CITIES_CACHE_KEY);
        if (cached) {
            const { data, ts } = JSON.parse(cached);
            if (Date.now() - ts < CITIES_CACHE_TTL && Array.isArray(data)) {
                citiesCache = data;
                return data;
            }
        }
    } catch { /* ignore parse errors */ }

    // Fetch from IBGE
    const res = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
    );
    const raw = await res.json();

    const cities: BRCity[] = raw.map((m: { nome: string; microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } } }) => ({
        name: m.nome,
        uf: m.microrregiao?.mesorregiao?.UF?.sigla || "",
    }));

    citiesCache = cities;

    try {
        localStorage.setItem(CITIES_CACHE_KEY, JSON.stringify({ data: cities, ts: Date.now() }));
    } catch { /* quota exceeded — still works from memory */ }

    return cities;
}

export function searchCities(cities: BRCity[], query: string, limit = 8): BRCity[] {
    const q = normalize(query);
    if (q.length < 2) return [];

    // Prioritize: starts-with first, then includes
    const startsWith: BRCity[] = [];
    const includes: BRCity[] = [];

    for (const c of cities) {
        const n = normalize(c.name);
        if (n.startsWith(q)) {
            startsWith.push(c);
        } else if (n.includes(q)) {
            includes.push(c);
        }
        if (startsWith.length + includes.length >= limit * 2) break;
    }

    return [...startsWith, ...includes].slice(0, limit);
}
