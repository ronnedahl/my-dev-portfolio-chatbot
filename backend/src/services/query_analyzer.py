"""Query analysis service for determining retrieval requirements."""

from typing import Tuple
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import structlog

logger = structlog.get_logger()


class QueryAnalyzer:
    """Analyzes user queries to determine processing requirements."""
    
    RETRIEVAL_REQUIRED_PROMPT = """You are analyzing queries for Peter's personal AI assistant.
    Users will ask questions directly to Peter using "you", "your", etc.
    
    Return "yes" if the query is about:
    - Personal details (age, location, background, family) - e.g. "How old are you?", "Where do you live?"
    - Skills, experience, or work history - e.g. "What's your experience?", "What do you do?"
    - Education, projects, achievements - e.g. "What did you study?", "Your projects?"
    - CV or resume information - e.g. "Your qualifications?"
    - Contact information - e.g. "How can I contact you?"
    - Any specific facts, preferences, or characteristics
    - Questions using "you", "your", "yours" referring to personal information
    - Questions mentioning Peter by name or "him"
    
    Return "no" ONLY if the query is:
    - General knowledge questions not about personal information
    - Pure greetings like "hello" or "hi"
    - Questions about how the AI system works
    - Requests for general help not related to personal information
    
    When in doubt, return "yes" - it's better to search than miss information.
    
    Only respond with "yes" or "no"."""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    async def requires_retrieval(self, query: str) -> Tuple[bool, str]:
        """
        Determine if a query requires retrieval from the knowledge base.
        
        Returns:
            Tuple of (should_retrieve, analysis_reason)
        """
        try:
            messages = [
                SystemMessage(content=self.RETRIEVAL_REQUIRED_PROMPT),
                HumanMessage(content=f"Query: {query}")
            ]
            
            response = await self.llm.ainvoke(messages)
            should_retrieve = response.content.strip().lower() == "yes"
            
            analysis_reason = "retrieve" if should_retrieve else "direct answer"
            
            logger.info(
                "query_analyzed",
                query=query[:100],
                should_retrieve=should_retrieve,
                reason=analysis_reason
            )
            
            return should_retrieve, analysis_reason
            
        except Exception as e:
            logger.error("query_analysis_failed", error=str(e))
           
            return True, "analysis_error"