# Testa säkerhet lokalt - Guide

## Förberedelser

### 1. Uppdatera backend dependencies

```bash
cd peterbot-ai/langgraph-api
uv sync
```

### 2. Skapa test .env fil för backend

Skapa/uppdatera `.env` i `langgraph-api/` med:

```env
# Existerande variabler...

# Lägg till dessa för säkerhetstest:
ADMIN_EMAILS=test@example.com,din-email@example.com
API_KEYS=test-api-key-123,another-test-key-456
API_ENV=development
LOG_LEVEL=DEBUG
```

## Starta applikationen

### 1. Starta backend med säkerhet aktiverad

```bash
cd peterbot-ai/langgraph-api
uv run uvicorn src.main:app --reload --port 8000
```

### 2. Starta frontend

Öppna ny terminal:

```bash
cd peterbot-ai/client
npm install  # Om du inte gjort det
npm run dev
```

## Testa säkerhetsfunktioner

### 1. Testa Security Headers

Öppna en ny terminal och kör:

```bash
# Testa security headers
curl -I http://localhost:8000/health

# Du bör se headers som:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

### 2. Testa Rate Limiting

```bash
# Skapa ett script för att testa rate limiting
cat > test_rate_limit.sh << 'EOF'
#!/bin/bash
echo "Testing rate limiting..."
for i in {1..65}; do
  echo "Request $i:"
  curl -X POST http://localhost:8000/chat/ \
    -H "Content-Type: application/json" \
    -d '{"query":"Test","conversation_id":"test","user_id":"test"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.5
done
EOF

chmod +x test_rate_limit.sh
./test_rate_limit.sh

# Efter ~60 requests bör du få 429 (Too Many Requests)
```

### 3. Testa Protected Routes (Admin endpoints)

```bash
# Försök accessa admin endpoint utan autentisering
curl http://localhost:8000/admin/cache/stats

# Du bör få 401 Unauthorized med:
# {"detail":"Authorization header required"}
```

### 4. Testa med Firebase Auth Token (om du har Firebase konfigurerat)

Om du har Firebase konfigurerat, kan du testa med ett riktigt token:

```bash
# Först, få ett ID token från Firebase (i din browser console):
# firebase.auth().currentUser.getIdToken().then(token => console.log(token))

# Sedan använd token:
curl http://localhost:8000/admin/cache/stats \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 5. Testa CORS

Öppna browser console på http://localhost:5173 och kör:

```javascript
// Testa CORS från frontend
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => console.log('CORS OK:', data))
  .catch(err => console.error('CORS Error:', err));

// Testa chat endpoint
fetch('http://localhost:8000/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Hej, fungerar säkerheten?',
    conversation_id: 'test',
    user_id: 'test_user'
  })
})
.then(res => res.json())
.then(data => console.log('Chat response:', data))
.catch(err => console.error('Chat error:', err));
```

### 6. Testa frontend error handling

I chatboten, försök:

1. **Skicka många meddelanden snabbt** för att trigga rate limiting
2. **Stäng av backend** och försök skicka meddelande för att se timeout-hantering

## Python test script

Skapa `test_security.py`:

```python
import requests
import time

BASE_URL = "http://localhost:8000"

def test_security_headers():
    print("Testing security headers...")
    response = requests.get(f"{BASE_URL}/health")
    headers = response.headers
    
    security_headers = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Referrer-Policy"
    ]
    
    for header in security_headers:
        if header in headers:
            print(f"✅ {header}: {headers[header]}")
        else:
            print(f"❌ {header}: Missing")

def test_rate_limiting():
    print("\nTesting rate limiting...")
    for i in range(65):
        try:
            response = requests.post(
                f"{BASE_URL}/chat/",
                json={
                    "query": f"Test {i}",
                    "conversation_id": "test",
                    "user_id": "test"
                }
            )
            
            # Check rate limit headers
            if 'X-RateLimit-Remaining' in response.headers:
                remaining = response.headers['X-RateLimit-Remaining']
                print(f"Request {i+1}: Status {response.status_code}, Remaining: {remaining}")
            else:
                print(f"Request {i+1}: Status {response.status_code}")
                
            if response.status_code == 429:
                print("✅ Rate limiting works! Got 429 Too Many Requests")
                break
                
            time.sleep(0.5)
        except Exception as e:
            print(f"Error: {e}")

def test_protected_routes():
    print("\nTesting protected routes...")
    
    # Test without auth
    response = requests.get(f"{BASE_URL}/admin/cache/stats")
    if response.status_code == 401:
        print("✅ Admin route properly protected (401 Unauthorized)")
    else:
        print(f"❌ Admin route not protected! Got: {response.status_code}")
    
    # Test with fake token
    headers = {"Authorization": "Bearer fake-token"}
    response = requests.get(f"{BASE_URL}/admin/cache/stats", headers=headers)
    if response.status_code == 401:
        print("✅ Invalid token rejected (401 Unauthorized)")
    else:
        print(f"❌ Invalid token accepted! Got: {response.status_code}")

if __name__ == "__main__":
    print("=== Security Testing ===\n")
    test_security_headers()
    test_protected_routes()
    test_rate_limiting()
    print("\n=== Testing Complete ===")
```

Kör med:

```bash
cd peterbot-ai
python test_security.py
```

## Verifiera i browser

1. Öppna http://localhost:5173
2. Öppna Developer Tools (F12)
3. Gå till Network-fliken
4. Använd chatboten och kontrollera:
   - Request/response headers
   - Rate limit headers
   - Error responses

## Felsökning

### Om middleware inte fungerar

1. Kontrollera att importen fungerar:
```python
# I backend terminal, testa:
uv run python -c "from src.middleware import setup_security_middleware; print('Import OK')"
```

2. Kontrollera logs för fel:
```bash
# Backend bör visa security middleware aktiverad
# Leta efter: "Security middleware configured"
```

### Om rate limiting inte fungerar

- Kontrollera att du inte har caching som stör
- Verifiera att IP-adressen detekteras korrekt
- Testa med curl istället för browser

### Om protected routes inte fungerar

- Kontrollera att Firebase är korrekt konfigurerat
- Verifiera att ADMIN_EMAILS är satt i .env
- Testa med API keys istället för Firebase token

## Förväntade resultat

✅ Security headers syns i alla responses  
✅ Rate limiting aktiveras efter 60 requests/minut  
✅ Admin routes returnerar 401 utan autentisering  
✅ CORS tillåter endast configurerade origins  
✅ Frontend visar tydliga felmeddelanden vid rate limiting  

När alla tester passerar är säkerheten korrekt implementerad!