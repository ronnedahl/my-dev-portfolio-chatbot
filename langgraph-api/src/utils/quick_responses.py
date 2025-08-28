"""Quick response handler for simple queries to avoid unnecessary LLM calls."""

import re
from typing import Optional, Dict, Any
import structlog

logger = structlog.get_logger()

# Simple greeting patterns
GREETING_PATTERNS = [
    r'^(hej|hello|hi|hallå|tjena|tja|yo)\.?!?$',
    r'^(hej|hello|hi)\s+(där|peter|du)\.?!?$',
    r'^(god\s+morgon|godmorgon|gm)\.?!?$',
    r'^(god\s+kväll|godkväll|gk)\.?!?$',
    r'^(god\s+dag|goddag)\.?!?$',
    r'^(bra\s+dag|ha\s+en\s+bra\s+dag)\.?!?$'
]

# Simple question patterns that need quick answers
QUICK_PATTERNS = {
    r'^(vad\s+heter\s+du|what.+name)': {
        'sv': "Hej! Jag heter Peter och jag är 51 år gammal. Vad vill du veta om mig?",
        'en': "Hi! My name is Peter and I'm 51 years old. What would you like to know about me?"
    },
    r'^(hur\s+mår\s+du|how\s+are\s+you)': {
        'sv': "Tack för att du frågar! Jag mår bra och är redo att berätta om mig själv. Vad är du nyfiken på?",
        'en': "Thanks for asking! I'm doing well and ready to tell you about myself. What are you curious about?"
    },
    r'^(vem\s+är\s+du|who\s+are\s+you)': {
        'sv': "Jag är Peter, en 51-årig webbutvecklare med passion för AI och teknik. Vad vill du veta mer om?",
        'en': "I'm Peter, a 51-year-old web developer with a passion for AI and technology. What would you like to know more about?"
    }
}

# Standard greeting responses
GREETING_RESPONSES = {
    'sv': [
        "Hej där! Jag är Peter. Vad vill du veta om mig? 😊",
        "Hallå! Trevligt att träffas! Jag heter Peter. Vad är du nyfiken på?",
        "Hej! Jag är Peter, 51 år och passionerad webbutvecklare. Vad kan jag berätta för dig?"
    ],
    'en': [
        "Hello there! I'm Peter. What would you like to know about me? 😊",
        "Hi! Nice to meet you! My name is Peter. What are you curious about?",
        "Hello! I'm Peter, 51 years old and passionate web developer. What can I tell you?"
    ]
}

def detect_language(text: str) -> str:
    """Detect if text is Swedish or English."""
    swedish_words = ['är', 'och', 'det', 'en', 'du', 'jag', 'vad', 'hur', 'vem', 'hej', 'där']
    english_words = ['are', 'and', 'the', 'you', 'what', 'how', 'who', 'hello', 'hi']
    
    text_lower = text.lower()
    swedish_count = sum(1 for word in swedish_words if word in text_lower)
    english_count = sum(1 for word in english_words if word in text_lower)
    
    return 'sv' if swedish_count > english_count else 'en'

def get_quick_response(query: str) -> Optional[str]:
    """
    Check if query can be answered quickly without LLM calls.
    
    Args:
        query: User query
        
    Returns:
        Quick response if applicable, None otherwise
    """
    query_clean = query.lower().strip()
    language = detect_language(query)
    
    logger.info("checking_quick_response", query=query[:50], language=language)
    
    # Check for simple greetings
    for pattern in GREETING_PATTERNS:
        if re.match(pattern, query_clean, re.IGNORECASE):
            import random
            response = random.choice(GREETING_RESPONSES[language])
            logger.info("quick_greeting_response", pattern=pattern, language=language)
            return response
    
    # Check for quick question patterns
    for pattern, responses in QUICK_PATTERNS.items():
        if re.search(pattern, query_clean, re.IGNORECASE):
            logger.info("quick_pattern_response", pattern=pattern, language=language)
            return responses.get(language, responses['en'])
    
    return None

def should_use_quick_response(query: str) -> bool:
    """
    Determine if query should use quick response path.
    
    Args:
        query: User query
        
    Returns:
        True if quick response should be used
    """
    return get_quick_response(query) is not None