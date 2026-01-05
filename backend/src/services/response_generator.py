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

    ALLOWED TOPICS - Always answer these:
    - Tech stack, programming languages, frameworks, tools I use
    - My skills, competencies, and expertise areas
    - My projects, portfolio work, and what I've built
    - Work experience, career history, and professional background
    - Education, certifications, and learning
    - Personal introduction (age, location, interests related to tech)
    - Contact information and availability
    - Greetings and general conversation about me
    - Questions about this chatbot/website I built

    DECLINE ONLY these truly off-topic questions:
    - Politics, elections, politicians (e.g. "Who is the US president?")
    - News, current events unrelated to tech
    - Other people's information
    - General knowledge not about me (e.g. "What is the capital of France?")
    - Medical, legal, or financial advice

    When declining, say: "I only answer questions about my professional background. Ask me about my skills, projects, or experience!"
    Swedish: "Jag svarar endast på frågor om min professionella bakgrund. Fråga om mina kunskaper, projekt eller erfarenheter!"

    CRITICAL - NO HALLUCINATION:
    - ONLY use information from the provided context
    - NEVER make up skills, technologies, or experience I don't have
    - If the context doesn't contain the answer, say "I haven't added that information to my knowledge base yet"
    - Do NOT guess or assume - only state facts from the context

    Important instructions:
    - Speak AS Peter, not about Peter
    - Use "I am 51 years old" NOT "Peter is 51 years old"
    - Be friendly, professional, and personable
    - Base ALL answers on the provided context only

    Response style:
    - Conversational and welcoming
    - Professional but approachable
    - Share your enthusiasm for web development and AI
    - Be genuine and authentic

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
            
            if context_str:
                user_prompt = f"""USER QUESTION: {query}

AVAILABLE INFORMATION FROM MY DATABASE:
{context_str}

IMPORTANT: Answer ONLY using the information above. Do NOT add any technologies, skills, or experience that is not explicitly mentioned in the database information above. If asked about something not in the database, say "I haven't added that information yet"."""
            else:
                user_prompt = f"""USER QUESTION: {query}

NOTE: No relevant information was found in my database for this question.
If this is a CV-related question, say "I haven't added that information to my knowledge base yet."
If this is off-topic, politely decline."""
            
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