// App.tsx - EXPO VERSION
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DatabaseService from './src/services/database/DatabaseService';
import NotificationService from './src/services/notification/NotificationService';
import AnalysisService from './src/services/llm/AnalysisService';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    // Order: Settings (left), History (center), Home (right)
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'تنظیمات ⚙️', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'تاریخچه 📅', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'خانه 🏠', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}

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
        // check and generate any pending LLM analyses
        try {
          await AnalysisService.checkAndGeneratePending(profile.id);
        } catch (e) {
          console.warn('Analysis check failed:', e);
        }
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
          initialRouteName={hasProfile ? 'Main' : 'Onboarding'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
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