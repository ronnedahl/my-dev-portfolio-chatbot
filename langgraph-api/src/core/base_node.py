"""Base node class for LangGraph nodes."""

from typing import Dict, Any
from abc import ABC, abstractmethod
import structlog
from .state import AgentState

logger = structlog.get_logger()


class BaseNode(ABC):
    """Abstract base class for LangGraph nodes providing common functionality."""
    
    @abstractmethod
    async def process(self, state: AgentState) -> Dict[str, Any]:
        """Process the state and return updates."""
        pass
    
    def _add_system_message(
        self, 
        messages: list, 
        content: str
    ) -> list:
        """Add a system message to the message history."""
        return messages + [{"role": "system", "content": content}]
    
    def _handle_error(
        self, 
        error: Exception, 
        operation: str,
        fallback_response: str = None
    ) -> Dict[str, Any]:
        """
        Standard error handling for node operations.
        
        Args:
            error: The exception that occurred
            operation: Name of the operation that failed
            fallback_response: Optional fallback response
        
        Returns:
            State update with error information
        """
        logger.error(f"{operation}_failed", error=str(error))
        
        result = {"error": str(error)}
        if fallback_response:
            result["final_response"] = fallback_response
        
        return result