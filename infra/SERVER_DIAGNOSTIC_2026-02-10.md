# 🔍 Server Diagnostic Report — 2026-02-10 03:57 UTC

**Host:** `srv1304758` | **RAM:** 3.8 GB | **Disk:** 49G (36% used) | **Uptime:** 12 days

---

## 🚨 CRITICAL FINDINGS

### 1. NO SWAP — Principal causa dos crashes do Playwright

| Item | Valor |
|------|-------|
| **RAM Total** | 3.8 GB |
| **RAM Livre** | 198 MB |
| **Swap** | **0 (ZERO!)** |

Sem swap, quando a RAM acaba, o kernel mata processos (OOM Kill) ou os processos crasham com erros como `SIGTRAP`. Isso explica diretamente o erro do Playwright:
> `browserType.launch: Target page, context or browser has been closed`

### 2. Scraper consumindo 37% da RAM

| Container | Memória | % do Total |
|-----------|---------|------------|
| `farolrural-scraper` | **1.42 GB** | **37.1%** |
| `n8n` | 353 MB | 9% |
| `evolution_api` | 93 MB | 2.4% |
| `postgres_n8n` | 55 MB | 1.4% |
| `postgres_evo` | 26 MB | 0.7% |
| `caddy` | 20 MB | 0.5% |
| `qdrant` | 18.5 MB | 0.5% |
| `redis_evo` | 3 MB | 0.1% |
| **TOTAL** | **~1.99 GB** | **~52%** |

O Chromium headless consome muita memória. Com `max_concurrency=2`, pode ter **2 browsers + n8n + postgres** competindo pela RAM ao mesmo tempo.

### 3. SCRAPER_URL com IP hardcoded

No `docker-compose.yml` do n8n:
```yaml
SCRAPER_URL=http://172.18.0.4:3005
```
Esse IP pode mudar quando os containers reiniciam. Deveria usar o hostname Docker ou uma rede compartilhada.

### 4. Evolution API com erro constante de Redis

```
ERROR [Redis] [string] redis disconnected
```
Repetindo a cada segundo. O `redis_evo` está rodando, mas a Evolution API não consegue conectar. Não afeta o scraper, mas é um problema separado.

### 5. Webhook probing no n8n

```
Received request for unknown webhook: "POST api"
Received request for unknown webhook: "POST api/graphql"
Received request for unknown webhook: "GET api/swagger.json"
```
Alguém está scaneando/probing o n8n procurando endpoints comuns. Não é crítico, mas indica que o n8n está exposto.

---

## ✅ O QUE ESTÁ OK

- ✅ Todos os 8 containers rodando
- ✅ Nenhum OOM Kill registrado pelo kernel (ainda)
- ✅ Disco com 64% disponível (32 GB livres)
- ✅ CPU load baixo (0.17 avg)
- ✅ Postgres healthy
- ✅ Certificados SSL ativos (Caddy)
- ✅ Qdrant operacional

---

## 🔧 AÇÕES IMEDIATAS (rodar no servidor)

### Ação 1: Criar 2GB de Swap (URGENTE)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

**Verificar:**
```bash
free -mh
swapon --show
```

### Ação 2: Reiniciar scraper para limpar memória

```bash
cd /opt/scraper  # ou onde estiver o docker-compose do scraper
docker restart farolrural-scraper
```

### Ação 3: Limitar memória do scraper (opcional mas recomendado)

Adicionar no `docker-compose.yml` do scraper:
```yaml
services:
  farolrural-scraper:
    deploy:
      resources:
        limits:
          memory: 1200M
```

### Ação 4: Corrigir SCRAPER_URL (médio prazo)

Opções:
1. Colocar o scraper na mesma rede do n8n e usar `http://farolrural-scraper:3005`
2. Ou usar `docker network connect n8n_default farolrural-scraper` e alterar a env var

### Ação 5: Investigar Redis do Evolution API

```bash
docker logs redis_evo --tail 20
docker exec redis_evo redis-cli ping
docker inspect redis_evo --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
docker inspect evolution_api --format '{{json .Config.Env}}' | python3 -m json.tool | grep -i redis
```

---

## 📊 Resumo da Causa do Problema Original

```
VPS 4GB sem swap → RAM esgota durante scraping → Chromium crash (SIGTRAP)
→ Scrape Fonte retorna 500 → Processar Resposta: success=false, links=[]
→ Mode=Links?: false → pipeline nunca chega no "Conteúdo Válido?"
→ Nenhum documento salvo
```

**Solução principal:** Criar swap + reiniciar scraper. O workflow em si está correto.
