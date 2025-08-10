"""Firebase vector store implementation for semantic search."""

from typing import List, Dict, Any, Optional, Tuple
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import FieldFilter
import numpy as np
from datetime import datetime
import structlog
from src.config import settings
from src.services.embeddings import EmbeddingService

logger = structlog.get_logger()


class FirebaseVectorStore:
    """Firebase-based vector store for storing and searching embeddings."""
    
    def __init__(self):
        """Initialize Firebase connection and services."""
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.get_firebase_credentials())
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        self.collection_name = settings.firebase_collection_name
        self.embedding_service = EmbeddingService()
        
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
        """
        Add a document with its embedding to the store.
        
        Args:
            text: Text content to store
            metadata: Optional metadata to associate with the document
            document_id: Optional specific document ID
            
        Returns:
            Document ID
        """
        try:
            # Generate embedding
            embedding = await self.embedding_service.embed_text(text)
            
            # Prepare document data
            doc_data = {
                "text": text,
                "embedding": embedding,
                "metadata": metadata or {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Add to Firestore
            if document_id:
                doc_ref = self.db.collection(self.collection_name).document(document_id)
                doc_ref.set(doc_data)
            else:
                doc_ref = self.db.collection(self.collection_name).add(doc_data)[1]
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
            raise
    
    async def search(
        self,
        query: str,
        top_k: Optional[int] = None,
        threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using semantic similarity.
        
        Args:
            query: Query text
            top_k: Number of results to return
            threshold: Minimum similarity threshold
            
        Returns:
            List of matching documents with similarity scores
        """
        try:
            # Use settings defaults if not provided
            top_k = top_k or settings.max_search_results
            threshold = threshold or settings.similarity_threshold
            
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_text(query)
            
            # Fetch all documents (Firebase doesn't support vector similarity natively)
            docs = self.db.collection(self.collection_name).stream()
            
            # Calculate similarities
            results = []
            for doc in docs:
                doc_data = doc.to_dict()
                
                # Try different embedding field names
                embedding_field = None
                if "embedding" in doc_data:
                    embedding_field = "embedding"
                elif "embeddings" in doc_data:
                    embedding_field = "embeddings"
                elif "vector" in doc_data:
                    embedding_field = "vector"
                
                if embedding_field and doc_data[embedding_field]:
                    similarity = self.embedding_service.calculate_similarity(
                        query_embedding,
                        doc_data[embedding_field]
                    )
                    
                    if similarity >= threshold:
                        # Try different text field names
                        text_content = (
                            doc_data.get("text") or 
                            doc_data.get("content") or 
                            doc_data.get("chunk") or 
                            doc_data.get("document") or
                            str(doc_data.get("data", ""))
                        )
                        
                        results.append({
                            "id": doc.id,
                            "text": text_content,
                            "metadata": doc_data.get("metadata", {}),
                            "similarity": similarity,
                            "created_at": doc_data.get("created_at"),
                            "updated_at": doc_data.get("updated_at")
                        })
            
            # Sort by similarity and return top k
            results.sort(key=lambda x: x["similarity"], reverse=True)
            results = results[:top_k]
            
            logger.info(
                "search_completed",
                query_length=len(query),
                results_count=len(results),
                top_similarity=results[0]["similarity"] if results else 0
            )
            
            # Debug logging - show what we found
            if results:
                logger.info("search_results_preview")
                for i, result in enumerate(results[:2]):  # Show top 2 results
                    logger.info(
                        f"result_{i+1}",
                        similarity=result["similarity"],
                        text_preview=result["text"][:150] + "..." if result["text"] else "NO TEXT FOUND"
                    )
            
            return results
            
        except Exception as e:
            logger.error("search_failed", error=str(e), query=query[:100])
            raise
    
    async def update_document(
        self,
        document_id: str,
        text: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update an existing document.
        
        Args:
            document_id: Document ID to update
            text: New text content (will regenerate embedding)
            metadata: New or updated metadata
            
        Returns:
            True if successful
        """
        try:
            doc_ref = self.db.collection(self.collection_name).document(document_id)
            
            update_data = {"updated_at": datetime.utcnow()}
            
            if text is not None:
                # Regenerate embedding for new text
                embedding = await self.embedding_service.embed_text(text)
                update_data["text"] = text
                update_data["embedding"] = embedding
            
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
            logger.error(
                "document_update_failed",
                error=str(e),
                document_id=document_id
            )
            raise
    
    async def delete_document(self, document_id: str) -> bool:
        """
        Delete a document from the store.
        
        Args:
            document_id: Document ID to delete
            
        Returns:
            True if successful
        """
        try:
            self.db.collection(self.collection_name).document(document_id).delete()
            logger.info("document_deleted", document_id=document_id)
            return True
            
        except Exception as e:
            logger.error(
                "document_delete_failed",
                error=str(e),
                document_id=document_id
            )
            raise
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific document by ID.
        
        Args:
            document_id: Document ID
            
        Returns:
            Document data or None if not found
        """
        try:
            doc = self.db.collection(self.collection_name).document(document_id).get()
            
            if doc.exists:
                doc_data = doc.to_dict()
                # Remove embedding from response (too large)
                doc_data.pop("embedding", None)
                doc_data["id"] = doc.id
                return doc_data
            
            return None
            
        except Exception as e:
            logger.error(
                "document_get_failed",
                error=str(e),
                document_id=document_id
            )
            raise
    
    async def list_documents(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        List documents with pagination.
        
        Args:
            limit: Maximum number of documents to return
            offset: Number of documents to skip
            
        Returns:
            Tuple of (documents, total_count)
        """
        try:
            # Get total count
            total_count = len(list(self.db.collection(self.collection_name).stream()))
            
            # Get paginated results
            query = self.db.collection(self.collection_name) \
                .order_by("created_at", direction=firestore.Query.DESCENDING) \
                .limit(limit) \
                .offset(offset)
            
            docs = []
            for doc in query.stream():
                doc_data = doc.to_dict()
                # Remove embedding from response
                doc_data.pop("embedding", None)
                doc_data["id"] = doc.id
                docs.append(doc_data)
            
            logger.info(
                "documents_listed",
                count=len(docs),
                total_count=total_count,
                limit=limit,
                offset=offset
            )
            
            return docs, total_count
            
        except Exception as e:
            logger.error("document_list_failed", error=str(e))
            raise