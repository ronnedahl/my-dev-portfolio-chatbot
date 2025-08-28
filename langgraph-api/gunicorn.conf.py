"""Gunicorn production configuration."""

import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('API_PORT', 8000)}"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
preload_app = True

# Timeouts
timeout = 30
keepalive = 2
graceful_timeout = 30

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info").lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(M)s ms'

# Process naming
proc_name = "peterbot-api"

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Restart workers
max_worker_memory = 500 * 1024 * 1024  # 500MB
worker_tmp_dir = "/dev/shm"  # Use memory for tmp files