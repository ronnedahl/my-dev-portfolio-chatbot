# Peterbot LangGraph API

En intelligent AI-assistent byggd med LangGraph, FastAPI och Firebase som vector store. API:et använder avancerad retrieval-augmented generation (RAG) för att svara på frågor om Peters bakgrund och CV-information.

## Funktioner

- **LangGraph Agent**: Intelligent agent med multi-step reasoning
- **Firebase Vector Store**: Semantisk sökning i kunskapsbasen
- **FastAPI**: Moderna RESTful API endpoints
- **Structured Logging**: Detaljerad loggning med structlog
- **Type Safety**: Full TypeScript-stil typing med Pydantic
- **Development Ready**: Hot reload och utvecklingsverktyg

## Projektstruktur

```
langgraph-api/
├── src/
│   ├── api/           # FastAPI routes och endpoints
│   ├── core/          # LangGraph agent implementation
│   ├── services/      # Business logic (Firebase, embeddings)
│   ├── models/        # Pydantic models för requests/responses
│   ├── config/        # Konfiguration och settings
│   └── utils/         # Utilities (logging, etc.)
├── scripts/           # Utvecklingsskript
├── tests/            # Test suite
└── pyproject.toml    # uv dependency management
```

## Snabbstart

### 1. Installation

**Option A: Med uv (Rekommenderat)**
```bash
# Installera uv först (se INSTALL.md för detaljer)
# Sedan navigera till projektet
cd peterbot-ai/langgraph-api

# Windows
setup.bat

# Unix/Linux/Mac
python scripts/setup.py
```

**Option B: Standard Python**
```bash
cd peterbot-ai/langgraph-api
python setup_simple.py
```

**Detaljerade instruktioner finns i [INSTALL.md](INSTALL.md)**

### 2. Konfiguration

Kopiera `.env.example` till `.env` och konfigurera:

```bash
cp .env.example .env
```

Fyll i dina credentials i `.env`:
- **OpenAI API Key**: För LLM och embeddings
- **Firebase Credentials**: För vector store
- **API Configuration**: Host, port, log level

### 3. Starta utvecklingsserver

```bash
# Aktivera virtual environment och starta server
uv run python scripts/dev.py
```

API:et startar på `http://localhost:8000`

### 4. Testa API:et

```bash
# Kör test suite
uv run python scripts/test_api.py

# Eller besök interactive docs
open http://localhost:8000/docs
```

## API Endpoints

### Chat
```
POST /chat/
```
Chatta med AI-assistenten. Agenten analyserar queries och hämtar relevant kontext automatiskt.

### Documents
```
POST /documents/     # Skapa dokument
GET /documents/{id}  # Hämta dokument
PUT /documents/{id}  # Uppdatera dokument
DELETE /documents/{id} # Ta bort dokument
GET /documents/      # Lista dokument
```

### Search
```
POST /search/
```
Semantisk sökning i kunskapsbasen med similarity scoring.

### Health
```
GET /health          # Health check
GET /                # API information
```

## LangGraph Agent Arkitektur

Agenten använder en multi-step process:

1. **Query Analysis**: Avgör om retrieval behövs
2. **Context Retrieval**: Hämtar relevant information från Firebase
3. **Response Planning**: Planerar strukturerat svar
4. **Response Generation**: Genererar finalt svar

```python
# Agent workflow
query → analyze → retrieve/skip → plan → generate → response
```

## Firebase Vector Store

Använder Firebase Firestore för:
- **Document Storage**: Text, metadata, embeddings
- **Semantic Search**: Cosine similarity search
- **Real-time Updates**: Live sync med knowledge base

## Development

### Kodkvalitet

```bash
# Linting
uv run ruff check src/

# Formatting  
uv run black src/

# Type checking
uv run mypy src/
```

### Testing

```bash
# Run tests
uv run pytest

# Coverage
uv run pytest --cov=src
```

### Environment Variables

Fullständig lista i `.env.example`:

- `OPENAI_API_KEY`: OpenAI API nyckel
- `FIREBASE_PROJECT_ID`: Firebase projekt ID
- `FIREBASE_PRIVATE_KEY`: Firebase service account key
- `API_HOST/PORT`: Server konfiguration
- `LOG_LEVEL`: Logging level (INFO, DEBUG, etc.)

## Lokal Frontend Integration

För att integrera med React frontend:

```javascript
// Exempel API call från React
const response = await fetch('http://localhost:8000/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "Tell me about Peter's Python experience",
    conversation_id: "user_session_123"
  })
});

const data = await response.json();
console.log(data.response); // AI assistant response
```

## Felsökning

### Vanliga Problem

1. **Firebase Connection**: Kontrollera credentials i `.env`
2. **OpenAI API**: Verifiera API key och quota
3. **Dependencies**: Kör `uv sync` för att synca packages
4. **Ports**: Se till att port 8000 är ledig

### Logging

API:et använder structured logging:
```bash
# Öka log level för debugging
LOG_LEVEL=DEBUG uv run python scripts/dev.py
```

### Performance

- **Firebase**: Optimerad med batch operations
- **Embeddings**: Cachad för bättre performance  
- **Memory**: MemorySaver för conversation persistence

## Production Deployment

Se `nginx/` konfiguration för production setup med:
- SSL certificates
- API proxy på `/api/*`
- Static file serving
- Security headers

## Bidrag

1. Fork repot
2. Skapa feature branch
3. Kör tests och linting
4. Skicka pull request

## Licens

MIT License - se LICENSE fil för detaljer.