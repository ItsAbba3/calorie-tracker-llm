// App.tsx - EXPO VERSION
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DatabaseService from './src/services/database/DatabaseService';
import NotificationService from './src/services/notification/NotificationService';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    initializeApp();

    // Cleanup on unmount
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // 1. راه‌اندازی دیتابیس
      await DatabaseService.init();
      console.log('✅ Database initialized');

      // 2. راه‌اندازی نوتیفیکیشن
      await NotificationService.init();
      console.log('✅ Notifications initialized');

      // 3. چک کردن وجود پروفایل کاربر
      const profile = await DatabaseService.getUserProfile();
      setHasProfile(profile !== null);

      // 4. اگر پروفایل داشت، یادآوری هوشمند را فعال کن
      if (profile) {
        await NotificationService.scheduleSmartReminders(profile.id);
        console.log('✅ Smart reminders scheduled');
      }

      setIsReady(true);

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setIsReady(true);
    }
  };

  // صفحه لودینگ
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361EE" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={hasProfile ? 'Home' : 'Onboarding'}
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress,
              },
            }),
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});