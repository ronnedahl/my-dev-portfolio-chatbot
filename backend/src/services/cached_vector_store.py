"""Cached vector store for improved performance."""

import asyncio
import time
from typing import List, Dict, Any, Optional
import structlog
from src.services.firebase_vector_store import FirebaseVectorStore
from src.services.embeddings import EmbeddingService

logger = structlog.get_logger()


class CachedVectorStore:
    """Vector store with local caching for improved search performance."""
    
    def __init__(self, cache_ttl: int = 300):  # 5 minutes cache
        self.firebase_store = FirebaseVectorStore()
        self.embedding_service = EmbeddingService()
        self.cache_ttl = cache_ttl
        self.documents_cache = None
        self.cache_timestamp = 0
        self.cache_lock = asyncio.Lock()
        
    async def _refresh_cache(self) -> None:
        """Refresh the document cache from Firebase."""
        try:
            logger.info("refreshing_document_cache")
            
            # Access the collection through the firebase connection
            collection = self.firebase_store.firebase.get_collection(self.firebase_store.collection_name)
            docs = collection.stream()
            
            cached_docs = []
            for doc in docs:
                doc_data = doc.to_dict()
                
                # Use the document processor for consistency
                embedding = self.firebase_store.processor.extract_embedding(doc_data)
                
                if embedding:
                    text_content = self.firebase_store.processor.extract_text_content(doc_data)
                    
                    cached_docs.append({
                        "id": doc.id,
                        "text": text_content,
                        "embedding": embedding,
                        "metadata": doc_data.get("metadata", {}),
                        "created_at": doc_data.get("created_at"),
                        "updated_at": doc_data.get("updated_at")
                    })
            
            self.documents_cache = cached_docs
            self.cache_timestamp = time.time()
            
            logger.info(
                "document_cache_refreshed", 
                document_count=len(cached_docs),
                cache_timestamp=self.cache_timestamp
            )
            
        except Exception as e:
            logger.error("cache_refresh_failed", error=str(e))
            # Ensure cache is initialized even on failure
            if self.documents_cache is None:
                self.documents_cache = []
    
    async def _ensure_cache_fresh(self) -> None:
        """Ensure cache is fresh, refresh if needed."""
        current_time = time.time()
        
        if (self.documents_cache is None or 
            current_time - self.cache_timestamp > self.cache_ttl):
            
            async with self.cache_lock:
               
                if (self.documents_cache is None or 
                    current_time - self.cache_timestamp > self.cache_ttl):
                    await self._refresh_cache()
    
    async def search(
        self,
        query: str,
        top_k: Optional[int] = None,
        threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using cached data.
        
        Args:
            query: Query text
            top_k: Number of results to return
            threshold: Minimum similarity threshold
            
        Returns:
            List of matching documents with similarity scores
        """
        try:
            start_time = time.time()
            
            # Use settings defaults if not provided
            from src.config import settings
            top_k = top_k or settings.max_search_results
            threshold = threshold or settings.similarity_threshold
            
            # Ensure cache is fresh
            await self._ensure_cache_fresh()
            
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_text(query)
            
            # Search through cached documents
            results = []
            for doc in self.documents_cache:
                similarity = self.embedding_service.calculate_similarity(
                    query_embedding,
                    doc["embedding"]
                )
                
                if similarity >= threshold:
                    results.append({
                        "id": doc["id"],
                        "text": doc["text"],
                        "metadata": doc["metadata"],
                        "similarity": similarity,
                        "created_at": doc.get("created_at"),
                        "updated_at": doc.get("updated_at")
                    })
            
            results.sort(key=lambda x: x["similarity"], reverse=True)
            results = results[:top_k]
            
            search_time = time.time() - start_time
            
            logger.info(
                "cached_search_completed",
                query_length=len(query),
                results_count=len(results),
                search_time_ms=int(search_time * 1000),
                top_similarity=results[0]["similarity"] if results else 0,
                cache_doc_count=len(self.documents_cache)
            )
            
            return results
            
        except Exception as e:
            logger.error("cached_search_failed", error=str(e), query=query[:100])
            
            logger.info("falling_back_to_firebase_search")
            return await self.firebase_store.search(query, top_k, threshold)
    
    async def add_document(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        document_id: Optional[str] = None
    ) -> str:
        """Add document and invalidate cache."""
        result = await self.firebase_store.add_document(text, metadata, document_id)
       
        self.cache_timestamp = 0
        logger.info("document_added_cache_invalidated", document_id=result)
        return result
    
    async def update_document(
        self,
        document_id: str,
        text: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update document and invalidate cache."""
        result = await self.firebase_store.update_document(document_id, text, metadata)
       
        self.cache_timestamp = 0
        logger.info("document_updated_cache_invalidated", document_id=document_id)
        return result
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete document and invalidate cache."""
        result = await self.firebase_store.delete_document(document_id)
      
        self.cache_timestamp = 0
        logger.info("document_deleted_cache_invalidated", document_id=document_id)
        return result
    
    def get_cache_info(self) -> Dict[str, Any]:
        """Get cache information for monitoring."""
        return {
            "cached_documents": len(self.documents_cache) if self.documents_cache else 0,
            "cache_age_seconds": int(time.time() - self.cache_timestamp),
            "cache_ttl_seconds": self.cache_ttl,
            "cache_fresh": time.time() - self.cache_timestamp < self.cache_ttl
        }