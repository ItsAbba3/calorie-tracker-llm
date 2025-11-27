// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DatabaseService from '../services/database/DatabaseService';

export default function OnboardingScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [goal, setGoal] = useState<'lose' | 'gain' | 'maintain'>('maintain');

  const save = async () => {
    // اعتبارسنجی ورودی‌ها
    if (!name.trim() || !age || !height || !weight) {
      Alert.alert('خطا', 'لطفاً تمام فیلدها را پر کنید');
      return;
    }

    try {
      // استفاده از saveUserProfile که در SQLite ذخیره می‌کند
      await DatabaseService.saveUserProfile({
        name: name.trim(),
        age: parseInt(age) || 25,
        gender: gender,
        weight: parseFloat(weight) || 70,
        height: parseFloat(height) || 170,
        goal: goal,
      });
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('خطا', 'مشکلی در ذخیره اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>خوش آمدید! 🎉</Text>
          <Text style={styles.subtitle}>بیایید پروفایل شما را کامل کنیم</Text>

          <View style={styles.form}>
            <Text style={styles.label}>نام</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="مثال: علی"
              placeholderTextColor="#999"
              textAlign="right"
            />

            <Text style={styles.label}>سن</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="مثال: ۳۰"
              placeholderTextColor="#999"
              textAlign="right"
            />

            <Text style={styles.label}>قد (سانتیمتر)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="مثال: ۱۷۵"
              placeholderTextColor="#999"
              textAlign="right"
            />

            <Text style={styles.label}>وزن (کیلوگرم)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="مثال: ۷۰"
              placeholderTextColor="#999"
              textAlign="right"
            />

            <Text style={styles.label}>جنسیت</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, gender === 'male' && styles.radioButtonActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.radioText, gender === 'male' && styles.radioTextActive]}>
                  مرد
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, gender === 'female' && styles.radioButtonActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.radioText, gender === 'female' && styles.radioTextActive]}>
                  زن
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>هدف شما</Text>
            <View style={styles.goalGroup}>
              <TouchableOpacity
                style={[styles.goalButton, goal === 'lose' && styles.goalButtonActive]}
                onPress={() => setGoal('lose')}
              >
                <Text style={[styles.goalText, goal === 'lose' && styles.goalTextActive]}>
                  کاهش وزن
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.goalButton, goal === 'maintain' && styles.goalButtonActive]}
                onPress={() => setGoal('maintain')}
              >
                <Text style={[styles.goalText, goal === 'maintain' && styles.goalTextActive]}>
                  حفظ وزن
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.goalButton, goal === 'gain' && styles.goalButtonActive]}
                onPress={() => setGoal('gain')}
              >
                <Text style={[styles.goalText, goal === 'gain' && styles.goalTextActive]}>
                  افزایش وزن
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={save} style={styles.button}>
              <Text style={styles.buttonText}>شروع سالم و های‌تک ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00D9A5',
    marginBottom: 8,
    textAlign: 'right',
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'right',
    width: '100%',
  },
  form: {
    width: '100%',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'right',
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'right',
    borderWidth: 2,
    borderColor: '#E8F8F5',
  },
  radioGroup: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 12,
  },
  radioButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F8F5',
    minWidth: 100,
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#00D9A5',
    borderColor: '#00D9A5',
  },
  radioText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  radioTextActive: {
    color: '#FFFFFF',
  },
  goalGroup: {
    width: '100%',
    gap: 12,
  },
  goalButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F8F5',
    alignItems: 'flex-end',
  },
  goalButtonActive: {
    backgroundColor: '#00D9A5',
    borderColor: '#00D9A5',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'right',
  },
  goalTextActive: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 32,
    width: '100%',
    backgroundColor: '#00D9A5',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00D9A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
