import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PredictionResponse } from '../services/diseaseDetectionService';

interface DiseaseProbability {
  disease: string;
  probability: number;
  color: string;
}

interface DiseaseInfo {
  symptoms: string[];
  recommendations: string[];
  severity: string;
  affectedArea: string;
}

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse result data from params or use mock data
  const [resultData, setResultData] = useState<PredictionResponse>({
    crop_type: (Array.isArray(params.cropType) ? params.cropType[0] : params.cropType) || 'maize',
    predicted_disease: 'blight',
    confidence: 94.2,
    all_probabilities: {
      'Corn Leaf Blight': 94.2,
      'Common Rust': 3.1,
      'Gray Leaf Spot': 1.8,
      'Healthy': 0.9
    },
    status: 'diseased',
    processing_time_ms: 2300,
    timestamp: new Date().toISOString(),
    // Legacy fields for backward compatibility
    plant_type: (Array.isArray(params.cropType) ? params.cropType[0] : params.cropType) || 'maize',
    predicted_class: 'Corn Leaf Blight'
  });

  // Get image URI from params or from saved result data
  const getImageUri = () => {
    console.log('Getting image URI:', {
      paramsImageUri: params.imageUri,
      savedResult: params.savedResult,
      resultDataImageUri: resultData.imageUri
    });
    
    // First priority: imageUri from params (works for both new scans and saved results)
    if (params.imageUri) {
      const uri = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;
      console.log('Using params imageUri:', uri);
      return uri;
    }
    
    // Second priority: imageUri from saved result data
    if (params.savedResult && resultData.imageUri) {
      console.log('Using saved result imageUri:', resultData.imageUri);
      return resultData.imageUri;
    }
    
    console.log('No image URI found, using default');
    return undefined;
  };

  const imageUri = getImageUri();
  console.log('Final imageUri:', imageUri);

  // Disease information database
  const diseaseDatabase: Record<string, Record<string, DiseaseInfo>> = {
    cassava: {
      'Cassava Mosaic Disease': {
        symptoms: ['Yellow mosaic patterns on leaves', 'Stunted growth', 'Reduced yield'],
        recommendations: ['Remove infected plants', 'Use virus-free planting material', 'Control whitefly vectors'],
        severity: 'High',
        affectedArea: 'Leaves and stems'
      },
      'Cassava Brown Streak Disease': {
        symptoms: ['Brown streaks in roots', 'Yellowing leaves', 'Root rot'],
        recommendations: ['Plant resistant varieties', 'Practice crop rotation', 'Remove infected plants'],
        severity: 'Critical',
        affectedArea: 'Roots and leaves'
      },
      'Green Mottle': {
        symptoms: ['Green mottling on leaves', 'Mild stunting', 'Reduced photosynthesis'],
        recommendations: ['Monitor plant health', 'Maintain good nutrition', 'Control pests'],
        severity: 'Medium',
        affectedArea: 'Leaves'
      },
      'Healthy': {
        symptoms: ['No visible symptoms', 'Normal growth', 'Healthy green leaves'],
        recommendations: ['Continue good practices', 'Regular monitoring', 'Maintain soil health'],
        severity: 'None',
        affectedArea: 'None'
      }
    },
    maize: {
      'Corn Leaf Blight': {
        symptoms: ['Large tan to brown lesions', 'Cigar-shaped spots', 'Leaf death'],
        recommendations: ['Apply fungicides', 'Remove infected debris', 'Improve air circulation'],
        severity: 'High',
        affectedArea: 'Leaves'
      },
      'Common Rust': {
        symptoms: ['Reddish-brown pustules', 'Orange spores', 'Leaf damage'],
        recommendations: ['Plant resistant varieties', 'Apply fungicides', 'Monitor regularly'],
        severity: 'Medium',
        affectedArea: 'Leaves and stems'
      },
      'Gray Leaf Spot': {
        symptoms: ['Gray to brown spots', 'Rectangular lesions', 'Leaf blight'],
        recommendations: ['Use resistant hybrids', 'Apply fungicides', 'Manage crop residue'],
        severity: 'High',
        affectedArea: 'Leaves'
      },
      'Healthy': {
        symptoms: ['No visible symptoms', 'Normal growth', 'Healthy green leaves'],
        recommendations: ['Continue good practices', 'Regular monitoring', 'Maintain soil health'],
        severity: 'None',
        affectedArea: 'None'
      }
    },
    tomato: {
      'Early Blight': {
        symptoms: ['Dark brown spots with rings', 'Target-like lesions', 'Leaf yellowing'],
        recommendations: ['Remove infected leaves', 'Apply fungicides', 'Improve air circulation'],
        severity: 'Medium',
        affectedArea: 'Leaves and stems'
      },
      'Late Blight': {
        symptoms: ['Water-soaked lesions', 'White fungal growth', 'Rapid spread'],
        recommendations: ['Immediate fungicide application', 'Remove infected plants', 'Control humidity'],
        severity: 'Critical',
        affectedArea: 'Leaves, stems, and fruits'
      },
      'Bacterial Spot': {
        symptoms: ['Small dark spots', 'Yellow halos', 'Leaf drop'],
        recommendations: ['Use copper-based sprays', 'Remove infected plants', 'Avoid overhead irrigation'],
        severity: 'Medium',
        affectedArea: 'Leaves and fruits'
      },
      'Leaf Mold': {
        symptoms: ['Yellow spots on upper leaf surface', 'Olive-green mold on underside', 'Leaf drop'],
        recommendations: ['Improve air circulation', 'Apply fungicides', 'Control humidity'],
        severity: 'Medium',
        affectedArea: 'Leaves'
      },
      'Mosaic Virus': {
        symptoms: ['Mottled leaf patterns', 'Stunted growth', 'Distorted leaves'],
        recommendations: ['Remove infected plants', 'Control aphid vectors', 'Use virus-free seeds'],
        severity: 'High',
        affectedArea: 'Entire plant'
      },
      'Septoria Leaf Spot': {
        symptoms: ['Small dark spots with gray centers', 'Yellow halos', 'Leaf drop'],
        recommendations: ['Remove infected leaves', 'Apply fungicides', 'Improve air circulation'],
        severity: 'Medium',
        affectedArea: 'Leaves'
      },
      'Spider Mites': {
        symptoms: ['Fine webbing', 'Yellow stippling', 'Leaf drop'],
        recommendations: ['Apply miticides', 'Increase humidity', 'Remove infested plants'],
        severity: 'Medium',
        affectedArea: 'Leaves and stems'
      },
      'Target Spot': {
        symptoms: ['Dark brown spots with rings', 'Yellow halos', 'Leaf drop'],
        recommendations: ['Remove infected leaves', 'Apply fungicides', 'Improve air circulation'],
        severity: 'Medium',
        affectedArea: 'Leaves and fruits'
      },
      'Yellow Leaf Curl Virus': {
        symptoms: ['Yellowing and curling leaves', 'Stunted growth', 'Reduced yield'],
        recommendations: ['Remove infected plants', 'Control whitefly vectors', 'Use resistant varieties'],
        severity: 'High',
        affectedArea: 'Leaves and stems'
      },
      'Healthy': {
        symptoms: ['No visible symptoms', 'Normal growth', 'Healthy green leaves'],
        recommendations: ['Continue good practices', 'Regular monitoring', 'Maintain soil health'],
        severity: 'None',
        affectedArea: 'None'
      }
    }
  };

  // Initialize result data from params
  useEffect(() => {
    if (params.resultData) {
      try {
        const parsedResult = JSON.parse(params.resultData as string);
        console.log('Setting new result data:', parsedResult);
        setResultData(parsedResult);
        // Reset saved status for new scan
        setIsSaved(false);
      } catch (error) {
        console.error('Error parsing result data:', error);
      }
    }
  }, [params.resultData, params.cropType, params.imageUri]);

  // Reset result data when component mounts to ensure fresh data
  useEffect(() => {
    // Clear any cached data when component mounts
    if (params.resultData) {
      try {
        const parsedResult = JSON.parse(params.resultData as string);
        console.log('Fresh scan result:', parsedResult);
        setResultData(parsedResult);
        // Reset saved status for new scan
        setIsSaved(false);
      } catch (error) {
        console.error('Error parsing fresh result data:', error);
      }
    }
  }, []); // Empty dependency array - runs only on mount

  // Only check saved status if this is a saved result, not a new scan
  useEffect(() => {
    if (params.savedResult) {
      try {
        const savedResult = JSON.parse(params.savedResult as string);
        console.log('Loading saved result:', savedResult);
        console.log('Saved result imageUri:', savedResult.imageUri);
        setResultData(savedResult);
        setIsSaved(true);
      } catch (error) {
        console.error('Error parsing saved result:', error);
      }
    } else if (params.resultData) {
      // This is a new scan, don't check saved status
      setIsSaved(false);
    }
  }, [params.savedResult, params.resultData]);

  // Get current disease info
  const currentDiseaseInfo = diseaseDatabase[resultData.plant_type as keyof typeof diseaseDatabase]?.[resultData.predicted_class || ''] || diseaseDatabase[resultData.plant_type as keyof typeof diseaseDatabase]?.['Healthy'];

  // Convert probabilities to array for display and convert decimals to percentages with 2 decimal places
  const diseaseProbabilities: DiseaseProbability[] = Object.entries(resultData.all_probabilities)
    .map(([disease, probability]) => {
      const convertedProb = typeof probability === 'number' ? parseFloat((probability * 100).toFixed(2)) : probability;
      console.log(`Probability for ${disease}: original=${probability}, converted=${convertedProb}`);
      return {
        disease,
        probability: convertedProb,
        color: disease === resultData.predicted_class ? '#4CAF50' : '#FF6B6B'
      };
    })
    .sort((a, b) => b.probability - a.probability);

  const checkIfSaved = async () => {
    try {
      const existingResults = await AsyncStorage.getItem('savedResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      
      // Check if this specific scan result is already saved by comparing key properties
      const isAlreadySaved = results.some((result: any) => 
        result.plant_type === resultData.plant_type && 
        result.predicted_class === resultData.predicted_class &&
        result.imageUri === imageUri // Use image URI as the main identifier
      );
      setIsSaved(isAlreadySaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveResult = async () => {
    try {
      if (isSaved) {
        // If already saved, remove this specific result
        const existingResults = await AsyncStorage.getItem('savedResults');
        const results = existingResults ? JSON.parse(existingResults) : [];
        
        // Find and remove this specific scan result
        const existingIndex = results.findIndex((result: any) => 
          result.plant_type === resultData.plant_type && 
          result.predicted_class === resultData.predicted_class &&
          result.imageUri === imageUri
        );
        
        if (existingIndex !== -1) {
          results.splice(existingIndex, 1);
          await AsyncStorage.setItem('savedResults', JSON.stringify(results));
          setIsSaved(false);
          Alert.alert('Removed!', 'Result has been removed from your saved items.');
        }
      } else {
        // If not saved, add this new result
        const uniqueId = `${resultData.plant_type}_${resultData.predicted_class}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const savedResult = {
          id: uniqueId,
          ...resultData,
          timestamp: new Date().toISOString(),
          scanId: uniqueId, // Additional unique identifier
          imageUri: imageUri, // Include image URI for uniqueness
          savedAt: Date.now(), // When this was saved
        };

        const existingResults = await AsyncStorage.getItem('savedResults');
        const results = existingResults ? JSON.parse(existingResults) : [];
        
        // Always add new results - don't check for duplicates since each scan is unique
        results.push(savedResult);
        await AsyncStorage.setItem('savedResults', JSON.stringify(results));
        setIsSaved(true);
        Alert.alert('Saved!', 'Result has been saved to your saved items.');
      }
      
    } catch (error) {
      console.error('Error saving/unsaving result:', error);
      Alert.alert('Error', 'Failed to save/unsave result. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detection Result</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={imageUri ? { uri: imageUri } : require('../assets/images/step2.png')} 
            style={styles.mainImage}
          />
        </View>

        {/* Result Summary Card */}
        <View style={styles.infoCard}>
          <View style={styles.plantHeader}>
            <View style={styles.plantTitle}>
              <Text style={styles.plantName}>{params.cropName || 'Plant'}</Text>
              <Text style={styles.plantCommonName}>({resultData.plant_type})</Text>
            </View>
            <TouchableOpacity 
              style={styles.heartButton} 
              onPress={handleSaveResult}
              accessibilityLabel={isSaved ? "Remove from saved items" : "Save to saved items"}
              accessibilityHint={isSaved ? "Double tap to remove this result from your saved items" : "Double tap to save this result to your saved items"}
            >
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={wp(6)} 
                color={isSaved ? "#FF6B6B" : "#4CAF50"} 
              />
            </TouchableOpacity>
          </View>

          {/* Disease Detection Result */}
          <View style={styles.diseaseResult}>
            <Text style={styles.diseaseName}>{resultData.predicted_class}</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${parseFloat(((resultData.all_probabilities[resultData.predicted_class || ''] || 0) * 100).toFixed(2))}%` }
                ]} 
              />
              <Text style={styles.confidenceText}>
                {((resultData.all_probabilities[resultData.predicted_class || ''] || 0) * 100).toFixed(2)}% Confidence
              </Text>
            </View>
          </View>

          {/* Processing Information Grid */}
          <View style={styles.careGrid}>
            <View style={styles.careItem}>
              <Ionicons name="warning" size={wp(5)} color="#FF6B35" />
              <View style={styles.careTextContainer}>
                <Text style={styles.careLabel}>Severity</Text>
                <Text style={styles.careValue}>{currentDiseaseInfo?.severity}</Text>
              </View>
            </View>
            <View style={styles.careItem}>
              <Ionicons name="analytics" size={wp(5)} color="#4CAF50" />
              <View style={styles.careTextContainer}>
                <Text style={styles.careLabel}>Confidence</Text>
                <Text style={styles.careValue}>
                  {((resultData.all_probabilities[resultData.predicted_class || ''] || 0) * 100).toFixed(2)}%
                </Text>
              </View>
            </View>
            <View style={styles.careItem}>
              <Ionicons name="leaf" size={wp(5)} color="#FF6B35" />
              <View style={styles.careTextContainer}>
                <Text style={styles.careLabel}>Affected Area</Text>
                <Text style={styles.careValue}>{currentDiseaseInfo?.affectedArea}</Text>
              </View>
            </View>
            <View style={styles.careItem}>
              <Ionicons name="time" size={wp(5)} color="#FF6B35" />
              <View style={styles.careTextContainer}>
                <Text style={styles.careLabel}>Processing Time</Text>
                <Text style={styles.careValue}>
                  {resultData.processing_time_ms ? 
                    `${(resultData.processing_time_ms / 1000).toFixed(1)}s` : 
                    'N/A'
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* All Disease Probabilities */}
          <View style={styles.probabilitiesSection}>
            <Text style={styles.sectionTitle}>Disease Probabilities</Text>
            <View style={styles.probabilitiesList}>
              {diseaseProbabilities.map((item, index) => (
                <View key={index} style={styles.probabilityItem}>
                  <View style={styles.probabilityHeader}>
                    <Text style={styles.probabilityDisease}>{item.disease}</Text>
                    <Text style={styles.probabilityValue}>{item.probability.toFixed(2)}%</Text>
                  </View>
                  <View style={styles.probabilityBar}>
                    <View 
                      style={[
                        styles.probabilityBarFill, 
                        { 
                          width: `${item.probability}%`,
                          backgroundColor: item.color
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Disease Symptoms */}
          <View style={styles.symptomsSection}>
            <Text style={styles.sectionTitle}>Symptoms</Text>
            {currentDiseaseInfo?.symptoms.map((symptom: string, index: number) => (
              <View key={index} style={styles.symptomItem}>
                <Ionicons name="alert-circle" size={wp(4)} color="#FF6B35" />
                <Text style={styles.symptomText}>{symptom}</Text>
              </View>
            ))}
          </View>

          {/* Treatment Recommendations */}
          <View style={styles.treatmentSection}>
            <Text style={styles.treatmentTitle}>Treatment Recommendations</Text>
            {currentDiseaseInfo?.recommendations.map((recommendation: string, index: number) => (
              <View key={index} style={styles.treatmentItem}>
                <Ionicons name="checkmark-circle" size={wp(4)} color="#4CAF50" />
                <Text style={styles.treatmentText}>{recommendation}</Text>
            </View>
            ))}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  headerSpacer: {
    width: wp(10),
  },
  imageContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  mainImage: {
    width: '100%',
    height: hp(30),
    borderRadius: wp(3),
    resizeMode: 'cover',
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: hp(3),
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(3),
  },
  plantTitle: {
    flex: 1,
  },
  plantName: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: '#000',
  },
  plantCommonName: {
    fontSize: wp(4),
    color: '#666',
    marginTop: hp(0.5),
    textTransform: 'capitalize',
  },
  heartButton: {
    padding: wp(2),
  },
  diseaseResult: {
    alignItems: 'center',
    marginBottom: hp(3),
    paddingVertical: hp(2),
    backgroundColor: '#f8f9fa',
    borderRadius: wp(3),
  },
  diseaseName: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  confidenceBar: {
    width: '100%',
    height: hp(2),
    backgroundColor: '#e0e0e0',
    borderRadius: wp(1),
    position: 'relative',
    overflow: 'hidden',
  },
  confidenceFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: wp(1),
  },
  confidenceText: {
    position: 'absolute',
    top: hp(0.5),
    left: wp(2),
    fontSize: wp(3),
    fontWeight: 'bold',
    color: '#fff',
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(4),
  },
  careItem: {
    width: '48%',
    backgroundColor: '#E3F2FD',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
  },
  careTextContainer: {
    flex: 1,
    marginLeft: wp(2),
  },
  careLabel: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.5),
  },
  careValue: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#000',
  },
  probabilitiesSection: {
    marginBottom: hp(4),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(2),
  },
  probabilitiesList: {
    gap: hp(1.5),
  },
  probabilityItem: {
    marginBottom: hp(1),
  },
  probabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  probabilityDisease: {
    fontSize: wp(4),
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  probabilityValue: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#000',
  },
  probabilityBar: {
    height: hp(1.5),
    backgroundColor: '#f0f0f0',
    borderRadius: wp(1),
    overflow: 'hidden',
  },
  probabilityBarFill: {
    height: '100%',
    borderRadius: wp(1),
  },
  symptomsSection: {
    marginBottom: hp(4),
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  symptomText: {
    fontSize: wp(4),
    color: '#000',
    lineHeight: hp(3),
    flex: 1,
    marginLeft: wp(2),
  },
  treatmentSection: {
    marginBottom: hp(3),
  },
  treatmentTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(2),
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  treatmentText: {
    fontSize: wp(4),
    color: '#000',
    lineHeight: hp(3),
    flex: 1,
    marginLeft: wp(2),
  },
  bottomSpacing: {
    height: hp(4),
  },
}); 