"""
FastAPI Backend for Bass Groove Master

Provides REST API endpoints for audio analysis with hardware acceleration
and serves the React frontend.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import logging
import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from audio_processing import (
    process_audio_buffer,
    get_device_info,
    is_cuda_available,
    is_mps_available
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bass Groove Master API",
    description="Hardware-accelerated audio analysis API for bass guitar practice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_dist_path = os.path.join(backend_dir, "frontend_build")

if os.path.exists(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

@app.get("/")
async def serve_frontend():
    index_path = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not built."}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "cuda": is_cuda_available(), "mps": is_mps_available()}

class AnalysisResponse(BaseModel):
    rhythm_accuracy: float
    tempo_stability: float
    attack_clarity: float
    dynamics: float
    overall_score: float
    duration: float
    sample_rate: int
    device_used: str

class DeviceInfoResponse(BaseModel):
    cuda_available: bool
    mps_available: bool
    device_type: str
    device_name: str
    memory_total: Optional[float] = None
    memory_allocated: Optional[float] = None

class FeedbackTip(BaseModel):
    message: str
    category: str

class DetailedAnalysisResponse(BaseModel):
    analysis: AnalysisResponse
    feedback: List[FeedbackTip]

@app.get("/device/info", response_model=DeviceInfoResponse)
async def get_accelerator_info():
    return get_device_info()

@app.post("/analyze/audio", response_model=DetailedAnalysisResponse)
async def analyze_audio(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        results = process_audio_buffer(content)
        feedback = []
        if results['rhythm_accuracy'] < 70:
            feedback.append(FeedbackTip(message="Работайте над ритмом с метрономом.", category="rhythm"))
        elif results['rhythm_accuracy'] >= 85:
            feedback.append(FeedbackTip(message="Отличный ритм!", category="rhythm"))
        if results['tempo_stability'] < 70:
            feedback.append(FeedbackTip(message="Темп плавает.", category="tempo"))
        if results['overall_score'] >= 85:
            feedback.append(FeedbackTip(message="Превосходно!", category="overall"))
        return DetailedAnalysisResponse(
            analysis=AnalysisResponse(**results),
            feedback=feedback
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
