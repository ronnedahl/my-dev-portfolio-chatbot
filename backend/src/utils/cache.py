"""Simple in-memory cache for common queries and responses."""

import hashlib
import time
from typing import Optional, Dict, Any
from dataclasses import dataclass
import structlog

logger = structlog.get_logger()

@dataclass
class CacheEntry:
    """Cache entry with expiration."""
    value: str
    timestamp: float
    ttl: int  # Time to live in seconds
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired."""
        return time.time() - self.timestamp > self.ttl

class SimpleCache:
    """Simple in-memory cache for responses."""
    
    def __init__(self, default_ttl: int = 300):  
        self.cache: Dict[str, CacheEntry] = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, query: str) -> str:
        """Generate cache key from query."""
        return hashlib.md5(query.lower().strip().encode()).hexdigest()
    
    def get(self, query: str) -> Optional[str]:
        """Get cached response for query."""
        key = self._generate_key(query)
        entry = self.cache.get(key)
        
        if entry is None:
            self.misses += 1
            logger.debug("cache_miss", query=query[:50], key=key[:8])
            return None
        
        if entry.is_expired():
            del self.cache[key]
            self.misses += 1
            logger.debug("cache_expired", query=query[:50], key=key[:8])
            return None
        
        self.hits += 1
        logger.info("cache_hit", query=query[:50], key=key[:8])
        return entry.value
    
    def set(self, query: str, response: str, ttl: Optional[int] = None) -> None:
        """Cache response for query."""
        key = self._generate_key(query)
        ttl = ttl or self.default_ttl
        
        self.cache[key] = CacheEntry(
            value=response,
            timestamp=time.time(),
            ttl=ttl
        )
        
        logger.info(
            "cache_set",
            query=query[:50],
            key=key[:8],
            ttl=ttl,
            cache_size=len(self.cache)
        )
    
    def clear_expired(self) -> int:
        """Clear expired entries and return count removed."""
        expired_keys = [
            key for key, entry in self.cache.items() 
            if entry.is_expired()
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        if expired_keys:
            logger.info("cache_cleanup", removed_count=len(expired_keys))
        
        return len(expired_keys)
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "cache_size": len(self.cache)
        }
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
        logger.info("cache_cleared")

# Global cache instance
_response_cache = SimpleCache(default_ttl=300) 

def get_cached_response(query: str) -> Optional[str]:
    """Get cached response for query."""
    return _response_cache.get(query)

def cache_response(query: str, response: str, ttl: int = 300) -> None:
    """Cache response for query."""
    _response_cache.set(query, response, ttl)

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics."""
    return _response_cache.stats()

def clear_cache() -> None:
    """Clear all cached responses."""
    _response_cache.clear()

def cleanup_expired() -> int:
    """Clean up expired cache entries."""
    return _response_cache.clear_expired()