# Verdiscan Mobile App

A React Native mobile application for plant disease detection using AI models. The app can detect diseases in cassava, maize, and tomato plants by analyzing leaf images.

## Features

### 1. Crop Selection
- Users can select from three supported crops:
  - **Cassava** (Manihot esculenta)
  - **Maize** (Zea mays) 
  - **Tomato** (Solanum lycopersicum)

### 2. Image Capture
- **Camera Integration**: Take photos directly using the device camera
- **Gallery Selection**: Choose existing images from the device gallery
- **Image Preview**: Review and retake images before analysis

### 3. Disease Detection
- **AI Analysis**: Uses machine learning models to detect plant diseases
- **Real-time Results**: Provides immediate disease detection results
- **Confidence Scoring**: Shows confidence levels for each detected disease

### 4. Comprehensive Results
- **Disease Information**: Detailed symptoms and affected areas
- **Treatment Recommendations**: Actionable advice for disease management
- **Probability Distribution**: Shows confidence for all possible diseases
- **Processing Metrics**: Includes analysis time and model performance

### 5. Result Management
- **Save Results**: Save important detection results for future reference
- **Result History**: Access previously saved results
- **Share Results**: Export and share detection results

## Supported Diseases

### Cassava
- Cassava Mosaic Disease
- Cassava Brown Streak Disease
- Green Mottle
- Healthy

### Maize
- Corn Leaf Blight
- Common Rust
- Gray Leaf Spot
- Healthy

### Tomato
- Early Blight
- Late Blight
- Bacterial Spot
- Leaf Mold
- Mosaic Virus
- Septoria Leaf Spot
- Spider Mites
- Target Spot
- Yellow Leaf Curl Virus
- Healthy

## Technical Architecture

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript development
- **CSS-in-JS**: Styled components for UI

### Backend Integration
- **FastAPI**: Python-based REST API
- **Docker**: Containerized deployment
- **Machine Learning**: TensorFlow.js models for disease detection

### API Endpoints
- `GET /health` - Health check
- `GET /models/status` - Model availability status
- `POST /predict/cassava` - Cassava disease prediction
- `POST /predict/maize` - Maize disease prediction
- `POST /predict/tomato` - Tomato disease prediction
- `POST /predict/{plant_type}` - Generic plant prediction

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd verdiscan/mobileApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   ```

### Environment Configuration

The app is configured to work with a local FastAPI backend by default. To change the API endpoint:

1. Edit `services/diseaseDetectionService.ts`
2. Update `API_BASE_URL` to point to your backend
3. Switch from `MockDiseaseDetectionService` to `realDiseaseDetectionService`

## Usage Flow

1. **Launch App**: Open the Verdiscan app
2. **Select Crop**: Choose the plant type you want to analyze
3. **Capture Image**: Take a photo or select from gallery
4. **Review Image**: Confirm the image is suitable for analysis
5. **Analyze**: AI processes the image for disease detection
6. **View Results**: See detailed disease information and recommendations
7. **Save Results**: Optionally save results for future reference

## Development Notes

### Mock vs Real Service
- **Development**: Uses `MockDiseaseDetectionService` for testing
- **Production**: Switch to `realDiseaseDetectionService` for live API calls

### Image Processing
- Images are processed at 4:3 aspect ratio
- Quality is optimized for analysis (80% quality)
- Supports both camera capture and gallery selection

### Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Retry mechanisms for failed requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions, please open an issue in the repository or contact the development team.
