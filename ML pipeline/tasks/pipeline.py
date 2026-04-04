import sys
from pathlib import Path
from celery import shared_task
from celery.utils.log import get_task_logger

# Ensure project root is in path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.database import supabase
from src.config import config
from src.models import load_distilbert_model
from src.geocoding import extract_address_gliner, geocode_address, find_ward

logger = get_task_logger(__name__)

# Global model variables for workers
_model = None
_tokenizer = None
_le_problem = None
_embedder = None

def get_classification_model():
    global _model, _tokenizer, _le_problem
    if _model is None:
        logger.info("Loading DistilBERT model...")
        _model, _tokenizer, _le_problem = load_distilbert_model()
    return _model, _tokenizer, _le_problem

def get_embedder():
    global _embedder
    if _embedder is None:
        logger.info("Loading embedding model...")
        from src.models import load_embedding_model
        _embedder = load_embedding_model()
    return _embedder

@shared_task(name="tasks.pipeline.classify_task")
def classify_task(complaint_id, text):
    """Run DistilBERT classification on text and save to Supabase"""
    logger.info(f"Classifying complaint #{complaint_id}")
    try:
        model, tokenizer, le_problem = get_classification_model()
        import torch
        
        inputs = tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            prob_idx = torch.argmax(outputs["problem_logits"], dim=1).item()
            urg_idx = torch.argmax(outputs["urgency_logits"], dim=1).item()
            senti_idx = torch.argmax(outputs["sentiment_logits"], dim=1).item()
            
        problem_type = le_problem.inverse_transform([prob_idx])[0]
        
        # Sentiments maps for string values
        sentiments = ["Very Negative", "Negative", "Neutral", "Positive", "Very Positive", "Mixed"]
        sentiment_str = sentiments[senti_idx] if senti_idx < len(sentiments) else "Neutral"
        
        # Update supabase
        supabase.table("ComplaintTable").update({
            "problem_type": problem_type,
            "urgency_level": urg_idx,
            "sentiment": sentiment_str
        }).eq("id", complaint_id).execute()
        
        return {"status": "success", "task": "classify", "id": complaint_id}
        
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        return {"status": "error", "task": "classify", "error": str(e)}

@shared_task(name="tasks.pipeline.geocode_task")
def geocode_task(complaint_id, text):
    """Run GLiNER NER and Geocoding and save to Supabase"""
    logger.info(f"Geocoding complaint #{complaint_id}")
    try:
        address = extract_address_gliner(text)
        
        lat, lon = None, None
        ward_no, ward_name = -1, "UNIDENTIFIED"
        
        if address:
            loc = geocode_address(address)
            if loc:
                lat = loc.latitude
                lon = loc.longitude
                ward_no, ward_name = find_ward(lat, lon)
                
        # Update database
        supabase.table("ComplaintTable").update({
            "location_details": address or "UNIDENTIFIED",
            "lat": lat,
            "lon": lon,
            "ward_no": ward_no,
            "ward_name": ward_name
        }).eq("id", complaint_id).execute()
        
        return {"status": "success", "task": "geocode", "id": complaint_id, "ward_no": ward_no}
        
    except Exception as e:
        logger.error(f"Geocoding failed: {e}")
        return {"status": "error", "task": "geocode", "error": str(e)}

@shared_task(name="tasks.pipeline.aggregate_task")
def aggregate_task(results, complaint_id):
    """
    Triggered when both classification and geocoding complete.
    Results will be a list of the return values of the upstream tasks.
    We just run the HDBSCAN aggregation for the affected ward/problem_type.
    """
    logger.info(f"Aggregating complaint #{complaint_id}. Upstream results: {results}")
    
    try:
        # Check if upstream tasks succeeded
        for res in results:
            if isinstance(res, dict) and res.get("status") == "error":
                logger.warning(f"Upstream task {res.get('task')} failed. Skipping aggregation.")
                return {"status": "skipped", "reason": "upstream failure"}
                
        # To aggregate, we run exactly what summary_worker used to do,
        # but just for a specific group of complaints if desired,
        # OR we just trigger one cycle of the summary_worker logic.
        from workers.summary_worker import summary_worker
        # Alternatively, we could just run it for checking all unsummarized.
        # Since it's incremental, it's fast. Let's just run one cycle of the logic.
        
        # We import the required parts and do a single pass without the infinite loop
        from workers.summary_worker import (
            load_clusterer, save_clusterer, load_label_map, save_label_map,
            generate_template_summary, setup_logger
        )
        import hdbscan
        import time
        
        embedder = get_embedder()
        
        # Fetch ALl unsummarized (not just this complaint, since it's a batch)
        response = (
            supabase.table("ComplaintTable")
            .select("id, raw_text, ward_no, ward_name, problem_type, image_urls")
            .is_("summarization_status", None)
            .neq("ward_no", -1)
            .execute()
        )
        
        complaints = response.data
        if not complaints:
            return {"status": "success", "message": "No complaints to summarize"}
            
        # Group
        groups = {}
        for c in complaints:
            if c is None:
                continue
            key = (c["ward_no"], c["problem_type"])
            if key not in groups:
                groups[key] = []
            groups[key].append(c)
            
        for (ward_no, problem_type), group in groups.items():
            texts = [c["raw_text"] for c in group]
            ids = [c["id"] for c in group]
            
            embeddings = embedder.encode(texts)
            clusterer = load_clusterer(ward_no, problem_type)
            label_map = load_label_map(ward_no, problem_type)
            
            if clusterer is None:
                if len(embeddings) >= 2:
                    clusterer = hdbscan.HDBSCAN(min_cluster_size=2, prediction_data=True)
                    labels = clusterer.fit_predict(embeddings)
                    save_clusterer(clusterer, ward_no, problem_type)
                else:
                    labels = [-1] * len(embeddings)
            else:
                labels, strengths = hdbscan.approximate_predict(clusterer, embeddings)
                labels = [l if s > 0.4 else -1 for l, s in zip(labels, strengths)]
                
            cluster_groups = {}
            for cid, text, label in zip(ids, texts, labels):
                cluster_groups.setdefault(label, []).append((cid, text))
                
            for label, items in cluster_groups.items():
                complaint_ids = [item[0] for item in items]
                cluster_texts = [item[1] for item in items]
                
                # Aggregate images
                cluster_images = []
                for cid in complaint_ids:
                    comp = next((c for c in group if c["id"] == cid), None)
                    if comp and comp.get("image_urls"):
                        for img in comp["image_urls"]:
                            if len(cluster_images) < 6 and img not in cluster_images:
                                cluster_images.append(img)
                
                if label != -1 and str(label) in label_map:
                    summary_id = label_map[str(label)]
                    supabase.table("ComplaintTable").update({
                        "summary_id": summary_id,
                        "summarization_status": 1
                    }).in_("id", complaint_ids).execute()
                    
                    res = supabase.table("SummaryTable").select("complaint_count, image_urls").eq("summaryId", summary_id).single().execute()
                    if res.data:
                        # Merge new images with existing
                        existing_images = res.data.get("image_urls") or []
                        for img in cluster_images:
                            if len(existing_images) < 6 and img not in existing_images:
                                existing_images.append(img)
                                
                        supabase.table("SummaryTable").update({
                            "complaint_count": res.data["complaint_count"] + len(complaint_ids),
                            "image_urls": existing_images
                        }).eq("summaryId", summary_id).execute()
                else:
                    rep_texts = cluster_texts[:5]
                    summary_text = generate_template_summary(rep_texts, problem_type, group[0]["ward_name"])
                    
                    summary_insert = supabase.table("SummaryTable").insert({
                        "summary": summary_text, 
                        "ward_no": ward_no, 
                        "ward_name": group[0]["ward_name"], 
                        "problem_type": problem_type, 
                        "complaint_count": len(complaint_ids), 
                        "summarization_status": 1,
                        "image_urls": cluster_images if cluster_images else None
                    }).execute()
                    
                    if summary_insert.data:
                        summary_id = summary_insert.data[0]["summaryId"]
                        supabase.table("ComplaintTable").update({
                            "summary_id": summary_id, 
                            "summarization_status": 1
                        }).in_("id", complaint_ids).execute()
                        if label != -1:
                            label_map[str(label)] = summary_id
                            
            save_label_map(label_map, ward_no, problem_type)
            
        return {"status": "success", "processed_groups": len(groups)}
        
    except Exception as e:
        logger.error(f"Aggregation failed: {e}")
        return {"status": "error", "task": "aggregate", "error": str(e)}
