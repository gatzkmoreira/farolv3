# PRD — FarolRural V3 (FarolV3)
**Versão:** 0.1  
**Status:** Draft (base para execução)  
**Orçamento alvo:** até US$ 20 / 10.000 buscas / mês  

---

## 1. Visão Geral
O FarolRural V3 é um site e motor de respostas focado no agronegócio brasileiro.  
Ele funciona como um **leitor de cenário + organizador + professor prático**, entregando respostas estruturadas, rápidas e contextualizadas.

---

## 2. Objetivo principal
1) Entregar ao usuário **respostas de alto valor** (cotação, clima, geral), com contexto e fontes.  
2) Manter o site “vivo” via **feed de cards** e **resumos editoriais no modal**.  
3) Capturar telemetria (anonimizada) para alimentar a Solis Intelligence.

---

## 3. Stack tecnológica (em aberto para decisão)
- Orquestração: n8n (self-hosted) ou backend próprio em conjunto
- Banco: Supabase Postgres + pgvector
- Scraping: Playwright (serviço/worker)
- LLM/Embeddings: OpenAI (modelos a definir por custo/qualidade)
- Observabilidade: logs + métricas + alertas

---

4 - Estrutura de Telas - Farol Rural 2.0 (Estado Atual)
═══════════════════════════════════════════════════════════════════════════════
                              ESTADOS DA APLICAÇÃO
═══════════════════════════════════════════════════════════════════════════════

   ┌──────────┐       busca        ┌───────────┐      resposta     ┌───────────┐
   │   IDLE   │ ──────────────────▶│  LOADING  │ ─────────────────▶│  RESULTS  │
   └──────────┘                    └───────────┘                   └───────────┘
        ▲                                                                │
        └────────────────────── nova busca ──────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                        4.1 HOME (IDLE - Sem Busca)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏷️ HEADER                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  🌾 FarolRural              [ Cotações ]  [ Clima ]  [ Sobre ]          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔍 HERO DE BUSCA (SearchHero.tsx)                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                          ┌─────────────┐                                │ │
│ │                          │ Em evolução │  ← selo outline -6°            │ │
│ │                          └─────────────┘                                │ │
│ │                       Farol Rural                                       │ │
│ │                       (amarelo)(verde)                                  │ │
│ │                       O caminho do agro                                 │ │
│ │                                                                         │ │
│ │   ┌─────────────────────────────────────────────────────────────────┐   │ │
│ │   │ 🔍 Pesquise: Preço do boi hoje...               [ Pesquisar ]   │   │ │
│ │   └─────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                         │ │
│ │   [ Boi gordo ] [ Soja ] [ Milho ] [ Café ] [ Clima ] [ Exportações ]   │ │
│ │                       ↑ chips clicáveis                                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 DASHBOARD (3 colunas no desktop)                                         │
│ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐           │
│ │ 🔥 NOTÍCIAS       │ │ 📈 COTAÇÕES       │ │ 🌤️ CLIMA          │           │
│ │    QUENTES        │ │                   │ │                   │           │
│ │ ┌───────────────┐ │ │ Boi    R$315 +0.7%│ │ Centro-Oeste      │           │
│ │ │ Título 1...   │ │ │ Soja   R$138 -0.8%│ │ 28°C              │           │
│ │ │ Fonte • data  │ │ │ Milho  R$72  +0.3%│ │ Parc. nublado     │           │
│ │ ├───────────────┤ │ │ Café   R$1250+1.2%│ │                   │           │
│ │ │ Título 2...   │ │ │                   │ │ Previsão: chuvas  │           │
│ │ │ Fonte • data  │ │ │ Atualizado: 14:30 │ │ isoladas à tarde  │           │
│ │ ├───────────────┤ │ │                   │ │                   │           │
│ │ │ Título 3...   │ │ │                   │ │                   │           │
│ │ └───────────────┘ │ └───────────────────┘ └───────────────────┘           │
│ │   (HotNews.tsx)   │   (CotacoesPanel)      (WeatherWidget)                │
│ └───────────────────┘                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📰 CARROSSEL DE NOTÍCIAS (NewsCarousel.tsx) - 2 linhas sincronizadas        │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  ◀  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  ▶           │ │
│ │     │ Card 1 │ │ Card 3 │ │ Card 5 │ │ Card 7 │ │ Card 9 │   Linha 1   │ │
│ │     │ (ímpar)│ │        │ │        │ │        │ │        │   (ímpares) │ │
│ │     └────────┘ └────────┘ └────────┘ └────────┘ └────────┘              │ │
│ │     ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │ │
│ │     │ Card 2 │ │ Card 4 │ │ Card 6 │ │ Card 8 │ │Card 10 │   Linha 2   │ │
│ │     │ (par)  │ │        │ │        │ │        │ │        │   (pares)   │ │
│ │     └────────┘ └────────┘ └────────┘ └────────┘ └────────┘              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 NEWSLETTER (Newsletter.tsx)                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │         Fique por dentro das novidades do agronegócio                   │ │
│ │   ┌──────────────────────────────────┐  ┌─────────────┐                 │ │
│ │   │ seu@email.com                    │  │  Inscrever  │                 │ │
│ │   └──────────────────────────────────┘  └─────────────┘                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🦶 FOOTER (Footer.tsx)                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  © 2026 Farol Rural    |    Termos    |    Privacidade    |    Contato  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                     4.2 LOADING (Durante a Busca)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏷️ HEADER                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔍 HERO DE BUSCA                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 🔍 preço do boi gordo são paulo          [ ⟳ Buscando... ]          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💀 SKELETON LOADERS (LoadingSkeleton.tsx)                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  ████████████████████████████████████████  ← bloco pulsante             │ │
│ │  ████████████████████████                                               │ │
│ │  ████████████████████████████████                                       │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ← cards skeleton             │ │
│ │  │ ████████ │  │ ████████ │  │ ████████ │                               │ │
│ │  │ ████     │  │ ████     │  │ ████     │                               │ │
│ │  └──────────┘  └──────────┘  └──────────┘                               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 NEWSLETTER                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🦶 FOOTER                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                     4.3 RESULTS (Após Busca Bem-Sucedida)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏷️ HEADER                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔍 HERO DE BUSCA                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 🔍 preço do boi gordo são paulo                    [ Pesquisar ]    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│   [ Boi gordo ] [ Soja ] [ Milho ] [ Café ] [ Clima ] [ Exportações ]       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📝 BLOCO DE RESUMO (SummaryBlock.tsx)                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │  ## Cotação do Boi Gordo - 28 de Janeiro de 2026                        │ │
│ │                                                                         │ │
│ │  O preço do boi gordo **subiu 0,73%** na última sessão,                 │ │
│ │  atingindo **R$ 315,50 por arroba** na média nacional.                  │ │
│ │                                                                         │ │
│ │  ### Principais destaques:                                              │ │
│ │  - **São Paulo:** R$ 318,00/@ (+0,8%)                                   │ │
│ │  - **Mato Grosso:** R$ 310,00/@ (+0,5%)                                 │ │
│ │                                                                         │ │
│ │  | Praça          | Preço    | Variação |                               │ │
│ │  |----------------|----------|----------|                               │ │
│ │  | SP Capital     | R$318,00 | +0,8%    |                               │ │
│ │  | Triângulo MG   | R$315,00 | +0,7%    |                               │ │
│ │                                                                         │ │
│ │  ─────────────────────────────────────────────────                      │ │
│ │  📚 Fontes: CEPEA/Esalq, Scot Consultoria, ABIEC                        │ │
│ │  ⏱️ Processado em 1.247ms                                                │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📰 GRID DE NOTÍCIAS (NewsGrid.tsx)                                          │
│                                                                             │
│ DESKTOP:                                                                    │
│ ┌───────────────┬───────────────────────────────────────────────────────┐   │
│ │ 📂 FILTROS    │  💡 CHIPS DE SUGESTÃO                                 │   │
│ │               │  [ Boi Gordo SP ] [ Exportações ] [ Arroba hoje ]     │   │
│ │ ○ Todas      │                                                        │   │
│ │ ○ Pecuária   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│ │ ● Boi        │  │ 🏷️ Boi       │ │ 🏷️ Boi       │ │ 🏷️ Exportação│    │   │
│ │ ○ Soja       │  │              │ │              │ │              │    │   │
│ │ ○ Milho      │  │ Título da    │ │ Título da    │ │ Título da    │    │   │
│ │ ○ Café       │  │ notícia 1... │ │ notícia 2... │ │ notícia 3... │    │   │
│ │ ○ Tecnologia │  │              │ │              │ │              │    │   │
│ │              │  │ Agronews     │ │ Canal Rural  │ │ Reuters      │    │   │
│ │              │  │ 28 jan 2026  │ │ 28 jan 2026  │ │ 27 jan 2026  │    │   │
│ │              │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│ └───────────────┴───────────────────────────────────────────────────────┘   │
│                                                                             │
│ MOBILE:                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ◀ [ Todas ] [ Pecuária ] [ Boi ] [ Soja ] [ Milho ] ▶  ← scroll horiz.  │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ [ Boi Gordo SP ] [ Exportações ] [ Arroba ]  ← chips                    │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Card empilhado 1                                                    │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Card empilhado 2                                                    │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 NEWSLETTER                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🦶 FOOTER                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                     4.4 MODAL DE NOTÍCIA (NewsDrawer.tsx)
═══════════════════════════════════════════════════════════════════════════════

Acionado ao clicar em qualquer card de notícia (HotNews ou NewsGrid)
Tipo: Modal centralizado (não é sidebar)

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│     ┌───────────────────────────────────────────────────────────────┐       │
│     │                                                         [ ✕ ] │       │
│     ├───────────────────────────────────────────────────────────────┤       │
│     │  🏷️ Boi                                                        │       │
│     │                                                               │       │
│     │  Preço do boi gordo atinge maior patamar em 6 meses           │       │
│     │                                                               │       │
│     │  Agronews  •  28 jan 2026                                     │       │
│     ├───────────────────────────────────────────────────────────────┤       │
│     │                                                               │       │
│     │  O mercado de boi gordo brasileiro registrou forte            │       │
│     │  valorização nesta terça-feira, com a arroba alcançando       │       │
│     │  R$ 318,00 em São Paulo.                                      │       │
│     │                                                               │       │
│     │  **Principais fatores:**                                      │       │
│     │  - Demanda aquecida da China                                  │       │
│     │  - Oferta restrita no período de entressafra                  │       │
│     │  - Câmbio favorável para exportações                          │       │
│     │                                                               │       │
│     │  (renderizado com .prose-reading para legibilidade)           │       │
│     │                                                               │       │
│     ├───────────────────────────────────────────────────────────────┤       │
│     │                                                               │       │
│     │  💡 Quer se aprofundar?                                        │       │
│     │  ┌─────────────────────────────────────────────────────────┐  │       │
│     │  │  🔗 Ler matéria completa no Agronews  →                 │  │       │
│     │  └─────────────────────────────────────────────────────────┘  │       │
│     │                          (abre em nova aba)                   │       │
│     └───────────────────────────────────────────────────────────────┘       │
│                                                                             │
│     ← backdrop escuro (fecha ao clicar fora)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

IMPORTANTE: Retorna null quando isOpen=false (sem overlay invisível)


═══════════════════════════════════════════════════════════════════════════════
                          COMPONENTES E ARQUIVOS
═══════════════════════════════════════════════════════════════════════════════

src/pages/
└── Index.tsx              ← Controlador de estados (idle/loading/results)

src/components/farol/
├── Header.tsx             ← Navegação principal
├── SearchHero.tsx         ← Campo de busca + chips + selo "Em evolução"
├── SummaryBlock.tsx       ← Renderiza answer_markdown do backend
├── NewsGrid.tsx           ← Grid de cards + filtros + chips dinâmicos
├── NewsCard.tsx           ← Card individual de notícia
├── NewsDrawer.tsx         ← Modal centralizado com resumo
├── NewsCarousel.tsx       ← Carrossel 2 linhas na home
├── HotNews.tsx            ← Notícias quentes (coluna esquerda)
├── CotacoesPanel.tsx      ← Painel de cotações (coluna central)
├── WeatherWidget.tsx      ← Widget de clima (coluna direita)
├── LoadingSkeleton.tsx    ← Skeletons durante loading
├── Newsletter.tsx         ← Captação de email
└── Footer.tsx             ← Rodapé

src/types/
└── farol.ts               ← Interfaces TypeScript (SearchResponse, NewsCard, etc.)

src/lib/
└── api.ts                 ← apiFetch() e trackEvent()

functions/api/
└── [[path]].ts            ← Proxy para n8n (Cloudflare Pages Function)

---

## 5. Modelagem de dados (Supabase)
(Ver /docs/data-model.md)

---

## 6. Sistema de intents
- cotacao
- clima
- geral
(Regras e roteamento: determinístico primeiro, LLM só quando necessário)

---

## 7. Sistema de chips
Chips são navegação e captura de intenção.  
Regras: 2–5 por resposta; específicos; mudam por contexto/histórico leve.

---

## 8. Endpoints da API (n8n ou backend)
- POST /api/search
- GET /api/cards
- GET /api/cards/:id
- POST /api/feedback
- POST /api/events

---

## 9. Fluxo do agente (em aberto)
(Ver /docs/workflows-map.md)

---

## 10. Integrações
- OpenWeather
- INMET/alertas (via scraping ou fonte compatível)
- COMEX/MDIC (a planejar como fonte estruturada e/ou documental)

---

## 11. Requisitos funcionais (alto nível)
- Busca e resposta por intent
- Feed de cards
- Modal com resumo editorial do card
- Chips e cards relacionados
- Fontes citadas e diversificadas
- Telemetria e feedback

---

## 12. Requisitos não funcionais
- Resposta rápida (meta P95 < 5s)
- Confiabilidade (retry, fallback)
- Segurança de credenciais
- Escalabilidade (mais fontes, mais categorias)
- Observabilidade (logs + métricas)

---

## 13. Checklist de desenvolvimento (macro)
- [ ] Preparar docs e rules
- [ ] Definir arquitetura final (n8n vs backend híbrido)
- [ ] Implementar modelo de dados
- [ ] Implementar ingestão (scrape → clean → store → embed)
- [ ] Implementar search (intent → dados → RAG → resposta)
- [ ] Implementar cards (geração + limites por categoria)
- [ ] Instrumentação (events, ai_outputs, feedback)
- [ ] Conectar front
- [ ] Produção (deploy + DNS + monitoramento)

---

## 14. Variáveis de ambiente
(Ver /docs/environment.md)

---

## 15. Critérios de aceite MVP
- Busca funcionando (3 intents) com fontes
- Cards carregando na home
- Modal com resumo editorial
- Chips respondendo e navegando
- Telemetria + feedback gravando
- Custos registrados por request

**FIM DO PRD**