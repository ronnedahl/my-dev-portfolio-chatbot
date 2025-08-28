"""Chat endpoint for AI assistant interactions."""

from fastapi import APIRouter, HTTPException
import structlog
import asyncio
from src.models import ChatRequest, ChatResponse, ErrorResponse
from src.core.agent import run_agent
from src.utils.quick_responses import get_quick_response
from src.utils.cache import get_cached_response, cache_response
from src.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])
logger = structlog.get_logger()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat with the AI assistant.
    
    This endpoint processes user queries through the LangGraph agent,
    which may retrieve relevant context from the knowledge base.
    """
    try:
        logger.info(
            "chat_request_received",
            query=request.query[:100],
            conversation_id=request.conversation_id,
            user_id=request.user_id
        )
        
        # Check for quick response first (avoid LLM calls for simple queries)
        quick_response = get_quick_response(request.query)
        if quick_response:
            logger.info(
                "quick_response_used",
                query=request.query[:50],
                response_length=len(quick_response)
            )
            return ChatResponse(
                response=quick_response,
                conversation_id=request.conversation_id,
                retrieved_context=[]
            )
        
        # Check cache for previous responses
        cached_response = get_cached_response(request.query)
        if cached_response:
            logger.info(
                "cached_response_used",
                query=request.query[:50],
                response_length=len(cached_response)
            )
            return ChatResponse(
                response=cached_response,
                conversation_id=request.conversation_id,
                retrieved_context=[]
            )
        
        # Run the full agent for complex queries with timeout
        try:
            result = await asyncio.wait_for(
                run_agent(
                    query=request.query,
                    conversation_id=request.conversation_id,
                    user_id=request.user_id,
                    additional_context=request.additional_context
                ),
                timeout=settings.request_timeout
            )
        except asyncio.TimeoutError:
            logger.error(
                "chat_request_timeout",
                query=request.query[:50],
                timeout=settings.request_timeout
            )
            raise HTTPException(
                status_code=504,
                detail=f"Request timed out after {settings.request_timeout} seconds"
            )
        
        # Check for errors
        if result.get("error"):
            logger.error(
                "chat_agent_error",
                error=result["error"],
                query=request.query[:100]
            )
            raise HTTPException(
                status_code=500,
                detail=f"Agent error: {result['error']}"
            )
        
        # Create response
        response = ChatResponse(
            response=result["response"],
            conversation_id=result["conversation_id"],
            retrieved_context=[
                {
                    "id": doc["id"],
                    "text": doc["text"],
                    "similarity": doc["similarity"]
                }
                for doc in result.get("retrieved_context", [])
            ]
        )
        
        # Cache the response for future use (5 minutes TTL)
        if result["response"] and not result.get("error"):
            cache_response(request.query, result["response"], ttl=300)
        
        logger.info(
            "chat_response_sent",
            response_length=len(response.response),
            context_count=len(response.retrieved_context)
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("chat_endpoint_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Chat endpoint error: {str(e)}"
        )