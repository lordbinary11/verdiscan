import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, shouldUseMockService } from '../config/api';

// Response types matching the FastAPI models
export interface PredictionResponse {
  plant_type: string;
  predicted_class: string;
  confidence: number;
  all_probabilities: Record<string, number>;
  image_path?: string;
  imageUri?: string; // Add imageUri for saved results
  processing_time_ms?: number;
  timestamp?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
}

export interface ModelStatusResponse {
  cassava: {
    loaded: boolean;
    classes: string[];
  };
  maize: {
    loaded: boolean;
    classes: string[];
  };
  tomato: {
    loaded: boolean;
    classes: string[];
  };
}

export interface DiseaseDetectionService {
  // Health check
  checkHealth(): Promise<HealthResponse>;
  
  // Get model status
  getModelStatus(): Promise<ModelStatusResponse>;
  
  // Predict disease for specific crop
  predictDisease(cropType: 'cassava' | 'maize' | 'tomato', imageUri: string): Promise<PredictionResponse>;
  
  // Generic prediction endpoint
  predictGeneric(plantType: string, imageUri: string): Promise<PredictionResponse>;
}

class DiseaseDetectionServiceImpl implements DiseaseDetectionService {
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
    return this.makeRequest<HealthResponse>('/health');
  }

  async testImageUpload(): Promise<{ supported: boolean; method: string }> {
    try {
      // Test with a simple base64 string to see what the server accepts
      const testPayload = {
        image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent PNG
        crop_type: 'test'
      };
      
      console.log('Testing JSON image upload support...');
      await this.makeJsonRequest('/predict/cassava', 'POST', testPayload);
      return { supported: true, method: 'json' };
    } catch (error) {
      console.log('JSON upload not supported, server expects FormData');
      return { supported: false, method: 'formdata' };
    }
  }

  async getModelStatus(): Promise<ModelStatusResponse> {
    return this.makeRequest<ModelStatusResponse>('/models/status');
  }

  async predictDisease(
    cropType: 'cassava' | 'maize' | 'tomato', 
    imageUri: string
  ): Promise<PredictionResponse> {
    try {
      console.log(`Starting disease prediction for ${cropType} with image: ${imageUri}`);
      
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
      formData.append('image', { uri: imageUri, name: rnFileName, type: rnMimeType } as any);
      console.log(`Appended RN file object to FormData: ${rnFileName}, type: ${rnMimeType}`);
      
      console.log(`Sending image prediction request to /predict/${cropType}`);
      const result = await this.makeRequest<PredictionResponse>(`/predict/${cropType}`, 'POST', formData);
      
      console.log(`Prediction successful for ${cropType}:`, result);
      return result;
      
    } catch (error) {
      console.error(`Prediction failed for ${cropType}:`, error);
      throw error;
    }
  }

  async predictGeneric(plantType: string, imageUri: string): Promise<PredictionResponse> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Try JSON payload first (most compatible with FastAPI)
      try {
        const base64Image = await this.imageUriToBase64(imageUri);
        
        const jsonPayload = {
          image: base64Image,
          crop_type: plantType
        };
        
        return this.makeJsonRequest<PredictionResponse>(`/predict/${plantType}`, 'POST', jsonPayload);
      } catch (base64Error) {
        // Fallback to FormData with base64
        try {
          const base64Image = await this.blobToBase64(blob);
          
          const formData = new FormData();
          formData.append('image', base64Image);
          
          return this.makeRequest<PredictionResponse>(`/predict/${plantType}`, 'POST', formData);
        } catch (formDataError) {
          // Final fallback to blob upload
          const formData = new FormData();
          
          // Determine file extension and MIME type
          let fileName = 'leaf_image.jpg';
          let mimeType = 'image/jpeg';
          
          if (blob.type) {
            if (blob.type.includes('png')) {
              fileName = 'leaf_image.png';
              mimeType = 'image/png';
            } else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) {
              fileName = 'leaf_image.jpg';
              mimeType = 'image/jpeg';
            }
          }
          
          // Create a new blob with explicit MIME type
          const imageBlob = new Blob([blob], { type: mimeType });
          
          // Append with proper filename and MIME type
          formData.append('image', imageBlob, fileName);
          
          return this.makeRequest<PredictionResponse>(`/predict/${plantType}`, 'POST', formData);
        }
      }
    } catch (error) {
      console.error(`Generic prediction failed for ${plantType}:`, error);
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
      message: 'Plant Disease Detection API is running',
      version: '1.0.0'
    };
  }

  async getModelStatus(): Promise<ModelStatusResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      cassava: {
        loaded: true,
        classes: ['Cassava Mosaic Disease', 'Cassava Brown Streak Disease', 'Green Mottle', 'Healthy']
      },
      maize: {
        loaded: true,
        classes: ['Corn Leaf Blight', 'Common Rust', 'Gray Leaf Spot', 'Healthy']
      },
      tomato: {
        loaded: true,
        classes: ['Early Blight', 'Late Blight', 'Bacterial Spot', 'Leaf Mold', 'Mosaic Virus', 'Septoria Leaf Spot', 'Spider Mites', 'Target Spot', 'Yellow Leaf Curl Virus', 'Healthy']
      }
    };
  }

  async predictDisease(
    cropType: 'cassava' | 'maize' | 'tomato', 
    imageUri: string
  ): Promise<PredictionResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    // Mock predictions based on crop type
    const mockPredictions = {
      cassava: {
        'Cassava Mosaic Disease': 85.2,
        'Cassava Brown Streak Disease': 8.1,
        'Green Mottle': 4.2,
        'Healthy': 2.5
      },
      maize: {
        'Corn Leaf Blight': 94.2,
        'Common Rust': 3.1,
        'Gray Leaf Spot': 1.8,
        'Healthy': 0.9
      },
      tomato: {
        'Early Blight': 78.5,
        'Late Blight': 12.3,
        'Bacterial Spot': 6.8,
        'Healthy': 2.4
      }
    };

    const predictions = mockPredictions[cropType];
    const predictedClass = Object.keys(predictions).reduce((a, b) => 
      predictions[a as keyof typeof predictions] > predictions[b as keyof typeof predictions] ? a : b
    );

    return {
      plant_type: cropType,
      predicted_class: predictedClass,
      confidence: predictions[predictedClass as keyof typeof predictions],
      all_probabilities: predictions,
      processing_time_ms: 2000 + Math.random() * 1000,
      timestamp: new Date().toISOString()
    };
  }

  async predictGeneric(plantType: string, imageUri: string): Promise<PredictionResponse> {
    if (plantType === 'cassava' || plantType === 'maize' || plantType === 'tomato') {
      return this.predictDisease(plantType as 'cassava' | 'maize' | 'tomato', imageUri);
    }
    
    throw new Error(`Unsupported plant type: ${plantType}`);
  }
}

// Export the service instance based on configuration
export const diseaseDetectionService: DiseaseDetectionService = shouldUseMockService()
  ? new MockDiseaseDetectionService() 
  : new DiseaseDetectionServiceImpl();

// Export individual services for manual switching
export const mockDiseaseDetectionService: DiseaseDetectionService = new MockDiseaseDetectionService();
export const realDiseaseDetectionService: DiseaseDetectionService = new DiseaseDetectionServiceImpl();
