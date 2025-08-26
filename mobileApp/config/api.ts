// API Configuration
export const API_CONFIG = {
  // Set to true to use mock service, false for real API
  USE_MOCK_SERVICE: false,
  
  // FastAPI server URL - update this to your actual server
  API_BASE_URL: 'http://10.42.0.62:8000',
  
  // Alternative URLs for different environments
  // API_BASE_URL: 'http://192.168.1.100:8000', // Local network
  // API_BASE_URL: 'http://10.0.2.2:8000', // Android emulator
  // API_BASE_URL: 'http://172.20.10.1:8000', // Your specific IP
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    MODEL_STATUS: '/models/status',
    PREDICT_CASSAVA: '/predict/cassava',
    PREDICT_MAIZE: '/predict/maize',
    PREDICT_TOMATO: '/predict/tomato',
    PREDICT_GENERIC: '/predict/{plant_type}',
  },
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

// Helper function to check if mock service should be used
export const shouldUseMockService = (): boolean => {
  return API_CONFIG.USE_MOCK_SERVICE;
};
