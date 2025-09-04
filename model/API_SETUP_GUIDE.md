# 🌾 VerdScan API Setup Guide

A comprehensive guide to set up the VerdScan Crop Disease Detection API after cloning the repository.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing the API](#testing-the-api)
5. [Mobile App Integration](#mobile-app-integration)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

## 🔧 Prerequisites

Before setting up the API, ensure you have:

- **Python 3.8 or higher** installed
- **pip** (Python package installer)
- **Git** (for cloning the repository)
- **At least 4GB RAM** (for model loading)
- **2GB free disk space** (for models and dependencies)

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Python | 3.8+ | 3.9+ |
| RAM | 4GB | 8GB+ |
| Storage | 2GB | 5GB+ |
| CPU | 2 cores | 4+ cores |

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd verdiscan
```

### 2. Install Dependencies
Choose your preferred method:

**Option A: Windows (Batch Script)**
```cmd
cd model
install_requirements.bat
```

**Option B: Linux/Mac (Shell Script)**
```bash
cd model
chmod +x install_requirements.sh
./install_requirements.sh
```

**Option C: Cross-platform (Python Script)**
```bash
cd model
python install_requirements.py
```

**Option D: Manual Installation**
```bash
cd model
pip install -r requirements.txt
```

### 3. Start the API Server
```bash
cd model/api
python main.py
```

The API will be available at: `http://localhost:8000`

## 📖 Detailed Setup

### Step 1: Environment Setup

#### Create Virtual Environment (Recommended)
```bash
# Navigate to model directory
cd model

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

#### Install Dependencies
```bash
# Install API-specific requirements
cd api
pip install -r requirements.txt

# Or install all model requirements
cd ..
pip install -r requirements.txt
```

### Step 2: Verify Model Files

Ensure the trained models are in the correct locations:

```
model/
├── models/
│   ├── cassava/
│   │   └── cassava_best_model.h5
│   ├── maize/
│   │   └── maize_best_model.h5
│   └── tomato/
│       └── tomato_best_model.h5
└── api/
    ├── main.py
    ├── requirements.txt
    └── ...
```

**If models are missing:**
1. Check if they're in a different location
2. Update the model paths in `api/main.py`
3. Re-train models using scripts in `model/models/scripts/`

### Step 3: Start the API Server

#### Method 1: Direct Python Execution
```bash
cd model/api
python main.py
```

#### Method 2: Using the Batch Script (Windows)
```cmd
cd model\api
start_api.bat
```

#### Method 3: Using Uvicorn Directly
```bash
cd model/api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4: Verify API is Running

Open your browser and visit:
- **API Info**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/redoc

## 🧪 Testing the API

### Automated Testing
```bash
cd model/api
python test_api.py
```

### Manual Testing with curl

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Test Disease Detection
```bash
# Test cassava detection
curl -X POST "http://localhost:8000/detect/cassava" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/leaf_image.jpg"

# Test maize detection
curl -X POST "http://localhost:8000/detect/maize" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/leaf_image.jpg"

# Test tomato detection
curl -X POST "http://localhost:8000/detect/tomato" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/leaf_image.jpg"
```

### Using Postman or Similar Tools

1. **Import the API**: Use the OpenAPI schema at http://localhost:8000/openapi.json
2. **Test Endpoints**: 
   - Set method to `POST`
   - Add image file as form-data with key `file`
   - Send request to detection endpoints

## 📱 Mobile App Integration

### Step 1: Update Mobile App Configuration

Edit `mobileApp/config/api.ts`:

```typescript
export const API_CONFIG = {
  USE_MOCK_SERVICE: false,  // Change from true to false
  API_BASE_URL: 'http://localhost:8000',  // Update with your server URL
  TIMEOUT: 30000,
};
```

### Step 2: Network Configuration

**For different environments:**

```typescript
// Local development (same machine)
API_BASE_URL: 'http://localhost:8000'

// Android Emulator
API_BASE_URL: 'http://10.0.2.2:8000'

// iOS Simulator
API_BASE_URL: 'http://localhost:8000'

// Physical device on same network
API_BASE_URL: 'http://192.168.1.100:8000'  // Replace with your computer's IP

// Production server
API_BASE_URL: 'https://your-api-domain.com'
```

### Step 3: Test Mobile App Connection

1. Start the API server
2. Update the mobile app configuration
3. Run the mobile app
4. Test disease detection functionality

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Models Not Loading**
```
Error: [Errno 2] No such file or directory: '../cassava/cassava_best_model.h5'
```

**Solutions:**
- Check if model files exist in the correct paths
- Update model paths in `main.py` if they're in different locations
- Re-train models if they're missing

#### 2. **Port Already in Use**
```
Error: [Errno 48] Address already in use
```

**Solutions:**
```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
uvicorn main:app --port 8001
```

#### 3. **Memory Issues**
```
ResourceExhaustedError: OOM when allocating tensor
```

**Solutions:**
- Close other applications to free RAM
- Use model quantization
- Reduce batch size in prediction code
- Consider using CPU-only TensorFlow

#### 4. **Import Errors**
```
ModuleNotFoundError: No module named 'tensorflow'
```

**Solutions:**
```bash
# Activate virtual environment first
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstall requirements
pip install -r requirements.txt
```

#### 5. **CORS Issues (Mobile App)**
```
Network Error: CORS policy blocked the request
```

**Solutions:**
- Verify CORS middleware is enabled in `main.py`
- Check if API server allows external connections
- Test with browser first before mobile app

#### 6. **Slow Predictions**
**Solutions:**
- Use model quantization
- Optimize image preprocessing
- Consider GPU acceleration
- Implement caching for repeated requests

### Performance Optimization

#### Model Optimization
```python
# Add to main.py for faster inference
import tensorflow as tf

# Enable mixed precision
tf.keras.mixed_precision.set_global_policy('mixed_float16')

# Optimize for inference
model = tf.keras.models.load_model('model.h5')
model = tf.lite.TFLiteConverter.from_keras_model(model).convert()
```

#### Server Optimization
```bash
# Use Gunicorn for production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🌐 Production Deployment

### Environment Variables
```bash
export API_HOST=0.0.0.0
export API_PORT=8000
export CORS_ORIGINS=https://yourapp.com
export MODEL_PATH=/path/to/models
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY model/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and models
COPY model/api/ .
COPY model/models/ ./models/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and Run Docker Container
```bash
# Build image
docker build -t verdiscan-api .

# Run container
docker run -p 8000:8000 verdiscan-api
```

### Cloud Deployment Options

#### AWS EC2
1. Launch EC2 instance
2. Install Docker or Python
3. Clone repository
4. Set up security groups for port 8000
5. Deploy using Docker or direct Python

#### Google Cloud Run
1. Build Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure domain and SSL

#### Heroku
1. Create `Procfile`: `web: uvicorn main:app --host=0.0.0.0 --port=${PORT:-5000}`
2. Add `runtime.txt`: `python-3.9.16`
3. Deploy using Git or GitHub integration

## 📊 API Endpoints Reference

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/` | API information | None |
| `GET` | `/health` | Health check | None |
| `POST` | `/detect/cassava` | Cassava disease detection | `file`: Image file |
| `POST` | `/detect/maize` | Maize disease detection | `file`: Image file |
| `POST` | `/detect/tomato` | Tomato disease detection | `file`: Image file |
| `POST` | `/detect/auto` | Auto-detect crop type | `file`: Image file |

### Response Format
```json
{
  "crop_type": "maize",
  "predicted_disease": "healthy",
  "confidence": 0.95,
  "all_probabilities": {
    "blight": 0.02,
    "common_rust": 0.01,
    "gray_leaf_spot": 0.02,
    "healthy": 0.95
  },
  "status": "healthy"
}
```

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the API logs for error messages
3. Test with the automated test script
4. Check network connectivity between mobile app and API
5. Verify model files are present and accessible

## 🎯 Next Steps

After successful setup:

1. **Integrate with mobile app** - Update configuration and test
2. **Optimize performance** - Implement caching and model optimization
3. **Add monitoring** - Set up logging and health monitoring
4. **Scale for production** - Use load balancers and multiple instances
5. **Secure the API** - Add authentication and rate limiting

---

**Happy coding! 🚀**
