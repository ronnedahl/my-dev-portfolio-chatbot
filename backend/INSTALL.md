# Installation Guide för Windows

## Steg 1: Installera uv

### Option A: Via PowerShell (Rekommenderat)
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Option B: Via pip
```bash
pip install uv
```

### Option C: Via Scoop
```bash
scoop install uv
```

## Steg 2: Starta om terminal
Efter installation, starta om din terminal/command prompt för att säkerställa att `uv` finns i PATH.

## Steg 3: Navigera till projektet
```bash
cd C:\peterbot-ai-hetzer\peterbot-ai\langgraph-api
```

## Steg 4: Kör setup

### Windows Command Prompt
```cmd
setup.bat
```

### PowerShell/Unix-style
```bash
python scripts/setup.py
```

## Steg 5: Konfigurera environment
1. Redigera `.env` filen som skapades
2. Lägg till dina API keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Firebase Configuration (från Firebase Console > Project Settings > Service Accounts)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
```

## Steg 6: Starta utvecklingsservern
```bash
uv run python scripts/dev.py
```

## Steg 7: Testa API:et
- Besök: http://localhost:8000/docs
- Eller kör: `uv run python scripts/test_api.py`

## Felsökning

### Problem: "uv command not found"
**Lösning**: 
1. Installera uv enligt steg 1
2. Starta om terminal
3. Verifiera med: `uv --version`

### Problem: "Build failed"
**Lösning**:
```bash
# Rensa cache
uv cache clean

# Försök igen
uv sync
```

### Problem: Firebase credentials
**Lösning**:
1. Gå till [Firebase Console](https://console.firebase.google.com)
2. Välj ditt projekt
3. Project Settings > Service Accounts
4. Generera ny private key
5. Kopiera värdena till `.env`

### Problem: OpenAI API key
**Lösning**:
1. Gå till [OpenAI Platform](https://platform.openai.com/api-keys)
2. Skapa ny API key
3. Kopiera till `.env`

## Manual Installation (utan uv)

Om uv inte fungerar, kan du använda standard Python:

```bash
# Skapa virtual environment
python -m venv venv

# Aktivera (Windows)
venv\Scripts\activate

# Aktivera (Unix/Mac)
source venv/bin/activate

# Installera dependencies
pip install -r requirements.txt
```

Skapa `requirements.txt`:
```
fastapi>=0.115.0
uvicorn[standard]>=0.31.0
langgraph>=0.2.0
langchain>=0.3.0
langchain-openai>=0.2.0
langchain-community>=0.3.0
firebase-admin>=6.5.0
google-cloud-firestore>=2.16.0
python-dotenv>=1.0.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
numpy>=1.26.0
structlog>=24.1.0
httpx>=0.27.0
python-multipart>=0.0.9
```