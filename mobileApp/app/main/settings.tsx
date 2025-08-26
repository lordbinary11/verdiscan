import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export default function SettingsScreen() {
  const handleRestorePurchase = () => {
    Alert.alert('Restore Purchase', 'Purchase restoration feature coming soon!');
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Thank you for your interest! Rating feature coming soon.');
  };

  const handleShareApp = () => {
    Alert.alert('Share App', 'Share feature coming soon!');
  };

  const handleTermsConditions = () => {
    Alert.alert('Terms & Conditions', 'Terms and conditions will be displayed here.');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy will be displayed here.');
  };

  const purchaseItems: SettingItem[] = [
    {
      id: '1',
      title: 'Restore Purchase',
      icon: 'cart',
      onPress: handleRestorePurchase
    }
  ];

  const supportItems: SettingItem[] = [
    {
      id: '1',
      title: 'Rate App',
      icon: 'star',
      onPress: handleRateApp
    },
    {
      id: '2',
      title: 'Share App',
      icon: 'share-social',
      onPress: handleShareApp
    }
  ];

  const aboutItems: SettingItem[] = [
    {
      id: '1',
      title: 'Terms & Conditions',
      icon: 'star',
      onPress: handleTermsConditions
    },
    {
      id: '2',
      title: 'Privacy Policy',
      icon: 'share-social',
      onPress: handlePrivacyPolicy
    }
  ];

  const renderSettingItem = (item: SettingItem, isLast: boolean) => (
    <View key={item.id}>
      <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={wp(5)} color="#4CAF50" />
        </View>
        <Text style={styles.settingText}>{item.title}</Text>
      </TouchableOpacity>
      {!isLast && <View style={styles.separator} />}
    </View>
  );

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.separator} />
      {items.map((item, index) => renderSettingItem(item, index === items.length - 1))}
    </View>
  );

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
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Upgrade Banner */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumLeft}>
              <View style={styles.crownContainer}>
                <Ionicons name="crown" size={wp(8)} color="#FFA500" />
              </View>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Upgrade To Premium</Text>
                <Text style={styles.premiumSubtitle}>Get access to premium features</Text>
              </View>
            </View>
            <View style={styles.plantIcon}>
              <Ionicons name="leaf" size={wp(12)} color="#4CAF50" />
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {renderSection('Purchase', purchaseItems)}
        {renderSection('Support', supportItems)}
        {renderSection('About', aboutItems)}

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
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  premiumBanner: {
    backgroundColor: '#8B4513',
    borderRadius: wp(3),
    marginBottom: hp(3),
    overflow: 'hidden',
  },
  premiumContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crownContainer: {
    marginRight: wp(3),
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp(0.5),
  },
  premiumSubtitle: {
    fontSize: wp(3.5),
    color: '#E8E8E8',
  },
  plantIcon: {
    paddingLeft: wp(2),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    marginBottom: hp(2),
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
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(1),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  settingText: {
    fontSize: wp(4),
    color: '#000',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: hp(1),
  },
  bottomSpacing: {
    height: hp(4),
  },
});