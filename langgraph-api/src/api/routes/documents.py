"""Document management endpoints."""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Tuple
import structlog
from src.models import DocumentRequest, DocumentResponse, ErrorResponse
from src.services import FirebaseVectorStore

router = APIRouter(prefix="/documents", tags=["documents"])
logger = structlog.get_logger()


@router.post("/", response_model=DocumentResponse)
async def create_document(request: DocumentRequest) -> DocumentResponse:
    """
    Add a new document to the knowledge base.
    
    This will create embeddings and store the document in Firebase.
    """
    try:
        vector_store = FirebaseVectorStore()
        
        document_id = await vector_store.add_document(
            text=request.text,
            metadata=request.metadata,
            document_id=request.document_id
        )
        
        logger.info(
            "document_created",
            document_id=document_id,
            text_length=len(request.text),
            has_metadata=bool(request.metadata)
        )
        
        return DocumentResponse(
            document_id=document_id,
            success=True,
            message="Document created successfully"
        )
        
    except Exception as e:
        logger.error("document_create_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create document: {str(e)}"
        )


@router.get("/{document_id}")
async def get_document(document_id: str):
    """Get a specific document by ID."""
    try:
        vector_store = FirebaseVectorStore()
        document = await vector_store.get_document(document_id)
        
        if not document:
            raise HTTPException(
                status_code=404,
                detail=f"Document {document_id} not found"
            )
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("document_get_error", error=str(e), document_id=document_id)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get document: {str(e)}"
        )


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    request: DocumentRequest
) -> DocumentResponse:
    """Update an existing document."""
    try:
        vector_store = FirebaseVectorStore()
        
        success = await vector_store.update_document(
            document_id=document_id,
            text=request.text,
            metadata=request.metadata
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Document {document_id} not found"
            )
        
        logger.info("document_updated", document_id=document_id)
        
        return DocumentResponse(
            document_id=document_id,
            success=True,
            message="Document updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("document_update_error", error=str(e), document_id=document_id)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update document: {str(e)}"
        )


@router.delete("/{document_id}", response_model=DocumentResponse)
async def delete_document(document_id: str) -> DocumentResponse:
    """Delete a document from the knowledge base."""
    try:
        vector_store = FirebaseVectorStore()
        
        success = await vector_store.delete_document(document_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Document {document_id} not found"
            )
        
        logger.info("document_deleted", document_id=document_id)
        
        return DocumentResponse(
            document_id=document_id,
            success=True,
            message="Document deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("document_delete_error", error=str(e), document_id=document_id)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.get("/")
async def list_documents(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """List documents with pagination."""
    try:
        vector_store = FirebaseVectorStore()
        
        documents, total_count = await vector_store.list_documents(
            limit=limit,
            offset=offset
        )
        
        return {
            "documents": documents,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error("document_list_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list documents: {str(e)}"
        )