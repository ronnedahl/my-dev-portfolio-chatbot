"""Application settings and configuration."""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    
    # Firebase Configuration
    firebase_project_id: str = Field(..., env="FIREBASE_PROJECT_ID")
    firebase_private_key_id: str = Field(..., env="FIREBASE_PRIVATE_KEY_ID")
    firebase_private_key: str = Field(..., env="FIREBASE_PRIVATE_KEY")
    firebase_client_email: str = Field(..., env="FIREBASE_CLIENT_EMAIL")
    firebase_client_id: str = Field(..., env="FIREBASE_CLIENT_ID")
    firebase_auth_uri: str = Field(
        default="https://accounts.google.com/o/oauth2/auth",
        env="FIREBASE_AUTH_URI"
    )
    firebase_token_uri: str = Field(
        default="https://oauth2.googleapis.com/token",
        env="FIREBASE_TOKEN_URI"
    )
    firebase_auth_provider_cert_url: str = Field(
        default="https://www.googleapis.com/oauth2/v1/certs",
        env="FIREBASE_AUTH_PROVIDER_CERT_URL"
    )
    firebase_client_cert_url: str = Field(..., env="FIREBASE_CLIENT_CERT_URL")
    firebase_collection_name: str = Field(
        default="openai_document_embeddings",
        env="FIREBASE_COLLECTION_NAME"
    )
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    api_env: str = Field(default="development", env="API_ENV")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Vector Store Configuration
    embedding_model: str = Field(
        default="text-embedding-3-small",
        env="EMBEDDING_MODEL"
    )
    vector_dimension: int = Field(default=1536, env="VECTOR_DIMENSION")
    similarity_threshold: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")
    max_search_results: int = Field(default=5, env="MAX_SEARCH_RESULTS")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def get_firebase_credentials(self) -> dict:
        """Get Firebase credentials as a dictionary."""
        # Handle private key newlines
        private_key = self.firebase_private_key.replace("\\n", "\n")
        
        return {
            "type": "service_account",
            "project_id": self.firebase_project_id,
            "private_key_id": self.firebase_private_key_id,
            "private_key": private_key,
            "client_email": self.firebase_client_email,
            "client_id": self.firebase_client_id,
            "auth_uri": self.firebase_auth_uri,
            "token_uri": self.firebase_token_uri,
            "auth_provider_x509_cert_url": self.firebase_auth_provider_cert_url,
            "client_x509_cert_url": self.firebase_client_cert_url
        }
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.api_env == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.api_env == "production"


# Create singleton instance
settings = Settings()