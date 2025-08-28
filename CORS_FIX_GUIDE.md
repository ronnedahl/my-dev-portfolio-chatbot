# CORS Fix Guide

## Problem som var löst

CORS-fel uppstod eftersom:
1. **TrustedHostMiddleware** blockerade requests från localhost:5173
2. **Middleware-ordning** var fel - CORS måste komma EFTER security middleware
3. **OPTIONS requests** (CORS preflight) blockerades av rate limiting

## Fixar som gjorts

### 1. Middleware-ordning fixad
**Innan:**
```python
# CORS först
app.add_middleware(CORSMiddleware, ...)
# Security middleware efter
setup_security_middleware(app)
```

**Efter:**
```python
# Security middleware först
setup_security_middleware(app)
# CORS efter (för att hantera preflight korrekt)
app.add_middleware(CORSMiddleware, ...)
```

### 2. TrustedHostMiddleware uppdaterad
Lade till localhost-portar:
```python
allowed_hosts=[
    "localhost",
    "localhost:8000",     # ← Ny
    "localhost:5173",     # ← Ny  
    "127.0.0.1",
    "127.0.0.1:8000",     # ← Ny
    "peterbot.dev",
    # ...
]
```

### 3. OPTIONS requests undantagna från rate limiting
```python
# Skip rate limiting for health checks and CORS preflight
if request.url.path in ["/health", "/", "/docs", "/openapi.json"] or request.method == "OPTIONS":
    return await call_next(request)
```

## Testa fix:

### 1. Starta backend
```bash
cd langgraph-api
uv run uvicorn src.main:app --reload --port 8000
```

### 2. Testa CORS-fix
```bash
cd ..
python test_cors_fix.py
```

### 3. Starta frontend och testa
```bash
cd client
npm run dev
```

Gå till http://localhost:5173 och testa chat-funktionen.

## Förväntat resultat

### ✅ CORS fungerar nu
- Preflight OPTIONS requests tillåts
- POST requests från localhost:5173 fungerar
- Alla CORS headers sätts korrekt

### ✅ Säkerhet bevarad
- Rate limiting fungerar fortfarande (men inte för OPTIONS)
- Security headers tilläggs
- TrustedHost-skydd aktivt

### ✅ Deployment-kompatibelt
- Samma kod fungerar för både utveckling och produktion
- chat.peterbot.dev tillåts i CORS och TrustedHost

## Felsökning

Om CORS fortfarande inte fungerar:

1. **Kontrollera backend logs**:
   ```bash
   # Sök efter "Security middleware configured"
   # Kontrollera för TrustedHost eller CORS-fel
   ```

2. **Testa manuellt**:
   ```bash
   # Test preflight
   curl -X OPTIONS http://localhost:8000/chat/ \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -v
   
   # Test actual request  
   curl -X POST http://localhost:8000/chat/ \
     -H "Origin: http://localhost:5173" \
     -H "Content-Type: application/json" \
     -d '{"query":"test","conversation_id":"test","user_id":"test"}' \
     -v
   ```

3. **Browser DevTools**:
   - Network tab → Se preflight och actual requests
   - Console → Leta efter CORS-fel
   - Headers → Kontrollera CORS headers i responses

## Teknisk förklaring

**Middleware-ordning är kritisk:**
1. TrustedHostMiddleware kontrollerar Host header först
2. SecurityHeadersMiddleware lägger till säkerhetsheaders  
3. RateLimitMiddleware kontrollerar rate limits (men hoppar över OPTIONS)
4. CORSMiddleware hanterar CORS headers och preflight requests
5. Request når endpoint

OPTIONS (preflight) requests:
1. Browser skickar OPTIONS request före actual POST
2. Server måste svara med CORS headers
3. Om preflight OK → Browser skickar actual request
4. Om preflight fail → Browser blockerar actual request

Med denna fix fungerar hela flödet korrekt! 🎉