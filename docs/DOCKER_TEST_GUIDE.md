# Docker Test Guide - PeterBot AI

Guide för att testa PeterBot AI med Docker innan deployment till Hetzner.

## Förutsättningar

### Windows Docker Setup:
1. **Docker Desktop** installerat och igång
2. **WSL2** aktiverat (för bästa prestanda)
3. **Git Bash** eller **PowerShell** för kommandorad

### Verifiering:
```bash
docker --version
docker-compose --version
```

## Snabbstart

### 1. **Förbered environment-variabler**
```bash
# Kopiera template
cp .env.docker .env.docker.local

# Redigera med dina värden
notepad .env.docker.local
```

**Fyll i alla värden från din lokala `.env`-fil!**

### 2. **Kör test-script**
```bash
# Windows
./docker-test.bat

# Eller manuellt
docker-compose --env-file .env.docker.local up --build -d
```

### 3. **Testa applikationen**
- **Nginx Proxy**: http://localhost
- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:8000
- **Health checks**: `/health` på alla endpoints

## Docker Kommandon

### **Starta services:**
```bash
docker-compose --env-file .env.docker.local up -d
```

### **Bygg om images:**
```bash
docker-compose --env-file .env.docker.local build --no-cache
```

### **Visa logs:**
```bash
# Alla services
docker-compose logs -f

# Specifik service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### **Stoppa services:**
```bash
docker-compose --env-file .env.docker.local down
```

### **Cleanup (ta bort allt):**
```bash
./docker-cleanup.bat
```

## Development Mode

För hot reload och utveckling:

```bash
# Starta development mode
docker-compose -f docker-compose.dev.yml --env-file .env.docker.local up -d

# Frontend på port 5173
# Backend på port 8000
```

## Testscenarios

### **1. Basic Functionality Test**
```bash
# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000/health

# Test nginx proxy
curl http://localhost/health
```

### **2. API Test**
```bash
# Test chat endpoint
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"query": "Vem är Peter?", "user_id": "test"}'
```

### **3. Frontend Test**
- Öppna http://localhost:3000
- Testa chat-funktionalitet
- Kontrollera att felhantering fungerar
- Testa admin-sidan (kräver inloggning)

### **4. Network Test**
```bash
# Test containers kan kommunicera
docker exec peterbot-frontend curl http://backend:8000/health
docker exec peterbot-backend curl http://frontend:3000/health
```

## Troubleshooting

### **Container startar inte:**
```bash
# Kontrollera logs
docker-compose logs [service-name]

# Kontrollera resource-användning
docker stats
```

### **Port-konflikter:**
```bash
# Kontrollera vilka portar som används
netstat -an | findstr :8000
netstat -an | findstr :3000
netstat -an | findstr :80
```

### **Environment-variabler:**
```bash
# Kontrollera env vars i container
docker exec peterbot-backend env | grep FIREBASE
docker exec peterbot-frontend env | grep VITE
```

### **Network-problem:**
```bash
# Kontrollera Docker networks
docker network ls
docker network inspect peterbot-ai_peterbot-network
```

## Performance Monitoring

### **Resource Usage:**
```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

### **Container Health:**
```bash
# Health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Production vs Development

### **Production Mode:**
- **Optimized builds**: Minimerat för prestanda
- **Security**: Non-root user, security headers
- **Caching**: Aggressiv caching för statiska filer
- **Health checks**: Automatisk felhantering

### **Development Mode:**
- **Hot reload**: Ändringar syns direkt
- **Volume mounts**: Lokal kod syncad
- **Debug logs**: Mer detaljerad logging
- **Port mapping**: Direkt access till services

## Success Criteria

### **Docker test är framgångsrikt om:**
1. Alla containers startar utan fel
2. Health checks returnerar 200 OK
3. Frontend visar chat-interface
4. Backend svarar på API-anrop
5. Nginx proxy fungerar korrekt
6. Environment-variabler laddas korrekt

### **Redo för Hetzner deployment:**
- Docker test passerar alla scenarion
- Images byggs utan fel
- Services kommunicerar korrekt via nätverk
- Security headers fungerar
- Performance är acceptabel

## Next Steps

Efter framgångsrik Docker-test:
1. **Push images** till registry (Docker Hub/Hetzner)
2. **Deploy till Hetzner** med samma Docker Compose setup
3. **Configure domain** och SSL-certifikat
4. **Setup monitoring** och logging
5. **Configure backup** för persistent data

---

**Problem?** Kolla logs med `docker-compose logs -f` eller kör `./docker-cleanup.bat` för clean start.