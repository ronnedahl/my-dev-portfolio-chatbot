"""Security middleware for FastAPI application."""

from fastapi import FastAPI, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict
from typing import Dict, Tuple
import structlog

logger = structlog.get_logger()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers (Helmet-like for FastAPI)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS (HTTP Strict Transport Security)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Remove server header
        response.headers.pop("server", None)
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent abuse."""
    
    def __init__(self, app, calls_per_minute: int = 60, calls_per_hour: int = 1000):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.calls_per_hour = calls_per_hour
        self.minute_requests: Dict[str, list] = defaultdict(list)
        self.hour_requests: Dict[str, list] = defaultdict(list)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request."""
        # Check for reverse proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _is_rate_limited(self, client_ip: str) -> Tuple[bool, str]:
        """Check if client is rate limited."""
        current_time = time.time()
        
        # Clean old entries and check minute limit
        minute_cutoff = current_time - 60
        self.minute_requests[client_ip] = [
            timestamp for timestamp in self.minute_requests[client_ip]
            if timestamp > minute_cutoff
        ]
        
        if len(self.minute_requests[client_ip]) >= self.calls_per_minute:
            return True, f"Rate limit exceeded: {self.calls_per_minute} requests per minute"
        
        # Clean old entries and check hour limit
        hour_cutoff = current_time - 3600
        self.hour_requests[client_ip] = [
            timestamp for timestamp in self.hour_requests[client_ip]
            if timestamp > hour_cutoff
        ]
        
        if len(self.hour_requests[client_ip]) >= self.calls_per_hour:
            return True, f"Rate limit exceeded: {self.calls_per_hour} requests per hour"
        
        return False, ""
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        client_ip = self._get_client_ip(request)
        is_limited, message = self._is_rate_limited(client_ip)
        
        if is_limited:
            logger.warning(
                "rate_limit_exceeded",
                client_ip=client_ip,
                path=request.url.path,
                message=message
            )
            
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "detail": message
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(self.calls_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time() + 60))
                }
            )
        
        # Record request
        current_time = time.time()
        self.minute_requests[client_ip].append(current_time)
        self.hour_requests[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        remaining_minute = max(0, self.calls_per_minute - len(self.minute_requests[client_ip]))
        response.headers["X-RateLimit-Limit"] = str(self.calls_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining_minute)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + 60))
        
        return response


def setup_security_middleware(app: FastAPI):
    """Setup all security middleware for the application."""
    
    # Add trusted host middleware (prevent host header attacks)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "peterbot.dev",
            "www.peterbot.dev",
            "api.peterbot.dev",
            "*.peterbot.dev"
        ]
    )
    
    # Add security headers
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Add rate limiting
    app.add_middleware(
        RateLimitMiddleware,
        calls_per_minute=60,  # 60 requests per minute
        calls_per_hour=1000   # 1000 requests per hour
    )
    
    logger.info("Security middleware configured")


# Import for JSONResponse
from fastapi.responses import JSONResponse