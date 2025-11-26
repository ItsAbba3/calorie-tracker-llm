// src/services/database/DatabaseService.ts - EXPO VERSION
import * as SQLite from 'expo-sqlite';
import { MERGED_FOODS_DATA } from '../../constants/database';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: number;
  name?: string;
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

const PROFILE_KEY = '@ct_profile_v1';
const FOOD_DB_KEY = '@ct_food_db_v1';
const MEALS_KEY = '@ct_meals_v1';

type FoodItem = {
  id?: string;
  name: string;
  caloriesPer100g?: number;
  caloriesPerUnit?: number;
  unitName?: string; // e.g., "عدد", "بشقاب", "گرم"
  unitWeightGrams?: number; // weight of 1 unit in grams (optional)
  [k: string]: any;
};

const defaultPortionWeights: Record<string, number> = {
  'بشقاب': 200,
  'کاسه': 150,
  'قاشق': 15,
  'حبه': 10,
  // کم و زیاد بر حسب نیاز قابل تنظیم است
};

async function getProfile() {
  try {
    const s = await AsyncStorage.getItem(PROFILE_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.warn('DB:getProfile error', e);
    return null;
  }
}

async function saveProfile(profile: any) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.warn('DB:saveProfile error', e);
    return false;
  }
}

async function getFoodDb(): Promise<FoodItem[]> {
  try {
    const s = await AsyncStorage.getItem(FOOD_DB_KEY);
    if (!s) return [];
    return JSON.parse(s);
  } catch (e) {
    console.warn('DB:getFoodDb error', e);
    return [];
  }
}

async function saveFoodDb(list: FoodItem[]) {
  try {
    await AsyncStorage.setItem(FOOD_DB_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.warn('DB:saveFoodDb error', e);
    return false;
  }
}

function findFoodByName(list: FoodItem[], name: string) {
  const n = name.trim().toLowerCase();
  return list.find(
    (f) =>
      f.name &&
      f.name.toLowerCase() === n
  ) || null;
}

async function calculateCalories(foodName: string, quantity = 1, unit: string | null = null): Promise<{ calories: number; matched?: FoodItem | null }> {
  try {
    const db = await getFoodDb();
    const matched = findFoodByName(db, foodName);

    // normalize quantity
    const q = Number(quantity) || 0;

    if (!matched) {
      // fallback 0 but return matched=null for logging
      return { calories: 0, matched: null };
    }

    // If calories per unit exists and unit matches or unit is null, use it
    if (matched.caloriesPerUnit && (unit == null || matched.unitName == null || matched.unitName === unit)) {
      return { calories: matched.caloriesPerUnit * q, matched };
    }

    // If we have calories per 100g, try to compute using unitWeightGrams or default portion weights
    if (matched.caloriesPer100g) {
      let grams = 0;
      if (matched.unitWeightGrams) {
        grams = (matched.unitWeightGrams) * q;
      } else if (unit && defaultPortionWeights[unit]) {
        grams = defaultPortionWeights[unit] * q;
      } else {
        // If no unit weight, assume quantity is in "واحد" and fallback to 100g per unit
        grams = q * 100;
      }
      const calories = (matched.caloriesPer100g / 100) * grams;
      return { calories: Math.round(calories), matched };
    }

    // last fallback: if has calories field
    if ((matched as any).calories) {
      return { calories: (matched as any).calories * q, matched };
    }

    return { calories: 0, matched };
  } catch (e) {
    console.warn('DB:calculateCalories error', e);
    return { calories: 0, matched: null };
  }
}

async function insertMeal(meal: any) {
  try {
    const s = await AsyncStorage.getItem(MEALS_KEY);
    const arr = s ? JSON.parse(s) : [];
    arr.push({ id: `${Date.now()}`, ...meal });
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(arr));
    return true;
  } catch (e) {
    console.warn('DB:insertMeal error', e);
    return false;
  }
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      // باز کردن یا ایجاد دیتابیس
      this.db = await SQLite.openDatabaseAsync('CalorieTracker.db');
      console.log('Opening SQLite DB: CalorieTracker.db');
      
      await this.createTables();

      // Migration: ensure existing databases have the 'name' column on user_profile
      try {
        const cols = await this.db.getAllAsync<any>('PRAGMA table_info(user_profile)');
        const hasName = cols && cols.some && cols.some((c: any) => c.name === 'name');
        if (!hasName) {
          console.log('Migration: adding name column to user_profile');
          await this.db.execAsync(`ALTER TABLE user_profile ADD COLUMN name TEXT;`);
        }
      } catch (e) {
        // If PRAGMA or ALTER fails, log but continue (old DB may be fresh)
        console.warn('Migration check failed:', e);
      }
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
        name TEXT,
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

    // تاریخچه وزن
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS weight_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES user_profile(id)
      );
    `);

    // پیام‌های LLM (تحلیل‌ها)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS llm_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES user_profile(id)
      );
    `);
  }

  private async seedInitialData(): Promise<void> {
    if (!this.db) return;

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM foods'
    );
    
    if (result && result.count === 0) {
      console.log('🌱 Seeding initial food data...');
      
      for (const food of MERGED_FOODS_DATA) {
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
      
      console.log(`✅ Seeded ${MERGED_FOODS_DATA.length} foods`);
    }
  }

  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'daily_calorie_target'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const bmr = this.calculateBMR(profile.age, profile.gender, profile.weight, profile.height);
    const targetCalories = this.adjustCaloriesForGoal(bmr, profile.goal);

    const result = await this.db.runAsync(
      `INSERT INTO user_profile (name, age, gender, weight, height, goal, daily_calorie_target) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      // name may be undefined for older flows
      (profile as any).name || null,
      profile.age,
      profile.gender,
      profile.weight,
      profile.height,
      profile.goal,
      targetCalories
    );

    const id = result.lastInsertRowId;
    // backup to SecureStore so we can restore if DB is missing on startup
    try {
      await SecureStore.setItemAsync('profile_backup', JSON.stringify({ ...profile, id }));
    } catch (e) {
      console.warn('Failed to write profile backup to SecureStore:', e);
    }

    return id;
  }

  // Save a backup of the profile to SecureStore for redundancy
  async backupUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'daily_calorie_target'>, id: number) {
    try {
      const toSave = { ...profile, id };
      await SecureStore.setItemAsync('profile_backup', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to backup profile to SecureStore:', e);
    }
  }

  async updateUserProfile(id: number, updates: Partial<UserProfile>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.age !== undefined) {
      fields.push('age = ?');
      values.push(updates.age);
    }
    if (updates.gender !== undefined) {
      fields.push('gender = ?');
      values.push(updates.gender);
    }
    if (updates.weight !== undefined) {
      fields.push('weight = ?');
      values.push(updates.weight);
    }
    if (updates.height !== undefined) {
      fields.push('height = ?');
      values.push(updates.height);
    }
    if (updates.goal !== undefined) {
      fields.push('goal = ?');
      values.push(updates.goal);
    }

    if (fields.length === 0) return;

    const sql = `UPDATE user_profile SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await this.db.runAsync(sql, ...values);
  }

  async addWeightEntry(userId: number, weight: number, date: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO weight_history (user_id, weight, date) VALUES (?, ?, ?)`,
      userId,
      weight,
      date
    );

    return result.lastInsertRowId;
  }

  async getWeightHistory(userId: number): Promise<Array<{id:number; weight:number; date:string;}>> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      `SELECT id, weight, date FROM weight_history WHERE user_id = ? ORDER BY date DESC`,
      userId
    );

    return rows || [];
  }

  // افزودن پیام LLM
  async addLLMMessage(userId: number, type: string, content: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO llm_messages (user_id, type, content) VALUES (?, ?, ?)`,
      userId,
      type,
      content
    );

    return result.lastInsertRowId;
  }

  async getLatestLLMMessage(userId: number): Promise<{id:number; type:string; content:string; created_at:string} | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.getFirstAsync<any>(
      `SELECT id, type, content, created_at FROM llm_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      userId
    );

    return row || null;
  }

  async getAllLLMMessages(userId: number): Promise<Array<{id:number; type:string; content:string; created_at:string}>> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      `SELECT id, type, content, created_at FROM llm_messages WHERE user_id = ? ORDER BY created_at DESC`,
      userId
    );

    return rows || [];
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
    console.log('getUserProfile result:', result);
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
      // Log raw SQL from the LLM for debugging
      console.log('Raw SQL from LLM:', sqlQuery);

      // Sanitize common mistakes from generated SQL (e.g. LLM might output `foodname` or `T1.calorie`)
      let sanitizedSql = sqlQuery;
      // common wrong tokens -> correct column names
      sanitizedSql = sanitizedSql.replace(/\bfoodname\b/gi, 'food_name');
      // alias.calorie or alias.calories -> alias.calories_per_unit
      sanitizedSql = sanitizedSql.replace(/\b([A-Za-z0-9_]+)\.calories?\b/gi, '$1.calories_per_unit');

      if (sanitizedSql !== sqlQuery) {
        console.warn('Sanitized SQL query (replaced unknown column names):', sanitizedSql);
      }

      const result = await this.db.getFirstAsync<any>(sanitizedSql);
      
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
    console.log('Saving meal entry for user', entry.user_id, entry.food_name, entry.total_calories);
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

  /**
   * Remove all user-generated data (keeping seeded foods intact).
   * This will delete meal entries, weight history and user profiles.
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Use a transaction to ensure atomicity
    await this.db.execAsync('BEGIN TRANSACTION;');
    try {
      await this.db.execAsync('DELETE FROM meal_entries;');
      await this.db.execAsync('DELETE FROM weight_history;');
      await this.db.execAsync('DELETE FROM user_profile;');
      await this.db.execAsync('COMMIT;');
      console.log('✅ Cleared user data (meal_entries, weight_history, user_profile)');
    } catch (e) {
      await this.db.execAsync('ROLLBACK;');
      console.error('Failed to clear data:', e);
      throw e;
    }
  }
}

export default {
  ...new DatabaseService(),
  getProfile,
  saveProfile,
  getFoodDb,
  saveFoodDb,
  calculateCalories,
  insertMeal,
};