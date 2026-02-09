# FarolV3 — Variáveis de Ambiente (runtime)

## Princípio
n8n self-hosted não depende de UI para env vars.
Variáveis devem ser definidas no servidor (Docker/compose/.env) e carregadas no runtime.

## Variáveis mínimas (exemplo)
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- OPENAI_API_KEY
- OPENWEATHER_API_KEY
- SCRAPER_URL (ex: http://scraper:3005)

## Notas
- Nunca versionar chaves no Git.
- Usar .env (não commitado) ou secrets do Docker.
