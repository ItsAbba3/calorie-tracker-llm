// src/screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import DatabaseService from '../services/database/DatabaseService';
import NotificationService from '../services/notification/NotificationService';
import { UserProfile } from '../services/database/DatabaseService';
import moment from 'moment-jalaali';
import { useNavigation } from '@react-navigation/native';
import ConfigService from '../services/config/ConfigService';
import AnalysisService from '../services/llm/AnalysisService';

const SettingsScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('13:00');
  const [dinnerTime, setDinnerTime] = useState('20:00');
  const [editableName, setEditableName] = useState('');
  const [editableWeight, setEditableWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<Array<{id:number; weight:number; date:string;}>>([]);
  const [groqKey, setGroqKey] = useState('');

  useEffect(() => {
    loadProfile();
    (async () => {
      try {
        const key = await ConfigService.getStoredGroqApiKey();
        setGroqKey(key);
      } catch (e) {
        console.warn('Failed to load groq key:', e);
      }
    })();
  }, []);

  const navigation = useNavigation<any>();

  const loadProfile = async () => {
    const userProfile = await DatabaseService.getUserProfile();
    setProfile(userProfile);
    if (userProfile) {
      setEditableName(userProfile.name || '');
      setEditableWeight(String(userProfile.weight));
      const wh = await DatabaseService.getWeightHistory(userProfile.id);
      setWeightHistory(wh);
    }
  };

  // تغییر وضعیت نوتیفیکیشن
  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);

    if (value) {
      // فعال‌سازی یادآوری‌ها
      await NotificationService.scheduleFixedReminders({
        breakfast: breakfastTime,
        lunch: lunchTime,
        dinner: dinnerTime,
      });
      Alert.alert('✅ فعال شد', 'یادآوری‌ها فعال شدند');
    } else {
      // غیرفعال‌سازی
      await NotificationService.cancelAllReminders();
      Alert.alert('⏸️ غیرفعال شد', 'یادآوری‌ها غیرفعال شدند');
    }
  };

  // ذخیره زمان‌های یادآوری
  const saveReminderTimes = async () => {
    try {
      await NotificationService.scheduleFixedReminders({
        breakfast: breakfastTime,
        lunch: lunchTime,
        dinner: dinnerTime,
      });
      Alert.alert('✅ ذخیره شد', 'زمان‌های یادآوری به‌روز شدند');
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در ذخیره‌سازی پیش آمد');
    }
  };

  // فعال‌سازی یادآوری هوشمند
  const enableSmartReminders = async () => {
    if (!profile) return;

    try {
      await NotificationService.scheduleSmartReminders(profile.id);
      Alert.alert(
        '🤖 هوشمند شد!',
        'یادآوری‌ها بر اساس الگوی مصرف شما تنظیم شدند'
      );
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در تنظیم یادآوری هوشمند پیش آمد');
    }
  };

  // پاک کردن تمام داده‌ها
  const clearAllData = () => {
    Alert.alert(
      '⚠️ هشدار',
      'آیا مطمئنید می‌خواهید تمام داده‌ها را پاک کنید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'بله، پاک کن',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.clearAllData();
              // reload local state
              await loadProfile();
              Alert.alert('پاک شد', 'تمام داده‌ها حذف شدند');
              // navigate to onboarding so user can re-create profile
              navigation.navigate('Onboarding');
            } catch (error) {
              console.error('Clear data error:', error);
              Alert.alert('خطا', 'مشکلی در پاک‌سازی داده‌ها پیش آمد');
            }
          },
        },
      ]
    );
  };

  const saveProfileChanges = async () => {
    if (!profile) return;

    try {
      await DatabaseService.updateUserProfile(profile.id, {
        name: editableName.trim(),
      });
      // if weight changed, update profile weight and add weight history entry
      const newWeight = parseFloat(editableWeight);
      if (!isNaN(newWeight) && newWeight !== profile.weight) {
        await DatabaseService.updateUserProfile(profile.id, { weight: newWeight });
        const today = moment().format('jYYYY/jMM/jDD');
        await DatabaseService.addWeightEntry(profile.id, newWeight, today);
        // generate weight-change analysis
        try {
          await AnalysisService.generateAnalysisForUser(profile.id, 'weight_change');
        } catch (e) {
          console.warn('Weight-change analysis failed:', e);
        }
      }

      Alert.alert('✅ ذخیره شد', 'پروفایل به‌روز شد');
      await loadProfile();
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('خطا', 'مشکلی در ذخیره‌سازی پیش آمد');
    }
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'lose':
        return 'کاهش وزن 📉';
      case 'gain':
        return 'افزایش وزن 📈';
      default:
        return 'تثبیت وزن ⚖️';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* هدر */}
      <View style={[styles.header, styles.headerRight]}>
        <Text style={[styles.headerTitle, { textAlign: 'right' }]}>تنظیمات ⚙️</Text>
      </View>

      {/* پروفایل کاربر */}
      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پروفایل شما</Text>

          <View style={styles.profileCard}>
            {/* Editable name */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>نام</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F9FAFB' }]}
                value={editableName}
                onChangeText={setEditableName}
              />
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>سن:</Text>
              <Text style={styles.profileValue}>{profile.age} سال</Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>جنسیت:</Text>
              <Text style={styles.profileValue}>
                {profile.gender === 'male' ? 'مرد 👨' : 'زن 👩'}
              </Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>وزن فعلی:</Text>
              <Text style={styles.profileValue}>{profile.weight} کیلوگرم</Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>ثبت وزن جدید</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F9FAFB' }]}
                value={editableWeight}
                onChangeText={setEditableWeight}
                keyboardType="numeric"
                placeholder="مثلاً: 70"
              />
            </View>

            <TouchableOpacity style={[styles.saveButton, { marginTop: 12 }]} onPress={saveProfileChanges}>
              <Text style={styles.saveButtonText}>ذخیره تغییرات و ثبت وزن</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>هدف کالری روزانه:</Text>
              <Text style={styles.calorieTarget}>
                {profile.daily_calorie_target} کالری
              </Text>
            </View>
          </View>

          {/* Weight history list */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>تاریخچه وزن</Text>
            <View style={styles.card}>
              {weightHistory.length === 0 && (
                <Text style={{ color: '#666' }}>تاکنون وزنی ثبت نشده</Text>
              )}
              {weightHistory.map(w => (
                <View key={w.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text>{w.date}</Text>
                  <Text style={{ fontWeight: '600' }}>{w.weight} kg</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

          {/* Groq API Key */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>کلید API Groq</Text>
            <View style={styles.card}>
              <Text style={{ marginBottom: 8, color: '#666' }}>در اینجا می‌توانید کلید API سرویس Groq را وارد کنید. این کلید در فضای امن دستگاه ذخیره می‌شود.</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F9FAFB' }]}
                placeholder="sk-..."
                value={groqKey}
                onChangeText={setGroqKey}
                autoCapitalize="none"
              />

              <TouchableOpacity style={[styles.saveButton, { marginTop: 12 }]} onPress={async () => {
                try {
                  await ConfigService.setStoredGroqApiKey(groqKey.trim());
                  Alert.alert('✅ ذخیره شد', 'کلید API با موفقیت ذخیره شد');
                } catch (e) {
                  console.error('Save groq key failed:', e);
                  Alert.alert('خطا', 'ذخیره‌سازی کلید API ناموفق بود');
                }
              }}>
                <Text style={styles.saveButtonText}>ذخیره کلید API</Text>
              </TouchableOpacity>
            </View>
          </View>

      {/* یادآوری‌ها */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>یادآوری‌ها</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>فعال کردن یادآوری‌ها</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#ccc', true: '#4361EE' }}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>🌅 صبحانه</Text>
                <TextInput
                  style={styles.timeInput}
                  value={breakfastTime}
                  onChangeText={setBreakfastTime}
                  placeholder="08:00"
                  maxLength={5}
                />
              </View>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>☀️ ناهار</Text>
                <TextInput
                  style={styles.timeInput}
                  value={lunchTime}
                  onChangeText={setLunchTime}
                  placeholder="13:00"
                  maxLength={5}
                />
              </View>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>🌙 شام</Text>
                <TextInput
                  style={styles.timeInput}
                  value={dinnerTime}
                  onChangeText={setDinnerTime}
                  placeholder="20:00"
                  maxLength={5}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveReminderTimes}
              >
                <Text style={styles.saveButtonText}>ذخیره زمان‌ها</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smartButton}
                onPress={enableSmartReminders}
              >
                <Text style={styles.smartButtonText}>
                  🤖 فعال‌سازی یادآوری هوشمند
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* درباره اپ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>درباره اپ</Text>

        <View style={styles.card}>
          <Text style={styles.aboutText}>
            📱 کالری شمار با هوش مصنوعی
          </Text>
          <Text style={styles.aboutVersion}>نسخه 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            این اپلیکیشن با استفاده از هوش مصنوعی ساخته شده است.
            تمام داده‌های شما به صورت محلی در دستگاهتان ذخیره می‌شود.
          </Text>
        </View>
      </View>

      {/* منطقه خطرناک */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleDanger}>منطقه خطرناک</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={clearAllData}
        >
          <Text style={styles.dangerButtonText}>
            🗑️ پاک کردن تمام داده‌ها
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#4361EE',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionTitleDanger: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calorieTarget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361EE',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E9F2',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E5E9F2',
    borderRadius: 8,
    padding: 10,
    width: 100,
    textAlign: 'center',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E9F2',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4361EE',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  smartButton: {
    backgroundColor: '#E7ECFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  smartButtonText: {
    color: '#4361EE',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  aboutDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;