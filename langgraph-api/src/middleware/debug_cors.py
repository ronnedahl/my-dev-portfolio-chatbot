"""Debug middleware for CORS issues."""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

logger = structlog.get_logger()


class CORSDebugMiddleware(BaseHTTPMiddleware):
    """Debug CORS requests to understand what's happening."""
    
    async def dispatch(self, request: Request, call_next):
        # Log all request details for debugging
        logger.info(
            "cors_debug_request",
            method=request.method,
            path=request.url.path,
            headers=dict(request.headers),
            origin=request.headers.get("origin"),
            host=request.headers.get("host")
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response details
        logger.info(
            "cors_debug_response", 
            status_code=response.status_code,
            response_headers=dict(response.headers)
        )
        
        return response