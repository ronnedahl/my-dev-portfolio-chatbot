# Peterbot Chat - Standalone Chat Application

En standalone React-applikation för att chatta med Peter AI Assistant, designad för att köras på en separat subdomän (t.ex. chat.peterbot.dev).

## Features

- **Fullskärms chatgränssnitt** - Optimerat för dedikerad chat-användning
- **Säker API-kommunikation** - Robust felhantering och timeout-skydd
- **Admin panel** - För cachehantering och systemadministration  
- **Responsiv design** - Fungerar på desktop och mobila enheter
- **Rate limit feedback** - Tydliga meddelanden vid överbelastning

## Struktur

```
src/
├── pages/
│   ├── ChatPage.tsx     # Huvudchat-gränssnitt
│   ├── AdminPage.tsx    # Admin-panel för systemhantering
│   └── LoginPage.tsx    # Inloggning för admin
├── utils/
│   └── api.ts           # Säker API-konfiguration
└── components/
    └── ChatbotWidget.tsx # (Tidigare widget, inte använd)
```

## Routes

- `/` → Redirectar till `/chat`
- `/chat` → Huvudchat-gränssnitt  
- `/admin` → Admin-panel (kräver autentisering)
- `/login` → Admin-inloggning

## Development

### Förutsättningar

- Node.js 18+
- Backend API körs på localhost:8000 (eller VITE_API_BASE_URL)

### Installation

```bash
npm install
```

### Starta development server

```bash
npm run dev
```

Applikationen startar på http://localhost:5173

### Build för produktion

```bash
npm run build
```

### Environment Variables

Skapa `.env` fil:

```env
VITE_API_BASE_URL=https://api.peterbot.dev  # eller http://localhost:8000
```

## Deployment för subdomän

### Nginx konfiguration för chat.peterbot.dev

```nginx
server {
    listen 443 ssl http2;
    server_name chat.peterbot.dev;
    
    ssl_certificate /etc/letsencrypt/live/peterbot.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/peterbot.dev/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend files
    location / {
        root /var/www/chat.peterbot.dev;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Optional: Proxy API calls to main API server
    location /api/ {
        proxy_pass https://api.peterbot.dev/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP redirect
server {
    listen 80;
    server_name chat.peterbot.dev;
    return 301 https://$host$request_uri;
}
```

### Deployment steg

1. **Bygg applikationen**
   ```bash
   npm run build
   ```

2. **Kopiera till server**
   ```bash
   scp -r dist/* user@server:/var/www/chat.peterbot.dev/
   ```

3. **Konfigurera Nginx**
   - Lägg till ovanstående konfiguration i `/etc/nginx/sites-available/chat.peterbot.dev`
   - Aktivera: `sudo ln -s /etc/nginx/sites-available/chat.peterbot.dev /etc/nginx/sites-enabled/`
   - Testa: `sudo nginx -t`
   - Ladda om: `sudo systemctl reload nginx`

4. **SSL-certifikat**
   ```bash
   sudo certbot --nginx -d chat.peterbot.dev
   ```

## Säkerhet

Applikationen implementerar:

- **HTTPS endast** - Alla API-anrop över säkra förbindelser
- **CORS hantering** - Backend måste tillåta chat.peterbot.dev origin
- **Rate limiting** - Automatisk hantering av rate limits från backend
- **Input sanitering** - Säker hantering av användarinput
- **Admin autentisering** - Firebase Auth för admin-funktioner

### Backend CORS-konfiguration

Se till att backend tillåter chat.peterbot.dev:

```python
# I backend src/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://peterbot.dev", 
        "https://chat.peterbot.dev"  # Lägg till denna
    ],
    # ...
)
```

## Testing

Testa applikationen lokalt:

1. **Starta backend**: `uv run uvicorn src.main:app --reload`
2. **Starta frontend**: `npm run dev`
3. **Besök**: http://localhost:5173
4. **Testa chat-funktionalitet**
5. **Testa admin-panel**: http://localhost:5173/admin

## Felsökning

### Vanliga problem

1. **API-anslutningsfel**
   - Kontrollera att VITE_API_BASE_URL är korrekt
   - Verifiera att backend körs
   - Kontrollera CORS-inställningar

2. **Rate limiting**
   - Normal respons vid för många requests
   - Vänta 1 minut innan nya försök

3. **Admin-åtkomst**
   - Kontrollera att Firebase Auth är konfigurerat
   - Verifiera admin-emails i backend .env

### Logs

- **Browser Console**: Kolla för JavaScript-fel
- **Network Tab**: Se API-requests och responses
- **Backend Logs**: Kontrollera backend-loggar för fel

## Licens

MIT License - se LICENSE fil för detaljer.