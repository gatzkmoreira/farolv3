# Frontend Import Guide — FarolRural V3

> Guia completo para executar e conectar o frontend Lovable aos workflows FarolV3

---

## 1. Status do Import

| Item | Status |
|------|--------|
| Repo clonado | ✅ `frontend/` |
| Stack | Vite + React 18 + TypeScript + TailwindCSS + shadcn-ui |
| Proxy para n8n | ✅ `functions/api/[[path]].ts` |
| Componentes Farol | ✅ 15 componentes |

**Origem:** https://github.com/gatzkmoreira/agro-insight-hub

**Comando executado:**
```bash
cd C:\Users\pichau\Documents\FarolV3
git clone https://github.com/gatzkmoreira/agro-insight-hub.git frontend
```

---

## 2. Estrutura Final

```
FarolV3/
├── backend/                   # Contracts e tipos
├── docs/                      # Documentação
├── workflows/                 # JSONs exportados do n8n
│
└── frontend/                  # ← IMPORTADO
    ├── package.json           # Scripts: dev, build, test
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    │
    ├── src/
    │   ├── main.tsx           # Entry point
    │   ├── App.tsx            # Router
    │   ├── index.css          # Estilos globais
    │   │
    │   ├── components/
    │   │   ├── farol/         # 15 componentes principais
    │   │   │   ├── Header.tsx
    │   │   │   ├── SearchHero.tsx
    │   │   │   ├── SummaryBlock.tsx
    │   │   │   ├── NewsGrid.tsx
    │   │   │   ├── NewsCard.tsx
    │   │   │   ├── NewsDrawer.tsx
    │   │   │   ├── NewsCarousel.tsx
    │   │   │   ├── HotNews.tsx
    │   │   │   ├── CotacoesPanel.tsx
    │   │   │   ├── WeatherWidget.tsx
    │   │   │   ├── LoadingSkeleton.tsx
    │   │   │   ├── LoadingMessages.tsx
    │   │   │   ├── TypewriterText.tsx
    │   │   │   ├── Newsletter.tsx
    │   │   │   └── Footer.tsx
    │   │   │
    │   │   ├── ui/            # shadcn-ui components
    │   │   └── NavLink.tsx
    │   │
    │   ├── lib/
    │   │   ├── api.ts         # apiFetch() + trackEvent()
    │   │   └── utils.ts       # cn() helper
    │   │
    │   ├── types/
    │   │   └── farol.ts       # Interfaces TypeScript
    │   │
    │   ├── pages/
    │   ├── hooks/
    │   └── test/
    │
    └── functions/             # Cloudflare Pages Functions
        └── api/
            └── [[path]].ts    # Proxy para n8n
```

---

## 3. Como Rodar Localmente

### 3.1 Instalar Dependências

```bash
cd C:\Users\pichau\Documents\FarolV3\frontend
npm install
```

### 3.2 Proxy (Já Configurado ✅)

O arquivo `functions/api/[[path]].ts` define o endpoint do n8n:

```typescript
// Linha 14 - CONFIRMADO CORRETO
const N8N_WEBHOOK_BASE = "https://n8n.olhonoagro.com.br/webhook";
```

> **✅ Status:** URL já está correta, não precisa alterar.

### 3.3 Rodar Dev Server

```bash
npm run dev
```

**Porta padrão:** `http://localhost:5173`

### 3.4 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Server de desenvolvimento |
| `build` | `npm run build` | Build de produção |
| `preview` | `npm run preview` | Preview do build |
| `test` | `npm run test` | Executar testes |
| `lint` | `npm run lint` | ESLint |

---

## 4. Endpoints Esperados

O proxy `[[path]].ts` mapeia `/api/*` → `/webhook/*`:

| Frontend | n8n Webhook | Método | Workflow ID |
|----------|-------------|--------|-------------|
| `/api/search` | `/webhook/search` | POST | (farol-search) |
| `/api/cards` | `/webhook/cards` | GET | `7VDcXh6dY9GC8DFx` |
| `/api/weather` | `/webhook/weather` | GET | `i4qszmtXiii1VBpo` |
| `/api/cotacoes` | `/webhook/cotacoes` | GET | `kqNuQ5UatwETzN3A` |
| `/api/event` | `/webhook/event` | POST | `QFnKJy10Tt9RQ2XK` |
| `/api/feedback` | `/webhook/feedback` | POST | `wT69mJ7gFKdAXTXf` |
| `/api/ping` | - | GET | (handled by proxy) |

### Fluxo de Request

```
Frontend                Cloudflare Pages        n8n
   │                         │                   │
   │  POST /api/search       │                   │
   │ ───────────────────────►│                   │
   │                         │  POST /webhook/search
   │                         │─────────────────►│
   │                         │                   │
   │                         │◄────────────────│
   │◄───────────────────────│                   │
   │     { success, data }   │                   │
```

---

## 5. Validação Rápida (Smoke Test)

### Teste 1: Frontend rodando

```bash
cd frontend
npm run dev
# Acesse http://localhost:5173
# Deve ver a home do FarolRural
```

### Teste 2: Proxy ping

```bash
curl http://localhost:5173/api/ping
# Esperado: { "success": true, "message": "FarolRural API Proxy is running", ... }
```

### Teste 3: Cards via proxy

```bash
curl http://localhost:5173/api/cards
# Esperado: { "success": true, "data": [...] }
```

### Teste 4: Search via proxy

```bash
curl -X POST http://localhost:5173/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "preço do boi"}'
# Esperado: { "success": true, "data": { "intent": "COTACAO", ... } }
```

---

## 6. Próximos Passos

- [ ] Executar `npm install` no frontend
- [ ] Verificar/atualizar URL do n8n no proxy
- [ ] Rodar `npm run dev` e testar home
- [ ] Validar integração com endpoints n8n
- [ ] Configurar deploy (Cloudflare Pages ou outro)

---

## 7. Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| `npm install` falha | Node antigo | Usar Node 18+ |
| CORS error | Proxy não configurado | Verificar `functions/api/[[path]].ts` |
| Cards vazios | Workflow inativo | Ativar no n8n UI |
| Proxy 502 | n8n offline | Verificar n8n.jgmoreira.com.br |
| Timeout | LLM lento | Aumentar timeout no fetch |

---

**Documento atualizado:** 2026-02-05  
**Versão:** 2.0
