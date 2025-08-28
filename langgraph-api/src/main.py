"""Main application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
import uvicorn
from contextlib import asynccontextmanager
from src.api.routes import chat, documents, search, health, admin
from src.config import settings
from src.utils import setup_logging
from src.middleware import setup_security_middleware

# Setup logging
setup_logging()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info(
        "application_starting",
        environment=settings.api_env,
        host=settings.api_host,
        port=settings.api_port
    )
    yield
    # Shutdown
    logger.info("application_shutting_down")


# Create FastAPI app
app = FastAPI(
    title="Peterbot LangGraph API",
    description="AI assistant API with Firebase vector store and LangGraph",
    version="0.1.0",
    lifespan=lifespan
)

# Setup security middleware (Helmet-like headers and rate limiting)
setup_security_middleware(app)

# Configure CORS (MUST be after security middleware to handle preflight requests correctly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://peterbot.dev",
        "https://www.peterbot.dev",
        "https://api.peterbot.dev",
        "https://chat.peterbot.dev"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(
        "unhandled_exception",
        error=str(exc),
        path=request.url.path,
        method=request.method
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.is_development else "An unexpected error occurred",
            "status_code": 500
        }
    )


# Include routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(admin.router)


def run():
    """Run the application."""
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development,
        log_config=None  # We handle logging ourselves
    )


if __name__ == "__main__":
    run()