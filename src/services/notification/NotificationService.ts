// src/services/notification/NotificationService.ts - EXPO VERSION
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import moment from 'moment-jalaali';
import DatabaseService from '../database/DatabaseService';

// تنظیمات پیش‌فرض نمایش نوتیفیکیشن
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  async init(): Promise<void> {
    await this.registerForPushNotifications();
    this.setupNotificationListeners();
  }

  private async registerForPushNotifications(): Promise<string | undefined> {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('calorie-tracker', {
        name: 'یادآوری وعده غذایی',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4361EE',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permission not granted for notifications');
        return;
      }
      
      console.log('✅ Notification permissions granted');
    }

    return token;
  }

  private setupNotificationListeners(): void {
    // وقتی نوتیفیکیشن دریافت می‌شود (اپ باز است)
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notification received:', notification);
    });

    // وقتی کاربر روی نوتیفیکیشن کلیک می‌کند
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
    });
  }

  async scheduleFixedReminders(times: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  }): Promise<void> {
    // حذف یادآوری‌های قبلی
    await this.cancelAllReminders();

    const reminders = [
      { 
        id: 'breakfast-reminder', 
        time: times.breakfast, 
        title: '🌅 صبحانه', 
        body: 'وقت صبحانه است! غذایت را ثبت کن' 
      },
      { 
        id: 'lunch-reminder', 
        time: times.lunch, 
        title: '☀️ ناهار', 
        body: 'نهار خوردی؟ کالری‌هایت را ثبت کن' 
      },
      { 
        id: 'dinner-reminder', 
        time: times.dinner, 
        title: '🌙 شام', 
        body: 'شام خوردی؟ فراموش نکن ثبت کنی' 
      },
    ];

    for (const reminder of reminders) {
      if (!reminder.time) continue;

      const [hour, minute] = reminder.time.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
          title: reminder.title,
          body: reminder.body,
          data: { type: 'meal-reminder' },
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    }

    console.log('✅ Fixed reminders scheduled');
  }

  async scheduleSmartReminders(userId: number): Promise<void> {
    try {
      const endDate = moment().format('jYYYY/jMM/jDD');
      const startDate = moment().subtract(7, 'days').format('jYYYY/jMM/jDD');
      
      const weeklyStats = await DatabaseService.getWeeklyStats(userId, startDate, endDate);
      
      if (weeklyStats.length === 0) {
        await this.scheduleFixedReminders({
          breakfast: '08:00',
          lunch: '13:00',
          dinner: '20:00',
        });
        return;
      }

      const mealTimes: string[] = [];
      
      for (const day of weeklyStats) {
        const meals = await DatabaseService.getMealsForDate(userId, day.date);
        mealTimes.push(...meals.map(m => m.time));
      }

      const morningMeals = mealTimes.filter(t => {
        const hour = parseInt(t.split(':')[0]);
        return hour >= 6 && hour < 11;
      });

      const afternoonMeals = mealTimes.filter(t => {
        const hour = parseInt(t.split(':')[0]);
        return hour >= 11 && hour < 16;
      });

      const eveningMeals = mealTimes.filter(t => {
        const hour = parseInt(t.split(':')[0]);
        return hour >= 16 && hour < 23;
      });

      const avgBreakfast = this.calculateAverageTime(morningMeals) || '08:00';
      const avgLunch = this.calculateAverageTime(afternoonMeals) || '13:00';
      const avgDinner = this.calculateAverageTime(eveningMeals) || '20:00';

      await this.scheduleFixedReminders({
        breakfast: avgBreakfast,
        lunch: avgLunch,
        dinner: avgDinner,
      });

      console.log('✅ Smart reminders scheduled:', { avgBreakfast, avgLunch, avgDinner });

    } catch (error) {
      console.error('Smart reminder error:', error);
      await this.scheduleFixedReminders({
        breakfast: '08:00',
        lunch: '13:00',
        dinner: '20:00',
      });
    }
  }

  private calculateAverageTime(times: string[]): string | null {
    if (times.length === 0) return null;

    const totalMinutes = times.reduce((sum, time) => {
      const [hour, minute] = time.split(':').map(Number);
      return sum + (hour * 60 + minute);
    }, 0);

    const avgMinutes = Math.round(totalMinutes / times.length);
    const hour = Math.floor(avgMinutes / 60);
    const minute = avgMinutes % 60;

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  async sendMotivationalNotification(
    progress: number,
    streakDays: number
  ): Promise<void> {
    let title = '';
    let body = '';

    if (progress >= 90 && progress < 110) {
      title = '🎯 عالی!';
      body = `امروز ${Math.round(progress)}٪ هدفت رو کامل کردی!`;
    } else if (streakDays >= 7) {
      title = '🔥 استقامت فوق‌العاده!';
      body = `${streakDays} روز متوالی ثبت غذا! ادامه بده!`;
    } else if (progress > 110) {
      title = '⚠️ هشدار';
      body = 'امروز بیش از حد کالری مصرف کردی';
    } else {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'motivational' },
      },
      trigger: null, // فوری
    });
  }

  async sendMissingDataReminder(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 یادت نره!',
        body: 'امروز هنوز غذایی ثبت نکردی',
        data: { type: 'missing-data' },
      },
      trigger: null,
    });
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All reminders cancelled');
  }

  async checkAndSendDailyReminders(userId: number): Promise<void> {
    const today = moment().format('jYYYY/jMM/jDD');
    const meals = await DatabaseService.getMealsForDate(userId, today);

    if (meals.length === 0 && moment().hour() >= 21) {
      await this.sendMissingDataReminder();
    }

    const profile = await DatabaseService.getUserProfile();
    if (profile) {
      const totalCalories = meals.reduce((sum, m) => sum + m.total_calories, 0);
      const progress = (totalCalories / profile.daily_calorie_target) * 100;

      const streak = await this.calculateStreak(userId);

      await this.sendMotivationalNotification(progress, streak);
    }
  }

  private async calculateStreak(userId: number): Promise<number> {
    let streak = 0;
    let currentDate = moment();

    while (true) {
      const dateStr = currentDate.format('jYYYY/jMM/jDD');
      const meals = await DatabaseService.getMealsForDate(userId, dateStr);

      if (meals.length === 0) break;

      streak++;
      currentDate = currentDate.subtract(1, 'day');

      if (streak > 100) break;
    }

    return streak;
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();