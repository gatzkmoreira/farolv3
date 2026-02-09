# FarolV3 — Infraestrutura Docker (SSH)

Documentação da infraestrutura Docker no servidor SSH para o projeto FarolV3.

---

## Servidor

| Campo | Valor |
|-------|-------|
| Hostname | `srv1304758` |
| IP | `76.13.170.114` |
| Acesso | `ssh root@srv1304758` |

---

## Estrutura de Diretórios

```
/opt/
├── n8n/
│   └── docker-compose.yml          # ← n8n + postgres
├── infra/
│   ├── caddy/docker-compose.yml    # Reverse proxy + SSL
│   ├── evolution/docker-compose.yml # WhatsApp API
│   └── traefik/docker-compose.yml  # (alternativo)
├── farolrural/
│   └── scraper/docker-compose.yml  # Playwright scraper
/root/
└── qdrant_storage/                 # Volume do Qdrant
```

---

## Containers Ativos

| Container | Image | Portas | Descrição |
|-----------|-------|--------|-----------|
| **n8n** | n8nio/n8n:latest | 127.0.0.1:5678 | Orquestrador workflows |
| **postgres_n8n** | postgres:16 | 5432 (interno) | Database n8n |
| **qdrant** | qdrant/qdrant | 6333-6334 (público) | VectorDB RAG |
| **caddy** | caddy:2 | 80, 443 (público) | Reverse proxy + SSL |
| **farolrural-scraper** | scraper-farolrural-scraper | 3005 (interno) | Playwright scraper |
| **evolution_api** | atendai/evolution-api:v2.1.1 | 8080 (público) | API WhatsApp |
| **postgres_evo** | postgres:16 | 5432 (interno) | Database Evolution |
| **redis_evo** | redis:7-alpine | 6379 (interno) | Cache Evolution |

---

## Variáveis de Ambiente (n8n)

O container n8n possui as seguintes env vars configuradas:

| Variável | Configurada |
|----------|-------------|
| `OPENAI_API_KEY` | ✅ Sim |
| `SUPABASE_URL` | ✅ Sim |
| `SUPABASE_SERVICE_KEY` | ✅ Sim |
| `OPENWEATHER_API_KEY` | ❌ **NÃO** |
| `DB_POSTGRESDB_*` | ✅ Sim |
| `N8N_ENCRYPTION_KEY` | ✅ Sim |
| `WEBHOOK_URL` | ✅ `https://n8n.olhonoagro.com.br` |

---

## Gerenciar n8n

### Localização
```bash
cd /opt/n8n
```

### Ver docker-compose.yml
```bash
cat /opt/n8n/docker-compose.yml
```

### Editar e reiniciar
```bash
cd /opt/n8n
nano docker-compose.yml
docker compose down
docker compose up -d
```

### Verificar logs
```bash
docker logs -f n8n --tail 100
```

### Verificar env vars atuais
```bash
docker exec n8n env | grep -E "(OPENWEATHER|OPENAI|SUPABASE)"
```

---

## Adicionar OPENWEATHER_API_KEY

### 1. Editar docker-compose.yml
```bash
cd /opt/n8n
nano docker-compose.yml
```

### 2. Adicionar na seção environment do serviço n8n:
```yaml
environment:
  - OPENWEATHER_API_KEY=SUA_CHAVE_AQUI
```

### 3. Recriar container
```bash
docker compose down && docker compose up -d
```

### 4. Verificar
```bash
docker exec n8n env | grep OPENWEATHER
```

---

## Volumes Persistentes

| Volume | Container | Local |
|--------|-----------|-------|
| n8n_data | n8n | `/opt/n8n/` (volume) |
| postgres_n8n_data | postgres_n8n | (Docker volume) |
| qdrant_storage | qdrant | `/root/qdrant_storage/` |
| caddy_data | caddy | (Docker volume) |

---

## URLs Públicas

| Serviço | URL |
|---------|-----|
| n8n | `https://n8n.olhonoagro.com.br` |
| Qdrant | `http://srv1304758:6333` |
| Evolution | `http://srv1304758:8080` |

---

*Atualizado: 2026-02-06*
