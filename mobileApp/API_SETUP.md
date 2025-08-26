# API Setup Guide

This guide explains how to switch from mock data to the real FastAPI backend for plant disease detection.

## Quick Setup

### 1. Update API Configuration

Edit `config/api.ts` and set:
```typescript
USE_MOCK_SERVICE: false,  // Change from true to false
```

### 2. Update API Base URL

In `config/api.ts`, update the `API_BASE_URL` to match your FastAPI server:

```typescript
// For local development
API_BASE_URL: 'http://localhost:8000'

// For Android emulator
API_BASE_URL: 'http://10.0.2.2:8000'

// For physical device on same network
API_BASE_URL: 'http://192.168.1.100:8000'  // Replace with your server's IP

// For your specific setup (if different)
API_BASE_URL: 'http://172.20.10.1:8000'
```

## FastAPI Server Requirements

Your FastAPI server should have these endpoints:

- `GET /health` - Health check
- `GET /models/status` - Model loading status
- `POST /predict/cassava` - Cassava disease prediction
- `POST /predict/maize` - Maize disease prediction  
- `POST /predict/tomato` - Tomato disease prediction
- `POST /predict/{plant_type}` - Generic prediction endpoint

## Testing the Connection

1. **Start your FastAPI server** (make sure it's running on the configured port)
2. **Update the API_BASE_URL** in `config/api.ts`
3. **Set `USE_MOCK_SERVICE: false`**
4. **Test the app** - try scanning a plant leaf

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if FastAPI server is running
   - Verify the port number (default: 8000)
   - Check firewall settings

2. **Network Error**
   - Ensure device and server are on same network
   - Try using the server's actual IP address
   - Check if server accepts external connections

3. **CORS Errors**
   - FastAPI server needs CORS middleware enabled
   - Add this to your FastAPI app:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Debug Mode

Enable detailed logging by checking the console output. The app will log:
- API request URLs
- Response status codes
- Error messages
- Processing steps

## Switching Back to Mock

If you need to use mock data again:

```typescript
// In config/api.ts
USE_MOCK_SERVICE: true
```

## API Response Format

The FastAPI endpoints should return data in this format:

```json
{
  "plant_type": "maize",
  "predicted_class": "Corn Leaf Blight",
  "confidence": 94.2,
  "all_probabilities": {
    "Corn Leaf Blight": 94.2,
    "Common Rust": 3.1,
    "Gray Leaf Spot": 1.8,
    "Healthy": 0.9
  },
  "processing_time_ms": 2300,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Performance Notes

- Real API calls may take 2-5 seconds depending on image size and server performance
- The app shows a loading indicator during processing
- Large images (>5MB) may cause timeouts - consider image compression on the server
