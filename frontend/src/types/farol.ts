// Raw API Response from n8n (actual format)
export interface APISource {
  name: string;
  url: string;
  date?: string;
}

export interface HistoryDataPoint {
  date: string;
  temp_min: number;
  temp_max: number;
  temp_mean: number;
  precipitation: number;
  humidity_mean?: number;
  wind_speed_max?: number;
  weather_code?: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  change_pct?: number;
}

export interface PriceComparisonPoint {
  state: string;
  price: number;
  unit: string;
  date: string;
}

export interface ChartYKey {
  key: string;
  label: string;
  color: string;
  axis?: 'left' | 'right';
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'bar_stacked' | 'line_dual';
  title: string;
  xKey: string;
  yKeys: ChartYKey[];
  data: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

export interface APISearchData {
  intent: 'cotacao' | 'clima' | 'geral';
  answer: string;
  chips: string[];
  sources: APISource[];
  timingMs: number;
  confidence?: number;
  historyData?: HistoryDataPoint[];
  priceHistory?: PriceHistoryPoint[];
  priceComparison?: PriceComparisonPoint[];
  charts?: ChartConfig[];
}

export interface APISearchResponse {
  success: boolean;
  data: APISearchData;
  meta?: {
    sessionKey: string;
    handler: string;
    version: string;
  };
}

// Transformed interface for frontend components
export interface SearchResponse {
  intent: 'cotacao' | 'clima' | 'geral';
  answer_markdown: string;
  chips: string[];
  cards: NewsCard[];
  sources_used: string[];
  timing_ms: number;
  historyData?: HistoryDataPoint[];
  priceHistory?: PriceHistoryPoint[];
  priceComparison?: PriceComparisonPoint[];
  charts?: ChartConfig[];
}

// Helper to transform API response to frontend format.
// Handles BOTH shapes:
//   1. Full wrapper: { success, data: { intent, answer, ... } }  (raw fetch)
//   2. Already-unwrapped: { intent, answer, ... }                (apiFetch auto-unwraps .data)
export function transformSearchResponse(raw: APISearchResponse | APISearchData): SearchResponse {
  // Detect which shape we got
  const data: APISearchData =
    (raw as APISearchResponse).data !== undefined
      ? (raw as APISearchResponse).data
      : (raw as APISearchData);

  return {
    intent: data.intent ?? 'geral',
    answer_markdown: data.answer ?? '',
    chips: data.chips ?? [],
    cards: [], // Cards come from a separate endpoint
    sources_used: Array.isArray(data.sources)
      ? data.sources.map(s => typeof s === 'string' ? s : s.name)
      : [],
    timing_ms: data.timingMs ?? 0,
    historyData: data.historyData,
    priceHistory: data.priceHistory,
    priceComparison: data.priceComparison,
    charts: data.charts,
  };
}

export interface NewsCard {
  id: string;
  title: string;
  description: string;
  source: string;
  source_logo?: string;
  date: string;
  category: string;
  url: string;
  image?: string;
  summary_markdown?: string;
}

// Raw card from API — field names differ from frontend
export interface APICardData {
  id: string;
  title: string;
  deck?: string;
  description?: string;
  category?: string;
  chips?: string[];
  tags?: string[];
  image_url?: string;
  image?: string;
  source_name?: string;
  source?: string;
  source_url?: string;
  url?: string;
  published_at?: string;
  date?: string;
  summary_markdown?: string;
}

/** Map a single API card to the frontend NewsCard shape */
export function transformCard(raw: APICardData): NewsCard {
  return {
    id: raw.id ?? crypto.randomUUID(),
    title: raw.title ?? '',
    description: raw.deck ?? raw.description ?? '',
    source: raw.source_name ?? raw.source ?? '',
    date: raw.published_at ?? raw.date ?? new Date().toISOString(),
    category: raw.category ?? 'geral',
    url: raw.source_url ?? raw.url ?? '#',
    image: raw.image_url ?? raw.image,
    summary_markdown: raw.summary_markdown,
  };
}

/** Map array of API cards to NewsCard[] */
export function transformCards(raw: unknown): NewsCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: APICardData) => transformCard(item));
}

export interface Cotacao {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  unit: string;
}

// ── Product Display Labels ──
const PRODUCT_LABELS: Record<string, string> = {
  boi_gordo: 'Boi Gordo',
  soja: 'Soja',
  milho: 'Milho',
  cafe_arabica: 'Café Arábica',
  cafe_robusta: 'Café Robusta',
  leite: 'Leite',
  trigo: 'Trigo',
  algodao: 'Algodão',
  frango: 'Frango',
  suino: 'Suíno',
};

// Preferred praça per product (first match wins)
const PREFERRED_PRACA: Record<string, string[]> = {
  boi_gordo: ['SP'],
  soja: ['MT', 'PR', 'RS'],
  milho: ['SP', 'PR'],
  cafe_arabica: ['SP'],
  cafe_robusta: ['ES'],
  leite: ['MG'],
};

// Products to exclude (never show these)
const EXCLUDED_PRODUCTS = ['boi_china'];

// Raw cotacao row from API
export interface APICotacaoData {
  id?: string;
  product?: string;
  price?: number;
  unit?: string;
  praca?: string;
  variation?: number;
  variation_pct?: number;
  change_day?: number;
  change_week?: number;
  date?: string;
  quote_date?: string;
  source_url?: string;
  // Fallbacks for alternative shapes
  name?: string;
  value?: number | string;
  change?: number | string;
  changePercent?: number | string;
  isPositive?: boolean;
}

/** Map raw cotacao to frontend shape */
export function transformCotacao(raw: APICotacaoData): Cotacao {
  const price = raw.price ?? (typeof raw.value === 'number' ? raw.value : 0);
  const variation = raw.change_day ?? raw.variation ?? (typeof raw.change === 'number' ? raw.change : 0);
  const positive = raw.isPositive ?? variation >= 0;
  const slug = raw.product ?? raw.name ?? '';
  const label = PRODUCT_LABELS[slug] ?? slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const praca = raw.praca ? ` (${raw.praca})` : '';

  return {
    name: `${label}${praca}`,
    value: `R$ ${typeof price === 'number' ? price.toFixed(2).replace('.', ',') : String(price)}`,
    change: (variation >= 0 ? '+' : '') + String(typeof variation === 'number' ? variation.toFixed(2).replace('.', ',') : variation),
    changePercent: '',
    isPositive: positive,
    unit: raw.unit ?? 'saca',
  };
}

/**
 * Pick the best single row per product from the raw API data.
 * - Excludes blacklisted products (boi_china etc.)
 * - Prefers the configured praça per product
 * - Falls back to the first available row
 */
export function pickBestCotacoes(rawRows: APICotacaoData[]): APICotacaoData[] {
  // Group by product
  const byProduct = new Map<string, APICotacaoData[]>();
  for (const row of rawRows) {
    const key = row.product ?? row.name ?? '';
    if (EXCLUDED_PRODUCTS.includes(key.toLowerCase())) continue;
    const arr = byProduct.get(key) ?? [];
    arr.push(row);
    byProduct.set(key, arr);
  }

  const result: APICotacaoData[] = [];
  for (const [product, rows] of byProduct) {
    const preferred = PREFERRED_PRACA[product] ?? [];
    // Find the first row matching a preferred praça
    let best: APICotacaoData | undefined;
    for (const pref of preferred) {
      best = rows.find(r => r.praca === pref);
      if (best) break;
    }
    result.push(best ?? rows[0]);
  }

  return result;
}

/** Map cotacoes API response to Cotacao[] (with smart dedup) */
export function transformCotacoes(raw: unknown): Cotacao[] {
  // Handle { data: [...] } or direct array
  const arr = Array.isArray(raw) ? raw : (raw as any)?.data;
  if (!Array.isArray(arr)) return [];
  const best = pickBestCotacoes(arr as APICotacaoData[]);
  return best.map(item => transformCotacao(item));
}

export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  icon: string;
  forecast: string;
}

export type ViewState = 'idle' | 'loading' | 'results';
