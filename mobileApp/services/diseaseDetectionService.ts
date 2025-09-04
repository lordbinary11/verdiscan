import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, shouldUseMockService } from '../config/api';

// Response types matching the FastAPI models
export interface PredictionResponse {
  crop_type: string;
  predicted_disease: string;
  confidence: number;
  all_probabilities: Record<string, number>;
  status: string;
  image_path?: string;
  imageUri?: string; // Add imageUri for saved results
  processing_time_ms?: number;
  timestamp?: string;
  
  // Legacy fields for backward compatibility
  plant_type?: string;
  predicted_class?: string;
}

export interface HealthResponse {
  status: string;
  models_loaded: number;
  available_crops: string[];
  message?: string;
  version?: string;
}


export interface DiseaseDetectionService {
  // Health check
  checkHealth(): Promise<HealthResponse>;
  
  // Detect disease for specific crop
  detectDisease(cropType: 'cassava' | 'maize' | 'tomato', imageUri: string): Promise<PredictionResponse>;
  
  // Auto-detect crop type and disease
  detectAuto(imageUri: string): Promise<PredictionResponse>;
}

// Utility class for disease name formatting
class DiseaseNameFormatter {
  static formatDiseaseNameForDisplay(diseaseName: string): string {
    // Convert snake_case API disease names to human-readable format
    const diseaseNameMap: Record<string, string> = {
      // Cassava diseases - matching exact disease database keys
      'bacterial_blight': 'Bacterial Blight',
      'brown_streak_disease': 'Cassava Brown Streak Disease',
      'green_mottle': 'Green Mottle',
      'mosaic_disease': 'Cassava Mosaic Disease',
      'healthy': 'Healthy',
      
      // Maize diseases - matching exact disease database keys
      'blight': 'Corn Leaf Blight',
      'common_rust': 'Common Rust',
      'gray_leaf_spot': 'Gray Leaf Spot',
      
      // Tomato diseases - matching exact disease database keys
      'bacterial_spot': 'Bacterial Spot',
      'early_blight': 'Early Blight',
      'late_blight': 'Late Blight',
      'leaf_mold': 'Leaf Mold',
      'mosaic_virus': 'Mosaic Virus',
      'septoria_spot': 'Septoria Spot',
      'spider_mites': 'Spider Mites',
      'target_spot': 'Target Spot',
      'yellow_leaf_curl_virus': 'Yellow Leaf Curl Virus'
    };
    
    return diseaseNameMap[diseaseName] || diseaseName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  static transformAllProbabilities(probabilities: Record<string, number>): Record<string, number> {
    // Transform all probability keys from snake_case to human-readable format and round to 2 decimal places
    const transformed: Record<string, number> = {};
    for (const [key, value] of Object.entries(probabilities)) {
      transformed[this.formatDiseaseNameForDisplay(key)] = Math.round(value * 100) / 100;
    }
    return transformed;
  }
}

class DiseaseDetectionServiceImpl implements DiseaseDetectionService {

  private transformResponse(response: any): PredictionResponse {
    // Transform API response to match expected format
    const formattedDiseaseName = DiseaseNameFormatter.formatDiseaseNameForDisplay(response.predicted_disease);
    const formattedProbabilities = DiseaseNameFormatter.transformAllProbabilities(response.all_probabilities);
    
    return {
      crop_type: response.crop_type,
      predicted_disease: response.predicted_disease,
      confidence: Math.round(response.confidence * 100) / 100,
      all_probabilities: formattedProbabilities,
      status: response.status,
      // Add legacy fields for backward compatibility with human-readable names
      plant_type: response.crop_type,
      predicted_class: formattedDiseaseName,
      processing_time_ms: response.processing_time_ms,
      timestamp: response.timestamp || new Date().toISOString(),
      imageUri: response.imageUri
    };
  }
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    body?: FormData
  ): Promise<T> {
    try {
      const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
      console.log(`Making ${method} request to: ${url}`);
      
      const options: RequestInit = {
        method,
        headers: {},
      };

      if (body) {
        options.body = body;
        console.log('Request includes FormData with image');
      }

      const response = await fetch(url, options);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`API response for ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async makeJsonRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    body?: any
  ): Promise<T> {
    try {
      const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
      console.log(`Making ${method} JSON request to: ${url}`);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
        console.log('Request includes JSON payload with image');
      }

      const response = await fetch(url, options);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`API response for ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.makeRequest<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  }


  async detectDisease(
    cropType: 'cassava' | 'maize' | 'tomato', 
    imageUri: string
  ): Promise<PredictionResponse> {
    try {
      console.log(`Starting disease detection for ${cropType} with image: ${imageUri}`);
      
      // Convert image URI to blob and ensure proper formatting
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log(`Image converted to blob, size: ${blob.size} bytes, type: ${blob.type}`);
      
      // Create a properly formatted file for upload
      const imageFile = await this.createImageFile(blob, cropType);
      console.log(`Created image file: ${imageFile instanceof File ? imageFile.name : 'blob'}, type: ${imageFile.type}, size: ${imageFile.size}`);
      
      // Create FormData for React Native compatibility
      const formData = new FormData();
      
      // Prefer RN-friendly URI FormData entry to avoid Blob serialization issues
      const { fileName: rnFileName, mimeType: rnMimeType } = this.deriveFileMetaFromUri(imageUri, cropType, imageFile.type);
      formData.append('file', { uri: imageUri, name: rnFileName, type: rnMimeType } as any);
      console.log(`Appended RN file object to FormData: ${rnFileName}, type: ${rnMimeType}`);
      
      // Get the appropriate endpoint
      const endpoint = cropType === 'cassava' ? API_CONFIG.ENDPOINTS.DETECT_CASSAVA :
                      cropType === 'maize' ? API_CONFIG.ENDPOINTS.DETECT_MAIZE :
                      API_CONFIG.ENDPOINTS.DETECT_TOMATO;
      
      console.log(`Sending image detection request to ${endpoint}`);
      const apiResponse = await this.makeRequest<any>(endpoint, 'POST', formData);
      
      console.log(`Detection successful for ${cropType}:`, apiResponse);
      const result = this.transformResponse(apiResponse);
      result.imageUri = imageUri; // Preserve the original image URI
      return result;
      
    } catch (error) {
      console.error(`Detection failed for ${cropType}:`, error);
      throw error;
    }
  }

  async detectAuto(imageUri: string): Promise<PredictionResponse> {
    try {
      console.log(`Starting auto-detection with image: ${imageUri}`);
      
      // Convert image URI to blob and ensure proper formatting
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log(`Image converted to blob, size: ${blob.size} bytes, type: ${blob.type}`);
      
      // Create a properly formatted file for upload
      const imageFile = await this.createImageFile(blob, 'auto');
      console.log(`Created image file: ${imageFile instanceof File ? imageFile.name : 'blob'}, type: ${imageFile.type}, size: ${imageFile.size}`);
      
      // Create FormData for React Native compatibility
      const formData = new FormData();
      
      // Prefer RN-friendly URI FormData entry to avoid Blob serialization issues
      const { fileName: rnFileName, mimeType: rnMimeType } = this.deriveFileMetaFromUri(imageUri, 'auto', imageFile.type);
      formData.append('file', { uri: imageUri, name: rnFileName, type: rnMimeType } as any);
      console.log(`Appended RN file object to FormData: ${rnFileName}, type: ${rnMimeType}`);
      
      console.log(`Sending image auto-detection request to ${API_CONFIG.ENDPOINTS.DETECT_AUTO}`);
      const apiResponse = await this.makeRequest<any>(API_CONFIG.ENDPOINTS.DETECT_AUTO, 'POST', formData);
      
      console.log(`Auto-detection successful:`, apiResponse);
      
      // Find the result with the highest confidence
      let bestResult = null;
      let highestConfidence = 0;
      
      if (apiResponse.results) {
        for (const [cropType, result] of Object.entries(apiResponse.results)) {
          if (result && typeof result === 'object' && 'confidence' in result) {
            const confidence = (result as any).confidence;
            if (confidence > highestConfidence) {
              highestConfidence = confidence;
              bestResult = result;
            }
          }
        }
      }
      
      if (!bestResult) {
        throw new Error('No valid prediction found in auto-detection response');
      }
      
      const transformedResult = this.transformResponse(bestResult);
      transformedResult.imageUri = imageUri; // Preserve the original image URI
      return transformedResult;
      
    } catch (error) {
      console.error(`Auto-detection failed:`, error);
      throw error;
    }
  }
  
  // Helper method to convert blob to base64 (alternative approach if needed)
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Remove data:image/jpeg;base64, prefix if present
            const base64 = reader.result.split(',')[1] || reader.result;
            console.log(`Base64 conversion successful, length: ${base64.length}`);
            resolve(base64);
          } else {
            reject(new Error('Failed to convert blob to base64 - invalid result type'));
          }
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(new Error(`FileReader failed: ${error}`));
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Base64 conversion error:', error);
        reject(new Error(`Base64 conversion failed: ${error}`));
      }
    });
  }
  
  // Alternative method: Convert image URI directly to base64
  private async imageUriToBase64(imageUri: string): Promise<string> {
    try {
      // For file:// URIs, try to read as base64 directly
      if (imageUri.startsWith('file://')) {
        console.log('Attempting direct file read for base64 conversion...');
        const response = await fetch(imageUri);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to base64 manually
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        console.log(`Direct base64 conversion successful, length: ${base64.length}`);
        return base64;
      }
      
      throw new Error('Unsupported URI scheme for direct conversion');
    } catch (error) {
      console.error('Direct base64 conversion failed:', error);
      throw error;
    }
  }

  // Helper method to create a properly formatted image file
  private async createImageFile(blob: Blob, cropType: string): Promise<Blob> {
    // Determine proper file extension and MIME type
    let fileName = `leaf_image_${cropType}.jpg`;
    let mimeType = 'image/jpeg';
    
    if (blob.type) {
      if (blob.type.includes('png')) {
        fileName = `leaf_image_${cropType}.png`;
        mimeType = 'image/png';
      } else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) {
        fileName = `leaf_image_${cropType}.jpg`;
        mimeType = 'image/jpeg';
      } else if (blob.type.includes('webp')) {
        fileName = `leaf_image_${cropType}.webp`;
        mimeType = 'image/webp';
      }
    }
    
    console.log(`Creating image file: ${fileName}, MIME type: ${mimeType}, blob size: ${blob.size}`);
    
    // For React Native, always use Blob directly instead of File constructor
    // File constructor in React Native can cause transmission issues
    const imageBlob = new Blob([blob], { type: mimeType });
    console.log(`New blob created: type=${imageBlob.type}, size=${imageBlob.size}`);
    
    // In React Native, use Blob directly - it's more reliable for HTTP transmission
    console.log('Using Blob directly for React Native compatibility');
    console.log(`Final blob: type=${imageBlob.type}, size=${imageBlob.size}`);
    
    // Verify the blob content
    this.verifyBlobContent(imageBlob);
    
    return imageBlob;
  }

  // Helper method to derive file metadata from URI
  private deriveFileMetaFromUri(imageUri: string, cropType: string, fallbackMime: string): { fileName: string; mimeType: string } {
    try {
      let mimeType = fallbackMime || 'image/jpeg';
      let extension = 'jpg';
      const lower = imageUri.toLowerCase();
      if (lower.includes('.png') || mimeType.includes('png')) {
        extension = 'png';
        mimeType = 'image/png';
      } else if (lower.includes('.webp') || mimeType.includes('webp')) {
        extension = 'webp';
        mimeType = 'image/webp';
      } else {
        extension = 'jpg';
        mimeType = 'image/jpeg';
      }
      const fileName = `leaf_image_${cropType}.${extension}`;
      return { fileName, mimeType };
    } catch {
      return { fileName: `leaf_image_${cropType}.jpg`, mimeType: 'image/jpeg' };
    }
  }

  // Helper method to verify file content
  private verifyFileContent(file: File): void {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      console.log(`File content verified: ${arrayBuffer.byteLength} bytes`);
      this.verifyImageSignature(arrayBuffer);
    };
    
    fileReader.onerror = (error) => {
      console.error('FileReader error:', error);
    };
    
    fileReader.readAsArrayBuffer(file);
  }

  // Helper method to verify blob content
  private verifyBlobContent(blob: Blob): void {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      console.log(`Blob content verified: ${arrayBuffer.byteLength} bytes`);
      this.verifyImageSignature(arrayBuffer);
    };
    
    fileReader.onerror = (error) => {
      console.error('FileReader error:', error);
    };
    
    fileReader.readAsArrayBuffer(blob);
  }

  // Helper method to verify image signature
  private verifyImageSignature(arrayBuffer: ArrayBuffer): void {
    if (arrayBuffer.byteLength > 0) {
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
      console.log(`File header (first 4 bytes): ${header}`);
      
      // Check for common image file signatures
      if (header.startsWith('ffd8')) {
        console.log('✓ Valid JPEG signature detected');
      } else if (header.startsWith('89504e47')) {
        console.log('✓ Valid PNG signature detected');
      } else if (header.startsWith('52494646')) {
        console.log('✓ Valid WebP signature detected');
      } else {
        console.log('⚠ Unknown file signature - may not be a valid image');
      }
    }
  }
}

// Mock service for development/testing
export class MockDiseaseDetectionService implements DiseaseDetectionService {
  async checkHealth(): Promise<HealthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'healthy',
      models_loaded: 3,
      available_crops: ['cassava', 'maize', 'tomato'],
      message: 'Plant Disease Detection API is running',
      version: '1.0.0'
    };
  }


  async detectDisease(
    cropType: 'cassava' | 'maize' | 'tomato', 
    imageUri: string
  ): Promise<PredictionResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    // Mock predictions based on crop type - matching exact API class names
    const mockPredictions = {
      cassava: {
        'mosaic_disease': 85.2,
        'brown_streak_disease': 8.1,
        'green_mottle': 4.2,
        'bacterial_blight': 1.0,
        'healthy': 2.5
      },
      maize: {
        'blight': 94.2,
        'common_rust': 3.1,
        'gray_leaf_spot': 1.8,
        'healthy': 0.9
      },
      tomato: {
        'early_blight': 78.5,
        'late_blight': 12.3,
        'bacterial_spot': 6.8,
        'leaf_mold': 1.2,
        'mosaic_virus': 0.8,
        'septoria_spot': 0.5,
        'spider_mites': 0.3,
        'target_spot': 0.2,
        'yellow_leaf_curl_virus': 0.1,
        'healthy': 2.4
      }
    };

    const predictions = mockPredictions[cropType];
    const predictedClass = Object.keys(predictions).reduce((a, b) => 
      predictions[a as keyof typeof predictions] > predictions[b as keyof typeof predictions] ? a : b
    );

    // Use the formatter utility to convert disease names for display
    const formattedDiseaseName = DiseaseNameFormatter.formatDiseaseNameForDisplay(predictedClass);
    const formattedProbabilities = DiseaseNameFormatter.transformAllProbabilities(predictions);

    return {
      crop_type: cropType,
      predicted_disease: predictedClass,
      confidence: Math.round(predictions[predictedClass as keyof typeof predictions] * 100) / 100,
      all_probabilities: formattedProbabilities,
      status: predictedClass === 'healthy' ? 'healthy' : 'diseased',
      processing_time_ms: Math.round((2000 + Math.random() * 1000) * 100) / 100,
      timestamp: new Date().toISOString(),
      // Legacy fields for backward compatibility with human-readable names
      plant_type: cropType,
      predicted_class: formattedDiseaseName
    };
  }

  async detectAuto(imageUri: string): Promise<PredictionResponse> {
    // Simulate processing time for auto-detection
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 1000));
    
    // Randomly select a crop type for auto-detection simulation
    const cropTypes: ('cassava' | 'maize' | 'tomato')[] = ['cassava', 'maize', 'tomato'];
    const randomCropType = cropTypes[Math.floor(Math.random() * cropTypes.length)];
    
    console.log(`Mock auto-detection selected crop type: ${randomCropType}`);
    
    // Use the existing detectDisease method with the randomly selected crop
    return this.detectDisease(randomCropType, imageUri);
  }
}

// Export the service instance based on configuration
export const diseaseDetectionService: DiseaseDetectionService = shouldUseMockService()
  ? new MockDiseaseDetectionService() 
  : new DiseaseDetectionServiceImpl();

// Export individual services for manual switching
export const mockDiseaseDetectionService: DiseaseDetectionService = new MockDiseaseDetectionService();
export const realDiseaseDetectionService: DiseaseDetectionService = new DiseaseDetectionServiceImpl();

// Export the formatter utility for use in other components
export { DiseaseNameFormatter };



