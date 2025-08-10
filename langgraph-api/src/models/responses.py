"""Response models for API endpoints."""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    
    response: str = Field(..., description="AI assistant response")
    conversation_id: str = Field(..., description="Conversation thread ID")
    retrieved_context: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Retrieved documents used for response"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Peter has extensive experience with Python...",
                "conversation_id": "conv_123",
                "retrieved_context": [
                    {
                        "id": "doc_1",
                        "text": "5 years Python experience",
                        "similarity": 0.95
                    }
                ],
                "timestamp": "2024-01-20T10:30:00Z"
            }
        }


class DocumentResponse(BaseModel):
    """Response model for document operations."""
    
    document_id: str = Field(..., description="Document ID")
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Operation message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "doc_abc123",
                "success": True,
                "message": "Document created successfully"
            }
        }


class SearchResult(BaseModel):
    """Single search result."""
    
    id: str = Field(..., description="Document ID")
    text: str = Field(..., description="Document text")
    similarity: float = Field(..., description="Similarity score")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Document metadata"
    )
    created_at: Optional[datetime] = Field(
        default=None,
        description="Document creation time"
    )


class SearchResponse(BaseModel):
    """Response model for search endpoint."""
    
    results: List[SearchResult] = Field(
        default_factory=list,
        description="Search results"
    )
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Total number of results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "results": [
                    {
                        "id": "doc_1",
                        "text": "Python expert with 5 years experience",
                        "similarity": 0.95,
                        "metadata": {"category": "skills"}
                    }
                ],
                "query": "Python experience",
                "total_results": 1
            }
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(
        default=None,
        description="Detailed error information"
    )
    status_code: int = Field(..., description="HTTP status code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "Internal server error",
                "detail": "Failed to connect to database",
                "status_code": 500
            }
        }