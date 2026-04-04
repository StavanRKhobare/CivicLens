#!/usr/bin/env python3
"""
CivicLens Classification Worker
Continuously processes new complaints for classification and geocoding
Runs every 5 seconds
"""

import sys
import time
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.config import config
from src.logger import get_worker_logger
from src.database import supabase
from src.models import load_classification_model, predict_problem_urgency_sentiment
from src.geocoding import extract_location_spacy, geocode_address, find_ward

# Initialize logger
logger = get_worker_logger("classification", config.LOG_LEVEL)


def civic_worker_realtime(poll_interval=5):
    """
    Main classification worker loop
    Polls database for unprocessed complaints and enriches them with:
    - Problem type classification
    - Urgency level
    - Sentiment
    - Address extraction and geocoding
    - Ward assignment
    
    Args:
        poll_interval: Time to wait between polls (seconds)
    """
    logger.info("=" * 80)
    logger.info("🚀 CivicLens Classification Worker Started")
    logger.info(f"📍 Project Root: {config.PROJECT_ROOT}")
    logger.info(f"⏱️  Poll Interval: {poll_interval} seconds")
    logger.info("=" * 80)
    
    # Load models once at startup
    logger.info("Loading classification model...")
    model, tokenizer, le_problem = load_classification_model()
    logger.info("✅ Models loaded successfully")
    
    while True:
        try:
            # Fetch complaints needing processing
            response = (
                supabase
                .table("ComplaintTable")
                .select("*")
                .or_(
                    "problem_type.is.null,"
                    "urgency_level.is.null,"
                    "sentiment.is.null,"
                    "ward_name.is.null,"
                    "ward_no.is.null"
                )
                .limit(10)
                .execute()
            )
            
            complaints = response.data
            
            if not complaints:
                logger.info("⏳ No new complaints. Sleeping...")
                time.sleep(poll_interval)
                continue
            
            logger.info(f"🔄 Processing {len(complaints)} complaints")
            
            for row in complaints:
                complaint_id = row['id']
                logger.info(f"➡️  Processing complaint ID {complaint_id}")
                
                updates = {}
                text = row["raw_text"]
                
                # Classification
                if (
                    row["problem_type"] is None
                    or row["urgency_level"] is None
                    or row["sentiment"] is None
                ):
                    logger.debug("🧠 Running classifier...")
                    preds = predict_problem_urgency_sentiment(text, model, tokenizer, le_problem)
                    updates["problem_type"] = preds["problem_type"]
                    updates["urgency_level"] = preds["urgency_level"]
                    updates["sentiment"] = preds["sentiment"]
                    logger.info(f"   ✓ Classification: {preds['problem_type']}, "
                               f"urgency={preds['urgency_level']}, sentiment={preds['sentiment']}")
                
                # Address extraction and ward assignment
                if row["ward_name"] is None or row["ward_no"] is None:
                    logger.debug("📍 Extracting address...")
                    location_text = extract_location_spacy(text)
                    
                    if location_text:
                        logger.debug(f"   Extracted location: {location_text}")
                        
                        # Geocode
                        logger.debug("🌍 Geocoding address...")
                        loc = geocode_address(location_text)
                        
                        if loc:
                            logger.debug(f"   Geocoded to: {loc.latitude}, {loc.longitude}")
                            
                            # Find ward
                            logger.debug("🗺️  Finding ward...")
                            ward_no, ward_name = find_ward(loc.latitude, loc.longitude)
                            
                            updates["latitude"] = loc.latitude
                            updates["longitude"] = loc.longitude
                            updates["ward_no"] = ward_no
                            updates["ward_name"] = ward_name
                            updates["address_text"] = location_text
                            
                            logger.info(f"   ✓ Geocoded: Ward {ward_no} - {ward_name}")
                        else:
                            # Geocoding failed - mark as unidentified
                            logger.warning(f"   ⚠️  Could not geocode: {location_text}")
                            updates["ward_no"] = -1
                            updates["ward_name"] = "UNIDENTIFIED"
                            updates["address_text"] = location_text
                    else:
                        # No location found in text
                        logger.warning("   ⚠️  No location found in complaint text")
                        updates["ward_no"] = -1
                        updates["ward_name"] = "UNIDENTIFIED"
                        updates["address_text"] = "UNIDENTIFIED"
                
                # Update database
                if updates:
                    logger.debug(f"💾 Writing updates to database...")
                    (
                        supabase
                        .table("ComplaintTable")
                        .update(updates)
                        .eq("id", complaint_id)
                        .execute()
                    )
                    logger.info(f"✅ Updated complaint {complaint_id}")
            
            # Wait before next poll
            time.sleep(poll_interval)
            
        except KeyboardInterrupt:
            logger.info("\n🛑 Classification worker stopped by user")
            break
            
        except Exception as e:
            logger.error(f"❌ Worker error: {e}", exc_info=True)
            logger.info(f"⏳ Waiting {poll_interval}s before retry...")
            time.sleep(poll_interval)


if __name__ == "__main__":
    try:
        civic_worker_realtime(poll_interval=5)
    except KeyboardInterrupt:
        logger.info("🛑 Classification worker stopped manually")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}", exc_info=True)
        sys.exit(1)
