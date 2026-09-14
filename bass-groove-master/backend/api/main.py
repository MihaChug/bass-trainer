"""
FastAPI Backend for Bass Groove Master

Provides REST API endpoints for audio analysis with hardware acceleration.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import sys
import os

# Add backend to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from audio_processing import (
    process_audio_buffer,
    get_device_info,
    is_cuda_available,
    is_mps_available
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bass Groove Master API",
    description="Hardware-accelerated audio analysis API for bass guitar practice",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResponse(BaseModel):
    """Response model for audio analysis."""
    rhythm_accuracy: float
    tempo_stability: float
    attack_clarity: float
    dynamics: float
    overall_score: float
    duration: float
    sample_rate: int
    device_used: str


class DeviceInfoResponse(BaseModel):
    """Response model for device information."""
    cuda_available: bool
    mps_available: bool
    device_type: str
    device_name: str
    memory_total: Optional[float] = None
    memory_allocated: Optional[float] = None


class FeedbackTip(BaseModel):
    """Feedback tip model."""
    message: str
    category: str


class DetailedAnalysisResponse(BaseModel):
    """Detailed analysis response with feedback."""
    analysis: AnalysisResponse
    feedback: List[FeedbackTip]


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Bass Groove Master API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=dict)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "acceleration": {
            "cuda": is_cuda_available(),
            "mps": is_mps_available()
        }
    }


@app.get("/device/info", response_model=DeviceInfoResponse)
async def get_accelerator_info():
    """Get information about available hardware accelerators."""
    info = get_device_info()
    logger.info(f"Device info requested: {info['device_type']}")
    return info


@app.post("/analyze/audio", response_model=DetailedAnalysisResponse)
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyze uploaded audio file and return detailed metrics.
    
    The analysis uses hardware acceleration (CUDA/MPS) when available.
    """
    try:
        # Read file content
        content = await file.read()
        
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Process audio
        logger.info(f"Processing audio file: {file.filename}")
        results = process_audio_buffer(content)
        
        # Generate feedback
        feedback = generate_feedback(results)
        
        response = DetailedAnalysisResponse(
            analysis=AnalysisResponse(
                rhythm_accuracy=results['rhythm_accuracy'],
                tempo_stability=results['tempo_stability'],
                attack_clarity=results['attack_clarity'],
                dynamics=results['dynamics'],
                overall_score=results['overall_score'],
                duration=results['duration'],
                sample_rate=results['sample_rate'],
                device_used=results['device_used']
            ),
            feedback=feedback
        )
        
        logger.info(f"Analysis complete - Overall score: {results['overall_score']:.1f}%")
        return response
        
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


def generate_feedback(results: dict) -> List[FeedbackTip]:
    """Generate personalized feedback based on analysis results."""
    feedback = []
    
    # Rhythm feedback
    if results['rhythm_accuracy'] < 70:
        feedback.append(FeedbackTip(
            message="Поработайте над чувством ритма. Используйте метроном на медленных темпах.",
            category="rhythm"
        ))
    elif results['rhythm_accuracy'] >= 85:
        feedback.append(FeedbackTip(
            message="Отличная ритмическая точность! Попробуйте более сложные синкопы.",
            category="rhythm"
        ))
    
    # Tempo feedback
    if results['tempo_stability'] < 70:
        feedback.append(FeedbackTip(
            message="Темп плавает. Практикуйте длинные сессии с метрономом.",
            category="tempo"
        ))
    elif results['tempo_stability'] >= 85:
        feedback.append(FeedbackTip(
            message="Стабильный темп! Можете экспериментировать с rubato.",
            category="tempo"
        ))
    
    # Attack feedback
    if results['attack_clarity'] < 65:
        feedback.append(FeedbackTip(
            message="Обратите внимание на четкость атаки. Каждая нота должна звучать ясно.",
            category="attack"
        ))
    elif results['attack_clarity'] >= 80:
        feedback.append(FeedbackTip(
            message="Четкая атака! Хорошая техника звукоизвлечения.",
            category="attack"
        ))
    
    # Dynamics feedback
    if results['dynamics'] < 65:
        feedback.append(FeedbackTip(
            message="Добавьте динамики в игру. Контраст между громкими и тихими нотами создает грув.",
            category="dynamics"
        ))
    elif results['dynamics'] >= 80:
        feedback.append(FeedbackTip(
            message="Отличная динамика! Вы чувствуете музыку.",
            category="dynamics"
        ))
    
    # Overall feedback
    if results['overall_score'] >= 85:
        feedback.append(FeedbackTip(
            message="Превосходно! Вы готовы к следующему уровню сложности.",
            category="overall"
        ))
    elif results['overall_score'] >= 70:
        feedback.append(FeedbackTip(
            message="Хороший результат! Продолжайте регулярные тренировки.",
            category="overall"
        ))
    else:
        feedback.append(FeedbackTip(
            message="Не сдавайтесь! Регулярная практика принесет результаты.",
            category="overall"
        ))
    
    return feedback


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
