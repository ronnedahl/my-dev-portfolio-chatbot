# Production Optimization Guide för peterbod.dev

## Environment Variables för Produktion

Lägg till dessa i din .env på Hetzner-servern:

```bash
# Performance optimering
REQUEST_TIMEOUT=20          # Kortare timeout i produktion
LLM_TIMEOUT=10             # Snabbare LLM timeout
VECTOR_SEARCH_TIMEOUT=5    # Snabbare vector search
MAX_CONCURRENT_REQUESTS=20  # Fler concurrent requests

# Logging optimering
LOG_LEVEL=INFO             # Mindre debug-info
API_ENV=production         # Produktionsläge

# Cache optimering
CACHE_TTL=600              # Längre cache (10 minuter)
```

## Docker/Deployment optimering

Lägg till i din Dockerfile eller docker-compose.yml:

```yaml
environment:
  - PYTHONUNBUFFERED=1
  - PYTHONDONTWRITEBYTECODE=1
  - WORKERS=4              # Fler worker processes
```

## Nginx optimering

Uppdatera nginx-konfigurationen:

```nginx
location /api/ {
    proxy_pass http://backend;
    proxy_timeout 30s;      # Kortare timeout
    proxy_read_timeout 30s;
    proxy_connect_timeout 10s;
    
    # Caching för statiska svar
    proxy_cache_valid 200 5m;
}
```

## Förväntade resultat i produktion

- **Första deployment:** Vector cache laddas en gång, sedan snabbt för alla användare
- **Gemensam cache:** Alla användare drar nytta av cachad data
- **Snabbare nätverk:** Europeiska datacenter → kortare latens
- **Mer resurser:** Bättre CPU/RAM → snabbare bearbetning

## Monitoring i produktion

Endpoints för att övervaka prestanda:
- `GET /admin/cache/stats` - Response cache statistik
- `GET /admin/vector-cache/info` - Vector cache information
- `GET /health` - System health check