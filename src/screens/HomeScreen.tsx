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
  Modal,
  Image,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moment from 'moment-jalaali';
import DatabaseService from '../services/database/DatabaseService';
import GroqService from '../services/llm/GroqService';
import { UserProfile, MealEntry } from '../services/database/DatabaseService';
import AnalysisService from '../services/llm/AnalysisService';

// Component to list all LLM messages with high-tech design
const AllLLMMessagesList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [msgs, setMsgs] = React.useState<Array<{id:number; type:string; content:string; created_at:string}>>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = await DatabaseService.getUserProfile();
        if (!profile) return;
        const all = await DatabaseService.getAllLLMMessages(profile.id);
        setMsgs(all);
      } catch (e) {
        console.warn('Failed to load LLM messages:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'daily': return 'تحلیل روزانه';
      case '3day': return 'تحلیل سه‌روزه';
      case 'weekly': return 'تحلیل هفتگی';
      case 'monthly': return 'تحلیل ماهانه';
      default: return 'تحلیل';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return moment(dateStr).format('jYYYY/jMM/jDD - HH:mm');
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color="#00D9A5" />
          <Text style={{ marginTop: 16, color: '#666', fontSize: 14 }}>در حال بارگذاری...</Text>
        </View>
      ) : msgs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🤖</Text>
          <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
            هنوز تحلیلی تولید نشده است
          </Text>
          <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            تحلیل‌های هوش مصنوعی به صورت خودکار تولید می‌شوند
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {msgs.map((m, index) => (
            <View 
              key={m.id} 
              style={[
                styles.aiMessageCard,
                { 
                  marginBottom: index === msgs.length - 1 ? 0 : 16,
                  borderLeftWidth: 4,
                  borderLeftColor: index % 3 === 0 ? '#00D9A5' : index % 3 === 1 ? '#4361EE' : '#FF6B9D'
                }
              ]}
            >
              <View style={styles.aiMessageHeader}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>🤖 AI</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.aiMessageType}>{getTypeLabel(m.type)}</Text>
                  <Text style={styles.aiMessageDate}>{formatDate(m.created_at)}</Text>
                </View>
              </View>
              <Text style={styles.aiMessageContent}>{m.content}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.modalFooter}>
        <TouchableOpacity 
          style={styles.modalCloseButton} 
          onPress={onClose}
        >
          <Text style={styles.modalCloseButtonText}>بستن</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  const [latestAnalysis, setLatestAnalysis] = useState<string | null>(null);
  const [latestAnalysisType, setLatestAnalysisType] = useState<string | null>(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);

  // بارگذاری اولیه
  useEffect(() => {
    initializeData();
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      if (!profile) return;
      const latest = await DatabaseService.getLatestLLMMessage(profile.id);
      if (latest) {
        setLatestAnalysis(latest.content);
        setLatestAnalysisType(latest.type);
      }
    } catch (e) {
      console.warn('Failed to load latest analysis:', e);
    }
  };

  const initializeData = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      if (!profile) {
        Alert.alert('خوش آمدید', 'لطفاً ابتدا اطلاعات خود را وارد کنید');
        return;
      }

      setUserProfile(profile);

      // بارگذاری وعده‌های امروز
      const today = moment().format('jYYYY/jMM/jDD');
      const meals = await DatabaseService.getMealsForDate(profile.id, today);
      setTodayMeals(meals);

      const total = meals.reduce((sum, meal) => sum + meal.total_calories, 0);
      setTodayTotal(total);

      // ایجاد خلاصه روزانه
      const morning = meals.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        return hour >= 5 && hour < 12;
      }).reduce((s, m) => s + m.total_calories, 0);
      
      const afternoon = meals.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        return hour >= 12 && hour < 17;
      }).reduce((s, m) => s + m.total_calories, 0);
      
      const evening = meals.filter(m => {
        const hour = parseInt(m.time.split(':')[0]);
        return hour >= 17 || hour < 5;
      }).reduce((s, m) => s + m.total_calories, 0);
      
      setDailyLabels(['صبح', 'ناهار', 'شام']);
      setDailyData([Math.round(morning), Math.round(afternoon), Math.round(evening)]);

      // بارگذاری داده‌های هفتگی
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
      const allFoods = await DatabaseService.searchFoods('');

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

      let totalCalories = 0;
      const normalize = (s: string) => s.trim().toLowerCase();

      const findFoodMatch = (detectedName: string) => {
        const d = normalize(detectedName);
        let found = allFoods.find(f => normalize(f.name) === d);
        if (found) return found;
        found = allFoods.find(f => normalize(f.name).includes(d));
        if (found) return found;
        found = allFoods.find(f => d.includes(normalize(f.name)));
        if (found) return found;
        const dWords = d.split(/\s+/).filter(Boolean);
        found = allFoods.find(f => {
          const dbn = normalize(f.name);
          return dWords.every(w => dbn.includes(w));
        });
        return found || null;
      };

      const perItemCalories: number[] = [];
      for (const item of parseResult.detected_items) {
        const detectedName = item.food || '';
        const qty = item.quantity || 0;
        const unit = item.unit || '';
        const matched = findFoodMatch(detectedName);
        let itemCal = 0;

        if (matched && matched.calories_per_unit > 0) {
          // اگر واحد دقیقاً یکسان است
          if (unit && matched.unit && (unit === matched.unit || unit.includes(matched.unit) || matched.unit.includes(unit))) {
            itemCal = qty * matched.calories_per_unit;
          } else {
            // تلاش برای تبدیل واحد
            try {
              const conv = await GroqService.convertUnits(foodInput, qty, unit || 'عدد', matched.unit || '100 گرم');
              if (conv && conv.conversion_factor && conv.conversion_factor > 0) {
                itemCal = qty * conv.conversion_factor * matched.calories_per_unit;
              } else {
                // اگر تبدیل واحد موفق نبود، از واحد دیتابیس استفاده کن
                itemCal = qty * matched.calories_per_unit;
              }
            } catch (e) {
              console.warn('Unit conversion failed:', e);
              // در صورت خطا، از واحد دیتابیس استفاده کن
              itemCal = qty * matched.calories_per_unit;
            }
          }
        } else if (matched && matched.calories_per_unit === 0) {
          console.warn(`Food "${detectedName}" found but calories_per_unit is 0`);
        } else {
          console.warn(`Food "${detectedName}" not found in database`);
        }

        // اگر هنوز کالری 0 است و SQL query داریم، از آن استفاده کن
        if (itemCal === 0 && parseResult.sql_query) {
          try {
            // ساخت SQL query برای این غذا خاص
            const foodSql = parseResult.sql_query.replace(
              /WHERE.*/i,
              `WHERE food_name LIKE '%${detectedName.replace(/'/g, "''")}%'`
            );
            const sqlCal = await DatabaseService.executeCalorieQuery(foodSql);
            if (sqlCal > 0) {
              itemCal = sqlCal;
            }
          } catch (e) {
            console.warn('Individual SQL calorie query failed:', e);
          }
        }

        perItemCalories.push(itemCal);
        totalCalories += itemCal;
      }

      // اگر کل کالری هنوز 0 است و SQL query کلی داریم، از آن استفاده کن
      if (totalCalories === 0 && parseResult.sql_query) {
        try {
          const sqlTotal = await DatabaseService.executeCalorieQuery(parseResult.sql_query);
          if (sqlTotal > 0) {
            totalCalories = sqlTotal;
            // تقسیم کالری بین آیتم‌ها به صورت مساوی
            const perItem = sqlTotal / parseResult.detected_items.length;
            for (let i = 0; i < perItemCalories.length; i++) {
              perItemCalories[i] = perItem;
            }
          }
        } catch (e) {
          console.warn('Fallback SQL calorie query failed:', e);
        }
      }

      const today = moment().format('jYYYY/jMM/jDD');
      const now = moment().format('HH:mm');

      for (let i = 0; i < parseResult.detected_items.length; i++) {
        const item = parseResult.detected_items[i];
        let itemCalories = perItemCalories[i] || 0;
        
        // اگر هنوز کالری 0 است، یک بار دیگر تلاش کن
        if (itemCalories === 0) {
          const matched = findFoodMatch(item.food || '');
          if (matched && matched.calories_per_unit > 0) {
            const qty = item.quantity || 0;
            itemCalories = qty * matched.calories_per_unit;
            console.log(`Recalculated calories for ${item.food}: ${itemCalories} (${qty} * ${matched.calories_per_unit})`);
          } else {
            console.warn(`Could not calculate calories for ${item.food}, matched:`, matched);
          }
        }

        // لاگ برای دیباگ
        console.log(`Saving meal: ${item.food}, quantity: ${item.quantity}, unit: ${item.unit}, calories: ${itemCalories}`);

        await DatabaseService.saveMealEntry({
          user_id: userProfile.id,
          food_name: item.food,
          quantity: item.quantity,
          unit: item.unit,
          total_calories: itemCalories,
          raw_input: foodInput,
          date: today,
          time: now,
        });
      }

      await initializeData();
      setFoodInput('');

      Alert.alert(
        '✅ ثبت شد!',
        `${Math.round(totalCalories)} کالری اضافه شد.\n\n${parseResult.explanation || ''}`
      );
      
      await loadLatestAnalysis();

    } catch (error: any) {
      console.error('Food processing error:', error);
      Alert.alert('خطا', error.message || 'مشکلی پیش آمد');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProgress = () => {
    if (!userProfile) return 0;
    return Math.min((todayTotal / userProfile.daily_calorie_target) * 100, 100);
  };

  const getRemainingCalories = () => {
    if (!userProfile) return 0;
    return Math.max(userProfile.daily_calorie_target - todayTotal, 0);
  };

  // حذف وعده غذایی
  const handleDeleteMeal = async (mealId: number) => {
    Alert.alert(
      'حذف وعده غذایی',
      'آیا مطمئن هستید که می‌خواهید این وعده را حذف کنید؟',
      [
        {
          text: 'انصراف',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteMealEntry(mealId);
              await initializeData();
              Alert.alert('✅', 'وعده غذایی با موفقیت حذف شد');
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('خطا', 'مشکلی در حذف وعده غذایی پیش آمد');
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (type: string | null) => {
    if (!type) return '';
    switch(type) {
      case 'daily': return 'تحلیل روزانه';
      case '3day': return 'تحلیل سه‌روزه';
      case 'weekly': return 'تحلیل هفتگی';
      case 'monthly': return 'تحلیل ماهانه';
      default: return 'تحلیل';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* هدر با گرادیانت */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {userProfile ? `سلام، ${userProfile.name || 'کاربر'} 👋` : 'سلام! 👋'}
              </Text>
              <Text style={styles.headerDate}>{moment().format('jYYYY/jMM/jDD')}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerGradient} />
      </View>

      {/* کارت پیشرفت روزانه */}
      {userProfile && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>کالری امروز</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {Math.round(getProgress())}%
              </Text>
            </View>
          </View>
          
          <View style={styles.calorieRow}>
            <Text style={styles.calorieText}>
              {Math.round(todayTotal)}
            </Text>
            <Text style={styles.calorieSeparator}> / </Text>
            <Text style={styles.targetText}>
              {userProfile.daily_calorie_target}
            </Text>
            <Text style={styles.calorieUnit}> کیلوکالری</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${getProgress()}%` }
              ]} 
            />
          </View>

          <Text style={styles.remainingText}>
            {getRemainingCalories()} کالری باقی‌مانده تا هدف روزانه
          </Text>
        </View>
      )}

      {/* ورودی غذا */}
      <View style={styles.inputCard}>
        <View style={styles.inputHeader}>
          <Text style={styles.inputLabel}>ثبت وعده غذایی</Text>
          <Text style={styles.inputSubLabel}>🍽️</Text>
        </View>
        
        <TextInput
          style={styles.textInput}
          placeholder="مثال: یک نان سنگک و دو تخم مرغ آب‌پز"
          placeholderTextColor="#999"
          value={foodInput}
          onChangeText={setFoodInput}
          multiline
          numberOfLines={3}
          editable={!isProcessing}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
          onPress={handleSubmitFood}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>ثبت غذا</Text>
              <Text style={styles.submitButtonIcon}>✨</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* نمودار روزانه */}
      {dailyData.length > 0 && dailyData.some(d => d > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>توزیع کالری روزانه</Text>
          <BarChart
            data={{ labels: ['', '', ''], datasets: [{ data: dailyData }] }}
            width={screenWidth - 80}
            height={160}
            fromZero
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 217, 165, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              barPercentage: 0.6,
            }}
            style={{ ...styles.chart, paddingRight: 10 }}
            yAxisLabel=""
            yAxisSuffix=""
            showValuesOnTopOfBars
          />

          <View style={[styles.barMetaRow, { width: screenWidth - 80 }]}>
            {dailyData.map((val, idx) => (
              <View key={idx} style={styles.barCell}>
                <Text style={styles.barValue}>{Math.round(val)}</Text>
                <Text style={styles.barLabel}>{dailyLabels[idx]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* بخش تحلیل هوش مصنوعی - High Tech Design */}
      <View style={styles.aiAnalysisCard}>
        <View style={styles.aiCardHeader}>
          <View style={styles.aiTitleContainer}>
            <Text style={styles.aiTitleIcon}>🤖</Text>
            <View>
              <Text style={styles.aiTitle}>تحلیل هوش مصنوعی</Text>
              <Text style={styles.aiSubtitle}>بینش‌های شخصی‌سازی شده</Text>
            </View>
          </View>
          <View style={styles.aiGlow} />
        </View>

        {latestAnalysis ? (
          <View style={styles.aiContentContainer}>
            {latestAnalysisType && (
              <View style={styles.aiTypeBadge}>
                <Text style={styles.aiTypeBadgeText}>{getTypeLabel(latestAnalysisType)}</Text>
              </View>
            )}
            <View style={styles.aiMessageBox}>
              <Text 
                style={styles.aiMessageText}
                numberOfLines={6}
              >
                {latestAnalysis}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.aiViewAllButton}
              onPress={() => setAnalysisModalVisible(true)}
            >
              <Text style={styles.aiViewAllButtonText}>مشاهده همه تحلیل‌ها</Text>
              <Text style={styles.aiViewAllButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.aiEmptyState}>
            <Text style={styles.aiEmptyIcon}>⚡</Text>
            <Text style={styles.aiEmptyText}>در حال تولید تحلیل...</Text>
            <Text style={styles.aiEmptySubtext}>
              تحلیل‌های هوش مصنوعی به صورت خودکار تولید می‌شوند
            </Text>
          </View>
        )}
      </View>

      {/* Modal برای همه تحلیل‌ها */}
      <Modal 
        visible={analysisModalVisible} 
        animationType="slide" 
        onRequestClose={() => setAnalysisModalVisible(false)}
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderIcon}>🤖</Text>
              <View>
                <Text style={styles.modalHeaderTitle}>همه تحلیل‌های هوش مصنوعی</Text>
                <Text style={styles.modalHeaderSubtitle}>تاریخچه کامل تحلیل‌های شما</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.modalCloseIcon}
              onPress={() => setAnalysisModalVisible(false)}
            >
              <Text style={styles.modalCloseIconText}>✕</Text>
            </TouchableOpacity>
          </View>
          <AllLLMMessagesList onClose={() => setAnalysisModalVisible(false)} />
        </View>
      </Modal>

      {/* لیست وعده‌های امروز */}
      {todayMeals.length > 0 && (
        <View style={styles.mealsCard}>
          <View style={styles.mealsHeader}>
            <Text style={styles.mealsTitle}>وعده‌های امروز</Text>
            <View style={styles.mealsCountBadge}>
              <Text style={styles.mealsCountText}>{todayMeals.length}</Text>
            </View>
          </View>
          
          {todayMeals.map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View style={styles.mealLeft}>
                <Text style={styles.mealTime}>{meal.time}</Text>
                <Text style={styles.mealName}>
                  {meal.quantity} {meal.unit} {meal.food_name}
                </Text>
              </View>
              
              <View style={styles.mealRightContainer}>
                <View style={styles.mealCaloriesContainer}>
                  <Text style={styles.mealCalories}>
                    {Math.round(meal.total_calories)}
                  </Text>
                  <Text style={styles.mealCaloriesUnit}>کالری</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMeal(meal.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#00D9A5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  headerContent: {
    alignItems: 'flex-end',
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  logo: {
    width: 50,
    height: 50,
    marginLeft: 12,
    borderRadius: 25,
  },
  headerTextContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'right',
  },
  headerDate: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'right',
  },
  progressCard: {
    margin: 20,
    marginTop: 20,
    marginBottom: 15,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#00D9A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  progressBadge: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D9A5',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  calorieText: {
    fontSize: 52,
    fontWeight: '800',
    color: '#00D9A5',
    textAlign: 'right',
  },
  calorieSeparator: {
    fontSize: 28,
    color: '#CCCCCC',
    marginHorizontal: 8,
  },
  targetText: {
    fontSize: 32,
    color: '#666666',
    fontWeight: '600',
  },
  calorieUnit: {
    fontSize: 16,
    color: '#999999',
    marginRight: 8,
  },
  progressBarContainer: {
    height: 14,
    backgroundColor: '#E8F8F5',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D9A5',
    borderRadius: 10,
  },
  remainingText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  inputSubLabel: {
    fontSize: 24,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E8F8F5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 100,
    textAlign: 'right',
    backgroundColor: '#FAFFFE',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#00D9A5',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D9A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  submitButtonIcon: {
    fontSize: 20,
  },
  chartCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'right',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  barMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  barCell: {
    alignItems: 'center',
    width: (screenWidth - 80) / 3,
  },
  barValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00D9A5',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  // AI Analysis Card Styles - High Tech
  aiAnalysisCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  aiCardHeader: {
    marginBottom: 20,
    position: 'relative',
  },
  aiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  aiTitleIcon: {
    fontSize: 32,
    marginLeft: 12,
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
    fontWeight: '500',
  },
  aiGlow: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    opacity: 0.5,
  },
  aiContentContainer: {
    marginTop: 8,
  },
  aiTypeBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  aiTypeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4361EE',
  },
  aiMessageBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    marginBottom: 16,
  },
  aiMessageText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 24,
    textAlign: 'right',
    fontWeight: '400',
  },
  aiViewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiViewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  aiViewAllButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  aiEmptyState: {
    alignItems: 'center',
    padding: 40,
  },
  aiEmptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  aiEmptyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  aiEmptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F0F9F7',
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalHeaderIcon: {
    fontSize: 32,
    marginLeft: 12,
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 4,
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
  },
  modalCloseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIconText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
  },
  modalCloseButton: {
    backgroundColor: '#00D9A5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // AI Message Card in Modal
  aiMessageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiBadge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4361EE',
  },
  aiMessageType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 4,
  },
  aiMessageDate: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
  },
  aiMessageContent: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 24,
    textAlign: 'right',
  },
  mealsCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#00D9A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  mealsCountBadge: {
    backgroundColor: '#E8F8F5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D9A5',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mealLeft: {
    flex: 1,
    alignItems: 'flex-end',
  },
  mealTime: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 6,
    fontWeight: '500',
  },
  mealName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'right',
  },
  mealRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCaloriesContainer: {
    alignItems: 'flex-start',
    marginLeft: 16,
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D9A5',
  },
  mealCaloriesUnit: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
});

export default HomeScreen;
