"""Request models for API endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    
    query: str = Field(..., min_length=1, description="User query")
    conversation_id: Optional[str] = Field(
        default="default",
        description="Conversation thread ID"
    )
    user_id: Optional[str] = Field(
        default="anonymous",
        description="User identifier"
    )
    additional_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context for the query"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Tell me about Peter's experience with Python",
                "conversation_id": "conv_123",
                "user_id": "user_456"
            }
        }


class DocumentRequest(BaseModel):
    """Request model for document management."""
    
    text: str = Field(..., min_length=1, description="Document text content")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Document metadata"
    )
    document_id: Optional[str] = Field(
        default=None,
        description="Optional document ID"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Peter has 5 years of experience with Python and FastAPI",
                "metadata": {
                    "category": "experience",
                    "tags": ["python", "fastapi"]
                }
            }
        }


class SearchRequest(BaseModel):
    """Request model for search endpoint."""
    
    query: str = Field(..., min_length=1, description="Search query")
    top_k: Optional[int] = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of results to return"
    )
    threshold: Optional[float] = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Minimum similarity threshold"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Python experience",
                "top_k": 5,
                "threshold": 0.7
            }
        }