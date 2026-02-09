# FarolV3 — Mapa de Workflows

> Última atualização: 2026-02-07

---

| Workflow | Endpoint | Método | Contrato |
|----------|----------|--------|----------|
| [API Search](#workflow-farolv3---api-search) | `/webhook/farol-search` | POST | `search.types.ts` |
| [API Cards](#workflow-farolv3---api-cards) | `/webhook/cards` | GET | `cards.types.ts` |
| [API Cotacoes](#workflow-farolv3---api-cotacoes) | `/webhook/cotacoes` | GET | `cotacoes.types.ts` |
| [API Weather](#workflow-farolv3---api-weather) | `/webhook/weather` | GET | `weather-api.types.ts` |
| [Healthcheck](#workflow-farolv3---healthcheck) | `/webhook/ping` | GET | `healthcheck.types.ts` |
| [API Event](#workflow-farolv3---api-event) | `/webhook/event` | POST | `event.types.ts` |
| [API Feedback](#workflow-farolv3---api-feedback) | `/webhook/feedback` | POST | `feedback.types.ts` |

---

## Workflow: FarolV3 - API Search

| Campo | Valor |
|-------|-------|
| **ID** | `XoJqFZHjxBtvD8Cq` |
| **Status** | ativo ✅ |
| **Dependências** | Supabase, OpenAI |
| **Tabelas** | `quotes_latest` (SELECT), `cards` (SELECT) |

### Endpoint

```
POST https://n8n.olhonoagro.com.br/webhook/farol-search
```

### Request

```json
{
  "query": "preço da soja em Rondonópolis",
  "session_id": "abc-123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "intent": "cotacao",
    "confidence": 0.95,
    "answer": "A soja em Rondonópolis...",
    "chips": ["Ver histórico", "Comparar praças"],
    "sources": [{ "name": "CEPEA", "url": "..." }],
    "timingMs": 1250
  },
  "meta": {
    "sessionKey": "sess_abc123",
    "handler": "cotacao",
    "version": "v4.0"
  }
}
```

---

## Workflow: FarolV3 - API Cards

| Campo | Valor |
|-------|-------|
| **ID** | `7VDcXh6dY9GC8DFx` |
| **Status** | ativo ✅ |
| **Dependências** | Supabase |
| **Tabelas** | `cards` (SELECT) |

### Endpoint

```
GET https://n8n.olhonoagro.com.br/webhook/cards
```

### Query Params

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `category` | string | - | Filtrar por categoria |
| `limit` | number | 20 | Máximo de cards |
| `offset` | number | 0 | Paginação |

### Request

```
GET /webhook/cards?category=mercado&limit=10
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "card_123",
      "category": "mercado",
      "title": "Soja atinge recorde",
      "deck": "Preços sobem 3% na semana",
      "chips": ["soja", "exportação"],
      "tags": ["commodities"],
      "image_url": null,
      "source_name": "CEPEA",
      "source_url": "https://...",
      "published_at": "2026-02-05T10:00:00Z"
    }
  ],
  "meta": {
    "limit": 10,
    "offset": 0,
    "count": 1
  }
}
```

---

## Workflow: FarolV3 - API Cotacoes

| Campo | Valor |
|-------|-------|
| **ID** | `kqNuQ5UatwETzN3A` |
| **Status** | ativo ✅ |
| **Dependências** | Supabase |
| **Tabelas** | `quotes` (SELECT) |

### Endpoint

```
GET https://n8n.olhonoagro.com.br/webhook/cotacoes
```

### Query Params

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `product` | string | - | Slug do produto (boi_gordo, soja...) |
| `praca` | string | - | UF da praça (SP, MT...) |
| `days` | number | 7 | Últimos N dias |
| `limit` | number | 50 | Máximo de registros |

### Request

```
GET /webhook/cotacoes?product=soja&days=14
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "quote_456",
      "product": "soja",
      "praca": "MT",
      "region": "Sorriso",
      "unit": "R$/sc",
      "price": 125.50,
      "currency": "BRL",
      "quote_date": "2026-02-05",
      "change_day": 1.2,
      "change_week": 3.5,
      "source_url": "https://..."
    }
  ],
  "grouped": {
    "soja": [{ "...": "..." }]
  },
  "meta": {
    "filters": { "product": "soja", "days": 14 },
    "count": 1,
    "limit": 50
  }
}
```

---

## Workflow: FarolV3 - API Weather

| Campo | Valor |
|-------|-------|
| **ID** | `i4qszmtXiii1VBpo` |
| **Status** | ativo ✅ |
| **Dependências** | OpenWeather (`$env.OPENWEATHER_API_KEY`) |
| **Tabelas** | nenhuma |

### Endpoint

```
GET https://n8n.olhonoagro.com.br/webhook/weather
```

### Query Params

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `city` / `cidade` | string | Sao Paulo | Nome da cidade |
| `uf` | string | SP | UF (usado apenas para display) |

### Cidades Suportadas

sao paulo, cuiaba, sorriso, campo grande, goiania, ribeirao preto, londrina, curitiba, belo horizonte, uberaba, rio verde, sinop, lucas do rio verde, rondonopolis, dourados, chapeco, passo fundo

### Request

```
GET /webhook/weather?city=sorriso
```

### Response

```json
{
  "success": true,
  "data": {
    "location": { "name": "Sorriso", "uf": "MT", "lat": -12.55, "lon": -55.71 },
    "current": {
      "temp": 32,
      "feels_like": 35,
      "temp_min": 28,
      "temp_max": 35,
      "humidity": 65,
      "condition": "parcialmente nublado",
      "wind_speed": 12,
      "clouds": 40
    },
    "forecast": [
      { "date": "2026-02-06", "temp_min": 24, "temp_max": 34, "condition": "céu limpo", "humidity": 60, "rain_prob": 10 }
    ],
    "source": "OpenWeather",
    "updated_at": "2026-02-05T12:00:00Z"
  },
  "meta": {
    "requestedCity": "sorriso",
    "requestedUf": "SP",
    "matchedLocation": "Sorriso"
  }
}
```

---

## Workflow: FarolV3 - Healthcheck

| Campo | Valor |
|-------|-------|
| **ID** | `PALXVamV38HMiwiU` |
| **Status** | ativo ✅ |
| **Dependências** | Supabase, OpenWeather (`$env`) |
| **Tabelas** | `sources` (SELECT para teste) |

### Endpoint

```
GET https://n8n.olhonoagro.com.br/webhook/ping
```

### Request

```
GET /webhook/ping
```

### Response

```json
{
  "healthy": true,
  "checks": {
    "supabase": { "status": "ok", "latency": 145 },
    "openweather": { "status": "ok", "latency": 320 },
    "timestamp": "2026-02-05T12:00:00Z",
    "version": "v4.0"
  }
}
```

---

## Workflow: FarolV3 - API Event

| Campo | Valor |
|-------|-------|
| **ID** | `my3QQWcn3DSYUM88` |
| **Status** | ativo ✅ |
| **Dependências** | Supabase ($env.SUPABASE_URL, $env.SUPABASE_SERVICE_KEY) |
| **Tabelas** | `events` (INSERT) |

### Endpoint

```
POST https://n8n.olhonoagro.com.br/webhook/event
```

### Event Types

`search_submitted`, `chip_clicked`, `card_clicked`, `external_link_clicked`, `feedback_given`, `page_view`, `error`

### Request

```json
{
  "session_id": "sess_abc123",
  "event_type": "chip_clicked",
  "payload": { "chip": "soja", "position": 0 }
}
```

### Response (sucesso)

```json
{
  "success": true,
  "data": { "event_id": "evt_789" }
}
```

### Response (erro)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "event_type is required. Valid types: ..."
  }
}
```

---

## Workflow: FarolV3 - API Feedback

| Campo | Valor |
|-------|-------|
| **ID** | `ED4tf2w59bmFzTYJ` |
| **Status** | ativo ✅ |
| **Dependências** | Supabase ($env.SUPABASE_URL, $env.SUPABASE_SERVICE_KEY) |
| **Tabelas** | `feedback` (INSERT), `events` (INSERT) |

### Endpoint

```
POST https://n8n.olhonoagro.com.br/webhook/feedback
```

### Request

```json
{
  "ai_output_id": "out_abc123",
  "session_id": "sess_xyz789",
  "rating": "positive",
  "comment": "Resposta muito útil!"
}
```

### Response (sucesso)

```json
{ "success": true }
```

### Response (erro)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ai_output_id and rating (positive/negative) are required"
  }
}
```

---

## Scrapers (ingestão)

| Workflow | ID | Status | Schedule |
|----------|-----|--------|----------|
| Scrape Cotações v2 | `Cx98ybOmXh9IOFvrM6ME4` | ativo ✅ | cron |
| Scrape News Generic | `FsZqNKfSc5ZpdR7IwCF9P` | ativo ✅ | cron |
| Scrape Pecuaria Corte | `7htvKRVK4UP59QpqFT959` | ativo ✅ | cron |
| Scrape Graos | `0BTxKkNT1jz-b72atcaSS` | ativo ✅ | cron |
| Scrape Cafe | `DCXHg27TZq5hlaKCdiAKV` | ativo ✅ | cron |
| Scrape Clima | `Pd9LdrGh4SBPEBn-tHxP0` | ativo ✅ | cron |
| Healthcheck Sources | `4foYWmptzst7QYbFR0RP3` | ativo ✅ | cron |

---

## Workflows Legados (inativos)

> [!NOTE]
> Os seguintes workflows legados foram **desativados** e substituídos por versões FarolV3:

| Legado | FarolV3 | Status |
|--------|---------|--------|
| `API Session - FarolRural` | `FarolV3 - API Search` | ✅ substituído |
| `API Cards - FarolRural` | `FarolV3 - API Cards` | ✅ substituído |
| `API Weather - FarolRural` | `FarolV3 - API Weather` | ✅ substituído |
| `API Event - FarolRural` | `FarolV3 - API Event` | ✅ substituído |
| `API Feedback - FarolRural` | `FarolV3 - API Feedback` | ✅ substituído |
