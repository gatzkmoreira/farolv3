# FarolV3 — Runbook

> Guia operacional para desenvolvedores e operadores

---

## 1. Arquitetura

```
                        DEV                                         PROD
┌─────────────────┐                                 ┌──────────────────┐
│  Frontend       │                                 │  Cloudflare      │
│  (Vite)         │                                 │  Pages Functions │
│  localhost:8080  │                                 │  /api/* → n8n    │
└───────┬─────────┘                                 └────────┬─────────┘
        │ Vite proxy /api/*                                  │ Proxy
        │ rewrite → /webhook/<path>                          │ ROUTE_MAPPING
        ▼                                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                n8n Workflows (Webhooks)                      │
│          https://n8n.olhonoagro.com.br/webhook/*             │
│                                                              │
│   /farol-search  /cards  /cotacoes  /weather                 │
│   /event  /feedback  /ping                                   │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
              ┌────────────────┐
              │   Supabase     │
              │   OpenAI       │
              │   OpenWeather  │
              └────────────────┘
```

---

## 2. Subir Ambiente Local (DEV)

### 2.1 Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:8080
```

### 2.2 Como funciona o proxy DEV

O Vite proxy (`vite.config.ts`) reescreve cada rota `/api/*` para o webhook correto do n8n:

| Frontend Path | → n8n Webhook Path |
|---|---|
| `/api/search` | `/farol-search` |
| `/api/cards` | `/cards` |
| `/api/cotacoes` | `/cotacoes` |
| `/api/weather` | `/weather` |
| `/api/event` | `/event` |
| `/api/feedback` | `/feedback` |
| `/api/healthcheck` | `/ping` |

> **Nota:** Não precisa de `.env` — o proxy aponta diretamente para `https://n8n.olhonoagro.com.br/webhook`.

### 2.3 Como funciona o proxy PROD

Em produção (Cloudflare Pages), o arquivo `functions/api/[[path]].ts` faz o mesmo mapeamento via `ROUTE_MAPPING`.

Diferença: Cloudflare Functions **adicionam headers CORS**; Vite proxy não precisa (same-origin).

### 2.4 Backend (n8n)

n8n roda em `https://n8n.olhonoagro.com.br`.

**Docker Compose env vars necessárias:**
```yaml
environment:
  - OPENWEATHER_API_KEY=<sua-chave>
  - OPENAI_API_KEY=<sua-chave>
```

---

## 3. Testar Endpoints

### 3.1 Via Proxy Local (recomendado)

```bash
# Healthcheck
curl http://localhost:8080/api/healthcheck | jq

# Search
curl -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"cotação do boi gordo"}' | jq
```

### 3.2 Direto no n8n (bypass proxy)

```bash
# Healthcheck
curl https://n8n.olhonoagro.com.br/webhook/ping | jq

# Cards
curl "https://n8n.olhonoagro.com.br/webhook/cards?limit=5" | jq

# Cotações
curl https://n8n.olhonoagro.com.br/webhook/cotacoes | jq

# Weather
curl "https://n8n.olhonoagro.com.br/webhook/weather?city=Sorriso&uf=MT" | jq

# Search
curl -X POST https://n8n.olhonoagro.com.br/webhook/farol-search \
  -H "Content-Type: application/json" \
  -d '{"query":"cotação do boi gordo"}' | jq

# Event
curl -X POST https://n8n.olhonoagro.com.br/webhook/event \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","payload":{}}' | jq

# Feedback
curl -X POST https://n8n.olhonoagro.com.br/webhook/feedback \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test","rating":5}' | jq
```

---

## 4. Workflows n8n (Ativos)

| Workflow | ID | Webhook Path | Nodes |
|----------|-----|------|-------|
| FarolV3 - API Search | `XoJqFZHjxBtvD8Cq` | `/farol-search` | 9 |
| FarolV3 - API Cards | `7VDcXh6dY9GC8DFx` | `/cards` | 4 |
| FarolV3 - API Cotacoes | `kqNuQ5UatwETzN3A` | `/cotacoes` | 3 |
| FarolV3 - API Weather | `i4qszmtXiii1VBpo` | `/weather` | 3 |
| FarolV3 - Healthcheck | `PALXVamV38HMiwiU` | `/ping` | 3 |
| FarolV3 - API Event | `my3QQWcn3DSYUM88` | `/event` | 3 |
| FarolV3 - API Feedback | `ED4tf2w59bmFzTYJ` | `/feedback` | 3 |

---

## 5. Telemetria

O frontend envia eventos via `trackEvent()` → `/api/event` (fire-and-forget):

```typescript
trackEvent("search", { query });
trackEvent("chip_click", { chip });
```

---

## 6. Troubleshooting

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| 502 Bad Gateway | Proxy não alcança n8n | Verificar se n8n está rodando |
| 404 Not Found | Webhook path errado | Verificar tabela de rotas acima |
| CORS Error | Headers faltando | Verificar `[[path]].ts` CORS |
| "Não foi possível" no browser | Parse/transform JS | F12 → Console → ver erro |
| Timeout | Workflow lento (~7-10s search) | Verificar executions no n8n |
| 422 parse body | JSON inválido | Verificar Content-Type header |

---

## 7. Deploy Checklist

### Frontend (Cloudflare Pages)

- [ ] Push para branch `main`
- [ ] Cloudflare detecta e faz build
- [ ] Verificar deploy em Cloudflare Dashboard

### Workflows (n8n)

- [ ] Testar via Execute Workflow
- [ ] Ativar workflow (toggle)
- [ ] Exportar JSON para `docs/workflows/`
- [ ] Atualizar `docs/workflows-map.md`

---

## 6. Debug frontend /api

### Checklist rápido (DevTools)

1. **Network tab**
   - Abra DevTools → Network
   - Execute a ação (busca, load de cards, etc.)
   - Procure por request `/api/search`, `/api/cards`, etc.
   - Checar:
     - **Status**: 200? 404? 500? 502?
     - **Response body**: JSON válido ou HTML (erro)?
     - **Content-Type**: `application/json` esperado

2. **Console tab**
   - Erro de CORS? → `Access-Control-Allow-Origin` faltando no n8n
   - Erro de JSON parse? → Endpoint retornando HTML (404 page)
   - Erro `undefined`? → Shape da resposta diferente do esperado

### Diagrama de fluxo de erro

```
Request /api/cards → 404?
  └─ Vite proxy NÃO configurado ou rota errada
     Checar: vite.config.ts → proxy

Request /api/cards → 502?
  └─ n8n indisponível ou workflow desativado
     Checar: n8n.olhonoagro.com.br/webhook/cards

Request /api/cards → 200 mas dados vazios?
  └─ Supabase: sem cards published ou RLS bloqueando
     Checar: SELECT count(*) FROM cards WHERE status='published'

Request /api/cards → 200 mas frontend não renderiza?
  └─ Shape mismatch: campo esperado (description) vs campo recebido (deck)
     Checar: "Format Response" node no workflow n8n
```

### Mapeamento de rotas (DEV)

| Frontend (Vite) | Vite Proxy rewrites to | n8n Webhook |
|---|---|---|
| `/api/search` | `/farol-search` | `/webhook/farol-search` |
| `/api/cards` | `/cards` | `/webhook/cards` |
| `/api/cotacoes` | `/cotacoes` | `/webhook/cotacoes` |
| `/api/weather` | `/weather` | `/webhook/weather` |
| `/api/event` | `/event` | `/webhook/event` |
| `/api/feedback` | `/feedback` | `/webhook/feedback` |
| `/api/healthcheck` | `/ping` | `/webhook/ping` |

### Teste manual via curl

```bash
# 1. Testar n8n direto (bypassa proxy):
curl -s https://n8n.olhonoagro.com.br/webhook/cards?limit=2 | jq .

# 2. Testar via Vite proxy (requer dev server rodando):
curl -s http://localhost:8080/api/cards?limit=2 | jq .

# 3. Verificar shape da resposta (NewsCard):
# Campos obrigatórios: id, title, description, source, date, category, url
# Campos opcionais: image, summary_markdown, chips, tags, source_logo
```

---

*Última atualização: 2026-02-08*
