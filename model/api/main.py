from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from typing import Dict, Any
import os
import sys
from contextlib import asynccontextmanager

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import services
from services.cassava_service import CassavaService
from services.maize_service import MaizeService
from services.tomato_service import TomatoService

# Import response models
from models import PredictionResponse, HealthResponse, ModelStatusResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global service variables
cassava_service = None
maize_service = None
tomato_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    global cassava_service, maize_service, tomato_service
    
    try:
        logger.info("Starting up Plant Disease Detection API...")
        
        # Initialize services
        cassava_service = CassavaService()
        maize_service = MaizeService()
        tomato_service = TomatoService()
        
        # Load models
        models_loaded = 0
        total_models = 3
        
        if cassava_service.load_model():
            models_loaded += 1
            logger.info("✅ Cassava model loaded successfully")
        else:
            logger.warning("⚠️ Cassava model failed to load")
        
        if maize_service.load_model():
            models_loaded += 1
            logger.info("✅ Maize model loaded successfully")
        else:
            logger.warning("⚠️ Maize model failed to load")
        
        if tomato_service.load_model():
            models_loaded += 1
            logger.info("✅ Tomato model loaded successfully")
        else:
            logger.warning("⚠️ Tomato model failed to load")
        
        if models_loaded == 0:
            logger.error("❌ No models loaded successfully!")
            raise Exception("Failed to load any models")
        elif models_loaded < total_models:
            logger.warning(f"⚠️ Only {models_loaded}/{total_models} models loaded successfully")
        else:
            logger.info(f"✅ All {models_loaded} models loaded successfully")
        
        logger.info("🚀 Plant Disease Detection API startup complete!")
        
    except Exception as e:
        logger.error(f"Failed to start API: {e}")
        raise e
    
    yield
    
    logger.info("Shutting down Plant Disease Detection API...")

# Create FastAPI app
app = FastAPI(
    title="Plant Disease Detection API",
    description="API for detecting plant diseases using machine learning models",
    version="1.0.0",
    lifespan=lifespan
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(f"Request details: {request.url}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Plant Disease Detection API is running",
        version="1.0.0"
    )

@app.get("/models/status", response_model=ModelStatusResponse)
async def get_model_status():
    """Get status of all models"""
    return ModelStatusResponse(
        cassava={
            "loaded": cassava_service.is_model_loaded() if cassava_service else False,
            "classes": cassava_service.get_class_names() if cassava_service else []
        },
        maize={
            "loaded": maize_service.is_model_loaded() if maize_service else False,
            "classes": maize_service.get_class_names() if maize_service else []
        },
        tomato={
            "loaded": tomato_service.is_model_loaded() if tomato_service else False,
            "classes": tomato_service.get_class_names() if tomato_service else []
        }
    )

@app.post("/predict/cassava", response_model=PredictionResponse)
async def predict_cassava(image: UploadFile = File(...)):
    """Predict cassava disease"""
    logger.info(f"Received cassava prediction request")
    logger.info(f"Image file: {image.filename}")
    logger.info(f"Content type: {image.content_type}")
    logger.info(f"File size: {getattr(image, 'size', 'unknown')}")
    logger.info(f"File object type: {type(image.file)}")
    
    if not cassava_service or not cassava_service.is_model_loaded():
        raise HTTPException(status_code=503, detail="Cassava model not available")
    
    # Validate image file
    if not image.content_type or not image.content_type.startswith('image/'):
        logger.error(f"Invalid content type: {image.content_type}")
        raise HTTPException(status_code=422, detail="Invalid file type. Please upload an image file.")
    
    if not image.filename:
        logger.error("No filename provided")
        raise HTTPException(status_code=422, detail="Image filename is required.")
    
    # Read a small chunk to validate there is content (avoid relying on UploadFile.size)
    try:
        pos = image.file.tell() if hasattr(image.file, 'tell') else None
        image.file.seek(0)
        sample = image.file.read(16)
        has_bytes = len(sample) > 0
        # Reset pointer
        image.file.seek(0)
        if not has_bytes:
            logger.error("Image file appears empty after read()")
            raise HTTPException(status_code=422, detail="Image file is empty.")
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(status_code=400, detail="Failed to read uploaded image file.")
    
    try:
        result = cassava_service.predict(image)
        if "error" in result:
            logger.error(f"Prediction error: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])
        
        logger.info(f"Prediction successful: {result}")
        return PredictionResponse(**result)
    except Exception as e:
        logger.error(f"Unexpected error in cassava prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/predict/maize", response_model=PredictionResponse)
async def predict_maize(image: UploadFile = File(...)):
    """Predict maize disease"""
    if not maize_service or not maize_service.is_model_loaded():
        raise HTTPException(status_code=503, detail="Maize model not available")
    
    # Validate image file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=422, detail="Invalid file type. Please upload an image file.")
    
    if not image.filename:
        raise HTTPException(status_code=422, detail="Image filename is required.")
    
    # Validate content by attempting a small read
    try:
        image.file.seek(0)
        sample = image.file.read(16)
        has_bytes = len(sample) > 0
        image.file.seek(0)
        if not has_bytes:
            raise HTTPException(status_code=422, detail="Image file is empty.")
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded image file.")
    
    result = maize_service.predict(image)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return PredictionResponse(**result)

@app.post("/predict/tomato", response_model=PredictionResponse)
async def predict_tomato(image: UploadFile = File(...)):
    """Predict tomato disease"""
    if not tomato_service or not tomato_service.is_model_loaded():
        raise HTTPException(status_code=503, detail="Tomato model not available")
    
    # Validate image file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=422, detail="Invalid file type. Please upload an image file.")
    
    if not image.filename:
        raise HTTPException(status_code=422, detail="Image filename is required.")
    
    # Validate content by attempting a small read
    try:
        image.file.seek(0)
        sample = image.file.read(16)
        has_bytes = len(sample) > 0
        image.file.seek(0)
        if not has_bytes:
            raise HTTPException(status_code=422, detail="Image file is empty.")
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded image file.")
    
    result = tomato_service.predict(image)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return PredictionResponse(**result)

@app.post("/predict/{plant_type}", response_model=PredictionResponse)
async def predict_generic(plant_type: str, image: UploadFile = File(...)):
    """Generic prediction endpoint for any plant type"""
    service_map = {
        "cassava": cassava_service,
        "maize": maize_service,
        "tomato": tomato_service
    }
    
    if plant_type not in service_map:
        raise HTTPException(status_code=400, detail=f"Unsupported plant type: {plant_type}")
    
    service = service_map[plant_type]
    if not service or not service.is_model_loaded():
        raise HTTPException(status_code=503, detail=f"{plant_type.capitalize()} model not available")
    
    # Validate image file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=422, detail="Invalid file type. Please upload an image file.")
    
    if not image.filename:
        raise HTTPException(status_code=422, detail="Image filename is required.")
    
    # Validate content by attempting a small read
    try:
        image.file.seek(0)
        sample = image.file.read(16)
        has_bytes = len(sample) > 0
        image.file.seek(0)
        if not has_bytes:
            raise HTTPException(status_code=422, detail="Image file is empty.")
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded image file.")
    
    result = service.predict(image)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return PredictionResponse(**result)

@app.post("/test/upload", response_model=Dict[str, Any])
async def test_upload(image: UploadFile = File(...)):
    """Test endpoint to debug image upload"""
    logger.info("=== TEST UPLOAD ENDPOINT ===")
    logger.info(f"Filename: {image.filename}")
    logger.info(f"Content type: {image.content_type}")
    logger.info(f"File size: {image.size}")
    logger.info(f"File object type: {type(image.file)}")
    logger.info(f"File object: {image.file}")
    
    # Additional debugging for React Native compatibility
    logger.info(f"File object attributes: {dir(image.file)}")
    logger.info(f"File object readable: {hasattr(image.file, 'readable')}")
    logger.info(f"File object seekable: {hasattr(image.file, 'seekable')}")
    
    try:
        # Try to read the file
        image.file.seek(0)
        image_data = image.file.read()
        logger.info(f"Read {len(image_data)} bytes")
        
        if len(image_data) > 0:
            logger.info(f"First 100 bytes: {image_data[:100]}")
            logger.info(f"Last 100 bytes: {image_data[-100:]}")
            
            # Check for image signatures
            if image_data.startswith(b'\xff\xd8\xff'):
                logger.info("✓ JPEG signature detected in uploaded data")
            elif image_data.startswith(b'\x89PNG\r\n\x1a\n'):
                logger.info("✓ PNG signature detected in uploaded data")
            else:
                logger.warning("⚠ No recognized image signature in uploaded data")
        else:
            logger.warning("⚠ No data read from uploaded file")
        
        # Reset file pointer
        image.file.seek(0)
        
        return {
            "filename": image.filename,
            "content_type": image.content_type,
            "size": image.size,
            "bytes_read": len(image_data),
            "file_object_type": str(type(image.file)),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error in test upload: {e}")
        return {
            "error": str(e),
            "status": "error"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
