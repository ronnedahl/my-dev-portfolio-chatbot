# Testa Standalone Chat-app lokalt

## Snabbstart

### 1. Starta backend (i en terminal)
```bash
cd peterbot-ai/langgraph-api
uv run uvicorn src.main:app --reload --port 8000
```

### 2. Starta chat-appen (i ny terminal)
```bash
cd peterbot-ai/client
npm run dev
```

### 3. Öppna i webbläsaren
Gå till: http://localhost:5173

Du bör se:
- En fullskärms chat-gränssnitt
- Peter's profilbild i header
- Ett välkomstmeddelande från Peter AI
- Inputfält längst ner

## Test checklista

### Grundfunktionalitet
- [ ] Chat-gränssnittet laddas korrekt
- [ ] Kan skicka meddelanden och få svar
- [ ] Meddelanden visas med tidsstämplar
- [ ] "Rensa chat"-knappen fungerar
- [ ] Auto-scroll till nya meddelanden

### Navigering
- [ ] `/` redirectar till `/chat`
- [ ] `/chat` visar chat-gränssnittet
- [ ] `/admin` visar admin-panelen
- [ ] `/login` visar login-sidan
- [ ] Inställnings-ikon i header går till admin

### Responsiv design
- [ ] Fungerar på desktop (1920x1080)
- [ ] Fungerar på tablet (768x1024)
- [ ] Fungerar på mobil (375x667)

### Felhantering
- [ ] Stäng av backend och testa → "Serverfel" meddelande
- [ ] Skicka många meddelanden → "Du skickar för många meddelanden"
- [ ] Tomma meddelanden skickas inte

### Admin-funktioner
- [ ] `/admin` kräver autentisering (visar 401 meddelanden)
- [ ] "Tillbaka till chat" länken fungerar
- [ ] Admin-panelen visar cache-hanteringsknappar

## Manuell testning

### Chat-funktionalitet
1. **Skicka normala frågor**:
   - "Hej Peter!"
   - "Vad är din bakgrund?"
   - "Vilken erfarenhet har du?"

2. **Testa rate limiting**:
   - Skicka 10-15 meddelanden snabbt i följd
   - Du bör få ett felmeddelande efter ~60 requests/minut

3. **Testa långa meddelanden**:
   - Skriv ett mycket långt meddelande
   - Kontrollera att det formateras korrekt

### UI/UX tester
1. **Keyboard shortcuts**:
   - Tryck Enter för att skicka
   - Tab för att navigera

2. **Visual feedback**:
   - Loading spinner när meddelanden skickas
   - Disabled input medan loading
   - Timestamps på meddelanden

3. **Responsiveness**:
   - Ändra fönsterstorlek
   - Testa på olika skärmstorlekar (DevTools)

## Automatisk testning

Kör säkerhetstesterna från parent-directory:

```bash
cd peterbot-ai
python test_security.py
```

Detta testar:
- Security headers
- Rate limiting
- CORS
- Protected routes
- API-funktionalitet

## Debugging

### Vanliga problem och lösningar

1. **App startar inte**
   ```bash
   # Kontrollera Node.js version
   node --version  # Ska vara 18+
   
   # Reinstallera dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **API-anslutningsfel**
   ```bash
   # Kontrollera backend-status
   curl http://localhost:8000/health
   
   # Kontrollera CORS
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS http://localhost:8000/chat/
   ```

3. **Build-fel**
   ```bash
   # Kontrollera TypeScript-fel
   npx tsc --noEmit
   
   # Kontrollera linting
   npm run lint
   ```

### Browser DevTools

Använd F12 för att öppna DevTools:

1. **Console** - Kolla JavaScript-fel
2. **Network** - Se API-requests och responses
3. **Application > Local Storage** - Se om data sparas
4. **Elements** - Inspektera DOM och CSS

### Typiska fel att leta efter

- `CORS error` - Backend tillåter inte localhost:5173
- `404 on API calls` - Backend körs inte eller fel URL
- `Rate limit exceeded` - Normalt beteende, vänta 1 minut
- `Firebase errors` - Normal om Firebase Auth inte är konfigurerat

## Performance-testning

### Minneslöckage
1. Öppna Chrome DevTools > Performance
2. Starta inspelning
3. Använd chat intensivt i 5 minuter
4. Stoppa inspelning och analysera

### Nätverksprestanda
1. DevTools > Network
2. Throttle till "Slow 3G"
3. Testa chat-funktionalitet
4. Kontrollera request-tider

## Deployment-test

Innan du deployer till produktion:

### 1. Build-test
```bash
npm run build
npm run preview  # Testa production build lokalt
```

### 2. Environment-test
```bash
# Skapa .env.production
echo "VITE_API_BASE_URL=https://api.peterbot.dev" > .env.production

# Bygg med production env
npm run build
```

### 3. HTTPS-test
Om du har lokalt HTTPS-setup, testa med:
```bash
# Exempel med mkcert eller liknande
npm run dev -- --https
```

## Resultat

När alla tester passerar:

✅ Chat-appen är redo för deployment till chat.peterbot.dev
✅ Alla säkerhetsfunktioner fungerar korrekt  
✅ Användargränssnitt är responsivt och användarvänligt
✅ Error handling fungerar som förväntat
✅ Performance är acceptabel

## Nästa steg

Efter lyckade lokala tester:

1. **Committa ändringar**:
   ```bash
   git add .
   git commit -m "Implement standalone chat app with security"
   ```

2. **Deploy till server** enligt instruktionerna i README.md

3. **Konfigurera subdomän** (chat.peterbot.dev)

4. **Testa live deployment** med samma test-checklista