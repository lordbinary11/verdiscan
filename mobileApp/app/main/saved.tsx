import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { PredictionResponse } from '../../services/diseaseDetectionService';

interface SavedResult extends PredictionResponse {
  id: string;
  cropName?: string;
  imageUri?: string;
}

export default function SavedScreen() {
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SavedResult[]>([]);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSavedResults();
    }, [])
  );

  // Filter results when search query changes
  React.useEffect(() => {
    try {
      if (searchQuery.trim() === '') {
        setFilteredResults(savedResults);
      } else {
        const filtered = savedResults.filter(item => {
          // Add safety checks for each field
          const cropName = item?.cropName || item?.plant_type || '';
          const predictedClass = item?.predicted_class || '';
          const query = searchQuery.toLowerCase();
          
          return cropName.toLowerCase().includes(query) || 
                 predictedClass.toLowerCase().includes(query);
        });
        setFilteredResults(filtered);
      }
    } catch (error) {
      console.error('Error filtering results:', error);
      setFilteredResults(savedResults);
    }
  }, [searchQuery, savedResults]);

  const loadSavedResults = async () => {
    try {
      const results = await AsyncStorage.getItem('savedResults');
      console.log('Loaded saved results:', results);
      if (results) {
        const parsedResults = JSON.parse(results);
        console.log('Parsed results:', parsedResults);
        
        // Validate and clean the parsed results
        const validResults = Array.isArray(parsedResults) ? parsedResults.filter(item => {
          return item && typeof item === 'object' && 
                 (item.cropName || item.plant_type) && 
                 item.predicted_class;
        }) : [];
        
        console.log('Valid results:', validResults);
        setSavedResults(validResults);
      } else {
        console.log('No saved results found');
        setSavedResults([]);
      }
    } catch (error) {
      console.error('Error loading saved results:', error);
      setSavedResults([]);
    }
  };

  const getDiseaseColor = (disease: string) => {
    if (!disease || typeof disease !== 'string') return '#666';
    if (disease === 'Healthy') return '#4CAF50';
    if (disease.includes('Critical') || disease.includes('High')) return '#FF6B6B';
    return '#FFA726';
  };

  // Helper function to get formatted confidence percentage
  const getFormattedConfidence = (item: SavedResult) => {
    console.log('Processing confidence for item:', {
      predictedClass: item.predicted_class,
      confidence: item.confidence,
      allProbabilities: item.all_probabilities
    });
    
    // First try to get confidence from all_probabilities for the detected disease
    if (item.all_probabilities && item.predicted_class) {
      const diseaseProb = item.all_probabilities[item.predicted_class];
      if (typeof diseaseProb === 'number') {
        // If it's a decimal (0.0-1.0), convert to percentage
        if (diseaseProb <= 1) {
          const percentage = Math.round(diseaseProb * 100);
          console.log(`Converted decimal ${diseaseProb} to percentage ${percentage}%`);
          return percentage;
        }
        // If it's already a percentage, return as is
        console.log(`Using existing percentage ${diseaseProb}%`);
        return Math.round(diseaseProb);
      }
    }
    
    // Fallback to confidence field
    if (typeof item.confidence === 'number') {
      // If it's a decimal (0.0-1.0), convert to percentage
      if (item.confidence <= 1) {
        const percentage = Math.round(item.confidence * 100);
        console.log(`Converted confidence decimal ${item.confidence} to percentage ${percentage}%`);
        return percentage;
      }
      // If it's already a percentage, return as is
      console.log(`Using existing confidence percentage ${item.confidence}%`);
      return Math.round(item.confidence);
    }
    
    console.log('No valid confidence found, returning 0');
    return 0;
  };

  const renderSavedItem = ({ item }: { item: SavedResult }) => {
    // Safety check for item
    if (!item || typeof item !== 'object') {
      return null;
    }

    return (
      <TouchableOpacity 
        style={styles.savedCard}
        onPress={() => {
          router.push({
            pathname: '/result',
            params: { 
              savedResult: JSON.stringify(item),
              imageUri: item.imageUri, // Pass imageUri separately
              fromSaved: 'true'
            }
          });
        }}
      >
        <Image 
          source={item.imageUri ? { uri: item.imageUri } : require('../../assets/images/step2.png')} 
          style={styles.savedImage} 
        />
        <View style={styles.savedContent}>
          <View style={styles.savedHeader}>
            <Text style={styles.savedPlantName}>{item.cropName || item.plant_type || 'Unknown'}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {getFormattedConfidence(item)}%
              </Text>
            </View>
          </View>
          <Text style={[styles.savedDiseaseName, { color: getDiseaseColor(item.predicted_class) }]}>
            {item.predicted_class || 'Unknown Disease'}
          </Text>
          <View style={styles.savedDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={wp(3)} color="#666" />
              <Text style={styles.detailText}>
                {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="leaf" size={wp(3)} color="#666" />
              <Text style={[styles.detailText, { textTransform: 'capitalize' }]}>
                {item.plant_type || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <ImageBackground 
        source={require('../../assets/images/leaf2.png')} 
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Saved</Text>
            <Text style={styles.headerSubtitle}>Easily access your saved plant detections anytime.</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={wp(5)} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved items..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={wp(5)} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Saved Items */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            renderItem={renderSavedItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.trim() !== '' ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={wp(15)} color="#ccc" />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={wp(15)} color="#ccc" />
            <Text style={styles.emptyText}>No saved items yet</Text>
            <Text style={styles.emptySubtext}>Your saved plant detections will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBackground: {
    paddingTop: hp(8),
    paddingBottom: hp(3),
    paddingHorizontal: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: wp(8),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  headerSubtitle: {
    fontSize: wp(4),
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    height: hp(6),
    fontSize: wp(4),
    color: '#000',
  },
  clearButton: {
    padding: wp(1),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  savedCard: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(2),
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
  savedImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  savedContent: {
    flex: 1,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  savedPlantName: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  confidenceText: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#1976D2',
  },
  savedDiseaseName: {
    fontSize: wp(4.5),
    fontWeight: '600',
    marginBottom: hp(1),
  },
  savedDetails: {
    flexDirection: 'row',
    gap: wp(4),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#666',
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: wp(4),
    color: '#999',
    textAlign: 'center',
    marginTop: hp(1),
  },
});