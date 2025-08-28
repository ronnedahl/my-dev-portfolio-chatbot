# 🚀 PeterBot Deployment Guide

Komplett guide för att deploya PeterBot som fristående chatapp på Hetzner server.

## 📁 Projektstruktur

```
peterbot-ai/
├── langgraph-api/          # Backend API
│   ├── src/                # Källkod
│   ├── Dockerfile          # Backend container
│   ├── .env.production     # Produktionsmiljövariabler
│   ├── gunicorn.conf.py    # Production server config
│   └── requirements-production.txt
├── standalone-chat/        # Fristående frontend
│   ├── index.html          # Minimal chat interface
│   ├── Dockerfile          # Frontend container
│   └── nginx.conf          # Nginx konfiguration
├── docker-compose.prod.yml # Docker orchestration
└── deploy.sh              # Deployment script
```

## 🔧 Förberedelser

### 1. Klona och förbered projektet

```bash
# På din Hetzner server
git clone https://github.com/din-användare/peter-bot-github.git
cd peter-bot-github/peterbot-ai
```

### 2. Konfigurera environment variables

```bash
# Kopiera template
cp langgraph-api/.env.production langgraph-api/.env.production.local

# Redigera med dina riktiga värden
nano langgraph-api/.env.production
```

**Viktiga variabler att sätta:**
```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# ... övriga Firebase-värden

# Domains (uppdatera till dina domäner)
API_HOST=0.0.0.0
```

## 🐳 Docker Deployment

### Snabb deployment

```bash
# Gör script körbart
chmod +x deploy.sh

# Starta deployment
./deploy.sh
```

### Manuell deployment

```bash
# Bygg och starta alla services
docker-compose -f docker-compose.prod.yml up -d --build

# Kontrollera status
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 Nginx & Domains

### Domain-konfiguration

För att använda dina domäner (peterbod.dev):

1. **API**: `api.peterbod.dev` → port 8000
2. **Chat**: `chat.peterbod.dev` → port 3000

### Nginx reverse proxy (valfritt)

```nginx
# /etc/nginx/sites-available/peterbod
server {
    listen 80;
    server_name chat.peterbod.dev;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.peterbod.dev;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 30s;
    }
}
```

## 📊 Övervakning & Underhåll

### Användning av deployment script

```bash
# Visa status
./deploy.sh status

# Visa logs
./deploy.sh logs

# Starta om services
./deploy.sh restart

# Stoppa alla services
./deploy.sh stop

# Fullständig cleanup
./deploy.sh clean
```

### Hälsokontroller

```bash
# API health
curl https://api.peterbod.dev/health

# Frontend health  
curl https://chat.peterbod.dev/health

# Cache statistik
curl https://api.peterbod.dev/admin/cache/stats

# Vector cache info
curl https://api.peterbod.dev/admin/vector-cache/info
```

### Loggning

```bash
# Visa alla logs
docker-compose -f docker-compose.prod.yml logs -f

# Bara API logs
docker-compose -f docker-compose.prod.yml logs -f api

# Bara Chat logs
docker-compose -f docker-compose.prod.yml logs -f chat
```

## 🔒 SSL/HTTPS Setup

### Med Certbot (rekommenderat)

```bash
# Installera Certbot
sudo apt install certbot python3-certbot-nginx

# Få SSL-certifikat
sudo certbot --nginx -d api.peterbod.dev -d chat.peterbod.dev

# Auto-renewal
sudo crontab -e
# Lägg till: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚨 Felsökning

### Vanliga problem

1. **API startar inte**
   ```bash
   # Kontrollera environment variabler
   docker-compose -f docker-compose.prod.yml config
   
   # Kontrollera API logs
   docker logs peterbot-api
   ```

2. **Chat kan inte ansluta till API**
   - Kontrollera CORS-inställningar i `main.py`
   - Kontrollera att API är tillgängligt från frontend

3. **Långsamma svar**
   ```bash
   # Kontrollera cache status
   curl http://localhost:8000/admin/cache/stats
   curl http://localhost:8000/admin/vector-cache/info
   ```

4. **Minnes-/CPU-problem**
   ```bash
   # Kontrollera resurser
   docker stats
   
   # Justera limits i docker-compose.prod.yml
   ```

### Prestanda-optimering

```bash
# Cacha varning - rensa cache om nödvändigt
curl -X POST http://localhost:8000/admin/cache/clear

# Vector cache - kolla information
curl http://localhost:8000/admin/vector-cache/info
```

## 📈 Förväntad prestanda

| Frågetyp | Hetzner (förväntat) | Förbättring |
|----------|---------------------|-------------|
| Enkla ("hej") | <0.5 sek | 99% |
| Komplexa första gången | 6-10 sek | 70% |
| Komplexa (cachade) | <1 sek | 99% |
| Vector search (cachad) | <2 sek | 95% |

## 🔄 Uppdateringar

### Uppdatera koden

```bash
# Hämta senaste koden
git pull origin main

# Rebuilda och starta om
./deploy.sh

# Eller manuellt
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup

```bash
# Deployment scriptet skapar automatisk backup i backups/
# Manuell backup av logs
docker logs peterbot-api > backup_api_$(date +%Y%m%d).log
docker logs peterbot-chat > backup_chat_$(date +%Y%m%d).log
```

## 🎯 Slutresultat

Efter deployment kommer du ha:
- ✅ **API**: `https://api.peterbod.dev` - FastAPI backend med optimering
- ✅ **Chat**: `https://chat.peterbod.dev` - Fristående minimal chatapp
- ✅ **Övervakning**: Health checks och cache-statistik
- ✅ **Prestanda**: 70-99% snabbare svar
- ✅ **SSL**: Automatiska HTTPS-certifikat
- ✅ **Auto-restart**: Docker restart policies

Din chatapp kommer nu att vara helt fristående från din huvudwebbsida och optimerad för snabb prestanda!