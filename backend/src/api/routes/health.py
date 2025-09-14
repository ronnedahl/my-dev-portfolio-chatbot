"""Health check endpoint."""

from fastapi import APIRouter
from datetime import datetime
import structlog

router = APIRouter(tags=["health"])
logger = structlog.get_logger()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns the service status and current timestamp.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "peterbot-langgraph-api"
    }


@router.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Peterbot LangGraph API",
        "version": "0.1.0",
        "description": "AI assistant API with Firebase vector store",
        "endpoints": {
            "chat": "/chat",
            "documents": "/documents", 
            "search": "/search",
            "health": "/health",
            "docs": "/docs"
        }
    }