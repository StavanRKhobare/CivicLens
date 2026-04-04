"""
Machine Learning models for CivicLens
- Classification model (DistilBERT multi-task)
- Embedding model (SentenceTransformer for clustering)
"""

import torch
import torch.nn as nn
from transformers import DistilBertModel, AutoTokenizer
from sentence_transformers import SentenceTransformer
import joblib

from src.config import config
from src.logger import setup_logger

logger = setup_logger(__name__)


class MultiTaskDistilBERT(nn.Module):
    """
    Multi-task DistilBERT model for civic complaint classification
    Predicts: problem_type, urgency_level, sentiment
    """
    
    def __init__(self, num_problem_labels, num_urgency_labels, num_sentiment_labels):
        super().__init__()
        
        # Base DistilBERT
        self.bert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        
        hidden_size = 768  # DistilBERT output dimension
        
        # Classification heads
        self.prob_head = nn.Linear(hidden_size, num_problem_labels)
        self.urg_head = nn.Linear(hidden_size, num_urgency_labels)
        self.sent_head = nn.Linear(hidden_size, num_sentiment_labels)
    
    def forward(self, input_ids, attention_mask):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = output.last_hidden_state[:, 0]  # CLS token
        
        return {
            "problem": self.prob_head(cls),
            "urgency": self.urg_head(cls),
            "sentiment": self.sent_head(cls)
        }


def load_classification_model():
    """
    Load the classification model, tokenizer, and label encoder
    
    Returns:
        tuple: (model, tokenizer, label_encoder)
    """
    logger.info("Loading classification model...")
    
    try:
        # Load tokenizer and label encoder
        tokenizer = AutoTokenizer.from_pretrained(str(config.TOKENIZER_PATH))
        le_problem = joblib.load(config.LABEL_ENCODER_PATH)
        
        # Determine number of problem labels
        num_problem_labels = len(le_problem.classes_)
        
        # Initialize model
        model = MultiTaskDistilBERT(
            num_problem_labels=num_problem_labels,
            num_urgency_labels=config.NUM_URGENCY_LABELS,
            num_sentiment_labels=config.NUM_SENTIMENT_LABELS
        )
        
        # Load weights
        state = torch.load(config.MODEL_PATH, map_location="cpu")
        model.load_state_dict(state)
        model.eval()
        
        logger.info(f"✅ Classification model loaded successfully ({num_problem_labels} problem types)")
        return model, tokenizer, le_problem
        
    except Exception as e:
        logger.error(f"❌ Failed to load classification model: {e}")
        raise


def predict_problem_urgency_sentiment(text: str, model, tokenizer, le_problem) -> dict:
    """
    Predict problem type, urgency level, and sentiment for a complaint
    
    Args:
        text: Complaint text
        model: Loaded MultiTaskDistilBERT model
        tokenizer: Loaded tokenizer
        le_problem: Label encoder for problem types
    
    Returns:
        dict with keys: problem_type, urgency_level, sentiment
    """
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    problem_id = outputs["problem"].argmax(1).item()
    urgency = outputs["urgency"].argmax(1).item()
    sentiment = outputs["sentiment"].argmax(1).item()
    
    problem_label = le_problem.inverse_transform([problem_id])[0]
    
    return {
        "problem_type": problem_label,
        "urgency_level": urgency,
        "sentiment": sentiment
    }


def load_embedding_model():
    """
    Load SentenceTransformer model for text embeddings (used in clustering)
    
    Returns:
        SentenceTransformer model
    """
    logger.info("Loading embedding model for clustering...")
    
    try:
        embedder = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("✅ Embedding model loaded successfully")
        return embedder
    except Exception as e:
        logger.error(f"❌ Failed to load embedding model: {e}")
        raise
