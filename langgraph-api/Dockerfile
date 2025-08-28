# Production Dockerfile för PeterBot API
FROM python:3.11-slim

# Sätt arbetskatalog
WORKDIR /app

# Installera systempaket
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Kopiera requirements först för bättre caching
COPY requirements-production.txt requirements.txt ./
RUN pip install --no-cache-dir -r requirements-production.txt

# Kopiera applikationskod
COPY src/ ./src/
COPY gunicorn.conf.py ./

# Skapa non-root användare för säkerhet
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Exponera port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Starta med Gunicorn
CMD ["gunicorn", "-c", "gunicorn.conf.py", "src.main:app"]