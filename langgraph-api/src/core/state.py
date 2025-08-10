"""LangGraph state definitions."""

from typing import List, Dict, Any, Optional, Annotated
from typing_extensions import TypedDict
from langgraph.graph import add_messages


class AgentState(TypedDict):
    """State for the LangGraph agent."""
    
    # Core conversation state
    messages: Annotated[List[Dict[str, Any]], add_messages]
    
    # Current user query
    query: str
    
    # Retrieved context from Firebase
    retrieved_context: List[Dict[str, Any]]
    
    # Processing flags
    should_retrieve: bool
    retrieval_complete: bool
    
    # Response planning
    response_plan: Optional[str]
    
    # Final response
    final_response: Optional[str]
    
    # Metadata
    conversation_id: Optional[str]
    user_id: Optional[str]
    
    # Error handling
    error: Optional[str]
    
    # Additional context
    additional_context: Dict[str, Any]