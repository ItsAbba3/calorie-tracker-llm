import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import moment from 'moment-jalaali';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../database/DatabaseService';

/* =========================
   Notification Handler
========================= */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEYS = {
  LAST_MOTIVATION: 'LAST_MOTIVATION_NOTIFICATION',
  LAST_MISSING: 'LAST_MISSING_NOTIFICATION',
};

/* =========================
   Service
========================= */

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  async init(): Promise<void> {
    await this.registerForPushNotifications();
    this.setupNotificationListeners();
  }

  /* =========================
     Permissions
  ========================= */

  private async registerForPushNotifications(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('calorie-tracker', {
        name: 'یادآوری وعده غذایی',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    if (!Device.isDevice) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== 'granted') {
        console.log('❌ Notification permission denied');
      }
    }
  }

  /* =========================
     Listeners
  ========================= */

  private setupNotificationListeners(): void {
    this.notificationListener =
      Notifications.addNotificationReceivedListener(() => {});

    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(() => {});
  }

  /* =========================
     Fixed Daily Reminders
  ========================= */

  async scheduleFixedReminders(times: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  }): Promise<void> {
    await this.cancelAllReminders();

    const reminders = [
      { time: times.breakfast, title: '🌅 صبحانه', body: 'صبحانه‌ات رو ثبت کن' },
      { time: times.lunch, title: '☀️ ناهار', body: 'وقت ثبت ناهاره' },
      { time: times.dinner, title: '🌙 شام', body: 'شامت رو ثبت کن' },
    ];

    for (const r of reminders) {
      if (!r.time) continue;

      const [hour, minute] = r.time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: { title: r.title, body: r.body },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    }
  }

  /* =========================
     Missing Data Reminder
  ========================= */

  async scheduleMissingDataReminder(): Promise<void> {
    const today = moment().format('YYYY-MM-DD');
    const last = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MISSING);

    if (last === today) return;

    const triggerDate = moment().hour(21).minute(0).second(0);

    if (triggerDate.isBefore(moment())) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 یادت نره!',
        body: 'امروز هنوز غذایی ثبت نکردی',
      },
      trigger: triggerDate.toDate(),
    });

    await AsyncStorage.setItem(STORAGE_KEYS.LAST_MISSING, today);
  }

  /* =========================
     Motivational Notification
  ========================= */

  async scheduleMotivationalNotification(
    progress: number,
    streakDays: number
  ): Promise<void> {
    const today = moment().format('YYYY-MM-DD');
    const last = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MOTIVATION);

    if (last === today) return;

    let title = '';
    let body = '';

    if (progress >= 90 && progress <= 110) {
      title = '🎯 عالی!';
      body = 'امروز خیلی خوب عمل کردی!';
    } else if (streakDays >= 7) {
      title = '🔥 فوق‌العاده!';
      body = `${streakDays} روز پشت سر هم!`;
    } else {
      return;
    }

    const triggerDate = moment().add(1, 'minute');

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: triggerDate.toDate(),
    });

    await AsyncStorage.setItem(STORAGE_KEYS.LAST_MOTIVATION, today);
  }

  /* =========================
     Cleanup
  ========================= */

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  cleanup(): void {
    if (this.notificationListener)
      Notifications.removeNotificationSubscription(this.notificationListener);
    if (this.responseListener)
      Notifications.removeNotificationSubscription(this.responseListener);
  }
}

export default new NotificationService();
