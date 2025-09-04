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
        symptoms: [
          'Distinctive yellow and green mosaic patterns appearing on leaf surfaces with irregular chlorotic patches',
          'Severe stunting of plant growth with shortened internodes and reduced overall plant height',
          'Significant reduction in tuber yield with smaller, fewer roots and decreased starch content',
          'Leaf distortion and curling with asymmetrical growth patterns and reduced leaf size',
          'Premature leaf drop in severe cases, starting from older leaves and progressing upward'
        ],
        recommendations: [
          'Immediately remove and destroy all infected plants to prevent virus spread to healthy crops',
          'Source and plant only certified virus-free planting material from reputable agricultural suppliers',
          'Implement integrated pest management to control whitefly vectors using yellow sticky traps and appropriate insecticides',
          'Practice crop rotation with non-host plants for at least 2-3 seasons to break the disease cycle',
          'Maintain proper field sanitation by removing plant debris and weeds that may harbor the virus',
          'Apply foliar fertilizers containing potassium and phosphorus to strengthen plant immunity and resilience'
        ],
        severity: 'High',
        affectedArea: 'Leaves and stems'
      },
      'Cassava Brown Streak Disease': {
        symptoms: [
          'Dark brown to black necrotic streaks running longitudinally through the root flesh and cortex',
          'Progressive yellowing of leaves starting from leaf margins and spreading inward with eventual necrosis',
          'Severe root rot with soft, discolored tissues that emit a foul odor when advanced',
          'Stem cankers appearing as sunken, dark lesions that may girdle the stem and cause wilting',
          'Reduced root quality with bitter taste and decreased nutritional value making them unsuitable for consumption'
        ],
        recommendations: [
          'Plant resistant or tolerant cassava varieties specifically bred for brown streak disease resistance',
          'Implement strict crop rotation with cereals or legumes for at least 3-4 years to reduce soil-borne inoculum',
          'Remove and burn all infected plant materials including roots, stems, and leaves to prevent disease spread',
          'Apply organic soil amendments like compost and well-decomposed manure to improve soil health and drainage',
          'Ensure proper field drainage to prevent waterlogging which exacerbates root rot conditions',
          'Monitor fields regularly and scout for early symptoms to enable prompt intervention measures'
        ],
        severity: 'Critical',
        affectedArea: 'Roots and leaves'
      },
      'Green Mottle': {
        symptoms: [
          'Light and dark green mottled patterns on leaf surfaces creating a variegated appearance',
          'Mild to moderate plant stunting with slightly reduced stem elongation and leaf development',
          'Decreased photosynthetic efficiency evidenced by lighter green coloration and reduced vigor',
          'Subtle leaf deformation with slightly irregular leaf shapes and minor vein clearing',
          'Gradual decline in overall plant health with reduced biomass accumulation over time'
        ],
        recommendations: [
          'Enhance plant nutrition with balanced NPK fertilizers, focusing on nitrogen and magnesium supplementation',
          'Implement regular monitoring schedules with weekly field inspections to track disease progression',
          'Apply foliar nutrients containing microelements like zinc, iron, and manganese to boost chlorophyll production',
          'Control insect pests that may stress plants and make them more susceptible to secondary infections',
          'Ensure adequate spacing between plants to improve air circulation and reduce humidity around foliage',
          'Apply organic mulch around plants to maintain soil moisture and suppress competing weeds'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves'
      },
      'Healthy': {
        symptoms: [
          'No visible disease symptoms with uniform green coloration throughout the plant canopy',
          'Normal vigorous growth with appropriate stem elongation and regular leaf development patterns',
          'Healthy dark green leaves showing optimal chlorophyll content and photosynthetic activity',
          'Strong root system development with normal tuber formation and healthy white flesh',
          'Consistent plant architecture with balanced vegetative growth and normal flowering patterns'
        ],
        recommendations: [
          'Continue current management practices including proper fertilization, irrigation, and pest control measures',
          'Conduct regular field monitoring at least twice weekly to detect any early signs of disease or pest issues',
          'Maintain optimal soil health through organic matter incorporation and balanced nutrient management programs',
          'Implement preventive pest management strategies including beneficial insect conservation and habitat management',
          'Ensure proper plant spacing and field sanitation to maintain ideal growing conditions',
          'Keep detailed records of field activities, weather conditions, and plant performance for future reference'
        ],
        severity: 'None',
        affectedArea: 'None'
      }
    },
    maize: {
      'Corn Leaf Blight': {
        symptoms: [
          'Large elongated tan to dark brown lesions developing on leaf surfaces, typically 1-6 inches in length',
          'Distinctive cigar-shaped or elliptical spots with defined margins and grayish-brown centers',
          'Progressive leaf death starting from lower leaves and moving upward through the canopy',
          'Lesions may have yellow halos or water-soaked margins during humid conditions',
          'Severe infections can cause complete leaf blight and premature senescence of entire plants'
        ],
        recommendations: [
          'Apply systemic fungicides containing active ingredients like azoxystrobin or propiconazole at first sign of infection',
          'Remove and destroy all infected crop debris immediately after harvest to eliminate overwintering inoculum sources',
          'Improve field air circulation by maintaining proper plant spacing and avoiding overcrowding in planting patterns',
          'Implement crop rotation with non-host crops like soybeans or cotton for at least 2-3 years to break disease cycle',
          'Apply balanced fertilization with emphasis on potassium to strengthen plant cell walls and disease resistance',
          'Scout fields regularly during humid weather conditions when disease pressure is typically highest'
        ],
        severity: 'High',
        affectedArea: 'Leaves'
      },
      'Common Rust': {
        symptoms: [
          'Small reddish-brown to cinnamon-colored pustules scattered across leaf surfaces, primarily on upper leaf sides',
          'Orange to rust-colored powdery spores readily visible and easily rubbed off infected leaves',
          'Progressive leaf damage with yellowing and browning of tissue surrounding pustule sites',
          'Pustules may coalesce to form larger necrotic areas during severe infections',
          'Premature leaf senescence and reduced photosynthetic capacity in heavily infected plants'
        ],
        recommendations: [
          'Plant resistant or tolerant maize hybrids that carry genetic resistance to common rust pathogen',
          'Apply protective fungicides containing strobilurin or triazole compounds when weather favors disease development',
          'Monitor fields weekly during warm, humid conditions when rust development is most rapid and severe',
          'Ensure adequate plant nutrition with balanced NPK fertilizers to maintain plant vigor and natural resistance',
          'Remove volunteer corn plants and grass weeds that can serve as alternative hosts for rust spores',
          'Time planting to avoid peak rust spore release periods in your local area based on weather patterns'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves and stems'
      },
      'Gray Leaf Spot': {
        symptoms: [
          'Small gray to brown rectangular or linear lesions aligned parallel to leaf veins',
          'Lesions typically 0.5-2 inches long with distinct straight edges and tan to gray centers',
          'Progressive leaf blight starting from lower leaves and spreading upward through the plant canopy',
          'Lesions may have dark brown borders and can coalesce to form large necrotic areas',
          'Severe infections cause premature leaf death and significant reduction in grain fill'
        ],
        recommendations: [
          'Select and plant resistant maize hybrids specifically bred for gray leaf spot tolerance in your region',
          'Apply preventive fungicides containing active ingredients like pyraclostrobin or tebuconazole before symptoms appear',
          'Manage crop residue by incorporating or removing corn debris to reduce inoculum sources for next season',
          'Implement minimum tillage practices to bury infected crop residue and reduce spore dispersal from soil surface',
          'Maintain proper plant density and row spacing to ensure adequate air movement and reduce leaf wetness duration',
          'Apply foliar fertilizers containing silicon and calcium to strengthen leaf tissue and improve disease resistance'
        ],
        severity: 'High',
        affectedArea: 'Leaves'
      },
      'Healthy': {
        symptoms: [
          'No visible disease symptoms with uniform dark green coloration throughout all leaf surfaces',
          'Normal vigorous growth with appropriate plant height, stem thickness, and leaf development',
          'Healthy green leaves displaying optimal size, shape, and photosynthetic activity',
          'Strong root system with healthy white roots and normal nutrient uptake capacity',
          'Proper ear development with full kernel set and normal grain filling progression'
        ],
        recommendations: [
          'Continue current management practices including proper fertilization, irrigation, and pest control measures',
          'Conduct regular field monitoring at least twice weekly to detect any early signs of disease or pest issues',
          'Maintain optimal soil health through organic matter incorporation and balanced nutrient management programs',
          'Implement preventive pest management strategies including beneficial insect conservation and habitat management',
          'Ensure proper plant spacing and field sanitation to maintain ideal growing conditions',
          'Keep detailed records of field activities, weather conditions, and plant performance for future reference'
        ],
        severity: 'None',
        affectedArea: 'None'
      }
    },
    tomato: {
      'Early Blight': {
        symptoms: [
          'Dark brown circular spots with distinctive concentric rings creating a target-like or bulls-eye appearance',
          'Lesions typically start small (1-2mm) and expand to 10-15mm in diameter with defined borders',
          'Progressive yellowing of leaves beginning around lesions and spreading throughout affected leaflets',
          'Lower leaves affected first with disease progression moving upward through the plant canopy',
          'Stem lesions may appear as dark, sunken cankers that can girdle stems and cause wilting'
        ],
        recommendations: [
          'Remove and destroy infected lower leaves immediately to prevent spore production and disease progression',
          'Apply preventive fungicides containing chlorothalonil or copper compounds every 7-14 days during humid weather',
          'Improve air circulation around plants by proper spacing, pruning, and using support systems like cages or stakes',
          'Apply organic mulch around plants to prevent soil splash and reduce inoculum contact with lower leaves',
          'Ensure adequate plant nutrition with balanced fertilizers, avoiding excessive nitrogen which promotes soft growth',
          'Implement drip irrigation or soaker hoses to keep foliage dry and reduce favorable conditions for fungal development'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves and stems'
      },
      'Late Blight': {
        symptoms: [
          'Water-soaked lesions appearing as dark, greasy spots on leaves, stems, and fruits',
          'White to grayish fungal growth (sporangia) visible on leaf undersides during humid conditions',
          'Extremely rapid disease spread with entire plants becoming infected within 24-48 hours',
          'Brown to black necrotic areas that quickly expand and cause tissue collapse',
          'Characteristic musty or moldy odor emanating from severely infected plant parts'
        ],
        recommendations: [
          'Apply systemic fungicides containing metalaxyl or dimethomorph immediately upon first symptom detection',
          'Remove and destroy entire infected plants including roots to prevent rapid disease spread to neighboring plants',
          'Control humidity levels in greenhouse environments using ventilation fans and dehumidification systems',
          'Implement strict sanitation protocols including disinfecting tools, hands, and equipment between plant handling',
          'Monitor weather conditions closely and apply preventive treatments before forecasted cool, wet periods',
          'Source certified disease-free transplants and avoid saving seeds from potentially infected plants'
        ],
        severity: 'Critical',
        affectedArea: 'Leaves, stems, and fruits'
      },
      'Bacterial Spot': {
        symptoms: [
          'Small dark brown to black spots (1-3mm diameter) with irregular margins on leaves and fruits',
          'Bright yellow halos surrounding spots, particularly visible on younger leaves',
          'Progressive leaf drop starting with heavily spotted lower leaves and moving upward',
          'Fruit lesions appear as raised, scab-like spots that may crack and provide entry for secondary pathogens',
          'Severe infections cause defoliation and reduced fruit quality with unmarketable appearance'
        ],
        recommendations: [
          'Apply copper-based bactericides like copper sulfate or copper hydroxide at weekly intervals during disease-favorable weather',
          'Remove and destroy infected plants and plant debris to reduce bacterial inoculum sources in the field',
          'Avoid overhead irrigation and use drip or furrow irrigation methods to minimize water splash and bacterial dispersal',
          'Implement crop rotation with non-solanaceous crops for at least 3-4 years to break the bacterial disease cycle',
          'Use certified pathogen-free seeds and transplants from reputable sources to prevent introduction of bacterial contamination',
          'Apply preventive treatments with streptomycin or oxytetracycline antibiotics where legally permitted and recommended'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves and fruits'
      },
      'Leaf Mold': {
        symptoms: ['Yellow spots on upper leaf surface', 'Olive-green mold on underside', 'Leaf drop'],
        recommendations: [
          'Improve greenhouse ventilation by installing exhaust fans and opening vents to reduce humidity levels below 85%',
          'Apply fungicides containing chlorothalonil, mancozeb, or copper compounds at first sign of infection',
          'Control relative humidity through proper plant spacing, pruning, and avoiding overhead watering systems',
          'Remove lower leaves and suckers to improve air circulation and reduce humidity around the plant canopy',
          'Monitor temperature and humidity levels using digital sensors and maintain optimal growing conditions',
          'Apply foliar applications of potassium bicarbonate or baking soda solutions as organic fungicide alternatives'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves'
      },
      'Mosaic Virus': {
        symptoms: [
          'Distinctive mottled patterns of light and dark green areas creating a mosaic appearance on leaf surfaces',
          'Significant plant stunting with reduced stem elongation and overall diminished plant size',
          'Severe leaf distortion including curling, puckering, and asymmetrical growth patterns',
          'Reduced fruit production with smaller, misshapen tomatoes and poor fruit quality',
          'Yellowing and necrosis of leaf tissue in severe cases, particularly in older leaves'
        ],
        recommendations: [
          'Remove and destroy infected plants immediately including root systems to prevent virus reservoir establishment',
          'Control aphid vectors using integrated pest management including beneficial insects, reflective mulches, and targeted insecticides',
          'Use certified virus-free seeds and transplants from reputable suppliers with pathogen testing programs',
          'Implement strict sanitation protocols including tool disinfection with 10% bleach solution between plants',
          'Apply reflective aluminum mulch around plants to deter aphid landing and reduce virus transmission rates',
          'Monitor surrounding weeds and volunteer plants that may serve as virus reservoirs and remove them promptly'
        ],
        severity: 'High',
        affectedArea: 'Entire plant'
      },
      'Septoria Leaf Spot': {
        symptoms: ['Small dark spots with gray centers', 'Yellow halos', 'Leaf drop'],
        recommendations: [
          'Remove infected lower leaves and destroy them to reduce spore production and prevent disease progression',
          'Apply protective fungicides containing chlorothalonil, mancozeb, or copper compounds every 10-14 days',
          'Improve air circulation through proper plant spacing, staking, and removal of unnecessary foliage',
          'Use drip irrigation or soaker hoses to keep foliage dry and reduce conditions favorable for spore germination',
          'Apply organic mulch around plants to prevent soil splash and reduce contact between soil-borne spores and leaves',
          'Rotate crops with non-solanaceous plants for 3-4 years to break the disease cycle and reduce soil inoculum'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves'
      },
      'Spider Mites': {
        symptoms: [
          'Fine silken webbing visible on leaf undersides and between leaves, especially during dry conditions',
          'Yellow stippling or speckling on leaf surfaces caused by mite feeding punctures',
          'Progressive leaf drop starting with lower leaves and advancing upward through the plant',
          'Leaves may appear bronze or rust-colored in severe infestations due to extensive feeding damage',
          'Tiny moving dots (mites) visible with hand lens, particularly on leaf undersides near veins'
        ],
        recommendations: [
          'Apply miticides containing abamectin, bifenazate, or spiromesifen, rotating active ingredients to prevent resistance',
          'Increase relative humidity around plants through misting systems or placing water trays to discourage mite reproduction',
          'Remove heavily infested plants and destroy them to prevent mite population spread to healthy plants',
          'Release beneficial predatory mites like Phytoseiulus persimilis as biological control agents in greenhouse settings',
          'Apply insecticidal soap or neem oil sprays every 3-5 days, ensuring thorough coverage of leaf undersides',
          'Monitor plants regularly using hand lens to detect early infestations before populations become established'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves and stems'
      },
      'Target Spot': {
        symptoms: ['Dark brown spots with rings', 'Yellow halos', 'Leaf drop'],
        recommendations: [
          'Remove infected leaves and plant debris immediately to reduce inoculum sources and prevent spore dispersal',
          'Apply fungicides containing azoxystrobin, pyraclostrobin, or chlorothalonil at first symptom appearance',
          'Improve air circulation through proper plant spacing, pruning, and use of support structures like stakes or cages',
          'Implement crop rotation with non-solanaceous crops for at least 3 years to break the fungal disease cycle',
          'Use drip irrigation systems to minimize leaf wetness and reduce conditions favorable for fungal development',
          'Apply preventive treatments during periods of high humidity and warm temperatures when disease pressure increases'
        ],
        severity: 'Medium',
        affectedArea: 'Leaves and fruits'
      },
      'Yellow Leaf Curl Virus': {
        symptoms: ['Yellowing and curling leaves', 'Stunted growth', 'Reduced yield'],
        recommendations: [
          'Remove and destroy infected plants including root systems to eliminate virus sources and prevent spread',
          'Control whitefly vectors using yellow sticky traps, reflective mulches, and systemic insecticides like imidacloprid',
          'Plant resistant or tolerant tomato varieties that carry genetic resistance to yellow leaf curl virus',
          'Install fine mesh screens in greenhouse openings to prevent whitefly entry and virus introduction',
          'Apply reflective aluminum mulch around plants to deter whitefly landing and reduce virus transmission',
          'Monitor surrounding areas for infected weeds and volunteer plants that serve as virus reservoirs'
        ],
        severity: 'High',
        affectedArea: 'Leaves and stems'
      },
      'Healthy': {
        symptoms: [
          'No visible disease symptoms with vibrant dark green foliage and uniform plant coloration',
          'Normal vigorous growth with appropriate plant height, stem development, and leaf expansion',
          'Healthy green leaves showing optimal size, proper shape, and strong photosynthetic activity',
          'Strong root system with healthy white roots and efficient nutrient and water uptake',
          'Proper flower and fruit development with normal fruit set, size, and quality characteristics'
        ],
        recommendations: [
          'Continue current management practices including proper fertilization, irrigation, and pest control measures',
          'Conduct regular field monitoring at least twice weekly to detect any early signs of disease or pest issues',
          'Maintain optimal soil health through organic matter incorporation and balanced nutrient management programs',
          'Implement preventive pest management strategies including beneficial insect conservation and habitat management',
          'Ensure proper plant spacing and field sanitation to maintain ideal growing conditions',
          'Keep detailed records of field activities, weather conditions, and plant performance for future reference'
        ],
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