"""Enterprise-grade Firebase vector store with modular architecture."""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import structlog

from src.config import settings
from src.services.embeddings import EmbeddingService
from src.services.firebase_connection import FirebaseConnection
from src.services.document_processor import DocumentProcessor
from src.services.vector_search_engine import VectorSearchEngine

logger = structlog.get_logger()


class DocumentOperationError(Exception):
    """Custom exception for document operations."""
    pass


class FirebaseVectorStore:
    """Production-ready Firebase vector store with enterprise features."""
    
    def __init__(self):
        """Initialize store with dependency injection pattern."""
        self.firebase = FirebaseConnection()
        self.collection_name = settings.firebase_collection_name
        self.embedding_service = EmbeddingService()
        self.processor = DocumentProcessor()
        self.search_engine = VectorSearchEngine(self.embedding_service)
        
        logger.info(
            "firebase_vector_store_initialized",
            collection=self.collection_name,
            project_id=settings.firebase_project_id
        )
    
    async def add_document(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        document_id: Optional[str] = None
    ) -> str:
        """Add document with automatic embedding generation."""
        try:
            embedding = await self.embedding_service.embed_text(text)
            doc_data = self.processor.prepare_document_data(text, embedding, metadata)
            
            collection = self.firebase.get_collection(self.collection_name)
            
            if document_id:
                collection.document(document_id).set(doc_data)
            else:
                doc_ref = collection.add(doc_data)[1]
                document_id = doc_ref.id
            
            logger.info(
                "document_added",
                document_id=document_id,
                text_length=len(text),
                has_metadata=bool(metadata)
            )
            
            return document_id
            
        except Exception as e:
            logger.error("document_add_failed", error=str(e))
            raise DocumentOperationError(f"Failed to add document: {e}")
    
    async def search(
        self,
        query: str,
        top_k: Optional[int] = None,
        threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Execute semantic similarity search."""
        try:
            top_k = top_k or settings.max_search_results
            threshold = threshold or settings.similarity_threshold
            
            # Stream documents for memory efficiency
            collection = self.firebase.get_collection(self.collection_name)
            documents = [(doc.id, doc.to_dict()) for doc in collection.stream()]
            
            # Delegate to search engine
            results = await self.search_engine.execute_similarity_search(
                query, documents, top_k, threshold
            )
            
            return results
            
        except Exception as e:
            logger.error("search_failed", error=str(e), query=query[:100])
            raise DocumentOperationError(f"Search operation failed: {e}")
    
    async def update_document(
        self,
        document_id: str,
        text: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update document with optional re-embedding."""
        try:
            collection = self.firebase.get_collection(self.collection_name)
            doc_ref = collection.document(document_id)
            
            update_data = {"updated_at": datetime.utcnow()}
            
            if text is not None:
                embedding = await self.embedding_service.embed_text(text)
                update_data.update({"text": text, "embedding": embedding})
            
            if metadata is not None:
                update_data["metadata"] = metadata
            
            doc_ref.update(update_data)
            
            logger.info(
                "document_updated",
                document_id=document_id,
                text_updated=text is not None,
                metadata_updated=metadata is not None
            )
            
            return True
            
        except Exception as e:
            logger.error("document_update_failed", error=str(e), document_id=document_id)
            raise DocumentOperationError(f"Failed to update document {document_id}: {e}")
    
    async def delete_document(self, document_id: str) -> bool:
        """Remove document from store."""
        try:
            collection = self.firebase.get_collection(self.collection_name)
            collection.document(document_id).delete()
            
            logger.info("document_deleted", document_id=document_id)
            return True
            
        except Exception as e:
            logger.error("document_delete_failed", error=str(e), document_id=document_id)
            raise DocumentOperationError(f"Failed to delete document {document_id}: {e}")
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve document by ID with sanitized response."""
        try:
            collection = self.firebase.get_collection(self.collection_name)
            doc = collection.document(document_id).get()
            
            if doc.exists:
                doc_data = self.processor.sanitize_for_response(doc.to_dict())
                doc_data["id"] = doc.id
                return doc_data
            
            return None
            
        except Exception as e:
            logger.error("document_get_failed", error=str(e), document_id=document_id)
            raise DocumentOperationError(f"Failed to retrieve document {document_id}: {e}")
    
    async def list_documents(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """List documents with pagination and performance optimization."""
        try:
            collection = self.firebase.get_collection(self.collection_name)
            
            # Count query (consider caching this in production)
            total_count = len(list(collection.stream()))
            
            # Paginated query with ordering
            query = collection.order_by("created_at", direction="DESCENDING") \
                             .limit(limit) \
                             .offset(offset)
            
            documents = []
            for doc in query.stream():
                doc_data = self.processor.sanitize_for_response(doc.to_dict())
                doc_data["id"] = doc.id
                documents.append(doc_data)
            
            logger.info(
                "documents_listed",
                count=len(documents),
                total_count=total_count,
                limit=limit,
                offset=offset
            )
            
            return documents, total_count
            
        except Exception as e:
            logger.error("document_list_failed", error=str(e))
            raise DocumentOperationError(f"Failed to list documents: {e}")