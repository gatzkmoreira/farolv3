# FarolV3 — Padrões de Resposta (v2)

> Atualizado em 2026-02-13. Reflete os prompts implementados nos handlers `Handle COTACAO`, `Handle CLIMA` e `Handle GERAL` do workflow n8n `FarolV3 - API Search`.

---

## Regras Globais

- **1ª linha: dado direto.** Sem saudação, sem "Claro!", sem emoji.
- **Proporção**: 60% dado concreto, 30% contexto, 10% orientação.
- **Fontes**: citadas naturalmente no texto. O sistema exibe fontes separadamente — NÃO incluir seção "Fontes:" ao final.
- **Tabelas**: obrigatórias quando dados comparativos estiverem disponíveis.
- **Bullets**: máximo 3, apenas para "pontos de atenção" ao final.

---

## Intent: COTAÇÃO

### Formato

1. **Linha inicial** — Valor + unidade + praça + data + fonte.
2. **Contexto dominante** — 1 parágrafo (max 4 linhas). O fator principal por trás do preço.
3. **Impacto prático** — 1 parágrafo (max 4 linhas). O que o produtor deve fazer.
4. **Tabela comparativa** — 3 praças (principal + 2 referência). Colunas: Praça, Preço, Variação Dia, Data, Fonte.

### Tabela de Referência (estadosRef)

| Praça | Comparar com |
|-------|-------------|
| SP | MS, GO |
| MS | SP, MT |
| MT | MS, GO |
| GO | SP, MT |
| PR | SP, RS |
| MG | SP, GO |

### Exemplo

> Boi gordo em SP: R$ 336,00/@ (12/02, Scot Consultoria).
>
> A oferta controlada de animais terminados...
>
> Para o produtor, a janela de venda se mostra favorável...
>
> | Praça | Preço | Variação | Data | Fonte |
> |-------|-------|----------|------|-------|
> | SP | R$ 336,00/@ | N/D | 12/02 | Scot |
> | MS | R$ 314,50/@ | N/D | 12/02 | Scot |
> | GO | R$ 316,50/@ | N/D | 12/02 | Scot |

---

## Intent: CLIMA

### Formato

1. **Dados imediatos** — Temperatura + chuva + condição + cidade/UF + fonte.
2. **Tendência 5 dias** — Com base no forecast. Anomalias em destaque.
3. **Ponto de atenção não óbvio** — Conexão clima × operação agrícola da região.
4. **Tabela de previsão** — Colunas: Dia, Min/Max, Chuva (mm), Umidade, Condição.

### Dados usados

- **Atual**: OpenWeather `/data/2.5/weather`
- **Forecast**: OpenWeather `/data/2.5/forecast` (5 dias, intervalos 3h)
- **Geocoding fallback**: Se a cidade não está no mapa hardcoded, usa OpenWeather Geocoding API

### Exemplo

> Sorriso (MT): 32°C, sem chuva, céu aberto (OpenWeather, 12/02 14h).
>
> A tendência indica aumento gradual de temperatura com chuvas leves...
>
> Um ponto de atenção: a sequência de dias sem chuva pode comprometer a granação da soja em R2...
>
> | Dia | Min/Max | Chuva (mm) | Umidade | Condição |
> |-----|---------|-----------|---------|----------|
> | 13/02 | 20°C / 24°C | 5.3 | 96% | chuva leve |
> | 14/02 | 19°C / 30°C | 3.4 | 87% | chuva leve |

---

## Intent: GERAL

### Sub-classificação automática

O handler detecta automaticamente o subtipo por keywords na query:

| Subtipo | Keywords | Prompt |
|---------|----------|--------|
| **Mercado** (default) | soja, boi, milho, pecuária | Tese + Drivers + Tabela de Sinais |
| **Política** | lei, regulação, governo, plano safra, crédito rural | O que mudou + Impacto na cadeia |
| **Logística** | frete, porto, estrada, BR-163, escoamento | Situação + Causas + Quem sente primeiro |

### Formato: Mercado

1. **Tese direta** — Ex: "Soja em alta pressionada por clima na Argentina."
2. **Drivers** — Max 3 fatores, 1 parágrafo cada, com dado + fonte.
3. **Tabela de sinais** — Fator, Sinal, Impacto.
4. **Pontos de atenção** — Max 3 bullets.

### Formato: Política

1. **O que mudou** — Fato concreto.
2. **Impacto na cadeia** — Quem ganha, quem perde.
3. **Reação de mercado** — Como o mercado reage.
4. **Pontos de atenção** — Max 3 bullets.

### Formato: Logística

1. **Situação atual** — O que está acontecendo.
2. **Causas** — Por que.
3. **Quem sente primeiro** — Produtor, região ou cultura mais impactada.
4. **Tabela comparativa** — Se dados disponíveis.
5. **Pontos de atenção** — Max 3 bullets.

### RAG Pipeline

1. **Embedding** da query via `text-embedding-3-small`
2. **Qdrant** busca semântica (8 resultados, threshold 0.25)
3. **Diversidade**: max 2 chunks por fonte
4. **Fallback**: se Qdrant vazio → busca cards no Supabase

---

## Anti-padrões (PROIBIDO)

- Começar com "Claro!", "Olá!" ou qualquer saudação
- Emojis (exceto ⚠️ para alertas críticos em CLIMA)
- Listas longas substituindo análise
- Texto "robótico" ou genérico de IA
- Seção separada de "Fontes" ao final
- Inventar dados numéricos
- Usar apenas UMA fonte quando há múltiplas disponíveis
- Repetir no texto informações que já estão na tabela