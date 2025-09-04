# 🌾 Crop Disease Detection API

A FastAPI-based REST API service that provides AI-powered crop disease detection for cassava, maize, and tomato crops using pre-trained deep learning models.

## 🚀 Features

- **Multi-Crop Support**: Detect diseases in cassava, maize, and tomato
- **Real-time Inference**: Fast prediction using optimized models
- **RESTful API**: Easy integration with any frontend application
- **CORS Enabled**: Ready for React Native and web applications
- **Auto-detection**: Experimental endpoint that tries all crop types
- **Health Monitoring**: Built-in health check endpoints

## 📋 API Endpoints

### Base URL
```
http://localhost:8000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information and available endpoints |
| `GET` | `/health` | Health check and model status |
| `POST` | `/detect/cassava` | Detect diseases in cassava leaves |
| `POST` | `/detect/maize` | Detect diseases in maize leaves |
| `POST` | `/detect/tomato` | Detect diseases in tomato leaves |
| `POST` | `/detect/auto` | Auto-detect crop type and disease |

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- TensorFlow 2.10+
- Your trained models in `.h5` format

### 1. Install Dependencies
```bash
cd api
pip install -r requirements.txt
```

### 2. Model Placement
Ensure your trained models are in the correct locations:
```
models/
├── cassava/
│   └── cassava_best_model.h5
├── maize/
│   └── maize_best_model.h5
└── tomato/
    └── tomato_best_model.h5
```

### 3. Start the API Server
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 📱 React Native Integration

### 1. Install Required Packages
```bash
expo install expo-image-picker
expo install expo-file-system
```

### 2. Example Usage
```javascript
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const detectDisease = async (cropType) => {
  try {
    // Pick image from camera or gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'leaf_image.jpg',
      });

      // Make API request
      const response = await fetch(`http://YOUR_API_URL/detect/${cropType}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      console.log('Detection result:', result);
    }
  } catch (error) {
    console.error('Error detecting disease:', error);
  }
};
```

## 🔧 API Response Format

### Successful Response
```json
{
  "crop_type": "tomato",
  "predicted_disease": "healthy",
  "confidence": 0.95,
  "all_probabilities": {
    "bacterial_spot": 0.01,
    "early_blight": 0.02,
    "healthy": 0.95,
    "late_blight": 0.01,
    "leaf_mold": 0.01
  },
  "status": "healthy"
}
```

### Error Response
```json
{
  "detail": "Error message description"
}
```

## 🧪 Testing

### 1. Test the API
```bash
python test_api.py
```

### 2. Manual Testing with curl
```bash
# Health check
curl http://localhost:8000/health

# Test cassava detection
curl -X POST "http://localhost:8000/detect/cassava" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/image.jpg"
```

## 🌐 Production Deployment

### 1. Environment Variables
```bash
export API_HOST=0.0.0.0
export API_PORT=8000
export CORS_ORIGINS=https://yourapp.com
```

### 2. Using Gunicorn (Recommended for production)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 3. Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
COPY ../models ./models

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 Model Performance

| Crop | Model Size | Accuracy | Classes |
|------|------------|----------|---------|
| Cassava | ~27MB | 83% | 5 |
| Maize | ~27MB | 95.45% | 4 |
| Tomato | ~27MB | 95% | 10 |

## 🔍 Troubleshooting

### Common Issues

1. **Models not loading**: Check file paths and ensure models exist
2. **Memory issues**: Reduce batch size or use model quantization
3. **CORS errors**: Verify CORS settings in production
4. **Slow inference**: Consider model optimization or GPU acceleration

### Performance Tips

- Use model quantization for faster inference
- Implement caching for repeated requests
- Consider batch processing for multiple images
- Monitor API response times and optimize accordingly

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
