import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import { hp, wp } from '@/helpers/dimentions';

interface ImageCaptureProps {
  onImageSelected: (imageUri: string) => void;
  onClose: () => void;
  visible: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImageCapture({ onImageSelected, onClose, visible }: ImageCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ExpoImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to use this feature.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0, // Use maximum quality instead of 0.8
        base64: false, // Don't include base64 to reduce memory usage
        exif: false, // Don't include EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0, // Use maximum quality instead of 0.8
        base64: false, // Don't include base64 to reduce memory usage
        exif: false, // Don't include EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleConfirm = () => {
    if (selectedImage) {
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        onImageSelected(selectedImage);
        onClose();
      }, 1000);
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedImage ? 'Review Image' : 'Capture Image'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!selectedImage ? (
            // Image capture options
            <View style={styles.captureOptions}>
              <View style={styles.optionCard}>
                <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
                  <View style={styles.optionIcon}>
                    <Ionicons name="camera" size={wp(15)} color="#4CAF50" />
                  </View>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionDescription}>
                    Use your camera to capture a photo of the plant leaf
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.optionCard}>
                <TouchableOpacity style={styles.optionButton} onPress={pickFromGallery}>
                  <View style={styles.optionIcon}>
                    <Ionicons name="images" size={wp(15)} color="#4CAF50" />
                  </View>
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                  <Text style={styles.optionDescription}>
                    Select an existing photo from your device
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips for better results:</Text>
                <Text style={styles.tipText}>• Ensure good lighting</Text>
                <Text style={styles.tipText}>• Focus on the affected leaves</Text>
                <Text style={styles.tipText}>• Avoid shadows and reflections</Text>
                <Text style={styles.tipText}>• Include both healthy and diseased parts</Text>
              </View>
            </View>
          ) : (
            // Image preview
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                  <Ionicons name="refresh" size={wp(5)} color="#666" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]} 
                  onPress={handleConfirm}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Ionicons name="leaf" size={wp(5)} color="#fff" />
                      <Text style={styles.confirmText}>Processing...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={wp(5)} color="#fff" />
                      <Text style={styles.confirmText}>Use This Image</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: wp(10),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  captureOptions: {
    flex: 1,
    gap: hp(3),
  },
  optionCard: {
    backgroundColor: '#fff',
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
  optionButton: {
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  optionIcon: {
    marginBottom: hp(2),
  },
  optionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    lineHeight: hp(3),
  },
  tipsContainer: {
    backgroundColor: '#fff',
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
  tipsTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(2),
  },
  tipText: {
    fontSize: wp(4),
    color: '#666',
    marginBottom: hp(0.5),
    lineHeight: hp(2.5),
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    borderRadius: wp(3),
    marginBottom: hp(4),
  },
  previewActions: {
    flexDirection: 'row',
    gap: wp(3),
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: wp(3),
    gap: wp(2),
  },
  retakeText: {
    fontSize: wp(4),
    fontWeight: '500',
    color: '#666',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: wp(3),
    gap: wp(2),
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmText: {
    fontSize: wp(4),
    fontWeight: '500',
    color: '#fff',
  },
});
