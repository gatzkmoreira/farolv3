# FarolV3 — Modelo de Dados (Supabase) v0
Objetivo: dados organizados para 3 frentes:
1) Respostas (RAG + estruturado)
2) Cards e retenção
3) Telemetria para Solis

## Núcleo de conteúdo
- sources
- documents_clean
- document_chunks
- embeddings_index

## Estruturados
- quotes (cotações)
- weather_cache
- microfacts

## Cards
- cards
- card_jobs (opcional)

## Telemetria
- search_sessions
- events
- ai_outputs
- feedback

## Operação/ingestão
- scrape_runs
- scrape_errors

> O schema final pode evoluir, mas o princípio é: separar conteúdo limpo, dados estruturados e sinais de uso.
