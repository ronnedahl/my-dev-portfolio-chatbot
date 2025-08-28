"""Admin endpoints for monitoring and cache management."""

from fastapi import APIRouter, Depends
import structlog
from src.utils.cache import get_cache_stats, clear_cache, cleanup_expired
from src.services.cached_vector_store import CachedVectorStore
from src.middleware.auth import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])
logger = structlog.get_logger()


@router.get("/cache/stats", dependencies=[Depends(require_admin)])
async def get_cache_statistics():
    """Get cache performance statistics."""
    try:
        stats = get_cache_stats()
        logger.info("cache_stats_requested", stats=stats)
        return {
            "cache_stats": stats,
            "status": "success"
        }
    except Exception as e:
        logger.error("cache_stats_error", error=str(e))
        return {"error": str(e), "status": "error"}


@router.post("/cache/clear", dependencies=[Depends(require_admin)])
async def clear_response_cache():
    """Clear all cached responses."""
    try:
        clear_cache()
        logger.info("cache_cleared_via_admin")
        return {
            "message": "Cache cleared successfully",
            "status": "success"
        }
    except Exception as e:
        logger.error("cache_clear_error", error=str(e))
        return {"error": str(e), "status": "error"}


@router.post("/cache/cleanup", dependencies=[Depends(require_admin)])
async def cleanup_expired_cache():
    """Remove expired cache entries."""
    try:
        removed_count = cleanup_expired()
        logger.info("cache_cleanup_via_admin", removed_count=removed_count)
        return {
            "message": f"Removed {removed_count} expired entries",
            "removed_count": removed_count,
            "status": "success"
        }
    except Exception as e:
        logger.error("cache_cleanup_error", error=str(e))
        return {"error": str(e), "status": "error"}


@router.get("/vector-cache/info", dependencies=[Depends(require_admin)])
async def get_vector_cache_info():
    """Get vector store cache information."""
    try:
        # Create a temporary instance to check cache info
        vector_store = CachedVectorStore()
        cache_info = vector_store.get_cache_info()
        logger.info("vector_cache_info_requested", cache_info=cache_info)
        return {
            "vector_cache_info": cache_info,
            "status": "success"
        }
    except Exception as e:
        logger.error("vector_cache_info_error", error=str(e))
        return {"error": str(e), "status": "error"}