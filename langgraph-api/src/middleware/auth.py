"""Authentication middleware and utilities."""

from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import structlog
from typing import Optional, Dict, Any
from src.config import settings

logger = structlog.get_logger()

# HTTP Bearer authentication
security = HTTPBearer(auto_error=False)


class FirebaseAuth:
    """Firebase authentication handler."""
    
    @staticmethod
    async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
        """Verify Firebase auth token."""
        if not credentials:
            raise HTTPException(
                status_code=401,
                detail="Authorization header required",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        try:
            # Verify the token with Firebase
            decoded_token = auth.verify_id_token(credentials.credentials)
            
            logger.info(
                "auth_token_verified",
                user_id=decoded_token.get("uid"),
                email=decoded_token.get("email")
            )
            
            return decoded_token
            
        except auth.InvalidIdTokenError:
            logger.warning("invalid_auth_token")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except auth.ExpiredIdTokenError:
            logger.warning("expired_auth_token")
            raise HTTPException(
                status_code=401,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except Exception as e:
            logger.error("auth_verification_error", error=str(e))
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
    
    @staticmethod
    async def verify_optional_token(
        credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
    ) -> Optional[Dict[str, Any]]:
        """Verify Firebase auth token if present (optional auth)."""
        if not credentials:
            return None
        
        try:
            return await FirebaseAuth.verify_token(credentials)
        except HTTPException:
            # Return None for optional auth instead of raising
            return None
    
    @staticmethod
    async def get_current_user(token_data: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
        """Get current authenticated user."""
        return {
            "uid": token_data.get("uid"),
            "email": token_data.get("email"),
            "email_verified": token_data.get("email_verified", False),
            "name": token_data.get("name"),
            "picture": token_data.get("picture")
        }
    
    @staticmethod
    async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        """Require admin role for access."""
        # Check if user has admin custom claim
        if not current_user.get("admin", False):
            # For now, check against configured admin emails
            admin_emails = settings.admin_emails if hasattr(settings, 'admin_emails') else []
            if current_user.get("email") not in admin_emails:
                logger.warning(
                    "admin_access_denied",
                    user_id=current_user.get("uid"),
                    email=current_user.get("email")
                )
                raise HTTPException(
                    status_code=403,
                    detail="Admin access required"
                )
        
        return current_user


# Dependency shortcuts
verify_token = FirebaseAuth.verify_token
verify_optional_token = FirebaseAuth.verify_optional_token
get_current_user = FirebaseAuth.get_current_user
require_admin = FirebaseAuth.require_admin


# API Key authentication (alternative to Firebase)
class APIKeyAuth:
    """API Key authentication for service-to-service communication."""
    
    @staticmethod
    async def verify_api_key(api_key: str = Security(HTTPBearer())) -> bool:
        """Verify API key."""
        if not hasattr(settings, 'api_keys') or not settings.api_keys:
            # API key auth not configured
            return False
        
        # Check if provided key is valid
        if api_key.credentials in settings.api_keys:
            logger.info("api_key_authenticated")
            return True
        
        logger.warning("invalid_api_key")
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )