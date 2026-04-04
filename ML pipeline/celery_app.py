import os
from celery import Celery
from src.config import config

# Initialize Celery app
# Upstash Redis URLs often use rediss:// for TLS, which Celery supports natively
celery_app = Celery(
    "civiclens_tasks",
    broker=config.REDIS_URL,
    backend=config.REDIS_URL,
    include=["tasks.pipeline"]
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # A retry policy in case Redis connections drop
    broker_connection_retry_on_startup=True
)

if __name__ == '__main__':
    celery_app.start()
