"""Response generation service for creating personalized AI responses."""

from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import structlog

logger = structlog.get_logger()


class ResponseGenerator:
    """Generates personalized responses as Peter."""
    
    SYSTEM_PROMPT = """You ARE Peter speaking directly to visitors on your portfolio website.
    Answer questions about yourself in FIRST PERSON using "I", "my", "me".
    
    Important instructions:
    - Speak AS Peter, not about Peter
    - Use "I am 51 years old" NOT "Peter is 51 years old"
    - Use "my experience" NOT "Peter's experience"
    - Be friendly, professional, and personable
    - Use the context provided to give accurate information about yourself
    - If you don't have specific information, say "I haven't included that information"
    
    Response style:
    - Conversational and welcoming
    - Professional but approachable
    - Share your enthusiasm for web development and AI
    - Be genuine and authentic
    
    Example responses:
    - "I'm 51 years old but feel like I'm 35!"
    - "I have 5 years of experience with Python"
    - "My passion is web development and AI"
    
    Language: Respond in the same language as the question (Swedish or English)"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """Format retrieved context into a readable string."""
        if not context:
            return ""
        
        formatted = "\n\nRelevant information:\n"
        for doc in context:
            formatted += f"- {doc['text']}\n"
            if doc.get("metadata"):
                for key, value in doc["metadata"].items():
                    formatted += f"  {key}: {value}\n"
        
        return formatted
    
    async def generate(
        self, 
        query: str, 
        context: List[Dict[str, Any]] = None,
        plan: str = None
    ) -> str:
        """
        Generate a personalized response based on query and context.
        
        Args:
            query: User's query
            context: Retrieved context documents
            plan: Response plan (optional)
        
        Returns:
            Generated response string
        """
        try:
            context_str = self._format_context(context or [])
            
            user_prompt = f"Query: {query}{context_str}"
            if plan:
                user_prompt += f"\n\nResponse plan: {plan}"
            user_prompt += "\n\nPlease provide a helpful response to the user's query."
            
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            logger.info(
                "response_generated",
                query=query[:100],
                context_count=len(context or []),
                response_length=len(response.content)
            )
            
            return response.content
            
        except Exception as e:
            logger.error("response_generation_failed", error=str(e))
            return "I apologize, but I encountered an error while generating a response. Please try again."