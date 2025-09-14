#!/usr/bin/env python3
"""Setup script for development environment."""

import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return None

def main():
    """Set up the development environment."""
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    print("🚀 Setting up Peterbot LangGraph API development environment")
    
    # Check if uv is installed
    if not run_command("uv --version", "Checking uv installation"):
        print("❌ uv is not installed. Please install it first:")
        print("   curl -LsSf https://astral.sh/uv/install.sh | sh")
        sys.exit(1)
    
    # Create virtual environment
    run_command("uv venv", "Creating virtual environment")
    
    # Install dependencies
    run_command("uv sync", "Installing dependencies")
    
    # Create .env file if it doesn't exist
    if not os.path.exists(".env"):
        print("📝 Creating .env file from template...")
        import shutil
        shutil.copy(".env.example", ".env")
        print("⚠️  Please edit .env file with your configuration")
    
    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Edit .env file with your Firebase and OpenAI credentials")
    print("2. Run: uv run python scripts/dev.py")
    print("3. Visit: http://localhost:8000/docs")

if __name__ == "__main__":
    main()