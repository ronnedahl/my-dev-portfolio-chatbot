"""API routes module."""

from . import chat
from . import documents
from . import search
from . import health

__all__ = ["chat", "documents", "search", "health"]