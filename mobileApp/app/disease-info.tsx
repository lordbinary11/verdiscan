import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DiseaseInfoScreen() {
  const { disease } = useLocalSearchParams();
  const diseaseData = disease ? JSON.parse(disease as string) : null;

  if (!diseaseData) {
    return (
      <View style={styles.container}>
        <Text>Disease information not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{diseaseData.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Image */}
      <Image source={diseaseData.image} style={styles.mainImage} />

      {/* Content Card */}
      <View style={styles.contentCard}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.contentText}>
            {diseaseData.name} is a serious plant disease that affects {diseaseData.category.toLowerCase()} plants. 
            This disease can cause significant damage to crops and reduce yields if not properly managed.
          </Text>

          <Text style={styles.sectionTitle}>Characteristics of {diseaseData.name}</Text>
          
          <Text style={styles.contentText}>
            The {diseaseData.name} is known for its distinctive symptoms and rapid spread. 
            It typically manifests through visible signs on the plant's leaves, stems, and sometimes roots. 
            Early detection is crucial for effective management and control of this disease.
          </Text>

          <Text style={styles.sectionTitle}>Symptoms</Text>
          
          <Text style={styles.contentText}>
            • {diseaseData.name === 'Cassava Mosaic Disease' && 'Yellow mosaic patterns on leaves'}
            {diseaseData.name === 'Cassava Brown Streak Disease' && 'Brown streaks in roots and yellowing leaves'}
            {diseaseData.name === 'Maize Rust' && 'Reddish-brown pustules on leaves, stems, and ears'}
            {diseaseData.name === 'Maize Leaf Blight' && 'Large, tan to brown lesions on leaves'}
            {diseaseData.name === 'Tomato Early Blight' && 'Dark brown spots with concentric rings'}
            {diseaseData.name === 'Tomato Late Blight' && 'Water-soaked lesions on leaves, stems, and fruits'}
          </Text>

          <Text style={styles.contentText}>
            • Stunted growth and reduced plant vigor
          </Text>

          <Text style={styles.contentText}>
            • Decreased yield and quality of harvest
          </Text>

          <Text style={styles.sectionTitle}>Management and Control</Text>
          
          <Text style={styles.contentText}>
            Effective management of {diseaseData.name} requires an integrated approach including:
          </Text>

          <Text style={styles.contentText}>
            • Use of resistant varieties when available
          </Text>

          <Text style={styles.contentText}>
            • Proper crop rotation and field sanitation
          </Text>

          <Text style={styles.contentText}>
            • Timely application of appropriate fungicides or other control measures
          </Text>

          <Text style={styles.contentText}>
            • Regular monitoring and early detection of symptoms
          </Text>

          <Text style={styles.sectionTitle}>Prevention</Text>
          
          <Text style={styles.contentText}>
            Prevention is always better than cure. Implementing good agricultural practices, 
            maintaining proper plant spacing, and ensuring adequate nutrition can help 
            reduce the risk of {diseaseData.name} infection.
          </Text>
        </ScrollView>
      </View>
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
  },
  backButton: {
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
  mainImage: {
    width: '100%',
    height: hp(30),
    resizeMode: 'cover',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    marginTop: -wp(2),
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  scrollContent: {
    flex: 1,
  },
  contentText: {
    fontSize: wp(4),
    color: '#000',
    lineHeight: hp(3),
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hp(3),
    marginBottom: hp(1),
  },
}); 