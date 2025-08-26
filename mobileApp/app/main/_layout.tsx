import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function MainTabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2E7D32', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="diagnose"
        options={{
          title: 'Detect',
          tabBarIcon: ({ color, size }) => <Ionicons name="camera" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
