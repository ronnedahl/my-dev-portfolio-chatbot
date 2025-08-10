"""LangGraph agent implementation."""

from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import structlog
from .state import AgentState
from .nodes import Nodes

logger = structlog.get_logger()


def should_retrieve(state: AgentState) -> str:
    """Determine if retrieval is needed based on analysis."""
    if state.get("should_retrieve", False):
        return "retrieve"
    return "skip"


def create_agent_graph():
    """
    Create the LangGraph agent with all nodes and edges.
    
    The graph flow:
    1. Analyze query to determine if retrieval is needed
    2. Either retrieve context or skip to planning
    3. Plan the response based on available information
    4. Generate the final response
    """
    # Initialize nodes
    nodes = Nodes()
    
    # Create the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("analyze_query", nodes.analyze_query)
    workflow.add_node("retrieve_context", nodes.retrieve_context)
    workflow.add_node("skip_retrieval", nodes.skip_retrieval)
    workflow.add_node("plan_response", nodes.plan_response)
    workflow.add_node("generate_response", nodes.generate_response)
    
    # Define edges
    workflow.set_entry_point("analyze_query")
    
    # Conditional edge based on analysis
    workflow.add_conditional_edges(
        "analyze_query",
        should_retrieve,
        {
            "retrieve": "retrieve_context",
            "skip": "skip_retrieval"
        }
    )
    
    # Both paths lead to planning
    workflow.add_edge("retrieve_context", "plan_response")
    workflow.add_edge("skip_retrieval", "plan_response")
    
    # Planning leads to response generation
    workflow.add_edge("plan_response", "generate_response")
    
    # End after generating response
    workflow.add_edge("generate_response", END)
    
    # Add memory for conversation persistence
    memory = MemorySaver()
    
    # Compile the graph
    app = workflow.compile(checkpointer=memory)
    
    logger.info("agent_graph_created", nodes_count=5)
    
    return app


async def run_agent(
    query: str,
    conversation_id: str = "default",
    user_id: str = "anonymous",
    additional_context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Run the agent with a query.
    
    Args:
        query: User query
        conversation_id: Conversation thread ID
        user_id: User identifier
        additional_context: Any additional context
        
    Returns:
        Agent response with final answer and metadata
    """
    try:
        # Create the agent
        app = create_agent_graph()
        
        # Initialize state
        initial_state = {
            "messages": [],
            "query": query,
            "retrieved_context": [],
            "should_retrieve": False,
            "retrieval_complete": False,
            "response_plan": None,
            "final_response": None,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "error": None,
            "additional_context": additional_context or {}
        }
        
        # Run the agent
        config = {"configurable": {"thread_id": conversation_id}}
        result = await app.ainvoke(initial_state, config)
        
        logger.info(
            "agent_run_completed",
            query=query[:100],
            conversation_id=conversation_id,
            retrieved_docs=len(result.get("retrieved_context", [])),
            has_error=bool(result.get("error"))
        )
        
        return {
            "response": result.get("final_response", ""),
            "retrieved_context": result.get("retrieved_context", []),
            "conversation_id": conversation_id,
            "error": result.get("error"),
            "messages": result.get("messages", [])
        }
        
    except Exception as e:
        logger.error(
            "agent_run_failed",
            error=str(e),
            query=query[:100],
            conversation_id=conversation_id
        )
        return {
            "response": "I apologize, but I encountered an error processing your request.",
            "error": str(e),
            "conversation_id": conversation_id
        }