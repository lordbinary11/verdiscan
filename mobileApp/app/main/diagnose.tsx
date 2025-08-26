import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Stop } from 'react-native-svg';
import ImageCapture from '../../components/ImageCapture';
import { diseaseDetectionService } from '../../services/diseaseDetectionService';
import { shouldUseMockService } from '../../config/api';

interface CropOption {
  id: string;
  name: string;
  scientificName: string;
  image: any;
  description: string;
}

const cropOptions: CropOption[] = [
  {
    id: 'cassava',
    name: 'Cassava',
    scientificName: 'Manihot esculenta',
    image: require('../../assets/images/cassava_healthy.jpeg'),
    description: 'Detect diseases like mosaic disease, brown streak, and green mottle'
  },
  {
    id: 'maize',
    name: 'Maize',
    scientificName: 'Zea mays',
    image: require('../../assets/images/maize_healthy1.jpeg'),
    description: 'Identify blight, common rust, and gray leaf spot'
  },
  {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    image: require('../../assets/images/thealthy1.jpeg'),
    description: 'Detect early blight, late blight, and other tomato diseases'
  }
];

export default function DiagnoseScreen() {
  const [selectedCrop, setSelectedCrop] = useState<CropOption | null>(null);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cleanup effect to reset state when component mounts
  useEffect(() => {
    // Reset all state when component mounts
    setSelectedCrop(null);
    setShowCameraOptions(false);
    setShowImageCapture(false);
    setIsProcessing(false);
  }, []);

  const handleCropSelection = (crop: CropOption) => {
    setSelectedCrop(crop);
    setShowCameraOptions(true);
  };

  const handleCameraPress = () => {
    if (!selectedCrop) return;
    setShowImageCapture(true);
  };

  const handleGalleryPress = () => {
    if (!selectedCrop) return;
    setShowImageCapture(true);
  };

  const handleBackToCropSelection = () => {
    setSelectedCrop(null);
    setShowCameraOptions(false);
  };

  const handleImageSelected = async (imageUri: string) => {
    if (!selectedCrop) return;

    setIsProcessing(true);
    
    try {
      console.log(`Starting disease detection for ${selectedCrop.name} (${selectedCrop.id})`);
      
      // Call the disease detection service
      const result = await diseaseDetectionService.predictDisease(
        selectedCrop.id as 'cassava' | 'maize' | 'tomato',
        imageUri
      );

      console.log('Disease detection successful:', result);

      // Navigate to result page with the detection result
      router.push({
        pathname: '/result',
        params: { 
          cropType: selectedCrop.id,
          cropName: selectedCrop.name,
          resultData: JSON.stringify(result),
          imageUri: imageUri,
          timestamp: Date.now().toString() // Add unique timestamp to force refresh
        }
      });
    } catch (error) {
      console.error('Disease detection failed:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to analyze the image. Please try again with a different image.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch image')) {
          errorMessage = 'Failed to process the selected image. Please try selecting a different image.';
        } else if (error.message.includes('HTTP error')) {
          if (error.message.includes('status: 500')) {
            errorMessage = 'Server error occurred. Please try again later.';
          } else if (error.message.includes('status: 404')) {
            errorMessage = 'API endpoint not found. Please check your connection.';
          } else if (error.message.includes('status: 422')) {
            errorMessage = 'Invalid image format. Please try with a different image.';
          } else {
            errorMessage = `Server error (${error.message}). Please try again.`;
          }
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        }
      }
      
      Alert.alert(
        'Detection Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseImageCapture = () => {
    setShowImageCapture(false);
  };

  const handleHealthCheck = async () => {
    try {
      const health = await diseaseDetectionService.checkHealth();
      Alert.alert(
        'API Status',
        `✅ API is healthy!\n\nStatus: ${health.status}\nMessage: ${health.message}\nVersion: ${health.version}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Health check failed:', error);
      Alert.alert(
        'API Status',
        `❌ API connection failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your server connection.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identify</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleHealthCheck} style={styles.healthCheckButton}>
            <Ionicons name="wifi" size={wp(5)} color={shouldUseMockService() ? "#FFA726" : "#4CAF50"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Plant Identification Section */}
        <View style={styles.identificationSection}>
          <View style={styles.ellipseContainer}>
            <Svg width={wp(80)} height={hp(25)} viewBox="0 0 401 396">
              <Defs>
                <LinearGradient id="paint0_linear_205_401" x1="201" y1="366" x2="201" y2="-147" gradientUnits="userSpaceOnUse">
                  <Stop stopColor="#F8F9FA" />
                  <Stop offset="0.377461" stopColor="#B9DEBC" />
                  <Stop offset="1" stopColor="#4CAF50" />
                </LinearGradient>
              </Defs>
              <Ellipse cx="200.5" cy="198" rx="200.5" ry="198" fill="url(#paint0_linear_205_401)" />
            </Svg>
            <View style={styles.plantImageContainer}>
              <Image 
                source={selectedCrop ? selectedCrop.image : require('../../assets/images/tmt.png')} 
                style={styles.plantImage}
              />
            </View>
          </View>
          <View style={styles.identificationText}>
            <Text style={styles.subText}>
              {selectedCrop 
                ? `Ready to scan ${selectedCrop.name} leaves for diseases!`
                : 'Select a crop to scan for diseases. Our AI will analyze the leaves and provide detailed disease detection results.'
              }
            </Text>
          </View>
        </View>

        {/* Crop Selection Section */}
        {!showCameraOptions && (
          <View style={styles.cropSelectionSection}>
            <Text style={styles.sectionTitle}>Select Crop to Scan</Text>
            <View style={styles.cropOptions}>
              {cropOptions.map((crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={styles.cropOption}
                  onPress={() => handleCropSelection(crop)}
                >
                  <Image source={crop.image} style={styles.cropImage} />
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <Text style={styles.cropScientificName}>{crop.scientificName}</Text>
                    <Text style={styles.cropDescription}>{crop.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={wp(5)} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Camera Options Section */}
        {showCameraOptions && selectedCrop && (
          <View style={styles.cameraOptionsSection}>
            <View style={styles.selectedCropInfo}>
              <Image source={selectedCrop.image} style={styles.selectedCropImage} />
              <View style={styles.selectedCropText}>
                <Text style={styles.selectedCropName}>{selectedCrop.name}</Text>
                <Text style={styles.selectedCropScientificName}>{selectedCrop.scientificName}</Text>
              </View>
              <TouchableOpacity onPress={handleBackToCropSelection} style={styles.changeCropButton}>
                <Text style={styles.changeCropText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={wp(5)} color="#000" />
                <Text style={styles.tipsTitle}>Tips for accurate detection</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>1. Ensure the leaf is well-lit and centered in the photo.</Text>
                <Text style={styles.tipItem}>2. Avoid blurry images for accurate results.</Text>
                <Text style={styles.tipItem}>3. Try to capture a clear shot of the affected leaves.</Text>
                <Text style={styles.tipItem}>4. Include both healthy and diseased parts if possible.</Text>
              </View>
            </View>

            {/* Processing Status */}
            {isProcessing && (
              <View style={styles.processingStatus}>
                <View style={styles.processingIndicator}>
                  <Ionicons name="analytics" size={wp(5)} color="#4CAF50" />
                  <Text style={styles.processingText}>Analyzing leaf image...</Text>
                </View>
                <Text style={styles.processingSubtext}>
                  This may take a few moments. Please wait.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, isProcessing && styles.actionButtonDisabled]} 
                onPress={handleCameraPress}
                disabled={isProcessing}
              >
                <Ionicons name="camera" size={wp(5.5)} color="#fff" />
                <Text style={styles.buttonText}>
                  {isProcessing ? 'Analyzing...' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, isProcessing && styles.actionButtonDisabled]} 
                onPress={handleGalleryPress}
                disabled={isProcessing}
              >
                <Ionicons name="images" size={wp(5.5)} color="#fff" />
                <Text style={styles.buttonText}>
                  {isProcessing ? 'Analyzing...' : 'Choose from Gallery'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Image Capture Modal */}
      <ImageCapture
        key={`${selectedCrop?.id}-${Date.now()}`}
        visible={showImageCapture}
        onImageSelected={handleImageSelected}
        onClose={handleCloseImageCapture}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(8),
    paddingBottom: hp(2),
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  scrollContent: {
    flex: 1,
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: wp(3),
  },
  healthCheckButton: {
    padding: wp(2),
  },
  identificationSection: {
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  ellipseContainer: {
    width: wp(80),
    height: hp(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    position: 'relative',
  },
  plantImageContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
  },
  plantImage: {
    width: wp(40),
    height: wp(40),
    resizeMode: 'contain',
  },
  identificationText: {
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  subText: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    lineHeight: hp(3),
  },
  cropSelectionSection: {
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  cropOptions: {
    gap: hp(2),
  },
  cropOption: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cropImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  cropScientificName: {
    fontSize: wp(3.5),
    color: '#666',
    fontStyle: 'italic',
    marginBottom: hp(0.5),
  },
  cropDescription: {
    fontSize: wp(3.5),
    color: '#666',
    lineHeight: hp(2.5),
  },
  cameraOptionsSection: {
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  selectedCropInfo: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(3),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCropImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  selectedCropText: {
    flex: 1,
  },
  selectedCropName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  selectedCropScientificName: {
    fontSize: wp(3.5),
    color: '#666',
    fontStyle: 'italic',
  },
  changeCropButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: wp(3),
    paddingVertical: wp(2),
    borderRadius: wp(2),
  },
  changeCropText: {
    color: '#666',
    fontSize: wp(3.5),
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#fff',
    marginBottom: hp(3),
    borderRadius: wp(3),
    padding: wp(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  tipsTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#000',
    marginLeft: wp(2),
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: hp(2),
  },
  tipsList: {
    gap: hp(1),
  },
  tipItem: {
    fontSize: wp(4),
    color: '#000',
    lineHeight: hp(2.5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Math.max(wp(3), 12), // Minimum gap of 12px
    paddingHorizontal: wp(2),
    marginTop: hp(2),
    marginBottom: hp(1),
    width: '100%',
    maxWidth: Math.min(wp(90), 600), // Maximum width for tablets
    alignSelf: 'center',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: wp(8),
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: wp(2.5),
    minHeight: hp(7),
    minWidth: wp(35),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: Math.max(wp(3.8), 14), // Minimum font size of 14
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: hp(2.2),
  },
  processingStatus: {
    backgroundColor: '#E8F5E8',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(3),
    alignItems: 'center',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  processingText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: wp(2),
  },
  processingSubtext: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: hp(4),
  },
});