// src/constants/database.ts
export const SAMPLE_FOODS_DATA = [
  // نان و غلات
  { name: 'نان سنگک', calories_per_unit: 85, unit: '¼ نان', category: 'نان', protein: 2.8, carbs: 17, fat: 0.5 },
  { name: 'نان بربری', calories_per_unit: 90, unit: '¼ نان', category: 'نان', protein: 3, carbs: 18, fat: 0.6 },
  { name: 'نان لواش', calories_per_unit: 70, unit: '¼ نان', category: 'نان', protein: 2.5, carbs: 14, fat: 0.4 },
  { name: 'نان کامل', calories_per_unit: 80, unit: '¼ نان', category: 'نان', protein: 3.5, carbs: 15, fat: 1 },
  { name: 'نان تست', calories_per_unit: 75, unit: 'یک برش', category: 'نان', protein: 2.5, carbs: 14, fat: 1 },
  { name: 'برنج پخته', calories_per_unit: 130, unit: '100 گرم', category: 'غلات', protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'ماکارونی پخته', calories_per_unit: 150, unit: '100 گرم', category: 'غلات', protein: 5, carbs: 30, fat: 1 },

  // لبنیات
  { name: 'شیر کامل', calories_per_unit: 150, unit: 'لیوان (250ml)', category: 'لبنیات', protein: 8, carbs: 12, fat: 8 },
  { name: 'شیر کم چرب', calories_per_unit: 100, unit: 'لیوان (250ml)', category: 'لبنیات', protein: 8, carbs: 12, fat: 2.5 },
  { name: 'ماست', calories_per_unit: 60, unit: '100 گرم', category: 'لبنیات', protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'پنیر لیقوان', calories_per_unit: 75, unit: '30 گرم', category: 'لبنیات', protein: 5, carbs: 1, fat: 6 },
  { name: 'پنیر پیتزا', calories_per_unit: 85, unit: '30 گرم', category: 'لبنیات', protein: 6, carbs: 1, fat: 7 },
  { name: 'دوغ', calories_per_unit: 25, unit: 'لیوان (250ml)', category: 'لبنیات', protein: 1.5, carbs: 3, fat: 1 },

  // پروتئین
  { name: 'تخم مرغ', calories_per_unit: 155, unit: 'عدد', category: 'پروتئین', protein: 13, carbs: 1.1, fat: 11 },
  { name: 'مرغ سینه', calories_per_unit: 165, unit: '100 گرم', category: 'پروتئین', protein: 31, carbs: 0, fat: 3.6 },
  { name: 'گوشت چرخ کرده', calories_per_unit: 250, unit: '100 گرم', category: 'پروتئین', protein: 26, carbs: 0, fat: 17 },
  { name: 'ماهی', calories_per_unit: 120, unit: '100 گرم', category: 'پروتئین', protein: 22, carbs: 0, fat: 3 },
  { name: 'کتلت', calories_per_unit: 180, unit: 'عدد (100 گرم)', category: 'پروتئین', protein: 15, carbs: 8, fat: 10 },

  // سبزیجات
  { name: 'گوجه فرنگی', calories_per_unit: 18, unit: '100 گرم', category: 'سبزیجات', protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'خیار', calories_per_unit: 15, unit: '100 گرم', category: 'سبزیجات', protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: 'کاهو', calories_per_unit: 15, unit: '100 گرم', category: 'سبزیجات', protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: 'سیب زمینی', calories_per_unit: 77, unit: '100 گرم', category: 'سبزیجات', protein: 2, carbs: 17, fat: 0.1 },

  // میوه
  { name: 'سیب', calories_per_unit: 95, unit: 'عدد متوسط', category: 'میوه', protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'موز', calories_per_unit: 105, unit: 'عدد متوسط', category: 'میوه', protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'پرتقال', calories_per_unit: 62, unit: 'عدد متوسط', category: 'میوه', protein: 1.2, carbs: 15, fat: 0.2 },
  { name: 'هندوانه', calories_per_unit: 30, unit: '100 گرم', category: 'میوه', protein: 0.6, carbs: 8, fat: 0.2 },

  // چربی و روغن
  { name: 'روغن مایع', calories_per_unit: 120, unit: 'قاشق غذاخوری', category: 'چربی', protein: 0, carbs: 0, fat: 14 },
  { name: 'کره', calories_per_unit: 102, unit: 'قاشق غذاخوری', category: 'چربی', protein: 0.1, carbs: 0, fat: 11.5 },
  { name: 'گردو', calories_per_unit: 185, unit: '30 گرم', category: 'چربی', protein: 4.3, carbs: 3.9, fat: 18.5 },

  // غذاهای آماده
  { name: 'پیتزا مخلوط', calories_per_unit: 266, unit: 'یک برش', category: 'غذا', protein: 11, carbs: 33, fat: 10 },
  { name: 'همبرگر ساده', calories_per_unit: 295, unit: 'عدد', category: 'غذا', protein: 17, carbs: 31, fat: 11 },
  { name: 'قورمه سبزی', calories_per_unit: 180, unit: '100 گرم', category: 'غذا', protein: 12, carbs: 8, fat: 11 },
  { name: 'زرشک پلو با مرغ', calories_per_unit: 220, unit: '100 گرم', category: 'غذا', protein: 15, carbs: 28, fat: 5 },

  // نوشیدنی
  { name: 'چای بدون شکر', calories_per_unit: 2, unit: 'استکان', category: 'نوشیدنی', protein: 0, carbs: 0.5, fat: 0 },
  { name: 'قهوه سیاه', calories_per_unit: 5, unit: 'فنجان', category: 'نوشیدنی', protein: 0.3, carbs: 1, fat: 0 },
  { name: 'نوشابه', calories_per_unit: 140, unit: 'قوطی (330ml)', category: 'نوشیدنی', protein: 0, carbs: 39, fat: 0 },
  { name: 'آب پرتقال', calories_per_unit: 112, unit: 'لیوان (250ml)', category: 'نوشیدنی', protein: 1.7, carbs: 26, fat: 0.5 },
];

// این دیتا هنگام نصب اپ به دیتابیس اضافه می‌شود
// کاربر می‌تواند بعداً غذاهای بیشتری اضافه کند