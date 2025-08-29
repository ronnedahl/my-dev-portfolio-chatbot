"""Document processing service for vector store operations."""

from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog

logger = structlog.get_logger()


class DocumentProcessor:
    """Handles document data processing and field normalization."""
    
    # Field mapping for different document schemas
    EMBEDDING_FIELDS = ["embedding", "embeddings", "vector"]
    TEXT_FIELDS = ["text", "content", "chunk", "document", "data"]
    
    @classmethod
    def prepare_document_data(
        cls,
        text: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Prepare document data with standardized schema.
        
        Returns:
            Formatted document data ready for storage
        """
        return {
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @classmethod
    def extract_embedding(cls, doc_data: Dict[str, Any]) -> Optional[List[float]]:
        """Extract embedding from document with flexible field mapping."""
        for field in cls.EMBEDDING_FIELDS:
            if field in doc_data and doc_data[field]:
                return doc_data[field]
        return None
    
    @classmethod
    def extract_text_content(cls, doc_data: Dict[str, Any]) -> str:
        """Extract text content with flexible field mapping."""
        for field in cls.TEXT_FIELDS:
            if field in doc_data and doc_data[field]:
                return doc_data[field]
        
        # Fallback to stringified data
        return str(doc_data.get("data", ""))
    
    @classmethod
    def format_search_result(
        cls,
        doc_id: str,
        doc_data: Dict[str, Any],
        similarity: float
    ) -> Dict[str, Any]:
        """Format document data for search results."""
        return {
            "id": doc_id,
            "text": cls.extract_text_content(doc_data),
            "metadata": doc_data.get("metadata", {}),
            "similarity": similarity,
            "created_at": doc_data.get("created_at"),
            "updated_at": doc_data.get("updated_at")
        }
    
    @classmethod
    def sanitize_for_response(cls, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove large fields from document data for API responses."""
        sanitized = doc_data.copy()
        # Remove embedding vectors (too large for responses)
        for field in cls.EMBEDDING_FIELDS:
            sanitized.pop(field, None)
        return sanitized