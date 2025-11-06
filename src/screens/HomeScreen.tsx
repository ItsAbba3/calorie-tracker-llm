// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moment from 'moment-jalaali';
import DatabaseService from '../services/database/DatabaseService';
import GroqService from '../services/llm/GroqService';
import { UserProfile, MealEntry } from '../services/database/DatabaseService';

// تنظیم locale به فارسی
moment.loadPersian({ dialect: 'persian-modern' });

const screenWidth = Dimensions.get('window').width;

const HomeScreen: React.FC = () => {
  // State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [foodInput, setFoodInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [weekLabels, setWeekLabels] = useState<string[]>([]);
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [dailyData, setDailyData] = useState<number[]>([]);

  // بارگذاری اولیه
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      if (!profile) {
        // اگر پروفایل نداشت، به صفحه Onboarding بره
        Alert.alert('خوش آمدید', 'لطفاً ابتدا اطلاعات خود را وارد کنید');
        // navigation.navigate('Onboarding');
        return;
      }

      setUserProfile(profile);

      // بارگذاری وعده‌های امروز
      const today = moment().format('jYYYY/jMM/jDD');
      const meals = await DatabaseService.getMealsForDate(profile.id, today);
      setTodayMeals(meals);

      const total = meals.reduce((sum, meal) => sum + meal.total_calories, 0);
      setTodayTotal(total);

    // prepare daily chart data
    const labels = meals.map(m => m.time);
    const data = meals.map(m => Math.round(m.total_calories));
  // create compact daily summary (sum per meal category)
  const morning = meals.filter(m => parseInt(m.time.split(':')[0]) >= 5 && parseInt(m.time.split(':')[0]) < 12).reduce((s, m) => s + m.total_calories, 0);
  const afternoon = meals.filter(m => parseInt(m.time.split(':')[0]) >= 12 && parseInt(m.time.split(':')[0]) < 17).reduce((s, m) => s + m.total_calories, 0);
  const evening = meals.filter(m => { const h = parseInt(m.time.split(':')[0]); return h >= 17 || h < 5; }).reduce((s, m) => s + m.total_calories, 0);
  setDailyLabels(['صبح', 'ناهار', 'شام']);
  setDailyData([Math.round(morning), Math.round(afternoon), Math.round(evening)]);

      // بارگذاری داده‌های هفتگی برای نمودار
      await loadWeeklyChart(profile.id);

    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('خطا', 'مشکلی در بارگذاری داده‌ها پیش آمد');
    }
  };

  const loadWeeklyChart = async (userId: number) => {
    const endDate = moment().format('jYYYY/jMM/jDD');
    const startDate = moment().subtract(6, 'days').format('jYYYY/jMM/jDD');

    const stats = await DatabaseService.getWeeklyStats(userId, startDate, endDate);

    // ایجاد آرایه 7 روزه
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      labels.push(date.format('jDD/jMM'));
      
      const dayData = stats.find(s => s.date === date.format('jYYYY/jMM/jDD'));
      data.push(dayData ? dayData.daily_total : 0);
    }

    setWeekLabels(labels);
    setWeeklyData(data);
  };

  // پردازش ورودی غذا
  const handleSubmitFood = async () => {
    if (!foodInput.trim() || !userProfile) return;

    setIsProcessing(true);

    try {
      // 1. جستجوی غذاها در دیتابیس
      const allFoods = await DatabaseService.searchFoods('');

      // 2. ارسال به Groq برای پارس کردن
      const parseResult = await GroqService.parseUserInputToSQL(
        foodInput,
        allFoods.map(f => ({
          name: f.name,
          unit: f.unit,
          calories_per_unit: f.calories_per_unit,
        }))
      );

      if (!parseResult.detected_items || parseResult.detected_items.length === 0) {
        Alert.alert('خطا', 'غذایی شناسایی نشد. لطفاً واضح‌تر بنویسید.');
        return;
      }

      // 3. محاسبه کالری با SQL
      const totalCalories = await DatabaseService.executeCalorieQuery(
        parseResult.sql_query
      );

      // 4. ذخیره در دیتابیس
      const today = moment().format('jYYYY/jMM/jDD');
      const now = moment().format('HH:mm');

      for (const item of parseResult.detected_items) {
        await DatabaseService.saveMealEntry({
          user_id: userProfile.id,
          food_name: item.food,
          quantity: item.quantity,
          unit: item.unit,
          total_calories: totalCalories / parseResult.detected_items.length, // تقسیم بین آیتم‌ها
          raw_input: foodInput,
          date: today,
          time: now,
        });
      }

      // 5. رفرش کردن UI
      await initializeData();
      setFoodInput('');

      Alert.alert(
        '✅ ثبت شد!',
        `${Math.round(totalCalories)} کالری اضافه شد.\n\n${parseResult.explanation || ''}`
      );

    } catch (error: any) {
      console.error('Food processing error:', error);
      Alert.alert('خطا', error.message || 'مشکلی پیش آمد');
    } finally {
      setIsProcessing(false);
    }
  };

  // محاسبه درصد پیشرفت
  const getProgress = () => {
    if (!userProfile) return 0;
    return Math.min((todayTotal / userProfile.daily_calorie_target) * 100, 100);
  };

  const getRemainingCalories = () => {
    if (!userProfile) return 0;
    return Math.max(userProfile.daily_calorie_target - todayTotal, 0);
  };

  return (
    <ScrollView style={styles.container}>
      {/* هدر */}
      <View style={[styles.header, styles.headerRight]}> 
        <Text style={styles.headerTitle}>
          {userProfile ? `سلام، ${userProfile.name} 👋` : 'سلام! 👋'}
        </Text>
        <Text style={styles.headerDate}>{moment().format('jYYYY/jMM/jDD')}</Text>
      </View>

      {/* کارت پیشرفت روزانه */}
      {userProfile && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>کالری امروز</Text>
          
          <View style={styles.calorieRow}>
            <Text style={styles.calorieText}>
              {Math.round(todayTotal)}
            </Text>
            <Text style={styles.calorieSeparator}> / </Text>
            <Text style={styles.targetText}>
              {userProfile.daily_calorie_target}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${getProgress()}%` }
              ]} 
            />
          </View>

          <Text style={styles.remainingText}>
            {getRemainingCalories()} کالری باقی‌مانده
          </Text>
        </View>
      )}

      {/* ورودی غذا */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>چی خوردی؟ 🍽️</Text>
        
        <TextInput
          style={styles.textInput}
          placeholder="مثلاً: یک نان سنگک و دو تخم مرغ"
          placeholderTextColor="#999"
          value={foodInput}
          onChangeText={setFoodInput}
          multiline
          numberOfLines={3}
          editable={!isProcessing}
        />

        <TouchableOpacity
          style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
          onPress={handleSubmitFood}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>ثبت غذا</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* نمودار هفتگی */}
      {/* weekly chart moved to History tab */}

      {/* نمودار روزانه */}
      {dailyData.length > 0 && (
        <View style={[styles.chartCard, { marginTop: 10 }]}>
          <Text style={styles.chartTitle}>خلاصهٔ روزانه</Text>
          <BarChart
            data={{ labels: ['', '', ''], datasets: [{ data: dailyData }] }}
            width={screenWidth - 80}
            height={140}
            fromZero
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={{ ...styles.chart, paddingRight: 10 }}
            yAxisLabel={""}
            yAxisSuffix={""}
          />

          {/* Custom labels and values under the chart so we can show exact numbers on top of bars */}
          <View style={[styles.barMetaRow, { width: screenWidth - 80 }] }>
            {dailyData.map((val, idx) => (
              <View key={idx} style={styles.barCell}>
                <Text style={styles.barValue}>{Math.round(val)}</Text>
                <Text style={styles.barLabel}>{dailyLabels[idx]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* لیست وعده‌های امروز */}
      {todayMeals.length > 0 && (
        <View style={styles.mealsCard}>
          <Text style={styles.mealsTitle}>وعده‌های امروز ({todayMeals.length})</Text>
          
          {todayMeals.map((meal, index) => (
            <View key={meal.id} style={styles.mealItem}>
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
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerDate: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  progressCard: {
    margin: 20,
    marginBottom: 15,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  calorieText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4361EE',
  },
  calorieSeparator: {
    fontSize: 24,
    color: '#999',
  },
  targetText: {
    fontSize: 28,
    color: '#666',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E9F2',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4361EE',
    borderRadius: 6,
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E9F2',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4361EE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  barMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  barCell: {
    alignItems: 'center',
    width: (screenWidth - 80) / 3,
  },
  barValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartLegend: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  mealsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
});

export default HomeScreen;