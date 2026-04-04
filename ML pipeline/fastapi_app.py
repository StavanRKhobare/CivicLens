from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import uvicorn
import logging

from src.config import config
from celery_app import celery_app
from celery import chord
from tasks.pipeline import classify_task, geocode_task, aggregate_task

# Initialize FastAPI
app = FastAPI(
    title="CivicLens ML Pipeline API",
    description="Async API for processing civic complaints",
    version="1.0.0"
)

logger = logging.getLogger("uvicorn")

class ProcessRequest(BaseModel):
    complaint_id: int
    text: str

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "civiclens-ml-api"}

@app.post("/process")
async def process_complaint(req: ProcessRequest):
    """
    Enqueue a complaint for processing via Celery
    Runs classification and geocoding in parallel, 
    then triggers aggregation (clustering + summarization)
    """
    logger.info(f"Received processing request for complaint #{req.complaint_id}")
    
    # We use a Celery chord: wait for classify_task & geocode_task to finish,
    # then pass their results to aggregate_task.
    try:
        header = [
            classify_task.s(req.complaint_id, req.text),
            geocode_task.s(req.complaint_id, req.text)
        ]
        callback = aggregate_task.s(req.complaint_id)
        
        # Dispatch the chord
        result = chord(header)(callback)
        
        return {
            "status": "enqueued",
            "complaint_id": req.complaint_id,
            "job_id": result.id
        }
    except Exception as e:
        logger.error(f"Failed to enqueue task: {e}")
        raise HTTPException(status_code=500, detail="Internal server error dispatching tasks")

@app.get("/status/{complaint_id}")
async def get_status(complaint_id: int):
    # This requires checking the Supabase DB
    from src.database import supabase
    
    try:
        res = supabase.table("ComplaintTable").select("problem_type, ward_no, summarization_status").eq("id", complaint_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Complaint not found")
            
        data = res.data[0]
        
        # Simple status logic based on DB fields
        status = {
            "classification": "pending",
            "geocoding": "pending",
            "aggregation": "pending"
        }
        
        if data.get("problem_type"):
            status["classification"] = "completed"
            
        if data.get("ward_no") is not None:
            status["geocoding"] = "completed"
            
        if data.get("summarization_status") == 1:
            status["aggregation"] = "completed"
            
        return {"complaint_id": complaint_id, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=config.FASTAPI_PORT, reload=True)
