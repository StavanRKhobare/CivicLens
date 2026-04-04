"""
Supabase database client wrapper
"""

from supabase import create_client
from src.config import config
from src.logger import setup_logger

logger = setup_logger(__name__)


class Database:
    """Wrapper for Supabase client operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        try:
            self.client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
            logger.info("✅ Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise
    
    def get_client(self):
        """Get the Supabase client instance"""
        return self.client


# Global database instance
db = Database()
supabase = db.get_client()
