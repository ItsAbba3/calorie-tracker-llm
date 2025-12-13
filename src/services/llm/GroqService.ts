import OpenAI from 'openai';
import ConfigService from '../config/ConfigService';

/* =========================
   Types
========================= */

export interface DetectedFood {
  food: string;
  quantity: number;            // quantity in USER units
  unit: string;                // user unit (normalized)
  unit_normalized: string;     // DB serving unit (exact from foods.unit)
  confidence: number;          // 0..1
  approximate: boolean;
  needs_unit_conversion: boolean;
}

export interface SQLQueryResult {
  sql_query: string;
  detected_items: DetectedFood[];
  explanation: string;
}

export interface UnitConversion {
  conversion_factor: number | null; // quantity_db = quantity_user * conversion_factor
  approximate: boolean;
  explanation: string;
  example_mapping: string[];
}

/* =========================
   Prompt Constants
========================= */

const SYSTEM_PARSE_TO_SQL = `
تو یک مبدل متن فارسی به دادهٔ ساخت‌یافته و SQL برای اپلیکیشن ثبت کالری هستی.

قوانین سخت (باید دقیق اجرا شوند):
1) فقط JSON خالص خروجی بده؛ هیچ متن اضافه، Markdown، توضیح یا کامنتی ننویس.
2) ساختار دیتابیس فقط و فقط این است:
   - foods(name, calories_per_unit, unit, category, protein, carbs, fat)
   - meal_entries(user_id, food_name, quantity, unit, total_calories, raw_input, date, time)
3) unit در جدول foods «واحد سروینگ» است؛ نه واحد پایه.
4) quantity در SQL یعنی «تعداد سروینگ دیتابیس».
5) تو اجازه نداری تبدیل واحد انجام بدهی.
6) اگر واحد کاربر دقیقاً معادل unit دیتابیس نیست → needs_unit_conversion = true
7) نام غذا فقط باید از لیست foods داده‌شده انتخاب شود (یا نزدیک‌ترین تطابق با confidence کمتر).
8) اگر غذا در لیست نبود، آن را در detected_items بیاور ولی SQL برایش نساز.
9) اعداد کلمه‌ای را به عدد اعشاری تبدیل کن (نصف=0.5، یک و نیم=1.5).
10) بازه‌ها را به مقدار میانی تبدیل کن و approximate=true.
11) SQL باید سازگار با SQLite باشد و مجموع کالری را برگرداند.

فرمت خروجی دقیقاً:
{
  "sql_query": "string",
  "detected_items": [
    {
      "food": "string",
      "quantity": number,
      "unit": "string",
      "unit_normalized": "string",
      "confidence": number,
      "approximate": boolean,
      "needs_unit_conversion": boolean
    }
  ],
  "explanation": "string"
}
`;

const SYSTEM_CONVERT_UNITS = `
تو یک ماشین حساب تبدیل واحد برای اپلیکیشن تغذیه هستی.

قوانین:
1) conversion_factor عددی است که:
   quantity_in_db = user_quantity × conversion_factor
2) unit دیتابیس همیشه یک سروینگ تعریف‌شده است (opaque).
3) اگر واحد کاربر معادل همان سروینگ دیتابیس است → conversion_factor = 1
4) اگر تبدیل تقریبی است → approximate=true و گرد کردن تا 2 رقم اعشار
5) اگر تبدیل منطقی ممکن نیست → conversion_factor = null
6) فقط JSON خالص خروجی بده.

فرمت خروجی:
{
  "conversion_factor": number | null,
  "approximate": boolean,
  "explanation": "string",
  "example_mapping": ["string"]
}
`;

const SYSTEM_SUGGEST_MEALS = `
تو یک متخصص تغذیه هستی. فقط JSON خالص بده.

فرمت:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "estimated_calories": number,
      "macros": { "protein": number, "carbs": number, "fat": number }
    }
  ]
}
`;

const SYSTEM_ANALYZE_PATTERN = `
تو یک تحلیلگر الگوی مصرف غذایی هستی.
فقط JSON خالص بده.

فرمت:
{
  "insights": ["string"],
  "recommendations": ["string"]
}
`;

/* =========================
   Service
========================= */

class GroqService {
  private client: OpenAI | null = null;

  private async ensureClient() {
    if (this.client) return;

    const apiKey = await ConfigService.getStoredGroqApiKey();
    if (!apiKey) {
      throw new Error('Groq API key is not set.');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    });
  }

  /* =========================
     Helpers
  ========================= */

  private cleanJSON(text: string): string {
    return text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  /* =========================
     1) Parse user input → SQL
  ========================= */

  async parseUserInputToSQL(
    userInput: string,
    availableFoods: Array<{ name: string; unit: string; calories_per_unit: number }>
  ): Promise<SQLQueryResult> {
    const foodsList = availableFoods
      .map(f => `- ${f.name} (${f.calories_per_unit} کالری / ${f.unit})`)
      .join('\n');

    const userPrompt = `
لیست غذاهای موجود در دیتابیس:
${foodsList}

متن کاربر:
"${userInput}"

وظیفه:
- غذاها را تشخیص بده
- مقدار و واحد را استخراج کن
- unit دیتابیس را بدون تغییر در unit_normalized قرار بده
- اگر واحد کاربر دقیقاً معادل unit دیتابیس نیست → needs_unit_conversion=true
- فقط برای غذاهای معتبر SQL بساز
- خروجی فقط JSON باشد
`;

    await this.ensureClient();

    const completion = await this.client!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PARSE_TO_SQL },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content || '{}';
    return JSON.parse(this.cleanJSON(raw));
  }

  /* =========================
     2) Convert Units
  ========================= */

  async convertUnits(
    userInput: string,
    userQuantity: number,
    userUnit: string,
    dbUnit: string
  ): Promise<UnitConversion> {
    const userPrompt = `
متن کاربر:
"${userInput}"

مقدار و واحد کاربر:
${userQuantity} ${userUnit}

واحد سروینگ دیتابیس:
${dbUnit}

ضریب تبدیل را محاسبه کن.
`;

    await this.ensureClient();

    const completion = await this.client!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_CONVERT_UNITS },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const raw = completion.choices[0].message.content || '{}';
    return JSON.parse(this.cleanJSON(raw));
  }

  /* =========================
     3) Suggest Meals
  ========================= */

  async suggestHealthyMeals(
    goal: string,
    remainingCalories: number,
    currentMacros: { protein: number; carbs: number; fat: number }
  ): Promise<any[]> {
    const userPrompt = `
هدف کاربر: ${goal}
کالری باقی‌مانده: ${remainingCalories}
ماکروهای فعلی:
پروتئین ${currentMacros.protein}g
کربوهیدرات ${currentMacros.carbs}g
چربی ${currentMacros.fat}g
`;

    await this.ensureClient();

    const completion = await this.client!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_SUGGEST_MEALS },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const raw = completion.choices[0].message.content || '{}';
    return JSON.parse(this.cleanJSON(raw)).suggestions || [];
  }

  /* =========================
     4) Analyze Eating Pattern
  ========================= */

  async analyzeEatingPattern(
    weeklyData: Array<{ date: string; total_calories: number; meals: number }>
  ): Promise<{ insights: string[]; recommendations: string[] }> {
    const text = weeklyData
      .map(d => `${d.date}: ${d.total_calories} کالری، ${d.meals} وعده`)
      .join('\n');

    const userPrompt = `
داده‌های هفتگی:
${text}

تحلیل کن.
`;

    await this.ensureClient();

    const completion = await this.client!.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_ANALYZE_PATTERN },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content || '{}';
    return JSON.parse(this.cleanJSON(raw));
  }
}

export default new GroqService();
