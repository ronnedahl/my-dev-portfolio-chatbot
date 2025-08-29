"""LangGraph node implementations for agent workflow orchestration."""

from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
import structlog

from src.services.cached_vector_store import CachedVectorStore
from src.services.query_analyzer import QueryAnalyzer
from src.services.response_generator import ResponseGenerator
from src.config import settings
from .state import AgentState
from .base_node import BaseNode

logger = structlog.get_logger()


class AnalysisNode(BaseNode):
    """Analyzes incoming queries to determine processing requirements."""
    
    def __init__(self, llm: ChatOpenAI):
        self.analyzer = QueryAnalyzer(llm)
    
    async def process(self, state: AgentState) -> Dict[str, Any]:
        """Analyze query and determine if retrieval is needed."""
        try:
            should_retrieve, reason = await self.analyzer.requires_retrieval(state["query"])
            
            return {
                "should_retrieve": should_retrieve,
                "messages": self._add_system_message(
                    state["messages"], 
                    f"Query analysis: {reason}"
                )
            }
        except Exception as e:
            return self._handle_error(e, "query_analysis")


class RetrievalNode(BaseNode):
    """Handles context retrieval from the vector store."""
    
    def __init__(self, vector_store: CachedVectorStore):
        self.vector_store = vector_store
    
    async def process(self, state: AgentState) -> Dict[str, Any]:
        """Retrieve relevant context from vector store."""
        try:
            results = await self.vector_store.search(
                query=state["query"],
                top_k=settings.max_search_results,
                threshold=settings.similarity_threshold
            )
            
            logger.info(
                "context_retrieved",
                query=state["query"][:100],
                results_count=len(results)
            )
            
            return {
                "retrieved_context": results,
                "retrieval_complete": True,
                "messages": self._add_system_message(
                    state["messages"],
                    f"Retrieved {len(results)} relevant documents from knowledge base"
                )
            }
        except Exception as e:
            return {
                **self._handle_error(e, "context_retrieval"),
                "retrieval_complete": True,
                "retrieved_context": []
            }


class ResponseNode(BaseNode):
    """Generates AI responses using retrieved context."""
    
    def __init__(self, llm: ChatOpenAI):
        self.generator = ResponseGenerator(llm)
    
    async def process(self, state: AgentState) -> Dict[str, Any]:
        """Generate response based on query and context."""
        try:
            response = await self.generator.generate(
                query=state["query"],
                context=state.get("retrieved_context", []),
                plan=state.get("response_plan")
            )
            
            return {
                "final_response": response,
                "messages": state["messages"] + [
                    HumanMessage(content=state["query"]),
                    AIMessage(content=response)
                ]
            }
        except Exception as e:
            return self._handle_error(
                e, 
                "response_generation",
                "I apologize, but I encountered an error. Please try again."
            )


class DirectResponseNode(BaseNode):
    """Handles queries that don't require retrieval."""
    
    async def process(self, state: AgentState) -> Dict[str, Any]:
        """Skip retrieval and prepare for direct response."""
        return {
            "retrieval_complete": True,
            "retrieved_context": [],
            "messages": self._add_system_message(
                state["messages"],
                "Skipping retrieval - answering directly"
            )
        }


class Nodes:
    """Node orchestrator providing backward compatibility and workflow management."""
    
    def __init__(self):
        """Initialize all node instances with shared dependencies."""
        # Shared LLM instance with optimized settings
        self.llm = ChatOpenAI(
            openai_api_key=settings.openai_api_key,
            model="gpt-4o-mini",
            temperature=0.7,
            timeout=settings.llm_timeout,
            max_retries=2
        )
        
        # Shared vector store with caching
        self.vector_store = CachedVectorStore(cache_ttl=300)
        
        # Initialize node instances
        self._analysis_node = AnalysisNode(self.llm)
        self._retrieval_node = RetrievalNode(self.vector_store)
        self._response_node = ResponseNode(self.llm)
        self._direct_node = DirectResponseNode()
    
    async def analyze_query(self, state: AgentState) -> Dict[str, Any]:
        """Delegate to AnalysisNode for backward compatibility."""
        return await self._analysis_node.process(state)
    
    async def retrieve_context(self, state: AgentState) -> Dict[str, Any]:
        """Delegate to RetrievalNode for backward compatibility."""
        return await self._retrieval_node.process(state)
    
    async def plan_and_generate_response(self, state: AgentState) -> Dict[str, Any]:
        """Combined planning and generation for optimized performance."""
        return await self._response_node.process(state)
    
    async def generate_response(self, state: AgentState) -> Dict[str, Any]:
        """Delegate to ResponseNode for backward compatibility."""
        return await self._response_node.process(state)
    
    async def skip_retrieval(self, state: AgentState) -> Dict[str, Any]:
        """Delegate to DirectResponseNode for backward compatibility."""
        return await self._direct_node.process(state)