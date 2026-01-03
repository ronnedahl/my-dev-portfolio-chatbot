"""Query analysis service for determining retrieval requirements."""

from typing import Tuple
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import structlog

logger = structlog.get_logger()


class QueryAnalyzer:
    """Analyzes user queries to determine processing requirements."""
    
    RETRIEVAL_REQUIRED_PROMPT = """You analyze queries for Peter's CV/portfolio chatbot.

    Return "yes" for ANY question about:
    - Tech stack, programming languages, frameworks, tools
    - Skills, competencies, expertise
    - Work experience, career, jobs
    - Projects, portfolio, what Peter has built
    - Education, certifications, courses
    - Personal info (age, location, background)
    - Contact information
    - ANY question using "you", "your", "din", "ditt", "du"

    Return "no" ONLY for:
    - Pure greetings: "hej", "hello", "hi", "tack", "thanks"
    - Off-topic: politics, news, other people, general knowledge

    IMPORTANT: If the question contains words like "teknikstack", "skills", "erfarenhet",
    "projekt", "programmering", "språk", "ramverk" - ALWAYS return "yes".

    When in doubt, return "yes".

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