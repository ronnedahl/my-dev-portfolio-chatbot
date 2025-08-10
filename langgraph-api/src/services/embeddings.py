"""Embedding service for text vectorization."""

from typing import List, Union
import numpy as np
from langchain_openai import OpenAIEmbeddings
from src.config import settings
import structlog

logger = structlog.get_logger()


class EmbeddingService:
    """Service for creating text embeddings using OpenAI."""
    
    def __init__(self):
        """Initialize the embedding service."""
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=settings.openai_api_key,
            model=settings.embedding_model
        )
        logger.info(
            "embedding_service_initialized",
            model=settings.embedding_model,
            dimension=settings.vector_dimension
        )
    
    async def embed_text(self, text: str) -> List[float]:
        """
        Create embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats representing the embedding
        """
        try:
            embedding = await self.embeddings.aembed_query(text)
            logger.debug("text_embedded", text_length=len(text))
            return embedding
        except Exception as e:
            logger.error("embedding_failed", error=str(e), text=text[:100])
            raise
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embeddings
        """
        try:
            embeddings = await self.embeddings.aembed_documents(texts)
            logger.debug("texts_embedded", count=len(texts))
            return embeddings
        except Exception as e:
            logger.error("batch_embedding_failed", error=str(e), count=len(texts))
            raise
    
    def calculate_similarity(
        self,
        embedding1: Union[List[float], np.ndarray],
        embedding2: Union[List[float], np.ndarray]
    ) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Similarity score between 0 and 1
        """
        # Convert to numpy arrays if needed
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Calculate cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        
        # Ensure the result is between 0 and 1
        return float(max(0, min(1, similarity)))