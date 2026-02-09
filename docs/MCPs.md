# FarolV3 — Inventário de MCPs

MCPs (Model Context Protocols) configurados para desenvolvimento agentic no projeto FarolV3.

---

## MCPs Conectados (Antigravity)

Os MCPs abaixo já estão conectados no ambiente Antigravity via MCP protocol.

### 1. Context7 MCP
| | |
|---|---|
| **Repositório** | [upstash/context7](https://github.com/upstash/context7) |
| **Propósito** | Busca docs e código atualizado para qualquer biblioteca/framework |
| **Uso no FarolV3** | Garantir que código gerado use APIs atualizadas (Next.js, Supabase, etc.) |

**Smoke Test:**
```
Perguntar: "use context7 para buscar docs do Next.js middleware"
Esperado: Documentação atualizada retornada
```

**Ferramentas disponíveis:**
- `mcp_context7_resolve-library-id` - Encontrar ID da biblioteca
- `mcp_context7_query-docs` - Buscar documentação

---

### 2. n8n MCP
| | |
|---|---|
| **Repositório** | [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) |
| **Propósito** | Construir e validar workflows n8n com assistência de IA |
| **Uso no FarolV3** | Criar/modificar workflows de ingestão, RAG e resposta |

**Smoke Test:**
```
Usar: mcp_n8n-mcp_search_nodes com query="webhook"
Esperado: Lista de nodes de webhook
```

**Ferramentas disponíveis:**
- `mcp_n8n-mcp_search_nodes` - Buscar nodes (1.084 disponíveis)
- `mcp_n8n-mcp_get_node` - Detalhes de um node
- `mcp_n8n-mcp_search_templates` - Buscar templates de workflow
- `mcp_n8n-mcp_validate_workflow` - Validar workflow JSON

---

### 3. Supabase MCP
| | |
|---|---|
| **Repositório** | [supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp) |
| **Propósito** | Gerenciar projetos Supabase via IA (SQL, tables, migrations, RLS) |
| **Uso no FarolV3** | Criar/modificar schema, executar queries, gerar tipos TS |

**Smoke Test:**
```
Usar: mcp_supabase-mcp-server_list_projects
Esperado: Lista de projetos conectados
```

**Ferramentas disponíveis:**
- `mcp_supabase-mcp-server_execute_sql` - Executar SQL
- `mcp_supabase-mcp-server_apply_migration` - Aplicar migration DDL
- `mcp_supabase-mcp-server_list_tables` - Listar tabelas
- `mcp_supabase-mcp-server_generate_typescript_types` - Gerar tipos TS
- `mcp_supabase-mcp-server_get_advisors` - Verificar segurança/performance

---

### 4. shadcn MCP
| | |
|---|---|
| **Repositório** | [@shadcn registry](https://shadcn.com) |
| **Propósito** | Acessar componentes shadcn/ui v4 para React |
| **Uso no FarolV3** | Gerar UI consistente no frontend Next.js |

**Smoke Test:**
```
Usar: mcp_shadcn_get_project_registries
Esperado: Registries configurados no projeto
```

**Ferramentas disponíveis:**
- `mcp_shadcn_search_items_in_registries` - Buscar componentes
- `mcp_shadcn_view_items_in_registries` - Ver código de componentes
- `mcp_shadcn_get_add_command_for_items` - Comando de instalação

---

## MCPs a Instalar

### 5. Google Stitch (via Skills)
| | |
|---|---|
| **Repositório** | [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) |
| **Propósito** | Gerar UI a partir de prompts, refinar designs, exportar código React |
| **Uso no FarolV3** | Refinar e finalizar UI/design do frontend |

**Instalação:**
```bash
# Listar skills disponíveis
npx skills add google-labs-code/stitch-skills --list

# Instalar skills principais
npx skills add google-labs-code/stitch-skills --skill design-md --global
npx skills add google-labs-code/stitch-skills --skill react:components --global
npx skills add google-labs-code/stitch-skills --skill stitch-loop --global
npx skills add google-labs-code/stitch-skills --skill enhance-prompt --global
```

**Skills disponíveis:**
- `design-md` - Gera DESIGN.md documentando sistema de design
- `react:components` - Converte telas Stitch em componentes React
- `stitch-loop` - Gera website multi-página de um prompt
- `enhance-prompt` - Melhora prompts vagos para Stitch
- `remotion` - Gera vídeos de walkthrough
- `shadcn-ui` - Integração com shadcn/ui

---

### 6. Qdrant MCP (VectorDB/RAG)
| | |
|---|---|
| **Repositório** | [qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant) |
| **Propósito** | Semantic memory layer - armazenar e buscar memórias vetoriais |
| **Uso no FarolV3** | RAG avançado, semantic search, context memory para agente |
| **Status** | ✅ Configurado |

**Configuração atual:**
```json
{
  "QDRANT_URL": "http://srv1304758:6333",
  "COLLECTION_NAME": "farol_memories",
  "EMBEDDING_PROVIDER": "fastembed",
  "EMBEDDING_MODEL": "sentence-transformers/all-MiniLM-L6-v2"
}
```

**Ferramentas disponíveis:**
- `store` - Armazenar memória/contexto
- `find` - Buscar memórias semanticamente similares

---

### 7. Firecrawl MCP (Crawler/Scraping)
| | |
|---|---|
| **Repositório** | [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) |
| **Propósito** | Web scraping e crawling otimizado para LLMs (retorna Markdown) |
| **Uso no FarolV3** | Complementar Playwright com extração de texto limpo, crawling de sites |

**Instalação:**
```bash
# Via npx
npx firecrawl-mcp
```

**Variáveis de ambiente:**
```env
FIRECRAWL_API_KEY=sua_api_key           # obter em firecrawl.dev
```

**Ferramentas disponíveis:**
- `firecrawl_scrape` - Extrair conteúdo de URL única
- `firecrawl_batch_scrape` - Scrape em lote
- `firecrawl_crawl` - Crawl de site inteiro
- `firecrawl_map` - Descobrir URLs de um site
- `firecrawl_search` - Buscar e extrair conteúdo
- `firecrawl_extract` - Extração estruturada

---

## Notas de Segurança

> [!CAUTION]
> - NUNCA commitar API keys no Git
> - Usar `.env` local (não versionado) ou Docker secrets
> - Supabase MCP é para DEV/TEST, não usar em produção sem revisar RLS

---

## Compatibilidade

| MCP | n8n | Supabase | Next.js | TypeScript |
|-----|-----|----------|---------|------------|
| Context7 | ✅ | ✅ | ✅ | ✅ |
| n8n MCP | ✅ | - | - | ✅ |
| Supabase MCP | - | ✅ | ✅ | ✅ |
| shadcn MCP | - | - | ✅ | ✅ |
| Stitch Skills | - | - | ✅ | ✅ |
| Qdrant MCP | ✅ | ✅ | ✅ | ✅ |
| Firecrawl MCP | ✅ | - | ✅ | ✅ |
