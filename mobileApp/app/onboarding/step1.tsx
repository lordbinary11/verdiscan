import { hp, wp } from '@/helpers/dimentions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Mask, Path, Rect } from 'react-native-svg';

const step2 = () => {
  const handlePress = () => {
    router.push("./step3");
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/step.jpg')} 
          style={styles.image} 
        />
      </View>

      <ImageBackground 
        source={require('../../assets/images/leaf2.png')} 
        style={styles.bottomContainer}
        imageStyle={{ resizeMode: 'cover', opacity: 0.5,  }}
      >
        <View style={styles.rowContent}>
          <View style={styles.textContainer}>
            <Text style={styles.heading}>Diagnose Plant Diseases</Text>
            <Text style={styles.description}>
            Find out what's wrong with your plants and get expert solutions to restore their health
            </Text>
          </View>
          <TouchableOpacity onPress={handlePress} style={styles.hexagonContainer}>
            <Svg width={wp(20)} height={hp(12)} viewBox="0 0 400 400" fill="none">
              <G clipPath="url(#clip0_105_51)">
                <Mask id="mask0_105_51" maskUnits="userSpaceOnUse" x="10" y="27" width="381" height="347">
                  <Path d="M81.5487 59.6075C93.1598 39.4964 114.618 27.1075 137.84 27.1075L262.785 27.1075C286.007 27.1075 307.465 39.4964 319.076 59.6075L381.549 167.813C393.16 187.924 393.16 212.701 381.549 232.813L319.077 341.018C307.465 361.129 286.007 373.518 262.785 373.518L137.84 373.518C114.618 373.518 93.1599 361.129 81.5487 341.018L19.0765 232.813C7.46536 212.701 7.46536 187.924 19.0765 167.813L81.5487 59.6075Z" fill="#C4C4C4"/>
                </Mask>
                <G mask="url(#mask0_105_51)">
                  <Rect x="-5" y="15" width="410" height="370" fill="#4CAF50"/>
                  <Rect x="-5" y="15" width="410" height="370" stroke="#4CAF50" strokeWidth="16"/>
                  <Path d="M90.2088 64.6073C99.8801 47.8563 117.625 37.4369 136.92 37.1152L137.84 37.1073L262.785 37.1076C282.434 37.1077 300.591 47.5903 310.416 64.6072L372.889 172.813C382.56 189.564 382.711 210.141 373.342 227.012L372.888 227.812L310.416 336.018C300.592 353.035 282.435 363.518 262.785 363.518L137.84 363.518C118.191 363.518 100.034 353.035 90.2092 336.018L27.7365 227.812C17.912 210.795 17.9121 189.83 27.7368 172.813L90.2088 64.6073Z" stroke="#4CAF50" strokeWidth="20"/>
                  <Path d="M85.8787 62.1073C96.4293 43.8333 115.788 32.4665 136.837 32.1159L137.84 32.1073L262.785 32.1077C284.221 32.1077 304.028 43.5433 314.746 62.1072L377.219 170.313C387.769 188.587 387.934 211.035 377.713 229.439L377.219 230.312L314.747 338.518C304.029 357.082 284.221 368.518 262.785 368.518L137.84 368.518C116.405 368.518 96.5971 357.082 85.8791 338.518L23.4064 230.312C12.6887 211.748 12.6888 188.877 23.4067 170.313L85.8787 62.1073Z" stroke="#4CAF50" strokeWidth="10"/>
                </G>
              </G>
              <Defs>
                <ClipPath id="clip0_105_51">
                  <Rect width="400" height="400" fill="white"/>
                </ClipPath>
              </Defs>
            </Svg>
            <View style={styles.hexagonInner}>
              <Ionicons name="arrow-forward" size={wp(6)} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default step2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    width: wp(100),
    height: hp(70 ),
    backgroundColor: 'transparent',
    borderBottomRightRadius: wp(15),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  bottomContainer: {
    width: wp(100),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    gap: wp(2),
  },
  textContainer: {
    flex: 1,
  },
  heading: {
    color: 'black',
    fontFamily: 'Merriweather-Bold',
    fontSize: wp(7),
    marginBottom: hp(1),
  },
  description: {
    fontSize: wp(4),
    color: '#333',
    fontFamily: 'Merriweather'
  },
  hexagonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(8),
    height: hp(4),
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});
