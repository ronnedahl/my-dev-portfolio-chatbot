#!/usr/bin/env python3
"""Development script for running the API locally."""

import os
import sys
import subprocess
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from src.main import run

if __name__ == "__main__":
    # Ensure we're in the right directory
    os.chdir(Path(__file__).parent.parent)
    
    # Load environment
    if not os.path.exists(".env"):
        print("⚠️  No .env file found. Please copy .env.example to .env and configure it.")
        sys.exit(1)
    
    print("🚀 Starting Peterbot LangGraph API in development mode...")
    print("📄 API docs available at: http://localhost:8000/docs")
    print("🔍 Health check at: http://localhost:8000/health")
    
    try:
        run()
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")