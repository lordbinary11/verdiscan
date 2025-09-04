from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import json
from typing import Dict, List
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Crop Disease Detection API",
    description="AI-powered API for detecting diseases in cassava, maize, and tomato crops",
    version="1.0.0"
)

# Add CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
models = {}
class_names = {}

def load_models():
    """Load all trained models and their class names"""
    try:
        # Cassava model
        cassava_model_path = "../cassava/cassava_best_model.h5"
        if os.path.exists(cassava_model_path):
            models['cassava'] = tf.keras.models.load_model(cassava_model_path)
            class_names['cassava'] = [
                'bacterial_blight',
                'brown_streak_disease', 
                'green_mottle',
                'healthy',
                'mosaic_disease'
            ]
            print("✅ Cassava model loaded successfully")
        
        # Maize model
        maize_model_path = "../maize/maize_best_model.h5"
        if os.path.exists(maize_model_path):
            models['maize'] = tf.keras.models.load_model(maize_model_path)
            class_names['maize'] = [
                'blight',
                'common_rust',
                'gray_leaf_spot',
                'healthy'
            ]
            print("✅ Maize model loaded successfully")
        
        # Tomato model
        tomato_model_path = "../tomato/tomato_best_model.h5"
        if os.path.exists(tomato_model_path):
            models['tomato'] = tf.keras.models.load_model(tomato_model_path)
            class_names['tomato'] = [
                'bacterial_spot',
                'early_blight',
                'healthy',
                'late_blight',
                'leaf_mold',
                'mosaic_virus',
                'septoria_spot',
                'spider_mites',
                'target_spot',
                'yellow_leaf_curl_virus'
            ]
            print("✅ Tomato model loaded successfully")
            
        print(f"🎯 Loaded {len(models)} models successfully")
        
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        raise e

def preprocess_image(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """Preprocess image for model inference"""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        image_array = np.array(image).astype(np.float32) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image preprocessing failed: {str(e)}")

def predict_disease(model, image_array: np.ndarray, crop_type: str) -> Dict:
    """Make prediction using the loaded model"""
    try:
        # Make prediction
        predictions = model.predict(image_array, verbose=0)
        
        # Get predicted class index
        predicted_class_idx = np.argmax(predictions[0])
        
        # Get confidence score
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get class name
        predicted_class = class_names[crop_type][predicted_class_idx]
        
        # Get all probabilities
        all_probabilities = {
            class_names[crop_type][i]: float(predictions[0][i])
            for i in range(len(class_names[crop_type]))
        }
        
        return {
            "crop_type": crop_type,
            "predicted_disease": predicted_class,
            "confidence": confidence,
            "all_probabilities": all_probabilities,
            "status": "healthy" if predicted_class == "healthy" else "diseased"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load models when the API starts"""
    print("🚀 Starting Crop Disease Detection API...")
    load_models()
    print("🎉 API is ready to serve predictions!")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Crop Disease Detection API",
        "version": "1.0.0",
        "available_crops": list(models.keys()),
        "endpoints": {
            "detect_cassava": "/detect/cassava",
            "detect_maize": "/detect/maize", 
            "detect_tomato": "/detect/tomato",
            "detect_auto": "/detect/auto",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "available_crops": list(models.keys())
    }

@app.post("/detect/cassava")
async def detect_cassava_disease(file: UploadFile = File(...)):
    """Detect diseases in cassava leaves"""
    if 'cassava' not in models:
        raise HTTPException(status_code=503, detail="Cassava model not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and preprocess image
    image_bytes = await file.read()
    image_array = preprocess_image(image_bytes)
    
    # Make prediction
    result = predict_disease(models['cassava'], image_array, 'cassava')
    
    return JSONResponse(content=result)

@app.post("/detect/maize")
async def detect_maize_disease(file: UploadFile = File(...)):
    """Detect diseases in maize leaves"""
    if 'maize' not in models:
        raise HTTPException(status_code=503, detail="Maize model not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and preprocess image
    image_bytes = await file.read()
    image_array = preprocess_image(image_bytes)
    
    # Make prediction
    result = predict_disease(models['maize'], image_array, 'maize')
    
    return JSONResponse(content=result)

@app.post("/detect/tomato")
async def detect_tomato_disease(file: UploadFile = File(...)):
    """Detect diseases in tomato leaves"""
    if 'tomato' not in models:
        raise HTTPException(status_code=503, detail="Tomato model not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and preprocess image
    image_bytes = await file.read()
    image_array = preprocess_image(image_bytes)
    
    # Make prediction
    result = predict_disease(models['tomato'], image_array, 'tomato')
    
    return JSONResponse(content=result)

@app.post("/detect/auto")
async def detect_disease_auto(file: UploadFile = File(...)):
    """Automatically detect crop type and disease (experimental)"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and preprocess image
    image_bytes = await file.read()
    image_array = preprocess_image(image_bytes)
    
    # Try all models and return the one with highest confidence
    results = {}
    for crop_type, model in models.items():
        try:
            result = predict_disease(model, image_array, crop_type)
            results[crop_type] = result
        except Exception as e:
            results[crop_type] = {"error": str(e)}
    
    return JSONResponse(content={
        "message": "Auto-detection results for all crop types",
        "results": results
    })

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
