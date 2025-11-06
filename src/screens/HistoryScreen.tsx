// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import moment from 'moment-jalaali';
import DatabaseService from '../services/database/DatabaseService';
import { MealEntry } from '../services/database/DatabaseService';

const HistoryScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weekDates, setWeekDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [weeklySummaries, setWeeklySummaries] = useState<Array<{weekLabel:string; total:number; target:number}>>([]);

  useEffect(() => {
    generateWeekDates();
    loadMeals();
  }, [selectedDate]);

  // تولید تاریخ‌های هفته
  const generateWeekDates = () => {
    const dates: any[] = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(moment().subtract(i, 'days'));
    }
    setWeekDates(dates);
  };

  // بارگذاری وعده‌های غذایی
  const loadMeals = async () => {
    try {
      setIsLoading(true);
      const profile = await DatabaseService.getUserProfile();
      if (!profile) return;

      const dateStr = selectedDate.format('jYYYY/jMM/jDD');
      const mealsData = await DatabaseService.getMealsForDate(profile.id, dateStr);
      
      setMeals(mealsData);
      
      const total = mealsData.reduce((sum, m) => sum + m.total_calories, 0);
      setDailyTotal(total);

      // load weekly summaries (last 4 weeks)
      const summaries: Array<{weekLabel:string; total:number; target:number}> = [];
      for (let w = 0; w < 4; w++) {
        const end = moment().subtract(w * 7, 'days');
        const start = end.clone().subtract(6, 'days');
        const startStr = start.format('jYYYY/jMM/jDD');
        const endStr = end.format('jYYYY/jMM/jDD');

        const stats = await DatabaseService.getWeeklyStats(profile.id, startStr, endStr);
        const weekTotal = stats.reduce((s, d) => s + (d.daily_total || 0), 0);
        summaries.push({ weekLabel: `هفتهٔ ${4 - w}`, total: weekTotal, target: profile.daily_calorie_target * 7 });
      }
      setWeeklySummaries(summaries.reverse());

    } catch (error) {
      console.error('Load meals error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // رفرش دستی
  const onRefresh = () => {
    loadMeals();
  };

  // گروه‌بندی وعده‌ها بر اساس زمان
  const getMealsByCategory = () => {
    const categories = {
      morning: meals.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        return hour >= 5 && hour < 12;
      }),
      afternoon: meals.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        return hour >= 12 && hour < 17;
      }),
      evening: meals.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        return hour >= 17 || hour < 5;
      }),
    };
    return categories;
  };

  const categorizedMeals = getMealsByCategory();

  return (
    <View style={styles.container}>
      {/* هدر */}
      <View style={[styles.header, styles.headerRight]}>
        <Text style={styles.headerTitle}>تاریخچه 📅</Text>
      </View>

      {/* انتخاب تاریخ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
        contentContainerStyle={styles.dateSelectorContent}
      >
        {weekDates.map((date) => {
          const isSelected = date.format('jYYYY/jMM/jDD') === selectedDate.format('jYYYY/jMM/jDD');
          const isToday = date.format('jYYYY/jMM/jDD') === moment().format('jYYYY/jMM/jDD');

          return (
            <TouchableOpacity
              key={date.format('jYYYY/jMM/jDD')}
              style={[styles.dateCard, isSelected && styles.dateCardActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
                {date.format('jDD')}
              </Text>
              <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>
                {date.format('jMMM')}
              </Text>
              {isToday && (
                <View style={styles.todayDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* لیست وعده‌ها - نمایش اول */}
      <ScrollView
        style={styles.mealsContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* صبحانه */}
        {categorizedMeals.morning.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>🌅 صبحانه</Text>
            {categorizedMeals.morning.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <Text style={styles.mealName}>
                    {meal.quantity} {meal.unit} {meal.food_name}
                  </Text>
                </View>
                <Text style={styles.mealCalories}>
                  {Math.round(meal.total_calories)} کالری
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ناهار */}
        {categorizedMeals.afternoon.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>☀️ ناهار</Text>
            {categorizedMeals.afternoon.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <Text style={styles.mealName}>
                    {meal.quantity} {meal.unit} {meal.food_name}
                  </Text>
                </View>
                <Text style={styles.mealCalories}>
                  {Math.round(meal.total_calories)} کالری
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* شام */}
        {categorizedMeals.evening.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>🌙 شام</Text>
            {categorizedMeals.evening.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <Text style={styles.mealName}>
                    {meal.quantity} {meal.unit} {meal.food_name}
                  </Text>
                </View>
                <Text style={styles.mealCalories}>
                  {Math.round(meal.total_calories)} کالری
                </Text>
              </View>
            ))}
          </View>
        )}

        {meals.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>در این روز وعده‌ای ثبت نشده</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* کل کالری روز - بعد از لیست */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>کل کالری</Text>
        <Text style={styles.summaryValue}>{Math.round(dailyTotal)}</Text>
        <Text style={styles.summaryMeals}>{meals.length} وعده غذایی</Text>
      </View>

      {/* خلاصه هفتگی - آخر */}
      {weeklySummaries.length > 0 && (
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 }}>خلاصه هفتگی</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
            {weeklySummaries.map((w, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                <Text>{w.weekLabel}</Text>
                <Text style={{ fontWeight: '600' }}>{Math.round(w.total)} / {w.target} کالری</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
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
  dateSelector: {
    maxHeight: 90,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F2',
  },
  dateSelectorContent: {
    padding: 15,
    gap: 10,
  },
  dateCard: {
    width: 60,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    position: 'relative',
  },
  dateCardActive: {
    backgroundColor: '#4361EE',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dateDayActive: {
    color: '#fff',
  },
  dateMonth: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dateMonthActive: {
    color: '#E0E7FF',
  },
  todayDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
  },
  summaryCard: {
    margin: 20,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4361EE',
    marginBottom: 5,
  },
  summaryMeals: {
    fontSize: 14,
    color: '#999',
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mealLeft: {
    flex: 1,
  },
  mealTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    color: '#333',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4361EE',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default HistoryScreen;