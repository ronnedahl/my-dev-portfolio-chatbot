# Production Dockerfile för PeterBot API
FROM python:3.11-slim

# Sätt arbetskatalog
WORKDIR /app

# Installera systempaket
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Installera UV för snabbare pakethantering
RUN pip install uv

# Kopiera alla projektfiler först (för UV)
COPY . .

# Installera dependencies med UV som root
RUN uv sync

# Skapa non-root användare för säkerhet
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && mkdir -p /home/appuser/.cache \
    && chown -R appuser:appuser /app /home/appuser/.cache

# Växla till appuser
USER appuser

# Exponera port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Starta med UV och Gunicorn
CMD ["uv", "run", "gunicorn", "-c", "gunicorn.conf.py", "src.main:app"]