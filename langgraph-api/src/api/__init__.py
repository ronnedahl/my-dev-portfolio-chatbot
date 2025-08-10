"""API module with FastAPI routes."""

from .routes import chat, documents, search, health

__all__ = ["chat", "documents", "search", "health"]