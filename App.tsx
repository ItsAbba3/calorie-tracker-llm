// App.tsx - EXPO VERSION
import React, { useEffect, useState } from 'react';
import { I18nManager, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DatabaseService from './src/services/database/DatabaseService';
import NotificationService from './src/services/notification/NotificationService';
import AnalysisService from './src/services/llm/AnalysisService';
import * as SecureStore from 'expo-secure-store';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator برای صفحات اصلی
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00D9A5',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8F8F5',

          // 👇 مهم‌ترین بخش
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'خانه',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'تاریخچه',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>📊</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'تنظیمات',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color }}>⚙️</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

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
      let profile = await DatabaseService.getUserProfile();

      // If DB has no profile but we have a backup in SecureStore, attempt restore
      if (!profile) {
        try {
          const backup = await SecureStore.getItemAsync('profile_backup');
          if (backup) {
            console.log('Found profile backup in SecureStore — restoring to DB');
            const parsed = JSON.parse(backup);
            await DatabaseService.saveUserProfile({
              name: parsed.name || '',
              age: parsed.age || 25,
              gender: parsed.gender || 'male',
              weight: parsed.weight || 70,
              height: parsed.height || 170,
              goal: parsed.goal || 'maintain',
            });
            profile = await DatabaseService.getUserProfile();
          }
        } catch (e) {
          console.warn('Profile restore failed:', e);
        }
      }

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
        <ActivityIndicator size="large" color="#00D9A5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasProfile ? 'MainTabs' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9F7',
  },
});
