from pydantic import BaseModel
from typing import Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

class PredictionResponse(BaseModel):
    plant_type: str
    predicted_class: str
    confidence: float
    all_probabilities: Dict[str, float]
    image_path: Optional[str] = None
    processing_time_ms: Optional[float] = None
    timestamp: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class ModelStatusResponse(BaseModel):
    cassava: Dict[str, Any]
    maize: Dict[str, Any]
    tomato: Dict[str, Any]
