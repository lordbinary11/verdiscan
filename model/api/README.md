# Plant Disease Detection API

This API provides plant disease detection services for cassava, maize, and tomato plants using machine learning models.

## Features

- **Multi-plant support**: Cassava, Maize, and Tomato disease detection
- **RESTful API**: Easy-to-use HTTP endpoints
- **Docker support**: Containerized deployment
- **Real-time predictions**: Fast image processing and disease classification
- **Comprehensive results**: Confidence scores and probability distributions

## API Endpoints

### Health Check
- `GET /` - Root endpoint with health status
- `GET /health` - Health check endpoint

### Disease Prediction
- `POST /predict/cassava` - Predict cassava diseases
- `POST /predict/maize` - Predict maize diseases  
- `POST /predict/tomato` - Predict tomato diseases
- `POST /predict/{plant_type}` - Generic prediction endpoint

### Model Information
- `GET /models/status` - Get status of all loaded models

## Response Format

```json
{
  "plant_type": "cassava",
  "predicted_class": "healthy",
  "confidence": 0.95,
  "all_probabilities": {
    "bacterial_blight": 0.02,
    "brown_streak_disease": 0.01,
    "green_mottle": 0.01,
    "healthy": 0.95,
    "mosaic_disease": 0.01
  },
  "processing_time_ms": 125.5,
  "timestamp": "2024-01-15 10:30:45"
}
```

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Python 3.9+ (for local development)

### Quick Start with Docker

1. **Clone and navigate to the project directory**
   ```bash
   cd model
   ```

2. **Build and run the API**
   ```bash
   docker-compose up --build
   ```

3. **Access the API**
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Local Development Setup

1. **Install dependencies**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Run the API locally**
   ```bash
   python main.py
   ```

## Usage Examples

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Predict cassava disease
curl -X POST "http://localhost:8000/predict/cassava" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@path/to/cassava_image.jpg"

# Get models status
curl http://localhost:8000/models/status
```

### Using Python

```python
import requests

# Upload image for prediction
with open('cassava_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/predict/cassava', files=files)
    
if response.status_code == 200:
    result = response.json()
    print(f"Predicted: {result['predicted_class']}")
    print(f"Confidence: {result['confidence']:.2%}")
```

### Using JavaScript/Fetch

```javascript
// Upload image for prediction
const formData = new FormData();
formData.append('file', imageFile);

fetch('http://localhost:8000/predict/cassava', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(result => {
    console.log(`Predicted: ${result.predicted_class}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
});
```

## Testing

Run the test script to verify API functionality:

```bash
cd api
python test_api.py
```

## Model Information

### Cassava Model
- **Classes**: 5 (bacterial_blight, brown_streak_disease, green_mottle, healthy, mosaic_disease)
- **Input size**: 224x224x3 RGB images
- **Model file**: `models/cassava/cassava_best_model.h5`

### Maize Model  
- **Classes**: 4 (common_rust, gray_leaf_spot, healthy, northern_leaf_blight)
- **Input size**: 224x224x3 RGB images
- **Model file**: `models/maize/maize_best_model.h5`

### Tomato Model
- **Classes**: 10 (bacterial_spot, early_blight, healthy, late_blight, leaf_mold, mosaic_virus, septoria_leaf_spot, spider_mites, target_spot, yellow_leaf_curl_virus)
- **Input size**: 224x224x3 RGB images
- **Model file**: `models/tomato/tomato_best_model.h5`

## Docker Commands

### Build and Run
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f plant-disease-api
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual Container Management
```bash
# Build specific service
docker-compose build plant-disease-api

# Restart specific service
docker-compose restart plant-disease-api

# Execute commands in container
docker-compose exec plant-disease-api bash
```

## Configuration

### Environment Variables
- `PYTHONPATH`: Set to `/app` for proper module imports
- `TF_CPP_MIN_LOG_LEVEL`: Set to `2` to reduce TensorFlow logging

### Port Configuration
- **API Service**: Port 8000
- **Nginx Proxy**: Port 80 (optional)

## Troubleshooting

### Common Issues

1. **Model loading fails**
   - Ensure model files exist in the correct paths
   - Check file permissions
   - Verify TensorFlow version compatibility

2. **Memory issues**
   - Models are loaded into memory on startup
   - Ensure sufficient RAM (recommended: 4GB+)
   - Consider using GPU acceleration for production

3. **Image processing errors**
   - Verify image format (JPEG, PNG supported)
   - Check image file integrity
   - Ensure images are not corrupted

### Logs
```bash
# View API logs
docker-compose logs plant-disease-api

# View nginx logs
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f plant-disease-api
```

## Production Deployment

### Security Considerations
- Configure CORS properly for production
- Use HTTPS with proper SSL certificates
- Implement authentication if needed
- Set appropriate file upload limits

### Scaling
- Use multiple API instances behind a load balancer
- Consider GPU acceleration for faster inference
- Implement caching for frequently accessed models

### Monitoring
- Health check endpoints for monitoring
- Log aggregation and analysis
- Performance metrics collection
- Error tracking and alerting

## License

This project is part of the Verdiscan plant disease detection system.

## Support

For issues and questions, please check the logs and refer to the troubleshooting section above.
