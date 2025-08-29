# PeterBot AI - Personal AI Assistant

A full-stack AI assistant application built with React TypeScript frontend and Python FastAPI backend, featuring RAG (Retrieval-Augmented Generation) capabilities powered by LangGraph and Firebase.

## Live Demo

Visit [your-domain.com](https://your-domain.com) to interact with PeterBot AI.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │───▶│   FastAPI API    │───▶│  Firebase Store │
│   (TypeScript)  │    │   (LangGraph)    │    │   (Firestore)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
    Vite + Tailwind         Python 3.11+              Vector DB
    Firebase Auth           OpenAI GPT-4o            Semantic Search
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Firebase Auth
- **Backend**: FastAPI, LangGraph, LangChain, Python 3.11+
- **AI/ML**: OpenAI GPT-4o-mini, Text Embeddings, Vector Search
- **Database**: Firebase Firestore with vector search capabilities
- **Infrastructure**: Docker, Nginx, UV package manager

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Python** 3.11 or higher
- **UV** package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Git**
- **Docker** (optional, for containerized deployment)

### Required API Keys & Services

1. **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
2. **Firebase Project** - [Create project](https://console.firebase.google.com/)
3. **Firebase Service Account Key** - Download JSON from Firebase Console

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/peterbot-ai.git
cd peterbot-ai
```

### 2. Backend Setup (FastAPI + LangGraph)

```bash
# Navigate to backend directory
cd langgraph-api

# Install dependencies using UV
uv sync

# Create environment file
cp .env.example .env
```

**Configure Backend Environment Variables** (`.env`):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_COLLECTION_NAME=documents
FIREBASE_FIELD_NAME=embedding
FIREBASE_INDEX_NAME=embedding-index
SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # Your Firebase service account JSON as string

# Application Settings
LOG_LEVEL=INFO
```

**Start the Backend Server:**

```bash
# Development server with hot reload
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# The API will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Frontend Setup (React + TypeScript)

```bash
# Navigate to frontend directory
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure Frontend Environment Variables** (`.env`):

```bash
# Firebase Configuration (Frontend)
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

**Start the Frontend Server:**

```bash
# Development server with HMR
npm run dev

# The app will be available at http://localhost:5173
```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Create a collection named `documents`

### 2. Enable Authentication

1. In Firebase Console, go to Authentication
2. Enable Email/Password authentication
3. Add your domain to authorized domains

### 3. Create Service Account

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert to single-line JSON string for `SERVICE_ACCOUNT_KEY`

### 4. Configure Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing the Setup

### Test Backend API

```bash
cd langgraph-api

# Test configuration
uv run python scripts/test_config.py

# Test API endpoints
uv run python scripts/test_api.py

# Test vector search
uv run python scripts/test_search.py
```

### Test Frontend

```bash
cd client

# Run linting
npm run lint

# Build for production
npm run build
```

## API Documentation

Once the backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/chat` - Send message to AI assistant
- `GET /api/health` - Health check
- `POST /api/documents` - Add document to knowledge base
- `GET /api/documents` - List stored documents

##  Development Workflow

### Backend Development

```bash
cd langgraph-api

# Run with auto-reload
uv run uvicorn src.main:app --reload

# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Run specific tests
uv run python scripts/test_api.py
```

### Frontend Development

```bash
cd client

# Development server
npm run dev

# Type checking
npm run build

# Linting
npm run lint
```

##  Production Deployment

### Using Docker

```bash
# Build and run with Docker Compose (if available)
docker-compose up --build

# Or build individual containers
cd client && docker build -t peterbot-frontend .
cd langgraph-api && docker build -t peterbot-backend .
```

### Manual Deployment

1. **Build Frontend:**
   ```bash
   cd client
   npm run build
   # Deploy dist/ folder to your web server
   ```

2. **Deploy Backend:**
   ```bash
   cd langgraph-api
   # Use gunicorn for production
   uv run gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

##  Configuration

### Backend Settings

Located in `langgraph-api/src/config/settings.py`:

- `MAX_SEARCH_RESULTS`: Maximum documents returned from vector search
- `SIMILARITY_THRESHOLD`: Minimum similarity score for search results
- `LLM_TIMEOUT`: OpenAI API timeout
- `CACHE_TTL`: Vector store cache duration

### Frontend Configuration

- `vite.config.ts`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS customization
- `firebase/config.ts`: Firebase SDK configuration

##  Troubleshooting

### Common Issues

**Backend won't start:**
- Verify Python 3.11+ is installed
- Check all environment variables are set
- Ensure Firebase service account JSON is valid

**Frontend build fails:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

**Firebase connection issues:**
- Verify project ID matches across all configs
- Check Firestore rules allow authenticated access
- Ensure service account has proper permissions

**OpenAI API errors:**
- Verify API key is valid and has credits
- Check rate limits haven't been exceeded

### Debug Mode

Enable detailed logging:

```bash
# Backend
LOG_LEVEL=DEBUG uv run uvicorn src.main:app --reload

# Check logs in structured format
tail -f logs/app.log
```

##  Project Structure

```
peterbot-ai/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── firebase/      # Firebase configuration
│   │   └── App.tsx        # Main application
│   ├── public/           # Static assets
│   └── vite.config.ts    # Vite configuration
├── langgraph-api/        # Python FastAPI backend
│   ├── src/
│   │   ├── api/          # FastAPI routes
│   │   ├── core/         # LangGraph nodes & state
│   │   ├── services/     # Business logic services
│   │   └── config/       # Configuration
│   └── scripts/          # Utility scripts
└── README.md
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  About

Created by Peter - A passionate developer showcasing modern full-stack AI application development with enterprise-grade architecture and best practices.

---

**Questions?** Open an issue or contact me at [your-email@example.com](mailto:your-email@example.com)
