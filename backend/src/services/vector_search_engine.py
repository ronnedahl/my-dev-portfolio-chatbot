"""Vector search engine for semantic similarity operations."""

from typing import List, Dict, Any
import structlog
from src.services.embeddings import EmbeddingService
from src.services.document_processor import DocumentProcessor

logger = structlog.get_logger()


class VectorSearchEngine:
    """High-performance vector similarity search engine."""
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        self.processor = DocumentProcessor()
    
    async def execute_similarity_search(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int,
        threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Execute semantic similarity search against document collection.
        
        Args:
            query: Search query text
            documents: Collection of documents with embeddings
            top_k: Maximum results to return
            threshold: Minimum similarity threshold
        
        Returns:
            Ranked list of similar documents with scores
        """
        try:
          
            query_embedding = await self.embedding_service.embed_text(query)
            
            results = []
            processed_count = 0
            
            for doc_id, doc_data in documents:
                processed_count += 1
                
                doc_embedding = self.processor.extract_embedding(doc_data)
                
                if doc_embedding:
                    similarity = self.embedding_service.calculate_similarity(
                        query_embedding, doc_embedding
                    )
                    
                    if similarity >= threshold:
                        result = self.processor.format_search_result(
                            doc_id, doc_data, similarity
                        )
                        results.append(result)
            
            results.sort(key=lambda x: x["similarity"], reverse=True)
            results = results[:top_k]
            
            self._log_search_metrics(query, results, processed_count)
            
            return results
            
        except Exception as e:
            logger.error("similarity_search_failed", error=str(e), query=query[:100])
            raise
    
    def _log_search_metrics(
        self, 
        query: str, 
        results: List[Dict[str, Any]], 
        processed_count: int
    ):
        """Log search performance metrics."""
        logger.info(
            "search_completed",
            query_length=len(query),
            documents_processed=processed_count,
            results_count=len(results),
            top_similarity=results[0]["similarity"] if results else 0
        )
        
        if results:
            logger.debug("search_results_preview")
            for i, result in enumerate(results[:2]):
                logger.debug(
                    f"result_{i+1}",
                    similarity=result["similarity"],
                    text_preview=result["text"][:150] + "..." if result["text"] else "NO TEXT"
                )