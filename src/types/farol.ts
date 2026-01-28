export interface SearchResponse {
  intent: 'cotacao' | 'clima' | 'geral';
  answer_markdown: string;
  chips: string[];
  cards: NewsCard[];
  sources_used: string[];
  timing_ms: number;
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

export interface Cotacao {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  unit: string;
}

export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  icon: string;
  forecast: string;
}

export type ViewState = 'idle' | 'loading' | 'results';
