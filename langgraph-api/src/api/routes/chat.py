"""Chat endpoint for AI assistant interactions."""

from fastapi import APIRouter, HTTPException
import structlog
from src.models import ChatRequest, ChatResponse, ErrorResponse
from src.core.agent import run_agent

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
        
        # Run the agent
        result = await run_agent(
            query=request.query,
            conversation_id=request.conversation_id,
            user_id=request.user_id,
            additional_context=request.additional_context
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