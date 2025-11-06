// src/services/database/DatabaseService.ts - EXPO VERSION
import * as SQLite from 'expo-sqlite';
import { SAMPLE_FOODS_DATA } from '../../constants/database';

export interface UserProfile {
  id: number;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  goal: 'lose' | 'gain' | 'maintain';
  daily_calorie_target: number;
  created_at: string;
}

export interface Food {
  id: number;
  name: string;
  calories_per_unit: number;
  unit: string;
  category: string;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealEntry {
  id: number;
  user_id: number;
  food_name: string;
  quantity: number;
  unit: string;
  total_calories: number;
  raw_input: string;
  date: string;
  time: string;
  created_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      // باز کردن یا ایجاد دیتابیس
      this.db = await SQLite.openDatabaseAsync('CalorieTracker.db');
      
      await this.createTables();
      await this.seedInitialData();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database init failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // جدول کاربر
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
        weight REAL NOT NULL,
        height REAL NOT NULL,
        goal TEXT NOT NULL CHECK(goal IN ('lose', 'gain', 'maintain')),
        daily_calorie_target INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // جدول غذاها
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        calories_per_unit REAL NOT NULL,
        unit TEXT NOT NULL,
        category TEXT,
        protein REAL,
        carbs REAL,
        fat REAL
      );
    `);

    // جدول وعده‌های غذایی
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        total_calories REAL NOT NULL,
        raw_input TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES user_profile(id)
      );
    `);

    // ایندکس
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_meal_date ON meal_entries(date, user_id);
    `);
  }

  private async seedInitialData(): Promise<void> {
    if (!this.db) return;

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM foods'
    );
    
    if (result && result.count === 0) {
      console.log('🌱 Seeding initial food data...');
      
      for (const food of SAMPLE_FOODS_DATA) {
        await this.db.runAsync(
          `INSERT INTO foods (name, calories_per_unit, unit, category, protein, carbs, fat) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          food.name,
          food.calories_per_unit,
          food.unit,
          food.category,
          food.protein || null,
          food.carbs || null,
          food.fat || null
        );
      }
      
      console.log(`✅ Seeded ${SAMPLE_FOODS_DATA.length} foods`);
    }
  }

  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'created_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const bmr = this.calculateBMR(profile.age, profile.gender, profile.weight, profile.height);
    const targetCalories = this.adjustCaloriesForGoal(bmr, profile.goal);

    const result = await this.db.runAsync(
      `INSERT INTO user_profile (age, gender, weight, height, goal, daily_calorie_target) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      profile.age,
      profile.gender,
      profile.weight,
      profile.height,
      profile.goal,
      targetCalories
    );

    return result.lastInsertRowId;
  }

  private calculateBMR(age: number, gender: string, weight: number, height: number): number {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  private adjustCaloriesForGoal(bmr: number, goal: string): number {
    const activityFactor = 1.55;
    const tdee = bmr * activityFactor;

    switch (goal) {
      case 'lose':
        return Math.round(tdee - 500);
      case 'gain':
        return Math.round(tdee + 500);
      default:
        return Math.round(tdee);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<UserProfile>(
      'SELECT * FROM user_profile ORDER BY id DESC LIMIT 1'
    );
    
    return result || null;
  }

  async searchFoods(query: string): Promise<Food[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<Food>(
      `SELECT * FROM foods WHERE name LIKE ? ORDER BY name LIMIT 20`,
      `%${query}%`
    );

    return results;
  }

  async executeCalorieQuery(sqlQuery: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(sqlQuery);
      
      if (result) {
        const calorieValue = result.total_calories || result.calories || Object.values(result)[0];
        return parseFloat(calorieValue) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  async saveMealEntry(entry: Omit<MealEntry, 'id' | 'created_at'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO meal_entries (user_id, food_name, quantity, unit, total_calories, raw_input, date, time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.user_id,
      entry.food_name,
      entry.quantity,
      entry.unit,
      entry.total_calories,
      entry.raw_input,
      entry.date,
      entry.time
    );
  }

  async getMealsForDate(userId: number, date: string): Promise<MealEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<MealEntry>(
      'SELECT * FROM meal_entries WHERE user_id = ? AND date = ? ORDER BY time DESC',
      userId,
      date
    );

    return results;
  }

  async getWeeklyStats(userId: number, startDate: string, endDate: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      `SELECT date, SUM(total_calories) as daily_total 
       FROM meal_entries 
       WHERE user_id = ? AND date BETWEEN ? AND ? 
       GROUP BY date 
       ORDER BY date`,
      userId,
      startDate,
      endDate
    );

    return results;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default new DatabaseService();