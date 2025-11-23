// src/services/llm/GroqService.ts
import OpenAI from 'openai';
import ConfigService from '../config/ConfigService';
import * as Notifications from 'expo-notifications';

interface DetectedFood {
  food: string;
  quantity: number;
  unit: string;
  confidence?: number;
}

interface SQLQueryResult {
  sql_query: string;
  detected_items: DetectedFood[];
  explanation?: string;
}

interface UnitConversion {
  conversion_factor: number;
  explanation: string;
}

class GroqService {
  private client: OpenAI | null = null;

  private async ensureClient() {
    if (this.client) return;

    const apiKey = await ConfigService.getStoredGroqApiKey();
    if (!apiKey) {
      throw new Error('Groq API key is not set. Please configure it in settings.');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * تبدیل متن ورودی کاربر به SQL Query
   */
  async parseUserInputToSQL(
    userInput: string,
    availableFoods: Array<{ name: string; unit: string; calories_per_unit: number }>
  ): Promise<SQLQueryResult> {
    const foodsList = availableFoods
      .map(f => `- ${f.name} (${f.calories_per_unit} کالری/${f.unit})`)
      .join('\n');

    const prompt = `
تو یک متخصص تجزیه متن و SQL هستی. من یک دیتابیس SQLite دارم با جدول foods که شامل غذاهای زیر است:

${foodsList}

توجه مهم: اسکیمای دیتابیس (از این نام‌ها دقیقاً استفاده کن):
- جدول foods: (name, calories_per_unit, unit, category, protein, carbs, fat)
- جدول meal_entries: (user_id, food_name, quantity, unit, total_calories, raw_input, date, time)

قواعد اضافه:
+- برای کالریِ واحدی از نام ستون 'calories_per_unit' استفاده کن (مثلاً 'foods.calories_per_unit' یا 'T1.calories_per_unit').
+- نامِ ستونِ نام غذا در جدول وعده‌ها 'food_name' است؛ 'foodname' یا 'foodName' نزن.
+- خروجی SQL باید یک عدد (مجموع کالری‌ها) برگرداند با نامی مثل 'total_calories' یا فقط مقدار اول.
+- اگر از ALIAS استفاده می‌کنی، از ستون‌های واقعی بالا استفاده کن (مثال: 'T1.calories_per_unit').

کاربر این متن را وارد کرده:
"${userInput}"

وظایف تو:
1. غذاهای ذکر شده را شناسایی کن (نام دقیق از لیست بالا)
2. مقدار و واحد هر غذا را استخراج کن
3. یک SQL query بنویس که کل کالری را محاسبه کند و از نام ستون‌های دقیق استفاده کند

مثال SQL خروجی (نمونه، برای الگو):
SELECT SUM(T1.quantity * T1.calories_per_unit) AS total_calories
FROM (
  SELECT foods.calories_per_unit, ? AS quantity
  FROM foods
  WHERE foods.name = 'نان'
) AS T1;

فرمت خروجی (JSON خالص بدون markdown):
{
  "sql_query": "SELECT ...",
  "detected_items": [
    {"food": "نام غذا", "quantity": 1.5, "unit": "واحد", "confidence": 0.95}
  ],
  "explanation": "توضیح کوتاه"
}
`;

    // Note: explicitly provide schema/column names so the model uses the exact column names
    // available in the app's SQLite schema. This reduces column-name mismatches like "foodname".
    // tables:
    // - foods(name, calories_per_unit, unit, category, protein, carbs, fat)
    // - meal_entries(food_name, quantity, unit, total_calories, raw_input, date, time, user_id)
    // Instruct the model to use these exact names (use `name` for foods, `food_name` for meal entries).

    try {
      await this.ensureClient();
      const completion = await (this.client as OpenAI).chat.completions.create({
        model: 'llama-3.3-70b-versatile', // مدل قوی و سریع
        messages: [
          {
            role: 'system',
            content: 'تو یک دستیار تغذیه هوشمند هستی که متن فارسی را به SQL تبدیل می‌کنی. فقط JSON بده، بدون markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // کم تا دقت بیشتر باشد
        max_tokens: 1000,
      });

      const responseText = completion.choices[0].message.content?.trim() || '{}';
      
      // پاکسازی markdown اگر وجود داشت
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const result: SQLQueryResult = JSON.parse(jsonText);
      
      console.log('✅ Groq parsed input:', result);
      return result;

    } catch (error) {
      console.error('❌ Groq API error:', error);
      throw new Error('خطا در پردازش متن. لطفاً دوباره تلاش کنید.');
    }
  }

  /**
   * تبدیل واحد کاربر به واحد دیتابیس
   */
  async convertUnits(
    userInput: string,
    userQuantity: number,
    userUnit: string,
    dbUnit: string
  ): Promise<UnitConversion> {
    const prompt = `
کاربر گفته: "${userInput}"
مقدار کاربر: ${userQuantity} ${userUnit}
واحد دیتابیس: ${dbUnit}

ضریب تبدیل را محاسبه کن.

مثال‌ها:
- کاربر: "1 نان" → DB: "¼ نان" → ضریب: 4
- کاربر: "0.5 لیوان" → DB: "لیوان" → ضریب: 0.5
- کاربر: "2 قاشق" → DB: "قاشق غذاخوری" → ضریب: 2

فرمت JSON (بدون markdown):
{
  "conversion_factor": 4.0,
  "explanation": "یک نان کامل برابر است با 4 × ¼ نان"
}
`;

    try {
      await this.ensureClient();
      const completion = await (this.client as OpenAI).chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'تو یک ماشین حساب واحدها هستی. فقط JSON بده.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
      });

      const responseText = completion.choices[0].message.content?.trim() || '{}';
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const result: UnitConversion = JSON.parse(jsonText);
      
      console.log('✅ Unit conversion:', result);
      return result;

    } catch (error) {
      console.error('❌ Unit conversion error:', error);
      // fallback: اگر خطا بود، از همان مقدار کاربر استفاده کن
      return {
        conversion_factor: userQuantity,
        explanation: 'استفاده از مقدار پیش‌فرض'
      };
    }
  }

  /**
   * پیشنهاد غذاهای سالم بر اساس پروفایل کاربر
   */
  async suggestHealthyMeals(
    goal: string,
    remainingCalories: number,
    currentMacros: { protein: number; carbs: number; fat: number }
  ): Promise<string[]> {
    const prompt = `
کاربر هدف "${goal}" دارد و امروز ${remainingCalories} کالری باقی‌مانده.
ماکروهای فعلی: پروتئین ${currentMacros.protein}g، کربوهیدرات ${currentMacros.carbs}g، چربی ${currentMacros.fat}g

3 پیشنهاد غذایی سالم و متعادل بده.

فرمت JSON (بدون markdown):
{
  "suggestions": [
    "پیشنهاد 1",
    "پیشنهاد 2",
    "پیشنهاد 3"
  ]
}
`;

    try {
      await this.ensureClient();
      const completion = await (this.client as OpenAI).chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'تو یک متخصص تغذیه هستی که پیشنهادات شخصی‌سازی شده می‌دهی.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const responseText = completion.choices[0].message.content?.trim() || '{}';
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const result = JSON.parse(jsonText);
      return result.suggestions || [];

    } catch (error) {
      console.error('❌ Suggestion error:', error);
      return [
        'سالاد سبزیجات با سینه مرغ',
        'ماست و میوه',
        'تخم مرغ آب پز با نان کامل'
      ];
    }
  }

  /**
   * تحلیل هوشمند الگوی مصرف کاربر
   */
  async analyzeEatingPattern(
    weeklyData: Array<{ date: string; total_calories: number; meals: number }>
  ): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    const dataText = weeklyData
      .map(d => `${d.date}: ${d.total_calories} کالری در ${d.meals} وعده`)
      .join('\n');

    const prompt = `
داده‌های هفتگی کاربر:
${dataText}

تحلیل کن:
1. الگوی مصرف کالری (منظم/نامنظم)
2. تعداد وعده‌های غذایی
3. روزهای کم‌کالری/پرکالری

فرمت JSON (بدون markdown):
{
  "insights": ["بینش 1", "بینش 2"],
  "recommendations": ["توصیه 1", "توصیه 2"]
}
`;

    try {
      await this.ensureClient();
      const completion = await (this.client as OpenAI).chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'تو یک تحلیلگر داده‌های تغذیه هستی.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const responseText = completion.choices[0].message.content?.trim() || '{}';
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(jsonText);

    } catch (error) {
      console.error('❌ Analysis error:', error);
      return {
        insights: ['داده کافی برای تحلیل وجود ندارد'],
        recommendations: ['ادامه ثبت منظم وعده‌های غذایی']
      };
    }
  }
}

export default new GroqService();