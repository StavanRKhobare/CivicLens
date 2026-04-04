#!/bin/bash
# Start FastAPI in background
uvicorn fastapi_app:app --host 0.0.0.0 --port ${PORT:-8000} &

# Start Celery worker in foreground
celery -A celery_app worker --loglevel=info
