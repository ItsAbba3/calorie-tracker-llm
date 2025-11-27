// src/services/llm/AnalysisService.ts
import DatabaseService from '../database/DatabaseService';
import GroqService from './GroqService';
import * as Notifications from 'expo-notifications';
import moment from 'moment-jalaali';

class AnalysisService {
  // تولید و ذخیره پیام تحلیل برای کاربر
  async generateAnalysisForUser(userId: number, type: string): Promise<void> {
    try {
      // جمع‌آوری آمار 7 روز گذشته
      const endDate = moment().format('jYYYY/jMM/jDD');
      const startDate = moment().subtract(6, 'days').format('jYYYY/jMM/jDD');
      const stats = await DatabaseService.getWeeklyStats(userId, startDate, endDate);

      // آماده‌سازی داده‌های هفتگی ساده شده برای مدل
      const weeklyData = [] as Array<{date:string; total_calories:number; meals:number}>;
      for (const s of stats) {
        const meals = await DatabaseService.getMealsForDate(userId, s.date);
        weeklyData.push({ date: s.date, total_calories: s.daily_total || 0, meals: meals.length });
      }

      const analysis = await GroqService.analyzeEatingPattern(weeklyData);

      const message = `بینش‌ها:\n- ${analysis.insights.join('\n- ')}\n\nتوصیه‌ها:\n- ${analysis.recommendations.join('\n- ')}`;

      await DatabaseService.addLLMMessage(userId, type, message);

      // ارسال نوتیفیکیشن محلی با خلاصه کوتاه
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 تحلیل مصرف غذای شما',
          body: analysis.insights && analysis.insights.length ? analysis.insights[0] : 'تحلیل جدید در اپلیکیشن موجود است',
          data: { type: 'llm_analysis' },
        },
        trigger: null,
      });

    } catch (error) {
      console.error('خطا در تولید تحلیل:', error);
    }
  }

  // بررسی و تولید تحلیل‌های معلق
  async checkAndGeneratePending(userId: number): Promise<void> {
    try {
      const last = await DatabaseService.getLatestLLMMessage(userId);
      const now = moment();

      // تعیین زمان آخرین اجرا
      let lastAt = last ? moment(last.created_at) : null;

      // روزانه (یک بار در روز) - تولید اگر آخرین تحلیل null باشد یا بیشتر از 1 روز گذشته باشد
      if (!lastAt || now.diff(lastAt, 'days') >= 1) {
        await this.generateAnalysisForUser(userId, 'daily');
        lastAt = moment();
      }

      // هر 3 روز
      const last3 = last ? moment(last.created_at) : null;
      if (!last3 || now.diff(last3, 'days') >= 3) {
        await this.generateAnalysisForUser(userId, '3day');
      }

      // هفتگی
      const lastWeek = last ? moment(last.created_at) : null;
      if (!lastWeek || now.diff(lastWeek, 'days') >= 7) {
        await this.generateAnalysisForUser(userId, 'weekly');
      }

    } catch (error) {
      console.error('خطا در بررسی و تولید تحلیل‌های معلق:', error);
    }
  }
}

export default new AnalysisService();

