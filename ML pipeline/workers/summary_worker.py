#!/usr/bin/env python3
"""
CivicLens Summary Worker
Continuously processes complaints for clustering and summarization
Runs every 60 seconds
"""

import sys
import time
import json
import pickle
from pathlib import Path
import numpy as np

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import hdbscan
from sklearn.feature_extraction.text import TfidfVectorizer

try:
    import nltk
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer

from src.config import config
from src.logger import get_worker_logger
from src.database import supabase
from src.models import load_embedding_model

# Initialize logger
logger = get_worker_logger("summary", config.LOG_LEVEL)

# Ensure clusterer storage dir exists
clusterer_dir = config.MODEL_DIR / "clusterers"
clusterer_dir.mkdir(exist_ok=True, parents=True)


def extract_keywords(texts, top_n=3):
    """Extract top TF-IDF keywords from a list of texts"""
    if not texts:
        return []
    try:
        if len(texts) == 1:
            words = [w for w in texts[0].split() if len(w) > 3]
            return list(set(words))[:top_n]
            
        vectorizer = TfidfVectorizer(stop_words='english', max_features=15)
        tfidf_matrix = vectorizer.fit_transform(texts)
        feature_names = vectorizer.get_feature_names_out()
        
        sum_tfidf = tfidf_matrix.sum(axis=0).A1
        indices = sum_tfidf.argsort()[::-1][:top_n]
        return [feature_names[idx] for idx in indices]
    except Exception as e:
        logger.debug(f"Keyword extraction error: {e}")
        return []


def generate_template_summary(texts, problem_type, ward_name) -> str:
    """Generate deterministic summary using template + TextRank"""
    count = len(texts)
    
    keywords = extract_keywords(texts)
    keyword_str = ", ".join(keywords) if keywords else "general issues"
    
    rep_sentence = ""
    try:
        combined_text = " ".join(texts)
        parser = PlaintextParser.from_string(combined_text, Tokenizer("english"))
        summarizer = TextRankSummarizer()
        summary = summarizer(parser.document, 1)
        if summary:
            rep_sentence = str(summary[0])
    except Exception as e:
        logger.debug(f"Sumy error: {e}")
        rep_sentence = texts[0][:100] + "..." if texts else ""
        
    final_summary = f"{count} reports of {problem_type} in {ward_name}. Key issues: {keyword_str}.\nRepresentative complaint: \"{rep_sentence}\""
    return final_summary


def load_clusterer(ward_no, problem_type):
    fn = clusterer_dir / f"clusterer_{ward_no}_{problem_type.replace(' ', '_')}.pkl"
    if fn.exists():
        with open(fn, 'rb') as f:
            return pickle.load(f)
    return None


def save_clusterer(clusterer, ward_no, problem_type):
    fn = clusterer_dir / f"clusterer_{ward_no}_{problem_type.replace(' ', '_')}.pkl"
    with open(fn, 'wb') as f:
        pickle.dump(clusterer, f)


def load_label_map(ward_no, problem_type):
    fn = clusterer_dir / f"map_{ward_no}_{problem_type.replace(' ', '_')}.json"
    if fn.exists():
        with open(fn, "r") as f:
            return json.load(f)
    return {}


def save_label_map(label_map, ward_no, problem_type):
    fn = clusterer_dir / f"map_{ward_no}_{problem_type.replace(' ', '_')}.json"
    with open(fn, "w") as f:
        json.dump(label_map, f)


def summary_worker(poll_interval=60):
    """
    Main summary worker loop using HDBSCAN approximate_predict for incremental updates
    """
    logger.info("=" * 80)
    logger.info("🧠 CivicLens Summary Worker Started (HDBSCAN Incremental)")
    logger.info(f"📍 Project Root: {config.PROJECT_ROOT}")
    logger.info(f"⏱️  Poll Interval: {poll_interval} seconds")
    logger.info("=" * 80)
    
    logger.info("Loading embedding model...")
    embedder = load_embedding_model()
    logger.info("✅ Embedding model loaded successfully")
    
    while True:
        try:
            # Fetch unsummarized complaints
            response = (
                supabase
                .table("ComplaintTable")
                .select("id, raw_text, ward_no, ward_name, problem_type")
                .is_("summarization_status", None)
                .neq("ward_no", -1)
                .execute()
            )
            
            complaints = response.data
            
            if not complaints:
                logger.info("⏳ No complaints to summarize. Sleeping...")
                time.sleep(poll_interval)
                continue
            
            logger.info(f"🔎 Found {len(complaints)} complaints to summarize")
            
            groups = {}
            for c in complaints:
                key = (c["ward_no"], c["problem_type"])
                groups.setdefault(key, []).append(c)
            
            for (ward_no, problem_type), group in groups.items():
                logger.info(f"\n📍 Processing Ward {ward_no} | {problem_type}")
                logger.info(f"   {len(group)} complaints in group")
                
                texts = [c["raw_text"] for c in group]
                ids = [c["id"] for c in group]
                
                embeddings = embedder.encode(texts)
                
                clusterer = load_clusterer(ward_no, problem_type)
                label_map = load_label_map(ward_no, problem_type)
                
                if clusterer is None:
                    # Initial fit
                    if len(embeddings) >= 2:
                        logger.debug("   Fitting new HDBSCAN model with prediction_data=True")
                        clusterer = hdbscan.HDBSCAN(min_cluster_size=2, prediction_data=True)
                        labels = clusterer.fit_predict(embeddings)
                        save_clusterer(clusterer, ward_no, problem_type)
                    else:
                        labels = [-1] * len(embeddings)
                else:
                    # Incremental via approximate_predict
                    logger.debug("   Matching to existing clusters using approximate_predict")
                    labels, strengths = hdbscan.approximate_predict(clusterer, embeddings)
                    # Filter out weak predictions into noise cluster
                    labels = [l if s > 0.4 else -1 for l, s in zip(labels, strengths)]
                
                cluster_groups = {}
                for cid, text, label in zip(ids, texts, labels):
                    cluster_groups.setdefault(label, []).append((cid, text))
                    
                for label, items in cluster_groups.items():
                    complaint_ids = [item[0] for item in items]
                    cluster_texts = [item[1] for item in items]
                    
                    # Exact match to existing cluster
                    if label != -1 and str(label) in label_map:
                        summary_id = label_map[str(label)]
                        logger.info(f"   ➡️  Adding {len(complaint_ids)} points to existing summary {summary_id}")
                        
                        # Mark complaints as summarized
                        supabase.table("ComplaintTable").update({
                            "summary_id": summary_id,
                            "summarization_status": 1
                        }).in_("id", complaint_ids).execute()
                        
                        # Increment summary complaint_count
                        res = supabase.table("SummaryTable").select("complaint_count").eq("summaryId", summary_id).single().execute()
                        if res.data:
                            new_count = res.data["complaint_count"] + len(complaint_ids)
                            supabase.table("SummaryTable").update({"complaint_count": new_count}).eq("summaryId", summary_id).execute()
                            
                    else:
                        # New cluster (or noise)
                        rep_texts = cluster_texts[:5]
                        summary_text = generate_template_summary(rep_texts, problem_type, group[0]["ward_name"])
                        
                        logger.info(f"   🧾 Creating NEW summary (label={label}, {len(complaint_ids)} complaints)")
                        
                        summary_insert = supabase.table("SummaryTable").insert({
                            "summary": summary_text,
                            "ward_no": ward_no,
                            "ward_name": group[0]["ward_name"],
                            "problem_type": problem_type,
                            "complaint_count": len(complaint_ids),
                            "summarization_status": 1
                        }).execute()
                        
                        summary_id = summary_insert.data[0]["summaryId"]
                        
                        supabase.table("ComplaintTable").update({
                            "summary_id": summary_id,
                            "summarization_status": 1
                        }).in_("id", complaint_ids).execute()
                        
                        # Save mapping if it was a real cluster from fit
                        if label != -1:
                            label_map[str(label)] = summary_id
                            
                # Save updated map
                save_label_map(label_map, ward_no, problem_type)
            
            logger.info(f"\n⏱️  Waiting {poll_interval}s before next poll...")
            time.sleep(poll_interval)
            
        except KeyboardInterrupt:
            logger.info("\n🛑 Summary worker stopped by user")
            break
            
        except Exception as e:
            logger.error(f"❌ Worker error: {e}", exc_info=True)
            logger.info(f"⏳ Waiting {poll_interval}s before retry...")
            time.sleep(poll_interval)


if __name__ == "__main__":
    try:
        summary_worker(poll_interval=60)
    except KeyboardInterrupt:
        logger.info("🛑 Summary worker stopped manually")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}", exc_info=True)
        sys.exit(1)
