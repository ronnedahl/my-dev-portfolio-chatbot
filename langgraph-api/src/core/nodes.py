"""LangGraph nodes for processing logic."""

from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import structlog
from src.services import FirebaseVectorStore
from src.config import settings
from .state import AgentState

logger = structlog.get_logger()


class Nodes:
    """Collection of nodes for the LangGraph agent."""
    
    def __init__(self):
        """Initialize nodes with required services."""
        self.llm = ChatOpenAI(
            openai_api_key=settings.openai_api_key,
            model="gpt-4o-mini",
            temperature=0.7
        )
        self.vector_store = FirebaseVectorStore()
    
    async def analyze_query(self, state: AgentState) -> Dict[str, Any]:
        """
        Analyze the user query to determine if retrieval is needed.
        
        This node examines the query and decides whether to search
        the knowledge base or answer directly.
        """
        try:
            query = state["query"]
            
            # System prompt for query analysis
            system_prompt = """You are analyzing queries for Peter's personal AI assistant.
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
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Query: {query}")
            ]
            
            response = await self.llm.ainvoke(messages)
            should_retrieve = response.content.strip().lower() == "yes"
            
            logger.info(
                "query_analyzed",
                query=query[:100],
                should_retrieve=should_retrieve
            )
            
            return {
                "should_retrieve": should_retrieve,
                "messages": state["messages"] + [
                    {"role": "system", "content": f"Query analysis: {'retrieve' if should_retrieve else 'direct answer'}"}
                ]
            }
            
        except Exception as e:
            logger.error("query_analysis_failed", error=str(e))
            return {"error": str(e)}
    
    async def retrieve_context(self, state: AgentState) -> Dict[str, Any]:
        """
        Retrieve relevant context from Firebase vector store.
        
        This node searches for relevant information based on the query.
        """
        try:
            query = state["query"]
            
            # Search for relevant documents
            results = await self.vector_store.search(
                query=query,
                top_k=settings.max_search_results,
                threshold=settings.similarity_threshold
            )
            
            logger.info(
                "context_retrieved",
                query=query[:100],
                results_count=len(results)
            )
            
            return {
                "retrieved_context": results,
                "retrieval_complete": True,
                "messages": state["messages"] + [
                    {
                        "role": "system",
                        "content": f"Retrieved {len(results)} relevant documents from knowledge base"
                    }
                ]
            }
            
        except Exception as e:
            logger.error("context_retrieval_failed", error=str(e))
            return {
                "error": str(e),
                "retrieval_complete": True,
                "retrieved_context": []
            }
    
    async def plan_response(self, state: AgentState) -> Dict[str, Any]:
        """
        Plan the response based on query and retrieved context.
        
        This node creates a structured plan for answering the user.
        """
        try:
            query = state["query"]
            context = state.get("retrieved_context", [])
            
            # Build context string
            context_str = ""
            if context:
                context_str = "\n\nRelevant information from knowledge base:\n"
                for i, doc in enumerate(context, 1):
                    context_str += f"\n{i}. {doc['text']} (relevance: {doc['similarity']:.2f})"
            
            # System prompt for response planning
            system_prompt = """You are an AI assistant helping to plan responses.
            Based on the user query and any retrieved context, create a brief plan
            for how to answer the user's question.
            
            The plan should:
            1. Identify the key points to address
            2. Note which information from the context is most relevant
            3. Suggest the tone and structure of the response
            4. Flag any missing information
            
            Keep the plan concise and actionable."""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Query: {query}{context_str}")
            ]
            
            response = await self.llm.ainvoke(messages)
            plan = response.content
            
            logger.info(
                "response_planned",
                query=query[:100],
                plan_length=len(plan)
            )
            
            return {
                "response_plan": plan,
                "messages": state["messages"] + [
                    {"role": "system", "content": f"Response plan created: {plan[:200]}..."}
                ]
            }
            
        except Exception as e:
            logger.error("response_planning_failed", error=str(e))
            return {"error": str(e)}
    
    async def generate_response(self, state: AgentState) -> Dict[str, Any]:
        """
        Generate the final response based on the plan.
        
        This node creates the actual response to send to the user.
        """
        try:
            query = state["query"]
            context = state.get("retrieved_context", [])
            plan = state.get("response_plan", "")
            
            # Build context for response generation
            context_str = ""
            if context:
                context_str = "\n\nRelevant information:\n"
                for doc in context:
                    context_str += f"- {doc['text']}\n"
                    if doc.get("metadata"):
                        for key, value in doc["metadata"].items():
                            context_str += f"  {key}: {value}\n"
            
            # System prompt for response generation
            system_prompt = """You ARE Peter speaking directly to visitors on your portfolio website.
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
            
            user_prompt = f"""Query: {query}
            
            {context_str}
            
            Response plan: {plan}
            
            Please provide a helpful response to the user's query."""
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            final_response = response.content
            
            logger.info(
                "response_generated",
                query=query[:100],
                response_length=len(final_response)
            )
            
            return {
                "final_response": final_response,
                "messages": state["messages"] + [
                    HumanMessage(content=query),
                    AIMessage(content=final_response)
                ]
            }
            
        except Exception as e:
            logger.error("response_generation_failed", error=str(e))
            return {
                "error": str(e),
                "final_response": "I apologize, but I encountered an error while generating a response. Please try again."
            }
    
    async def skip_retrieval(self, state: AgentState) -> Dict[str, Any]:
        """
        Skip retrieval for queries that don't need it.
        
        This node handles direct responses without searching the knowledge base.
        """
        return {
            "retrieval_complete": True,
            "retrieved_context": [],
            "messages": state["messages"] + [
                {"role": "system", "content": "Skipping retrieval - answering directly"}
            ]
        }