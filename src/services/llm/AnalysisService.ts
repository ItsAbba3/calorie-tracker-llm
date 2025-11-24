import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DatabaseService from '../services/database/DatabaseService';
import DatabaseService from '../database/DatabaseService';
import GroqService from './GroqService';
import * as Notifications from 'expo-notifications';
import moment from 'moment-jalaali';

class AnalysisService {
  // Generate and store an analysis message for a user.
  async generateAnalysisForUser(userId: number, type: string): Promise<void> {
    try {
      // collect last 7 days stats
      const endDate = moment().format('jYYYY/jMM/jDD');
      const startDate = moment().subtract(6, 'days').format('jYYYY/jMM/jDD');
      const stats = await DatabaseService.getWeeklyStats(userId, startDate, endDate);

      // prepare simplified weekly data for model
      const weeklyData = [] as Array<{date:string; total_calories:number; meals:number}>;
      for (const s of stats) {
        const meals = await DatabaseService.getMealsForDate(userId, s.date);
        weeklyData.push({ date: s.date, total_calories: s.daily_total || 0, meals: meals.length });
      }

      const analysis = await GroqService.analyzeEatingPattern(weeklyData);

      const message = `بینش‌ها:\n- ${analysis.insights.join('\n- ')}\n\nتوصیه‌ها:\n- ${analysis.recommendations.join('\n- ')}`;

      await DatabaseService.addLLMMessage(userId, type, message);

      // Send a local notification briefly summarizing
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 تحلیل مصرف غذای شما',
          body: analysis.insights && analysis.insights.length ? analysis.insights[0] : 'تحلیل جدید در اپ موجود است',
          data: { type: 'llm_analysis' },
        },
        trigger: null,
      });

    } catch (error) {
      console.error('تحلیل تولید خطا:', error);
    }
  }

  // Check if analyses are due and generate them.
  async checkAndGeneratePending(userId: number): Promise<void> {
    try {
      const last = await DatabaseService.getLatestLLMMessage(userId);
      const now = moment();

      // determine last run times
      let lastAt = last ? moment(last.created_at) : null;

      // daily (once per day) - generate if last is null or >1 day
      if (!lastAt || now.diff(lastAt, 'days') >= 1) {
        await this.generateAnalysisForUser(userId, 'daily');
        lastAt = moment();
      }

      // every-3-days
      const last3 = last ? moment(last.created_at) : null;
      if (!last3 || now.diff(last3, 'days') >= 3) {
        await this.generateAnalysisForUser(userId, '3day');
      }

      // weekly
      const lastWeek = last ? moment(last.created_at) : null;
      if (!lastWeek || now.diff(lastWeek, 'days') >= 7) {
        await this.generateAnalysisForUser(userId, 'weekly');
      }

    } catch (error) {
      console.error('بررسی و تولید تحلیل‌های معلق خطا:', error);
    }
  }
}

export default new AnalysisService();

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
    <View style={styles.container}>
      <Text style={styles.title}>خوش آمدی! بیایید پروفایل شما را کامل کنیم</Text>

      <Text style={styles.label}>نام</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="مثال: علی" />

      <Text style={styles.label}>سن</Text>
      <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="مثال: ۳۰" />

      <Text style={styles.label}>قد (سانتیمتر)</Text>
      <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="مثال: ۱۷۵" />

      <Text style={styles.label}>وزن (کیلو)</Text>
      <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="مثال: ۷۰" />

      <TouchableOpacity onPress={save} style={styles.button}>
        <Text style={styles.buttonText}>شروع سالم و های‌تِک</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f6fff9', alignItems: 'flex-end' },
  title: { fontSize: 22, fontWeight: '700', color: '#0b6e4f', marginBottom: 20, textAlign: 'right' },
  label: { alignSelf: 'stretch', color: '#0b6e4f', marginTop: 8, textAlign: 'right' },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginTop: 6, textAlign: 'right' },
  button: { marginTop: 20, backgroundColor: '#0b8f67', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});

import DatabaseService from '../database/DatabaseService';

type ParsedFood = {
  name: string;
  quantity?: number;
  unit?: string | null;
};

async function analyzeFoods(parsedFoods: ParsedFood[]) {
  let total = 0;
  const details = [];

  for (const item of parsedFoods) {
    const qty = item.quantity ?? 1;
    const unit = item.unit ?? null;
    const { calories, matched } = await DatabaseService.calculateCalories(item.name, qty, unit);
    details.push({
      name: item.name,
      quantity: qty,
      unit,
      calories,
      matchedName: matched ? matched.name : null,
    });
    total += calories;
  }

  return { totalCalories: total, items: details };
}

export default { analyzeFoods };
