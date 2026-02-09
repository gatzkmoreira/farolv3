# FarolV3 — Backend Routes Matrix

> Mapeamento completo: Frontend → Proxy → n8n Workflows

---

## 1. Visão Geral

| Camada | URL Base |
|--------|----------|
| Frontend DEV | `http://localhost:8080` (Vite proxy) |
| Frontend PROD | `https://[cf-pages-domain]` (Cloudflare Functions) |
| n8n Webhooks | `https://n8n.olhonoagro.com.br/webhook` |

---

## 2. Tabela de Rotas

> **⚠️ ATENÇÃO**: Os paths de webhook no n8n **NÃO** seguem o padrão `/api/*`.
> O proxy (DEV e PROD) mapeia `/api/*` para os paths reais do n8n.

| Front Path | Method | n8n Webhook Path | Workflow Name | Workflow ID | Status |
|------------|--------|------------------|---------------|-------------|--------|
| `/api/search` | POST | `/farol-search` | FarolV3 - API Search | `XoJqFZHjxBtvD8Cq` | ✅ Ativo |
| `/api/cards` | GET | `/cards` | FarolV3 - API Cards | `7VDcXh6dY9GC8DFx` | ✅ Ativo |
| `/api/cotacoes` | GET | `/cotacoes` | FarolV3 - API Cotacoes | `kqNuQ5UatwETzN3A` | ✅ Ativo |
| `/api/weather` | GET | `/weather` | FarolV3 - API Weather | `i4qszmtXiii1VBpo` | ✅ Ativo |
| `/api/healthcheck` | GET | `/ping` | FarolV3 - Healthcheck | `PALXVamV38HMiwiU` | ✅ Ativo |
| `/api/event` | POST | `/event` | FarolV3 - API Event | `my3QQWcn3DSYUM88` | ✅ Ativo |
| `/api/feedback` | POST | `/feedback` | FarolV3 - API Feedback | `ED4tf2w59bmFzTYJ` | ✅ Ativo |

---

## 3. Proxy Configuration

### 3.1 DEV — Vite (`vite.config.ts`)

```typescript
proxy: {
  '/api/search':      { target: N8N, rewrite: path => '/farol-search' },
  '/api/cards':       { target: N8N, rewrite: path => '/cards' },
  '/api/cotacoes':    { target: N8N, rewrite: path => '/cotacoes' },
  '/api/weather':     { target: N8N, rewrite: path => '/weather' },
  '/api/event':       { target: N8N, rewrite: path => '/event' },
  '/api/feedback':    { target: N8N, rewrite: path => '/feedback' },
  '/api/healthcheck': { target: N8N, rewrite: path => '/ping' },
}
```

### 3.2 PROD — Cloudflare (`functions/api/[[path]].ts`)

```typescript
const ROUTE_MAPPING = {
  "/api/search":      "/farol-search",
  "/api/weather":     "/weather",
  "/api/cards":       "/cards",
  "/api/cotacoes":    "/cotacoes",
  "/api/event":       "/event",
  "/api/feedback":    "/feedback",
  "/api/healthcheck": "/ping",
};
```

Adiciona headers CORS em todas as respostas.

---

## 4. Frontend Components ↔ Endpoints

### 4.1 Live (API real)

| Componente | Endpoint | Método |
|------------|----------|--------|
| `Index.tsx` | `/api/search` | POST via `apiFetch()` |
| `Index.tsx` | `/api/event` | POST via `trackEvent()` |
| `WeatherWidget.tsx` | `/api/weather` | GET via `apiFetch()` |

### 4.2 Mock Data (pendente migração)

| Componente | Dado Mock | Endpoint Alvo |
|------------|-----------|---------------|
| `HotNews.tsx` | `mockHotNews[]` | `/api/cards?category=hot` |
| `CotacoesPanel.tsx` | `mockCotacoes[]` | `/api/cotacoes` |
| `NewsCarousel.tsx` | `mockCarouselNews[]` | `/api/cards` |

---

## 5. Contratos TypeScript

| Arquivo | Request Type | Response Type | Usado em |
|---------|--------------|---------------|----------|
| `farol.ts` | `{ query: string }` | `APISearchResponse → SearchResponse` | Index.tsx |
| `farol.ts` | Query params | `WeatherData` | WeatherWidget.tsx |
| contracts `event.types.ts` | `EventRequest` | `{ success: boolean }` | api.ts |
| contracts `feedback.types.ts` | `FeedbackRequest` | `{ success: boolean }` | (não usado) |

### Nota sobre `apiFetch`

`apiFetch()` em `src/lib/api.ts` **auto-unwrap** a resposta:
```typescript
return (json?.data ?? json) as T;
```
Portanto, se a API retorna `{ success, data: {...} }`, o caller recebe o `data` diretamente.

O `transformSearchResponse()` lida com ambos os formatos (wrapped e unwrapped).

---

## 6. Troubleshooting

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| 502 Bad Gateway | n8n down | Verificar se n8n está rodando |
| 404 Not Found | Webhook path errado | Verificar tabela de rotas §2 |
| CORS Error | Headers faltando | Verificar `[[path]].ts` |
| "Não foi possível" | JS parse/transform | F12 → Console → ver log `[Farol]` |
| 422 parse body | JSON malformado | Verificar Content-Type + body |
| Timeout | Workflow ~7-10s (search) | Normal; verificar n8n executions |

---

*Última atualização: 2026-02-07*
