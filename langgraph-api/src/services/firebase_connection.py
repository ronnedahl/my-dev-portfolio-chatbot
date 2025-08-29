"""Firebase connection management service."""

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as firestore_client
import structlog
from src.config import settings

logger = structlog.get_logger()


class FirebaseConnection:
    """Manages Firebase Admin SDK connection lifecycle."""
    
    _instance = None
    _db_client = None
    
    def __new__(cls):
        """Singleton pattern for connection management."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Firebase Admin SDK connection."""
        if not firebase_admin._apps:
            try:
                cred = credentials.Certificate(settings.get_firebase_credentials())
                firebase_admin.initialize_app(cred)
                logger.info(
                    "firebase_admin_initialized",
                    project_id=settings.firebase_project_id
                )
            except Exception as e:
                logger.error("firebase_initialization_failed", error=str(e))
                raise
        
        self._db_client = firestore.client()
    
    @property
    def db(self) -> firestore_client.Client:
        """Get Firestore client instance."""
        if self._db_client is None:
            self._initialize()
        return self._db_client
    
    def get_collection(self, collection_name: str):
        """Get a Firestore collection reference."""
        return self.db.collection(collection_name)