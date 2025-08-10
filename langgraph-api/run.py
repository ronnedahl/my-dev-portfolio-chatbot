#!/usr/bin/env python3
"""Simple run script with proper Python path setup."""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Load environment
from dotenv import load_dotenv
load_dotenv()

# Check .env file
if not os.path.exists(".env"):
    print("⚠️  No .env file found. Please copy .env.example to .env and configure it.")
    sys.exit(1)

print("🚀 Starting Peterbot LangGraph API...")
print("📄 API docs available at: http://localhost:8000/docs")
print("🔍 Health check at: http://localhost:8000/health")

try:
    import uvicorn
    from src.main import app
    from src.config import settings
    
    uvicorn.run(
        app,
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development,
        log_config=None
    )
except KeyboardInterrupt:
    print("\n👋 Shutting down...")
except Exception as e:
    print(f"❌ Error starting server: {e}")
    print("\nTry installing dependencies:")
    print("- With uv: uv sync")
    print("- With pip: pip install -r requirements.txt")