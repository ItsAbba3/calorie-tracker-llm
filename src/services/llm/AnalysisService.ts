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
      console.error('Analysis generation failed:', error);
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
      console.error('checkAndGeneratePending failed:', error);
    }
  }
}

export default new AnalysisService();
