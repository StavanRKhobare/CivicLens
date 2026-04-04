"""
Logging setup for CivicLens workers
Provides dual logging to console and file with proper formatting
"""

import logging
import sys
from pathlib import Path
from datetime import datetime


def setup_logger(name: str, log_file: str = None, level: str = "INFO") -> logging.Logger:
    """
    Create a logger with both console and file handlers
    
    Args:
        name: Logger name (typically module name)
        log_file: Optional log file path (relative to logs directory)
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    
    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Prevent duplicate handlers if logger already configured
    if logger.handlers:
        return logger
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if log_file specified)
    if log_file:
        from src.config import config
        log_path = config.LOG_DIR / log_file
        
        file_handler = logging.FileHandler(log_path, mode='a', encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)  # File gets all levels
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


def get_worker_logger(worker_name: str, level: str = "INFO") -> logging.Logger:
    """
    Convenience function to create a worker-specific logger
    
    Args:
        worker_name: Name of the worker (e.g., 'classification', 'summary')
        level: Logging level
    
    Returns:
        Configured logger for the worker
    """
    log_file = f"{worker_name}_worker.log"
    return setup_logger(worker_name, log_file, level)
