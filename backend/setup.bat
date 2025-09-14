@echo off
echo 🚀 Setting up Peterbot LangGraph API development environment

REM Check if uv is installed
uv --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ uv is not installed. Please install it first:
    echo    Visit: https://docs.astral.sh/uv/getting-started/installation/
    pause
    exit /b 1
)

echo ✅ uv found

REM Create virtual environment
echo 🔄 Creating virtual environment...
uv venv

REM Install dependencies
echo 🔄 Installing dependencies...
uv sync

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy ".env.example" ".env"
    echo ⚠️  Please edit .env file with your configuration
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your Firebase and OpenAI credentials
echo 2. Run: uv run python scripts/dev.py
echo 3. Visit: http://localhost:8000/docs
echo.
pause