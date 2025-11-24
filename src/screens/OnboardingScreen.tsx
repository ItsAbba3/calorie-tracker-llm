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
} from 'react-native';
import DatabaseService from '../services/database/DatabaseService';

export default function OnboardingScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const save = async () => {
    const profile = { name, age, height, weight, createdAt: Date.now() };
    await DatabaseService.saveProfile(profile);
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>خوش آمدی! بیایید پروفایل شما را کامل کنیم</Text>

        <Text style={styles.label}>نام</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="مثال: علی"
        />

        <Text style={styles.label}>سن</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="مثال: ۳۰"
        />

        <Text style={styles.label}>قد (سانتیمتر)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="مثال: ۱۷۵"
        />

        <Text style={styles.label}>وزن (کیلو)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="مثال: ۷۰"
        />

        <TouchableOpacity onPress={save} style={styles.button}>
          <Text style={styles.buttonText}>شروع سالم و های‌تِک</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f6fff9',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b6e4f',
    marginBottom: 20,
    textAlign: 'right',
  },
  label: {
    alignSelf: 'stretch',
    color: '#0b6e4f',
    marginTop: 8,
    textAlign: 'right',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#0b8f67',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});