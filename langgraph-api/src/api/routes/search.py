"""Search endpoint for semantic search in the knowledge base."""

from fastapi import APIRouter, HTTPException
import structlog
from src.models import SearchRequest, SearchResponse, SearchResult
from src.services import FirebaseVectorStore

router = APIRouter(prefix="/search", tags=["search"])
logger = structlog.get_logger()


@router.post("/", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """
    Search the knowledge base using semantic similarity.
    
    This endpoint performs vector similarity search to find
    relevant documents based on the query.
    """
    try:
        logger.info(
            "search_request_received",
            query=request.query[:100],
            top_k=request.top_k,
            threshold=request.threshold
        )
        
        vector_store = FirebaseVectorStore()
        
        # Perform search
        results = await vector_store.search(
            query=request.query,
            top_k=request.top_k,
            threshold=request.threshold
        )
        
        # Convert to response model
        search_results = [
            SearchResult(
                id=result["id"],
                text=result["text"],
                similarity=result["similarity"],
                metadata=result.get("metadata", {}),
                created_at=result.get("created_at")
            )
            for result in results
        ]
        
        response = SearchResponse(
            results=search_results,
            query=request.query,
            total_results=len(search_results)
        )
        
        logger.info(
            "search_completed",
            results_count=len(search_results),
            top_similarity=search_results[0].similarity if search_results else 0
        )
        
        return response
        
    except Exception as e:
        logger.error("search_endpoint_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Search error: {str(e)}"
        )