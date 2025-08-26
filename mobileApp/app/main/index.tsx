import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const diseaseData = [
  {
    id: '1',
    name: 'Cassava Mosaic Disease',
    description: 'A viral disease that causes yellow mosaic patterns on cassava leaves, reducing yield significantly.',
    image: require('../../assets/images/step.jpg'),
    category: 'Cassava'
  },
  {
    id: '2',
    name: 'Cassava Brown Streak Disease',
    description: 'A devastating viral disease that causes brown streaks in cassava roots and yellowing of leaves.',
    image: require('../../assets/images/step1.jpg'),
    category: 'Cassava'
  },
  {
    id: '3',
    name: 'Maize Rust',
    description: 'A fungal disease that causes reddish-brown pustules on maize leaves, stems, and ears.',
    image: require('../../assets/images/step2.png'),
    category: 'Maize'
  },
  {
    id: '4',
    name: 'Maize Leaf Blight',
    description: 'A fungal disease that causes large, tan to brown lesions on maize leaves, reducing photosynthesis.',
    image: require('../../assets/images/step3.jpg'),
    category: 'Maize'
  },
  {
    id: '5',
    name: 'Tomato Early Blight',
    description: 'A fungal disease that causes dark brown spots with concentric rings on tomato leaves and stems.',
    image: require('../../assets/images/leaf.png'),
    category: 'Tomato'
  },
  {
    id: '6',
    name: 'Tomato Late Blight',
    description: 'A destructive disease that causes water-soaked lesions on tomato leaves, stems, and fruits.',
    image: require('../../assets/images/leaf2.png'),
    category: 'Tomato'
  }
];

interface DiseaseItem {
  id: string;
  name: string;
  description: string;
  image: any;
  category: string;
}

const DiseaseCard = ({ item, onPress }: { item: DiseaseItem; onPress: (item: DiseaseItem) => void }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
    <Image source={item.image} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const handleDiseasePress = (disease: DiseaseItem) => {
    router.push({
      pathname: '/disease-info' as any,
      params: { disease: JSON.stringify(disease) }
    });
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'Are you sure you want to reset the onboarding? This will show the onboarding screens again on next app launch.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('onboardingComplete');
              Alert.alert('Success', 'Onboarding has been reset. Please restart the app to see the onboarding screens.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset onboarding. Please try again.');
            }
          },
        },
      ]
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
            <Text style={styles.title}>VerdiScan</Text>
            <Text style={styles.subtitle}>Scan and identify common tomato, cassava and maize diseases</Text>
          </View>
          <TouchableOpacity style={styles.crownContainer} onPress={handleResetOnboarding}>
            <Ionicons name="star" size={wp(5)} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(5)} color="#666" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search Plants"
            placeholderTextColor="#666"
          />
        </View>
      </View>

             {/* Disease List */}
       <FlatList
         data={diseaseData}
         renderItem={({ item }) => <DiseaseCard item={item} onPress={handleDiseasePress} />}
         keyExtractor={item => item.id}
         style={styles.list}
         contentContainerStyle={styles.listContent}
         showsVerticalScrollIndicator={false}
       />
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
  title: {
    fontSize: wp(8),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: wp(4),
    color: '#666',
  },
  crownContainer: {
    paddingTop: hp(1),
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: wp(3),
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#000',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    marginBottom: hp(2),
    flexDirection: 'row',
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
  cardImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    marginRight: wp(4),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
     cardDescription: {
     fontSize: wp(3.5),
     color: '#666',
     lineHeight: hp(2.5),
   },
});
