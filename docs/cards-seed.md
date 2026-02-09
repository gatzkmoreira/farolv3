# FarolV3 — Cards Seed (MVP)

> Última atualização: 2026-02-07

---

## 1. Schema da tabela `cards`

| Coluna | Tipo | Obrigatório | Default | Nota |
|--------|------|:-----------:|---------|------|
| `id` | uuid | ✅ | `uuid_generate_v4()` | PK |
| `category` | text | ✅ | — | Slug da categoria |
| `title` | text | ✅ | — | Título curto (máx ~80 chars) |
| `deck` | text | — | — | Subtítulo / resumo 1 linha |
| `body_markdown` | text | — | — | Corpo completo em markdown |
| `chips` | jsonb | — | — | Array de strings para busca rápida |
| `tags` | jsonb | — | — | Array de strings para filtro |
| `image_url` | text | — | — | URL da imagem de capa |
| `source_id` | uuid | — | — | FK para `sources` |
| `source_name` | text | — | — | Nome da fonte (ex: "CEPEA") |
| `source_url` | text | — | — | URL original da matéria |
| `published_at` | timestamptz | — | — | Data de publicação |
| `scraped_at` | timestamptz | — | — | Data de coleta |
| `document_id` | uuid | — | — | FK para `documents_clean` |
| `content_hash` | text | — | — | SHA-256 de `title+deck` para dedupe |
| `status` | text | — | `'draft'` | `draft` \| `published` \| `archived` |
| `created_at` | timestamptz | — | `now()` | |
| `updated_at` | timestamptz | — | `now()` | |

---

## 2. Mapeamento DB → Frontend

O workflow n8n "Format Response" transforma os campos do banco para o formato esperado pelo frontend (`NewsCard`):

| DB (Supabase) | Frontend (NewsCard) | Nota |
|---------------|---------------------|------|
| `id` | `id` | direto |
| `title` | `title` | direto |
| `deck` | `description` | renomeia |
| `source_name` | `source` | renomeia |
| `source_url` | `url` | renomeia |
| `published_at` | `date` | renomeia |
| `category` | `category` | direto |
| `image_url` | `image` | renomeia |
| `body_markdown` | `summary_markdown` | renomeia |
| — | `source_logo` | não usado (opcional) |

---

## 3. Categorias iniciais (6)

| Slug | Label UI | Descrição |
|------|----------|-----------|
| `pecuaria_corte` | Pecuária de Corte | Boi gordo, escalas, frigoríficos, exportação |
| `graos` | Grãos | Soja, milho, trigo, safra, colheita |
| `clima` | Clima | Previsões, alertas, impacto agrícola |
| `mercado` | Mercado | Câmbio, exportação, indicadores, crédito rural |
| `tecnologia` | Tecnologia | Agricultura de precisão, insumos, manejo |
| `politica_rural` | Política Rural | Plano Safra, legislação, sustentabilidade |

---

## 4. Regra de dedupe (`content_hash`)

```sql
-- Gerar hash na inserção:
content_hash = encode(sha256(convert_to(title || '|' || coalesce(deck,''), 'UTF8')), 'hex')
```

Cards com mesmo `content_hash` são considerados duplicatas. O scraper deve verificar antes de inserir:

```sql
INSERT INTO cards (...) VALUES (...)
ON CONFLICT (content_hash) DO NOTHING;
```

> ⚠️ Requer índice UNIQUE em `content_hash` (ver seed SQL).

---

## 5. Guidelines editoriais (title / deck / body)

### Title (máx 80 chars)
- Substantivo + verbo ativo
- Sem artigos desnecessários
- Exemplo: "Escalas de abate mais curtas sustentam preços do boi gordo"

### Deck (máx 140 chars)
- Uma frase que completa o título com contexto
- Sempre começa com informação nova
- Exemplo: "Oferta ajustada de animais terminados mantém mercado favorável ao pecuarista em fevereiro."

### Body Markdown
- 2–3 parágrafos conectados (causa e efeito)
- Sem emojis (exceto ⚠️ em alertas)
- Pode usar 1 subtítulo e bullets curtos no fim
- Sempre citar fonte e data

### Chips (máx 3)
- Frases curtas que levam a buscas relacionadas
- Exemplo: `["Cotação boi gordo SP", "Exportações de carne", "Preço do milho"]`

---

## 6. Template de card (JSON)

```json
{
  "category": "pecuaria_corte",
  "title": "Escalas de abate mais curtas sustentam preços do boi gordo",
  "deck": "Oferta ajustada de animais terminados mantém mercado favorável ao pecuarista em fevereiro.",
  "body_markdown": "O mercado pecuário segue favorável ao pecuarista. A oferta de animais terminados continua ajustada nas principais praças do país, com frigoríficos operando em escalas curtas.\n\nDo lado da demanda, as exportações mantêm ritmo firme — a China segue como principal destino. O câmbio acima dos R$ 5,00 dá competitividade à carne brasileira no mercado internacional.\n\n**O que acompanhar:**\n- Evolução das escalas de abate\n- Volume de embarques para a China\n- Comportamento do dólar",
  "chips": ["Cotação boi gordo SP", "Exportações de carne", "Preço do milho"],
  "tags": ["boi_gordo", "mercado", "frigorificos"],
  "source_name": "Scot Consultoria",
  "source_url": "https://www.scotconsultoria.com.br",
  "published_at": "2026-02-07T10:00:00Z",
  "status": "published"
}
```

---

## 7. Checklist

- [x] Schema documentado
- [x] Mapeamento DB → Frontend documentado
- [x] 6 categorias definidas
- [x] Regra de dedupe definida (content_hash)
- [x] Guidelines editoriais
- [x] Template JSON
- [ ] Criar índice UNIQUE em content_hash
- [ ] Seed SQL com 20 cards (5 existentes + 15 novos)
- [ ] Testar GET /api/cards no localhost
- [ ] Confirmar renderização no frontend

---

## 8. Verificação (2026-02-08)

### Supabase — dados confirmados

| Métrica | Valor |
|---------|-------|
| **Total cards** | 20 |
| **Status published** | 20 |
| **Status draft** | 0 |

| Categoria | Qtd |
|-----------|-----|
| graos | 4 |
| pecuaria_corte | 4 |
| clima | 3 |
| mercado | 3 |
| politica_rural | 3 |
| tecnologia | 3 |

✅ Dados OK. Todas as 6 categorias com cards.
