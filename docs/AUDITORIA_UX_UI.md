 # 📋 RELATÓRIO DE AUDITORIA UX/UI — FAROL RURAL 2.0
 
 **Data:** 05/02/2026  
 **Escopo:** Frontend completo (React + Tailwind)  
 **Objetivo:** Identificar melhorias antes do push para GitHub/Antigravity
 
 ---
 
 ## 1) DIAGNÓSTICO GERAL
 
 ### ✅ O que está bom:
 
 - **Base visual sólida** com identidade agro bem definida (paleta verde floresta + ouro quente)
 - **Tipografia moderna** (Plus Jakarta Sans) bem aplicada
 - **Sistema de design tokenizado** corretamente no Tailwind (index.css + tailwind.config.ts)
 - **Arquitetura de componentes modular** e organizada em `/components/farol/`
 - **Fluxo de estados** (`idle` → `loading` → `results`) claro e previsível
 - **Skeleton loader** transmite profissionalismo durante carregamento
 - **Cards de notícias** são "scannable" (fácil de escanear visualmente)
 - **Modal de leitura** usa `.prose-reading` para conforto de leitura
 - **Consistência visual geral** é boa entre componentes
 
 ### ⚠️ Maiores gargalos hoje:
 
 1. **Cores hardcoded nos componentes** — violam o design system (ex: `bg-amber-100`, `bg-red-100`, `bg-blue-100` em vez de tokens semânticos)
 2. **Estados de erro/vazio ausentes ou fracos** — sem tratamento visual para "busca sem resultados" ou "backend offline"
 3. **Acessibilidade básica faltando** — focus states invisíveis, contraste insuficiente em alguns textos secundários
 4. **Mobile com problemas de densidade** — chips e filtros ficam apertados, header sem menu funcional
 5. **Inconsistências menores** — diferentes estilos de badges de categoria, duplicação de lógica (`getCategoryColor` aparece em 2 arquivos)
 
 ---
 
 ## 2) LISTA DE MELHORIAS POR PRIORIDADE
 
 ### 🔴 P0 — Bloqueia / Quebra UX
 
 | # | Onde | Problema | Sugestão | Impacto |
 |---|------|----------|----------|---------|
 | 1 | `NewsCard.tsx` + `NewsCarousel.tsx` | Cores de categoria hardcoded (`bg-amber-100`, `bg-red-100`, etc.) violam design system | Criar tokens semânticos em `index.css` (ex: `--category-soja`, `--category-clima`) e mover `getCategoryColor` para utils | Consistência visual + manutenção |
 | 2 | `Index.tsx` | Estado de erro usa cores hardcoded (`bg-red-50 border-red-200 text-red-600`) | Usar `bg-destructive/10 border-destructive text-destructive` | Design system compliance |
 | 3 | `NewsDrawer.tsx` | Renderizado pode causar sobreposições invisíveis | Verificar z-index conflicts; considerar animação de saída | Previne bugs de interação |
 | 4 | `Header.tsx` | Menu mobile é apenas um botão visual — **não funciona** | Implementar Sheet/Drawer com navegação real ou ocultar em MVP | Usabilidade mobile quebrada |
 | 5 | `NewsGrid.tsx` | Estado "sem resultados de filtro" tem texto genérico sem CTA | Adicionar botão "Limpar filtro" e melhorar copy | Reduz frustração do usuário |
 
 ### 🟡 P1 — Muito Importante Antes do GitHub/Antigravity
 
 | # | Onde | Problema | Sugestão | Impacto |
 |---|------|----------|----------|---------|
 | 6 | `SearchHero.tsx` | Falta debounce na busca | Implementar debounce de 300ms | UX de busca mais fluida |
 | 7 | `index.css` | Arquivo com 300 linhas — muito grande | Separar em: `tokens.css`, `components.css`, `utilities.css` | Manutenção |
 | 8 | Global | Falta focus-visible em elementos interativos | Adicionar `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | Acessibilidade (teclado) |
 | 9 | `NewsDrawer.tsx` | Sem animação de entrada/saída suave | Usar `framer-motion` ou CSS transitions para fade + scale | Polimento visual |
 | 10 | Geral | Textos `text-muted-foreground` podem ter contraste baixo | Aumentar luminosidade de 45% para 50-55% | Acessibilidade (WCAG AA) |
 | 11 | `HotNews.tsx` + `WeatherWidget.tsx` + `CotacoesPanel.tsx` | Ícones do header usam cores hardcoded | Padronizar todos com tokens semânticos | Consistência |
 | 12 | `SummaryBlock.tsx` | Falta estado de "resposta vazia" ou erro | Adicionar fallback: "Não foi possível gerar o resumo" | Robustez |
 | 13 | `Newsletter.tsx` | Form não tem validação nem feedback | Adicionar validação de email/telefone + toast de confirmação | UX de conversão |
 | 14 | `NewsCarousel.tsx` | Usa dados mock hardcoded | Preparar para receber props do backend | Integração real |
 | 15 | Mobile | Chips de categoria no mobile ficam apertados | Aumentar `py-2` para `py-2.5` e gap de `gap-2` para `gap-3` | Touch targets maiores |
 
 ### 🟢 P2 — Nice-to-Have / Depois
 
 | # | Onde | Problema | Sugestão | Impacto |
 |---|------|----------|----------|---------|
 | 16 | `SearchHero.tsx` | Sem histórico de busca recente | Implementar localStorage com últimas 5 buscas | Conveniência |
 | 17 | `SearchHero.tsx` | Chips de sugestão são estáticos | Permitir que backend envie chips dinâmicos | Personalização |
 | 18 | Geral | Sem dark mode toggle no UI | Adicionar switch no header | Preferência do usuário |
 | 19 | `Footer.tsx` | Links são `#` (não funcionais) | Deixar claro que são placeholders | Transparência |
 | 20 | `LoadingSkeleton.tsx` | Grid skeleton assume 4 colunas, mas results usa 3 | Alinhar skeletons com layout real | Consistência |
 | 21 | `WeatherWidget.tsx` | Emojis inline podem não renderizar igual em todos OS | Substituir por ícones Lucide | Cross-platform |
 | 22 | Geral | Imagens podem causar layout shift | Adicionar `aspect-ratio` fixo + placeholder blur | Performance |
 | 23 | `NewsCarousel.tsx` | Scroll horizontal sem indicador visual | Adicionar fade gradient nas bordas | Affordance |
 | 24 | Responsivo | Telas >1400px têm muito espaço lateral | Considerar max-width maior | Aproveitamento |
 | 25 | `Header.tsx` | Selo "2.0" sem explicação | Adicionar tooltip "Nova versão com IA" | Comunicação |
 
 ---
 
 ## 3) PLANO DE AÇÃO EM ETAPAS
 
 ### 📌 FASE 1: Correções Críticas (P0) — ~2h
 
 **Objetivo:** Eliminar bugs visuais e funcionais antes de exportar
 
 ```
 1. Criar arquivo `src/lib/categoryColors.ts` com função única getCategoryColor()
    → Remover duplicação de NewsCard.tsx e NewsCarousel.tsx
 
 2. Criar tokens de categoria em index.css:
    --category-soja: 45 80% 90%;
    --category-clima: 210 80% 92%;
    (etc.)
 
 3. Corrigir estado de erro em Index.tsx:
    bg-red-50 → bg-destructive/10
    border-red-200 → border-destructive/30
    text-red-600 → text-destructive
 
 4. Header mobile: implementar Sheet com menu ou ocultar botão
 
 5. NewsGrid: melhorar empty state com CTA "Limpar filtro"
 ```
 
 ### 📌 FASE 2: Polimento UX (P1) — ~3h
 
 **Objetivo:** Garantir qualidade de produto pronto
 
 ```
 6. Adicionar focus-visible global em index.css:
    @layer base {
      [tabindex]:focus-visible, button:focus-visible, a:focus-visible {
        @apply ring-2 ring-ring ring-offset-2;
      }
    }
 
 7. Refatorar index.css em 3 arquivos:
    - tokens.css (variáveis)
    - components.css (classes .farol-*)
    - utilities.css (helpers)
 
 8. NewsDrawer: adicionar animação com CSS transitions ou framer-motion
 
 9. Newsletter: validação básica + toast de sucesso
 
 10. Ajustar contraste de muted-foreground (aumentar luminosidade 5-10%)
 
 11. Mobile chips: aumentar touch targets (min 44x44px)
 ```
 
 ### 📌 FASE 3: Preparação para Backend (P1) — ~1h
 
 **Objetivo:** Remover mocks e preparar integração
 
 ```
 12. NewsCarousel: converter para receber cards via props
     → Manter mock apenas como fallback
 
 13. SummaryBlock: adicionar tratamento de markdown vazio/erro
 
 14. Verificar que todos os endpoints /api/* estão documentados
 ```
 
 ### 📌 FASE 4: Export & Push — Checklist Final
 
 ```
 □ Rodar build local sem erros
 □ Testar em 3 breakpoints (mobile 375px, tablet 768px, desktop 1280px)
 □ Verificar que NewsDrawer fecha corretamente
 □ Confirmar que busca retorna skeleton → resultado
 □ Validar focus states com Tab
 □ Commit + Push para GitHub
 □ Importar no Antigravity
 □ Configurar variáveis de ambiente (N8N_WEBHOOK_BASE)
 □ Testar /api/ping
 ```
 
 ---
 
 ## 4) ESTRUTURA ATUAL DOS COMPONENTES
 
 ```
 src/
 ├── pages/
 │   └── Index.tsx              ← State machine (idle/loading/results)
 │
 ├── components/farol/
 │   ├── Header.tsx             ← Logo + nav (menu mobile quebrado)
 │   ├── SearchHero.tsx         ← Input + chips + badge "Em evolução"
 │   ├── LoadingSkeleton.tsx    ← Skeleton durante loading
 │   ├── SummaryBlock.tsx       ← Resposta markdown do backend
 │   ├── NewsGrid.tsx           ← Grid de cards + filtros categoria
 │   ├── NewsCard.tsx           ← Card individual de notícia
 │   ├── NewsDrawer.tsx         ← Modal de leitura centralizado
 │   ├── NewsCarousel.tsx       ← Carrossel 2 linhas (home)
 │   ├── HotNews.tsx            ← Bloco "Notícias Quentes"
 │   ├── CotacoesPanel.tsx      ← Bloco de cotações
 │   ├── WeatherWidget.tsx      ← Widget de clima
 │   ├── Newsletter.tsx         ← CTA SEMANAGRO
 │   └── Footer.tsx             ← Rodapé
 │
 ├── lib/
 │   ├── api.ts                 ← apiFetch + trackEvent
 │   └── utils.ts               ← cn() helper
 │
 ├── types/
 │   └── farol.ts               ← Interfaces TypeScript
 │
 └── index.css                  ← Design tokens + componentes CSS
 ```
 
 ---
 
 ## 5) RESUMO VISUAL
 
 ```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                        AUDITORIA FAROL RURAL 2.0                            │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  ✅ BOM                          ⚠️ PRECISA AJUSTE                          │
 │  ────────────────────            ─────────────────────────────────          │
 │  • Design system tokens          • Cores hardcoded em categorias            │
 │  • Tipografia Plus Jakarta       • Menu mobile não funciona                 │
 │  • Estrutura de componentes      • Focus states ausentes                    │
 │  • Skeleton loaders              • Estados vazios/erro fracos               │
 │  • Modal de leitura              • index.css muito grande                   │
 │  • Paleta agro coerente          • Mocks hardcoded no carousel              │
 │                                                                             │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  PRIORIDADES:  🔴 P0: 5 itens  |  🟡 P1: 10 itens  |  🟢 P2: 10 itens       │
 │  ESTIMATIVA:   ~6h para P0+P1 completo                                      │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 **Próximo passo:** Confirmar quais itens implementar primeiro.