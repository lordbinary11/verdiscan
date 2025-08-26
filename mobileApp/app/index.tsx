import { Colors } from "@/constants/Colors";
import { hp, wp } from "@/helpers/dimentions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Index() {
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const done = await AsyncStorage.getItem("onboardingComplete");

        setTimeout(() => {
          if (done === "true") {
            router.replace("/main"); // User already onboarded
          } else {
            router.replace("/onboarding/step1"); // Start onboarding
          }
        }, 3000); // 3 second splash
      } catch (error) {
        console.error("Error reading onboarding status:", error);
        router.replace("/onboarding/step1");
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View
      style={styles.container}
    >
      <Image
        source={require('../assets/images/white.png')}
        style={styles.logo}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.logo_g
  },
  logo:{
    width: wp(50),
    height: hp(30)

  }
})
