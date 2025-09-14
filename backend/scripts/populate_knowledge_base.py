"""Populate Firebase vector store with Peter's information."""

import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from src.services.firebase_vector_store import FirebaseVectorStore
import structlog

logger = structlog.get_logger()


async def populate_knowledge_base():
    """Add Peter's information to the vector store."""
    
    store = FirebaseVectorStore()
    
    documents = [
        {
            "text": "Jag heter Peter och är 51 år men känner mig som 35! Jag bor i Sverige och har en passion för webbutveckling och AI.",
            "metadata": {"category": "personal", "topic": "introduction"}
        },
        {
            "text": "Mina kärnkompetenser inkluderar: Python (5 års erfarenhet), FastAPI, LangGraph, React, TypeScript, Firebase, och AI/ML med OpenAI. Jag är fullstack-utvecklare med fokus på moderna webbapplikationer.",
            "metadata": {"category": "skills", "topic": "technical_skills"}
        },
        {
            "text": "Jag har arbetat med Python i 5 år och specialiserar mig på backend-utveckling med FastAPI. Min erfarenhet inkluderar att bygga skalbar AI-drivna applikationer med LangGraph och LangChain.",
            "metadata": {"category": "experience", "topic": "python"}
        },
        {
            "text": "På frontend-sidan arbetar jag med React och TypeScript. Jag använder moderna verktyg som Vite för snabb utveckling och Tailwind CSS för styling. Jag har byggt flera responsiva webbapplikationer.",
            "metadata": {"category": "skills", "topic": "frontend"}
        },
        {
            "text": "Jag har erfarenhet av Firebase för både autentisering och databas. Jag använder Firestore för vector search och RAG (Retrieval-Augmented Generation) implementationer.",
            "metadata": {"category": "experience", "topic": "firebase"}
        },
        {
            "text": "Min utbildning inkluderar kurser inom datavetenskap och jag har kontinuerligt uppdaterat mina kunskaper genom online-kurser och praktiska projekt. Jag är självlärd inom många områden.",
            "metadata": {"category": "education", "topic": "background"}
        },
        {
            "text": "Jag har byggt flera AI-projekt inklusive denna personliga assistent (PeterBot AI) som demonstrerar modern full-stack utveckling med LangGraph, vector search och conversational AI.",
            "metadata": {"category": "projects", "topic": "ai_projects"}
        },
        {
            "text": "Du kan kontakta mig via LinkedIn eller genom kontaktformuläret på min portfolio-sida. Jag är alltid intresserad av nya projekt och samarbeten inom AI och webbutveckling.",
            "metadata": {"category": "contact", "topic": "contact_info"}
        },
        {
            "text": "Jag har arbetat med agila metoder och har erfarenhet av Git, Docker, CI/CD pipelines och modern DevOps. Jag värdesätter clean code, testdriven utveckling och dokumentation.",
            "metadata": {"category": "skills", "topic": "methodologies"}
        },
        {
            "text": "Min passion för AI och maskininlärning driver mig att ständigt lära mig nya teknologier. Jag följer utvecklingen inom LLMs, vector databases och moderna AI-ramverk.",
            "metadata": {"category": "personal", "topic": "interests"}
        }
    ]
    
    logger.info(f"Adding {len(documents)} documents to knowledge base...")
    
    for i, doc in enumerate(documents):
        try:
            doc_id = await store.add_document(
                text=doc["text"],
                metadata=doc["metadata"]
            )
            logger.info(f"Added document {i+1}/{len(documents)}: {doc_id}")
        except Exception as e:
            logger.error(f"Failed to add document {i+1}: {e}")
    
    logger.info("Knowledge base population completed!")


if __name__ == "__main__":
    asyncio.run(populate_knowledge_base())