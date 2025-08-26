import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Merriweather': require('../assets/fonts/merriweather/Merriweather_24pt-Regular.ttf'),
    'Merriweather-Bold': require('../assets/fonts/merriweather/Merriweather_24pt-Bold.ttf'),
    // Add more variants if needed
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
