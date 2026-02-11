# FarolRural V3 — Runbook

## Como rodar local

```bash
cd frontend
npm install
npm run dev
# Abre http://localhost:8080
```

### Variáveis necessárias

O proxy para n8n está configurado em `vite.config.ts` (plugin `n8nApiProxy`).
O endpoint alvo está hardcoded como `https://n8n.farolrural.com.br`.

Para Cloudflare Functions (produção), o proxy está em `functions/api/[[path]].ts`.

## Checklist MVP no browser

| # | Teste | Como verificar |
|---|-------|---------------|
| 1 | Home carrega | Abrir `/` — sem tela branca |
| 2 | Cards (HotNews) | 3 cards no painel esquerdo |
| 3 | Cotações | Painel central com preços reais (Boi Gordo SP, Soja, Milho, etc.) |
| 4 | Clima | Painel direito com temperatura e previsão |
| 5 | Carousel | Seção "Cards de Notícias" com cards e filtro por categoria |
| 6 | Busca | Digitar "soja" → resposta com resumo + chips + cards |
| 7 | Modal do card | Clicar num card → drawer abre com conteúdo completo |
| 8 | Feedback | Após busca, clicar 👍 ou 👎 → botão muda de estado |
| 9 | Console limpo | DevTools → Console → sem erros vermelhos |

## Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/ping` | GET | Health check do proxy |
| `/api/cards` | GET | Cards de notícias |
| `/api/cotacoes` | GET | Cotações de commodities |
| `/api/weather` | GET | Dados climáticos |
| `/api/search` | POST | Busca com `{ query: "..." }` |
| `/api/feedback` | POST | Feedback `{ rating, session_id }` |
| `/api/events` | POST | Telemetria `{ event, properties }` |

## Build de produção

```bash
npm run build
# Output em dist/
```
