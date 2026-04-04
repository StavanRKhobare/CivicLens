"""
Configuration management for CivicLens
Loads environment variables and defines project paths
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Configuration class for CivicLens application"""
    
    def __init__(self):
        # Project root directory
        self.PROJECT_ROOT = Path(__file__).parent.parent.resolve()
        
        # API Keys
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        # Optional now, used only if other methods fail or for testing
        
        # Redis Configuration
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        # FastAPI Configuration
        self.FASTAPI_PORT = int(os.getenv("FASTAPI_PORT", "8000"))
        
        # Supabase Configuration
        self.SUPABASE_URL = os.getenv("SUPABASE_URL")
        self.SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        if not self.SUPABASE_URL or not self.SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        # Model paths
        self.MODEL_DIR = self.PROJECT_ROOT / "civiclens_model"
        self.MODEL_PATH = self.MODEL_DIR / "multitask_distilbert.pt"
        self.TOKENIZER_PATH = self.MODEL_DIR / "tokenizer_distilbert"
        self.LABEL_ENCODER_PATH = self.MODEL_DIR / "le_problem.pkl"
        
        # Data paths
        self.ADDRESS_DATA_DIR = self.PROJECT_ROOT / "address_data"
        self.KML_PATH = self.ADDRESS_DATA_DIR / "bbmp_ward_data.kml"
        
        # Log configuration
        self.LOG_DIR = self.PROJECT_ROOT / "logs"
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        
        # Ensure directories exist
        self.LOG_DIR.mkdir(exist_ok=True)
        
        # Model parameters
        self.NUM_URGENCY_LABELS = 6  # 0-5
        self.NUM_SENTIMENT_LABELS = 6  # 0-5
        
        # Validate critical paths
        self._validate_paths()
    
    def _validate_paths(self):
        """Validate that critical files and directories exist"""
        if not self.MODEL_DIR.exists():
            raise FileNotFoundError(f"Model directory not found: {self.MODEL_DIR}")
        
        if not self.MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {self.MODEL_PATH}")
        
        if not self.TOKENIZER_PATH.exists():
            raise FileNotFoundError(f"Tokenizer directory not found: {self.TOKENIZER_PATH}")
        
        if not self.LABEL_ENCODER_PATH.exists():
            raise FileNotFoundError(f"Label encoder not found: {self.LABEL_ENCODER_PATH}")
        
        if not self.ADDRESS_DATA_DIR.exists():
            raise FileNotFoundError(f"Address data directory not found: {self.ADDRESS_DATA_DIR}")
        
        if not self.KML_PATH.exists():
            raise FileNotFoundError(f"KML ward data not found: {self.KML_PATH}")


# Global configuration instance
config = Config()
