# Farol Rural 2.0 - Documentação Técnica do Frontend

## 📋 Resumo do Projeto

**Farol Rural 2.0** é uma plataforma de busca inteligente e discovery para o agronegócio brasileiro. Não é um chat estilo ChatGPT, mas sim uma ferramenta de inteligência com respostas estruturadas.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.3.1 | Framework principal |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Estilização |
| TanStack Query | 5.x | Gerenciamento de estado/cache (preparado) |
| React Router DOM | 6.x | Roteamento |
| Lucide React | 0.462.0 | Ícones |
| Vaul | 0.9.9 | Drawer/Modal |

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   └── farol/
│       ├── Header.tsx          # Cabeçalho com navegação
│       ├── SearchHero.tsx      # Campo de busca principal
│       ├── SummaryBlock.tsx    # Renderiza resposta markdown
│       ├── NewsCard.tsx        # Card individual de notícia
│       ├── NewsGrid.tsx        # Grid de cards após busca
│       ├── NewsDrawer.tsx      # Modal lateral com resumo
│       ├── NewsCarousel.tsx    # Carrossel 2 linhas na home
│       ├── HotNews.tsx         # Notícias quentes (sidebar)
│       ├── CotacoesPanel.tsx   # Painel de cotações
│       ├── WeatherWidget.tsx   # Widget de clima
│       ├── LoadingSkeleton.tsx # Estados de loading
│       ├── Newsletter.tsx      # Captação de email
│       └── Footer.tsx          # Rodapé
├── pages/
│   └── Index.tsx               # Página principal
├── types/
│   └── farol.ts                # Interfaces TypeScript
└── index.css                   # Variáveis CSS e estilos base
```

---

## 📊 Interfaces TypeScript (Contratos de API)

### SearchResponse (Resposta da Busca)

```typescript
interface SearchResponse {
  intent: 'cotacao' | 'clima' | 'geral';
  answer_markdown: string;      // Markdown renderizado como resumo
  chips: string[];              // Sugestões de busca relacionadas
  cards: NewsCard[];            // Notícias relacionadas
  sources_used: string[];       // Fontes utilizadas na resposta
  timing_ms: number;            // Tempo de processamento
}
```

### NewsCard (Card de Notícia)

```typescript
interface NewsCard {
  id: string;
  title: string;
  description: string;
  source: string;               // Nome da fonte (ex: "Agronews")
  source_logo?: string;         // URL do logo da fonte
  date: string;                 // Data formatada (ex: "28 jan 2026")
  category: string;             // Categoria (Soja, Boi, Milho, etc.)
  url: string;                  // Link externo da matéria original
  image?: string;               // Imagem de capa (opcional)
  summary_markdown?: string;    // Resumo expandido para o drawer
}
```

### Cotacao (Dados de Cotação)

```typescript
interface Cotacao {
  name: string;           // Ex: "Boi Gordo"
  value: string;          // Ex: "R$ 315,50"
  change: string;         // Ex: "+2,30"
  changePercent: string;  // Ex: "+0,73%"
  isPositive: boolean;    // true = alta, false = baixa
  unit: string;           // Ex: "@" ou "saca"
}
```

### WeatherData (Dados de Clima)

```typescript
interface WeatherData {
  location: string;       // Ex: "Mato Grosso"
  temperature: string;    // Ex: "28°C"
  condition: string;      // Ex: "Parcialmente nublado"
  icon: string;           // sunny | cloudy | rainy | partlyCloudy
  forecast: string;       // Previsão resumida
}
```

---

## 🔌 Endpoints Necessários (Backend)

### 1. Busca Principal
```
POST /api/search
```

**Request:**
```json
{
  "query": "preço do boi gordo hoje",
  "user_id": "opcional"
}
```

**Response:**
```json
{
  "intent": "cotacao",
  "answer_markdown": "## Cotação do Boi Gordo\n\nO preço subiu **0,73%**...",
  "chips": ["Boi Gordo SP", "Exportações de carne", "Arroba hoje"],
  "cards": [
    {
      "id": "1",
      "title": "Preço do boi gordo atinge maior patamar",
      "description": "Demanda chinesa impulsiona valorização...",
      "source": "Agronews",
      "source_logo": "https://...",
      "date": "28 jan 2026",
      "category": "Boi",
      "url": "https://agronews.com/...",
      "summary_markdown": "O mercado registrou forte valorização..."
    }
  ],
  "sources_used": ["CEPEA/Esalq", "Scot Consultoria"],
  "timing_ms": 1247
}
```

---

### 2. Notícias em Alta (Home)
```
GET /api/news/hot
```

**Response:**
```json
{
  "cards": [
    {
      "id": "1",
      "title": "China aumenta importações de soja",
      "description": "...",
      "source": "Portal do Agro",
      "date": "28 jan 2026",
      "category": "Soja",
      "url": "https://..."
    }
  ]
}
```

---

### 3. Feed de Notícias (Carrossel)
```
GET /api/news/feed?limit=20
```

**Response:**
```json
{
  "cards": [
    // Array de NewsCard ordenado por data DESC
  ]
}
```

---

### 4. Cotações em Tempo Real
```
GET /api/cotacoes
```

**Response:**
```json
{
  "cotacoes": [
    {
      "name": "Boi Gordo",
      "value": "R$ 315,50",
      "change": "+2,30",
      "changePercent": "+0,73%",
      "isPositive": true,
      "unit": "@"
    },
    {
      "name": "Soja",
      "value": "R$ 138,00",
      "change": "-1,20",
      "changePercent": "-0,86%",
      "isPositive": false,
      "unit": "saca"
    }
  ],
  "updated_at": "2026-01-28T14:30:00Z"
}
```

---

### 5. Clima
```
GET /api/weather?region=centro-oeste
```

**Response:**
```json
{
  "location": "Brasil - Centro-Oeste",
  "temperature": "28°C",
  "condition": "Parcialmente nublado",
  "icon": "partlyCloudy",
  "max": "32°C",
  "min": "22°C",
  "rain_chance": "20%"
}
```

---

### 6. Registro de Eventos (Analytics)
```
POST /api/event
```

**Request:**
```json
{
  "event_type": "search" | "card_click" | "chip_click" | "external_link",
  "payload": {
    "query": "boi gordo",
    "card_id": "123",
    "source": "home"
  },
  "user_id": "opcional",
  "timestamp": "2026-01-28T14:30:00Z"
}
```

---

## 🔄 Fluxo de Estados da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                         ESTADOS                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐     busca      ┌───────────┐                 │
│   │   IDLE   │ ──────────────▶│  LOADING  │                 │
│   │          │                │           │                 │
│   │ Mostra:  │                │ Mostra:   │                 │
│   │ - HotNews│                │ Skeleton  │                 │
│   │ - Cotações               │ Loaders   │                 │
│   │ - Clima  │                └─────┬─────┘                 │
│   │ - Carousel               │       │                       │
│   └──────────┘                │       │ resposta             │
│        ▲                      │       ▼                      │
│        │                      │ ┌───────────┐                │
│        │      nova busca      │ │  RESULTS  │                │
│        └──────────────────────┼─│           │                │
│                               │ │ Mostra:   │                │
│                               │ │ - Summary │                │
│                               │ │ - NewsGrid│                │
│                               │ └───────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### Paleta de Cores (HSL)

```css
/* Cores Principais */
--primary: 152 45% 25%        /* Deep Forest Green */
--primary-foreground: 0 0% 100%
--accent: 43 74% 49%          /* Warm Gold */

/* Cores de Suporte */
--background: 40 33% 98%      /* Cream claro */
--foreground: 152 25% 15%     /* Verde escuro texto */
--muted: 40 20% 94%
--muted-foreground: 152 10% 45%

/* Cores Semânticas */
--green-light: 152 35% 92%    /* Verde claro para badges */
--gold: 43 74% 49%            /* Dourado para destaques */
--cream: 40 33% 96%           /* Fundo alternativo */
```

### Categorias de Notícias (Cores)

| Categoria | Cor do Badge |
|-----------|--------------|
| Soja | amber-100 / amber-700 |
| Milho | yellow-100 / yellow-700 |
| Café | orange-100 / orange-700 |
| Boi | red-100 / red-700 |
| Clima | blue-100 / blue-700 |
| Política & Mercado | purple-100 / purple-700 |
| Máquinas & Tecnologia | slate-100 / slate-700 |

---

## 🧩 Comportamentos Importantes

### 1. Busca
- Campo de busca no hero
- Chips rápidos clicáveis
- Loading state com skeleton
- Resultado aparece inline (sem reload)

### 2. Cards de Notícias
- Clique abre drawer lateral (não abre nova aba)
- Drawer mostra `summary_markdown` da notícia
- Botão "Ler matéria completa" → link externo
- Objetivo: manter usuário na plataforma

### 3. Carrossel (Home)
- 2 linhas que movem juntas
- Ordenação por data DESC
- Linha 1: posições ímpares (1ª, 3ª, 5ª...)
- Linha 2: posições pares (2ª, 4ª, 6ª...)

### 4. Markdown Rendering
- O campo `answer_markdown` deve ser renderizado como HTML
- Suporta: headings, bold, italic, listas, tabelas
- Estilo "briefing executivo" - limpo e escaneável

---

## 📱 Responsividade

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | 1 coluna, cards empilhados |
| Tablet (640-1024px) | 2 colunas |
| Desktop (>1024px) | 3-4 colunas |

---

## 🔗 Integrações Esperadas

1. **Supabase** - Banco de dados e autenticação
2. **n8n** - Orquestração de workflows e IA
3. **APIs de Cotações** - CEPEA, B3, etc.
4. **APIs de Clima** - INMET ou similar
5. **Scraping de Notícias** - Fontes do agro

---

## ✅ Checklist para Backend

- [ ] Endpoint POST /api/search retornando SearchResponse
- [ ] Endpoint GET /api/news/hot com notícias em alta
- [ ] Endpoint GET /api/news/feed com paginação
- [ ] Endpoint GET /api/cotacoes com dados atualizados
- [ ] Endpoint GET /api/weather por região
- [ ] Endpoint POST /api/event para analytics
- [ ] Geração de `answer_markdown` via IA (n8n + LLM)
- [ ] Geração de `summary_markdown` para cada notícia
- [ ] Classificação de `intent` da busca
- [ ] Sugestão de `chips` relacionados

---

## 📝 Exemplo de Resposta Completa

```json
{
  "intent": "cotacao",
  "answer_markdown": "## Cotação do Boi Gordo - 28 de Janeiro de 2026\n\nO preço do boi gordo **subiu 0,73%** na última sessão, atingindo **R$ 315,50 por arroba** na média nacional.\n\n### Principais destaques:\n\n- **São Paulo:** R$ 318,00/@ (+0,8%)\n- **Mato Grosso:** R$ 310,00/@ (+0,5%)\n- **Goiás:** R$ 312,50/@ (+0,6%)\n\n### Fatores de influência:\n\n1. **Demanda aquecida** para exportação, especialmente para China\n2. **Oferta restrita** devido ao período de entressafra\n3. **Dólar em alta** favorecendo exportadores\n\n| Praça | Preço (R$/@) | Variação |\n|-------|--------------|----------|\n| SP Capital | 318,00 | +0,8% |\n| Triângulo Mineiro | 315,00 | +0,7% |",
  "chips": ["Boi Gordo SP", "Exportações de carne", "Arroba hoje", "Frigoríficos"],
  "cards": [
    {
      "id": "1",
      "title": "Preço do boi gordo atinge maior patamar em 6 meses",
      "description": "Demanda chinesa e oferta restrita impulsionam valorização da arroba no mercado brasileiro.",
      "source": "Agronews",
      "date": "28 jan 2026",
      "category": "Boi",
      "url": "https://agronews.com/boi-gordo-alta",
      "summary_markdown": "O mercado de boi gordo brasileiro registrou forte valorização nesta terça-feira, com a arroba alcançando R$ 318,00 em São Paulo.\n\n**Principais fatores:**\n- Demanda aquecida da China\n- Oferta restrita no período de entressafra\n- Câmbio favorável para exportações"
    }
  ],
  "sources_used": ["CEPEA/Esalq", "Scot Consultoria", "ABIEC"],
  "timing_ms": 1247
}
```

---

## 🚀 Próximos Passos

1. Criar tabelas no Supabase
2. Configurar workflows no n8n
3. Implementar scraping de notícias
4. Conectar APIs de cotações
5. Integrar LLM para geração de resumos
6. Conectar frontend aos endpoints

---

*Documentação gerada automaticamente - Farol Rural 2.0*
