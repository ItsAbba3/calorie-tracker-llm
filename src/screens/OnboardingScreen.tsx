// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import DatabaseService from '../services/database/DatabaseService';

type Props = {
  navigation: StackNavigationProp<any>;
};

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  // State
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<'lose' | 'gain' | 'maintain'>('maintain');

  // Validation
  const validateStep1 = (): boolean => {
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      Alert.alert('خطا', 'لطفاً سن خود را به درستی وارد کنید (10-100)');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weight || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      Alert.alert('خطا', 'لطفاً وزن خود را به درستی وارد کنید (30-300 کیلوگرم)');
      return false;
    }

    if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      Alert.alert('خطا', 'لطفاً قد خود را به درستی وارد کنید (100-250 سانتی‌متر)');
      return false;
    }

    return true;
  };

  // مرحله بعدی
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  // مرحله قبلی
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ذخیره نهایی
  const handleFinish = async () => {
    try {
      const profile = {
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        goal,
      };

      await DatabaseService.saveUserProfile(profile);

      Alert.alert(
        '🎉 خوش آمدید!',
        'پروفایل شما با موفقیت ایجاد شد',
        [
          {
            text: 'شروع کنیم',
            onPress: () => navigation.replace('Home'),
          },
        ]
      );

    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('خطا', 'مشکلی در ذخیره اطلاعات پیش آمد');
    }
  };

  // رندر مرحله 1: سن و جنسیت
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>درباره شما بگویید</Text>

      {/* سن */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>سن شما</Text>
        <TextInput
          style={styles.input}
          placeholder="مثلاً: 25"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          maxLength={3}
        />
      </View>

      {/* جنسیت */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>جنسیت</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.optionButton, gender === 'male' && styles.optionButtonActive]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.optionText, gender === 'male' && styles.optionTextActive]}>
              مرد 👨
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, gender === 'female' && styles.optionButtonActive]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.optionText, gender === 'female' && styles.optionTextActive]}>
              زن 👩
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // رندر مرحله 2: وزن و قد
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>اندازه‌های بدنی</Text>

      {/* وزن */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>وزن (کیلوگرم)</Text>
        <TextInput
          style={styles.input}
          placeholder="مثلاً: 70"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
      </View>

      {/* قد */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>قد (سانتی‌متر)</Text>
        <TextInput
          style={styles.input}
          placeholder="مثلاً: 175"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
      </View>
    </View>
  );

  // رندر مرحله 3: هدف
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>هدف شما چیست؟</Text>

      <TouchableOpacity
        style={[styles.goalCard, goal === 'lose' && styles.goalCardActive]}
        onPress={() => setGoal('lose')}
      >
        <Text style={styles.goalEmoji}>📉</Text>
        <Text style={styles.goalTitle}>کاهش وزن</Text>
        <Text style={styles.goalDesc}>کسری 500 کالری در روز</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.goalCard, goal === 'maintain' && styles.goalCardActive]}
        onPress={() => setGoal('maintain')}
      >
        <Text style={styles.goalEmoji}>⚖️</Text>
        <Text style={styles.goalTitle}>تثبیت وزن</Text>
        <Text style={styles.goalDesc}>حفظ وزن فعلی</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.goalCard, goal === 'gain' && styles.goalCardActive]}
        onPress={() => setGoal('gain')}
      >
        <Text style={styles.goalEmoji}>📈</Text>
        <Text style={styles.goalTitle}>افزایش وزن</Text>
        <Text style={styles.goalDesc}>مازاد 500 کالری در روز</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calorie Tracker</Text>
          <Text style={styles.headerSubtitle}>با هوش مصنوعی 🤖</Text>
          
          {/* پیشرفت */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((num) => (
              <View
                key={num}
                style={[
                  styles.progressDot,
                  step >= num && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* محتوای مراحل */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* دکمه‌ها */}
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>قبلی</Text>
            </TouchableOpacity>
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>بعدی</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>شروع کنیم! 🚀</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4361EE',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E9F2',
  },
  progressDotActive: {
    backgroundColor: '#4361EE',
    width: 30,
  },
  stepContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E9F2',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  optionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E9F2',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#4361EE',
    backgroundColor: '#E7ECFF',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
  optionTextActive: {
    color: '#4361EE',
    fontWeight: '600',
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E9F2',
    backgroundColor: '#fff',
    marginBottom: 15,
    alignItems: 'center',
  },
  goalCardActive: {
    borderColor: '#4361EE',
    backgroundColor: '#E7ECFF',
  },
  goalEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  goalDesc: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E9F2',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4361EE',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  finishButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#4361EE',
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;