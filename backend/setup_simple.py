#!/usr/bin/env python3
"""Simple setup script using standard Python."""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def main():
    """Set up the development environment using standard Python."""
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    print("🚀 Setting up Peterbot LangGraph API with standard Python")
    
    # Check Python version
    if sys.version_info < (3, 11):
        print("❌ Python 3.11+ is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} found")
    
    # Create virtual environment
    venv_path = "venv"
    if not os.path.exists(venv_path):
        if not run_command(f"python -m venv {venv_path}", "Creating virtual environment"):
            sys.exit(1)
    
    # Determine activation script
    if os.name == 'nt':  # Windows
        activate_script = f"{venv_path}\\Scripts\\activate"
        python_exe = f"{venv_path}\\Scripts\\python.exe"
        pip_exe = f"{venv_path}\\Scripts\\pip.exe"
    else:  # Unix/Linux/Mac
        activate_script = f"{venv_path}/bin/activate"
        python_exe = f"{venv_path}/bin/python"
        pip_exe = f"{venv_path}/bin/pip"
    
    # Install dependencies
    if not run_command(f"{pip_exe} install -r requirements.txt", "Installing dependencies"):
        print("⚠️  Failed to install some dependencies, but continuing...")
    
    # Create .env file if it doesn't exist
    if not os.path.exists(".env"):
        print("📝 Creating .env file from template...")
        shutil.copy(".env.example", ".env")
        print("⚠️  Please edit .env file with your configuration")
    
    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Edit .env file with your Firebase and OpenAI credentials")
    
    if os.name == 'nt':
        print(f"2. Activate environment: {activate_script}")
        print(f"3. Run: {python_exe} scripts/dev.py")
    else:
        print(f"2. Activate environment: source {activate_script}")
        print(f"3. Run: {python_exe} scripts/dev.py")
    
    print("4. Visit: http://localhost:8000/docs")

if __name__ == "__main__":
    main()