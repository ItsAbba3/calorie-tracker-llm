// // src/constants/database.ts
// export const SAMPLE_FOODS_DATA = [
//   // نان و غلات
//   { name: 'نان سنگک', calories_per_unit: 85, unit: '¼ نان', category: 'نان', protein: 2.8, carbs: 17, fat: 0.5 },
//   { name: 'نان بربری', calories_per_unit: 90, unit: '¼ نان', category: 'نان', protein: 3, carbs: 18, fat: 0.6 },
//   { name: 'نان لواش', calories_per_unit: 70, unit: '¼ نان', category: 'نان', protein: 2.5, carbs: 14, fat: 0.4 },
//   { name: 'نان کامل', calories_per_unit: 80, unit: '¼ نان', category: 'نان', protein: 3.5, carbs: 15, fat: 1 },
//   { name: 'نان تست', calories_per_unit: 75, unit: 'یک برش', category: 'نان', protein: 2.5, carbs: 14, fat: 1 },
//   { name: 'برنج پخته', calories_per_unit: 130, unit: '100 گرم', category: 'غلات', protein: 2.7, carbs: 28, fat: 0.3 },
//   { name: 'ماکارونی پخته', calories_per_unit: 150, unit: '100 گرم', category: 'غلات', protein: 5, carbs: 30, fat: 1 },

//   // لبنیات
//   { name: 'شیر کامل', calories_per_unit: 150, unit: 'لیوان (250ml)', category: 'لبنیات', protein: 8, carbs: 12, fat: 8 },
//   { name: 'شیر کم چرب', calories_per_unit: 100, unit: 'لیوان (250ml)', category: 'لبنیات', protein: 8, carbs: 12, fat: 2.5 },
//   { name: 'ماست', calories_per_unit: 60, unit: '100 گرم', category: 'لبنیات', protein: 3.5, carbs: 4.7, fat: 3.3 },
//   { name: 'پنیر لیقوان', calories_per_unit: 75, unit: '30 گرم', category: 'لبنیات', protein: 5, carbs: 1, fat: 6 },
//   { name: 'پنیر پیتزا', calories_per_unit: 85, unit: '30 گرم', category: 'لبنیات', protein: 6, carbs: 1, fat: 7 },
//   { name: 'دوغ', calories_per_unit: 25, unit: 'لیوان (250ml)', category: 'لبنیات', protein: 1.5, carbs: 3, fat: 1 },

//   // پروتئین
//   { name: 'تخم مرغ', calories_per_unit: 155, unit: 'عدد', category: 'پروتئین', protein: 13, carbs: 1.1, fat: 11 },
//   { name: 'مرغ سینه', calories_per_unit: 165, unit: '100 گرم', category: 'پروتئین', protein: 31, carbs: 0, fat: 3.6 },
//   { name: 'گوشت چرخ کرده', calories_per_unit: 250, unit: '100 گرم', category: 'پروتئین', protein: 26, carbs: 0, fat: 17 },
//   { name: 'ماهی', calories_per_unit: 120, unit: '100 گرم', category: 'پروتئین', protein: 22, carbs: 0, fat: 3 },
//   { name: 'کتلت', calories_per_unit: 180, unit: 'عدد (100 گرم)', category: 'پروتئین', protein: 15, carbs: 8, fat: 10 },

//   // سبزیجات
//   { name: 'گوجه فرنگی', calories_per_unit: 18, unit: '100 گرم', category: 'سبزیجات', protein: 0.9, carbs: 3.9, fat: 0.2 },
//   { name: 'خیار', calories_per_unit: 15, unit: '100 گرم', category: 'سبزیجات', protein: 0.7, carbs: 3.6, fat: 0.1 },
//   { name: 'کاهو', calories_per_unit: 15, unit: '100 گرم', category: 'سبزیجات', protein: 1.4, carbs: 2.9, fat: 0.2 },
//   { name: 'سیب زمینی', calories_per_unit: 77, unit: '100 گرم', category: 'سبزیجات', protein: 2, carbs: 17, fat: 0.1 },

//   // میوه
//   { name: 'سیب', calories_per_unit: 95, unit: 'عدد متوسط', category: 'میوه', protein: 0.5, carbs: 25, fat: 0.3 },
//   { name: 'موز', calories_per_unit: 105, unit: 'عدد متوسط', category: 'میوه', protein: 1.3, carbs: 27, fat: 0.4 },
//   { name: 'پرتقال', calories_per_unit: 62, unit: 'عدد متوسط', category: 'میوه', protein: 1.2, carbs: 15, fat: 0.2 },
//   { name: 'هندوانه', calories_per_unit: 30, unit: '100 گرم', category: 'میوه', protein: 0.6, carbs: 8, fat: 0.2 },

//   // چربی و روغن
//   { name: 'روغن مایع', calories_per_unit: 120, unit: 'قاشق غذاخوری', category: 'چربی', protein: 0, carbs: 0, fat: 14 },
//   { name: 'کره', calories_per_unit: 102, unit: 'قاشق غذاخوری', category: 'چربی', protein: 0.1, carbs: 0, fat: 11.5 },
//   { name: 'گردو', calories_per_unit: 185, unit: '30 گرم', category: 'چربی', protein: 4.3, carbs: 3.9, fat: 18.5 },

//   // غذاهای آماده
//   { name: 'پیتزا مخلوط', calories_per_unit: 266, unit: 'یک برش', category: 'غذا', protein: 11, carbs: 33, fat: 10 },
//   { name: 'همبرگر ساده', calories_per_unit: 295, unit: 'عدد', category: 'غذا', protein: 17, carbs: 31, fat: 11 },
//   { name: 'قورمه سبزی', calories_per_unit: 180, unit: '100 گرم', category: 'غذا', protein: 12, carbs: 8, fat: 11 },
//   { name: 'زرشک پلو با مرغ', calories_per_unit: 220, unit: '100 گرم', category: 'غذا', protein: 15, carbs: 28, fat: 5 },

//   // نوشیدنی
//   { name: 'چای بدون شکر', calories_per_unit: 2, unit: 'استکان', category: 'نوشیدنی', protein: 0, carbs: 0.5, fat: 0 },
//   { name: 'قهوه سیاه', calories_per_unit: 5, unit: 'فنجان', category: 'نوشیدنی', protein: 0.3, carbs: 1, fat: 0 },
//   { name: 'نوشابه', calories_per_unit: 140, unit: 'قوطی (330ml)', category: 'نوشیدنی', protein: 0, carbs: 39, fat: 0 },
//   { name: 'آب پرتقال', calories_per_unit: 112, unit: 'لیوان (250ml)', category: 'نوشیدنی', protein: 1.7, carbs: 26, fat: 0.5 },
// ];

// // این دیتا هنگام نصب اپ به دیتابیس اضافه می‌شود
// // کاربر می‌تواند بعداً غذاهای بیشتری اضافه کند

export const MERGED_FOODS_DATA = [
  {
    name: 'نان سنگک',
    calories_per_unit: 78,
    unit: '¼ نان (30 گرم)',
    category: 'نان',
    protein: 2.6,
    carbs: 16.5,
    fat: 0.12
  },
  {
    name: 'نان بربری',
    calories_per_unit: 74,
    unit: '¼ نان (28 گرم)',
    category: 'نان',
    protein: 2.2,
    carbs: 15.2,
    fat: 0.4
  },
  {
    name: 'نان لواش',
    calories_per_unit: 86,
    unit: '¼ نان (30 گرم)',
    category: 'نان',
    protein: 2.7,
    carbs: 18.6,
    fat: 0.15
  },
  {
    name: 'نان تافتون',
    calories_per_unit: 80,
    unit: '¼ نان (30 گرم)',
    category: 'نان',
    protein: 2.5,
    carbs: 17,
    fat: 0.3
  },
  {
    name: 'نان جو',
    calories_per_unit: 67,
    unit: '¼ نان (25 گرم)',
    category: 'نان',
    protein: 2.4,
    carbs: 13.5,
    fat: 0.5
  },
  {
    name: 'نان فطیر',
    calories_per_unit: 105,
    unit: '¼ نان (30 گرم)',
    category: 'نان',
    protein: 3,
    carbs: 20,
    fat: 2
  },
  {
    name: 'نان روغنی',
    calories_per_unit: 115,
    unit: '¼ نان (30 گرم)',
    category: 'نان',
    protein: 2.8,
    carbs: 18,
    fat: 4
  },
  {
    name: 'نان تست',
    calories_per_unit: 90,
    unit: 'یک برش (30 گرم)',
    category: 'نان',
    protein: 2.5,
    carbs: 14,
    fat: 1
  },
  {
    name: 'نان باگت',
    calories_per_unit: 75,
    unit: 'یک برش (30 گرم)',
    category: 'نان',
    protein: 2.4,
    carbs: 14.5,
    fat: 0.8
  },
  {
    name: 'برنج سفید پخته',
    calories_per_unit: 130,
    unit: '100 گرم',
    category: 'غلات',
    protein: 2.7,
    carbs: 28,
    fat: 0.3
  },
  {
    name: 'برنج قهوه‌ای پخته',
    calories_per_unit: 110,
    unit: '100 گرم',
    category: 'غلات',
    protein: 2.5,
    carbs: 23,
    fat: 0.8
  },
  {
    name: 'ماکارونی پخته',
    calories_per_unit: 150,
    unit: '100 گرم',
    category: 'غلات',
    protein: 5,
    carbs: 30,
    fat: 1
  },
  {
    name: 'بلغور پخته',
    calories_per_unit: 85,
    unit: '100 گرم',
    category: 'غلات',
    protein: 3.5,
    carbs: 18,
    fat: 0.4
  },
  {
    name: 'جو دوسر پخته',
    calories_per_unit: 68,
    unit: '100 گرم',
    category: 'غلات',
    protein: 2.4,
    carbs: 12,
    fat: 1.4
  },
  {
    name: 'شیر کامل',
    calories_per_unit: 150,
    unit: 'لیوان (250ml)',
    category: 'لبنیات',
    protein: 8,
    carbs: 12,
    fat: 8
  },
  {
    name: 'شیر کم چرب (2%)',
    calories_per_unit: 120,
    unit: 'لیوان (250ml)',
    category: 'لبنیات',
    protein: 8,
    carbs: 12,
    fat: 5
  },
  {
    name: 'شیر بدون چرب',
    calories_per_unit: 90,
    unit: 'لیوان (250ml)',
    category: 'لبنیات',
    protein: 8,
    carbs: 12,
    fat: 0.5
  },
  {
    name: 'مااست ساده',
    calories_per_unit: 60,
    unit: '100 گرم',
    category: 'لبنیات',
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3
  },
  {
    name: 'ماست چکیده',
    calories_per_unit: 80,
    unit: '100 گرم',
    category: 'لبنیات',
    protein: 7,
    carbs: 4,
    fat: 4
  },
  {
    name: 'دوغ محلی',
    calories_per_unit: 25,
    unit: 'لیوان (250ml)',
    category: 'لبنیات',
    protein: 1.5,
    carbs: 3,
    fat: 1
  },
  {
    name: 'پنیر لیقوان',
    calories_per_unit: 75,
    unit: '30 گرم',
    category: 'لبنیات',
    protein: 5,
    carbs: 1,
    fat: 6
  },
  {
    name: 'پنیر پیتزا',
    calories_per_unit: 85,
    unit: '30 گرم',
    category: 'لبنیات',
    protein: 6,
    carbs: 1,
    fat: 7
  },
  {
    name: 'پنیر خامه‌ای',
    calories_per_unit: 100,
    unit: '30 گرم',
    category: 'لبنیات',
    protein: 3,
    carbs: 1,
    fat: 10
  },
  {
    name: 'کشک',
    calories_per_unit: 50,
    unit: 'قاشق غذاخوری (20 گرم)',
    category: 'لبنیات',
    protein: 3.5,
    carbs: 2,
    fat: 2.5
  },
  {
    name: 'تخم مرغ آب‌پز',
    calories_per_unit: 155,
    unit: 'عدد',
    category: 'پروتئین',
    protein: 13,
    carbs: 1.1,
    fat: 11
  },
  {
    name: 'تخم مرغ عسلی',
    calories_per_unit: 140,
    unit: 'عدد',
    category: 'پروتئین',
    protein: 12,
    carbs: 1,
    fat: 9.5
  },
  {
    name: 'مرغ سینه بدون پوست',
    calories_per_unit: 165,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 31,
    carbs: 0,
    fat: 3.6
  },
  {
    name: 'مرغ ران بدون پوست',
    calories_per_unit: 185,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 26,
    carbs: 0,
    fat: 9
  },
  {
    name: 'بوقلمون سینه',
    calories_per_unit: 135,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 30,
    carbs: 0,
    fat: 1
  },
  {
    name: 'گوشت گوسفند چرخ کرده',
    calories_per_unit: 250,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 26,
    carbs: 0,
    fat: 17
  },
  {
    name: 'گوشت گوساله چرخ کرده',
    calories_per_unit: 220,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 27,
    carbs: 0,
    fat: 14
  },
  {
    name: 'ماهی قزل آلا',
    calories_per_unit: 120,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 22,
    carbs: 0,
    fat: 3
  },
  {
    name: 'ماهی سفید',
    calories_per_unit: 90,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 20,
    carbs: 0,
    fat: 1.5
  },
  {
    name: 'تن ماهی در روغن',
    calories_per_unit: 180,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 25,
    carbs: 0,
    fat: 8
  },
  {
    name: 'کتلت گوشت',
    calories_per_unit: 180,
    unit: 'عدد (100 گرم)',
    category: 'پروتئین',
    protein: 15,
    carbs: 8,
    fat: 10
  },
  {
    name: 'کباب کوبیده',
    calories_per_unit: 230,
    unit: 'یک سیخ (100 گرم)',
    category: 'پروتئین',
    protein: 20,
    carbs: 3,
    fat: 16
  },
  {
    name: 'کباب برگ',
    calories_per_unit: 240,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 28,
    carbs: 2,
    fat: 14
  },
  {
    name: 'جوجه کباب',
    calories_per_unit: 200,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 25,
    carbs: 2,
    fat: 10
  },
  {
    name: 'سوسیس',
    calories_per_unit: 280,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 12,
    carbs: 2,
    fat: 25
  },
  {
    name: 'کالباس',
    calories_per_unit: 260,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 14,
    carbs: 3,
    fat: 22
  },
  {
    name: 'گوجه فرنگی',
    calories_per_unit: 18,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2
  },
  {
    name: 'خیار',
    calories_per_unit: 15,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1
  },
  {
    name: 'کاهو',
    calories_per_unit: 15,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 1.4,
    carbs: 2.9,
    fat: 0.2
  },
  {
    name: 'سیب زمینی آب‌پز',
    calories_per_unit: 77,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 2,
    carbs: 17,
    fat: 0.1
  },
  {
    name: 'سیب زمینی سرخ کرده',
    calories_per_unit: 195,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 3,
    carbs: 32,
    fat: 7
  },
  {
    name: 'هویج خام',
    calories_per_unit: 41,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 0.9,
    carbs: 10,
    fat: 0.2
  },
  {
    name: 'فلفل دلمه‌ای',
    calories_per_unit: 20,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 0.9,
    carbs: 4.6,
    fat: 0.2
  },
  {
    name: 'کلم بروکلی',
    calories_per_unit: 34,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 2.8,
    carbs: 7,
    fat: 0.4
  },
  {
    name: 'پیاز',
    calories_per_unit: 40,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1
  },
  {
    name: 'سیر',
    calories_per_unit: 149,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 6.4,
    carbs: 33,
    fat: 0.5
  },
  {
    name: 'بادمجان کبابی',
    calories_per_unit: 40,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 1,
    carbs: 7,
    fat: 0.8
  },
  {
    name: 'کدو سبز',
    calories_per_unit: 17,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 1.2,
    carbs: 3.1,
    fat: 0.2
  },
  {
    name: 'سیب',
    calories_per_unit: 95,
    unit: 'عدد متوسط (180 گرم)',
    category: 'میوه',
    protein: 0.5,
    carbs: 25,
    fat: 0.3
  },
  {
    name: 'موز',
    calories_per_unit: 105,
    unit: 'عدد متوسط (118 گرم)',
    category: 'میوه',
    protein: 1.3,
    carbs: 27,
    fat: 0.4
  },
  {
    name: 'پرتقال',
    calories_per_unit: 62,
    unit: 'عدد متوسط (130 گرم)',
    category: 'میوه',
    protein: 1.2,
    carbs: 15,
    fat: 0.2
  },
  {
    name: 'هندوانه',
    calories_per_unit: 30,
    unit: '100 گرم',
    category: 'میوه',
    protein: 0.6,
    carbs: 8,
    fat: 0.2
  },
  {
    name: 'خربزه',
    calories_per_unit: 34,
    unit: '100 گرم',
    category: 'میوه',
    protein: 0.8,
    carbs: 8.5,
    fat: 0.2
  },
  {
    name: 'انگور',
    calories_per_unit: 67,
    unit: '100 گرم',
    category: 'میوه',
    protein: 0.6,
    carbs: 16,
    fat: 0.2
  },
  {
    name: 'نارگیل تازه',
    calories_per_unit: 354,
    unit: '100 گرم',
    category: 'میوه',
    protein: 3.3,
    carbs: 15,
    fat: 33
  },
  {
    name: 'خرما',
    calories_per_unit: 70,
    unit: 'یک عدد (25 گرم)',
    category: 'میوه',
    protein: 0.5,
    carbs: 18,
    fat: 0.1
  },
  {
    name: 'انجیر تازه',
    calories_per_unit: 74,
    unit: '100 گرم',
    category: 'میوه',
    protein: 0.8,
    carbs: 19,
    fat: 0.3
  },
  {
    name: 'انجیر خشک',
    calories_per_unit: 250,
    unit: '100 گرم',
    category: 'میوه',
    protein: 3,
    carbs: 64,
    fat: 1.5
  },
  {
    name: 'آلو خشک',
    calories_per_unit: 240,
    unit: '100 گرم',
    category: 'میوه',
    protein: 2,
    carbs: 63,
    fat: 0.5
  },
  {
    name: 'لیمو شیرین',
    calories_per_unit: 43,
    unit: '100 گرم',
    category: 'میوه',
    protein: 1.1,
    carbs: 9,
    fat: 0.3
  },
  {
    name: 'روغن مایع',
    calories_per_unit: 120,
    unit: 'قاشق غذاخوری',
    category: 'چربی',
    protein: 0,
    carbs: 0,
    fat: 14
  },
  {
    name: 'کره',
    calories_per_unit: 102,
    unit: 'قاشق غذاخوری',
    category: 'چربی',
    protein: 0.1,
    carbs: 0,
    fat: 11.5
  },
  {
    name: 'مارگارین',
    calories_per_unit: 100,
    unit: 'قاشق غذاخوری',
    category: 'چربی',
    protein: 0.1,
    carbs: 0,
    fat: 11
  },
  {
    name: 'گردو',
    calories_per_unit: 185,
    unit: '30 گرم',
    category: 'چربی',
    protein: 4.3,
    carbs: 3.9,
    fat: 18.5
  },
  {
    name: 'بادام خام',
    calories_per_unit: 160,
    unit: '30 گرم',
    category: 'چربی',
    protein: 6,
    carbs: 5,
    fat: 14
  },
  {
    name: 'پسته خام',
    calories_per_unit: 170,
    unit: '30 گرم',
    category: 'چربی',
    protein: 6,
    carbs: 9,
    fat: 14
  },
  {
    name: 'فندق',
    calories_per_unit: 180,
    unit: '30 گرم',
    category: 'چربی',
    protein: 4,
    carbs: 5,
    fat: 18
  },
  {
    name: 'کنجد',
    calories_per_unit: 170,
    unit: '30 گرم',
    category: 'چربی',
    protein: 5,
    carbs: 7,
    fat: 15
  },
  {
    name: 'آووکادو',
    calories_per_unit: 160,
    unit: '100 گرم',
    category: 'چربی',
    protein: 2,
    carbs: 9,
    fat: 15
  },
  {
    name: 'لوبیا قرمز پخته',
    calories_per_unit: 127,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 9,
    carbs: 23,
    fat: 0.5
  },
  {
    name: 'نخود پخته',
    calories_per_unit: 164,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 9,
    carbs: 27,
    fat: 2.6
  },
  {
    name: 'عدس پخته',
    calories_per_unit: 116,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 9,
    carbs: 20,
    fat: 0.4
  },
  {
    name: 'لوبیا چیتی پخته',
    calories_per_unit: 110,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 7.5,
    carbs: 20,
    fat: 0.4
  },
  {
    name: 'لوبیا سفید پخته',
    calories_per_unit: 118,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 8.7,
    carbs: 21,
    fat: 0.4
  },
  {
    name: 'قورمه سبزی',
    calories_per_unit: 180,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 12,
    carbs: 8,
    fat: 11
  },
  {
    name: 'زرشک پلو با مرغ',
    calories_per_unit: 220,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 15,
    carbs: 28,
    fat: 5
  },
  {
    name: 'چلو کباب کوبیده',
    calories_per_unit: 270,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 18,
    carbs: 20,
    fat: 12
  },
  {
    name: 'آبگوشت',
    calories_per_unit: 140,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 14,
    carbs: 5,
    fat: 7
  },
  {
    name: 'میرزا قاسمی',
    calories_per_unit: 120,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 2.5,
    carbs: 6,
    fat: 10
  },
  {
    name: 'کشک بادمجان',
    calories_per_unit: 130,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 5,
    carbs: 8,
    fat: 9
  },
  {
    name: 'عدس پلو',
    calories_per_unit: 160,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 7,
    carbs: 25,
    fat: 3.5
  },
  {
    name: 'آلبالو پلو',
    calories_per_unit: 200,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 6,
    carbs: 30,
    fat: 6
  },
  {
    name: 'ته چین مرغ',
    calories_per_unit: 230,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 16,
    carbs: 25,
    fat: 7
  },
  {
    name: 'فسنجان',
    calories_per_unit: 250,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 18,
    carbs: 20,
    fat: 12
  },
  {
    name: 'پیتزا مخلوط',
    calories_per_unit: 266,
    unit: 'یک برش',
    category: 'فست فود',
    protein: 11,
    carbs: 33,
    fat: 10
  },
  {
    name: 'همبرگر ساده',
    calories_per_unit: 295,
    unit: 'عدد',
    category: 'فست فود',
    protein: 17,
    carbs: 31,
    fat: 11
  },
  {
    name: 'ساندویچ شاورما',
    calories_per_unit: 320,
    unit: 'عدد',
    category: 'فست فود',
    protein: 20,
    carbs: 30,
    fat: 14
  },
  {
    name: 'لازانیا',
    calories_per_unit: 135,
    unit: '100 گرم',
    category: 'فست فود',
    protein: 8,
    carbs: 12,
    fat: 6
  },
  {
    name: 'پاستا آلفردو',
    calories_per_unit: 200,
    unit: '100 گرم',
    category: 'فست فود',
    protein: 10,
    carbs: 20,
    fat: 9
  },
  {
    name: 'آب',
    calories_per_unit: 0,
    unit: 'لیوان',
    category: 'نوشیدنی',
    protein: 0,
    carbs: 0,
    fat: 0
  },
  {
    name: 'چای',
    calories_per_unit: 2,
    unit: 'لیوان',
    category: 'نوشیدنی',
    protein: 0,
    carbs: 0.5,
    fat: 0
  },
  {
    name: 'قهوه',
    calories_per_unit: 5,
    unit: 'لیوان',
    category: 'نوشیدنی',
    protein: 0.3,
    carbs: 0,
    fat: 0.1
  },
  {
    name: 'نوشابه',
    calories_per_unit: 105,
    unit: 'قوطی (250ml)',
    category: 'نوشیدنی',
    protein: 0,
    carbs: 27,
    fat: 0
  },
  {
    name: 'آبمیوه طبیعی',
    calories_per_unit: 110,
    unit: 'لیوان (250ml)',
    category: 'نوشیدنی',
    protein: 1,
    carbs: 25,
    fat: 0.5
  },
  {
    name: 'بستنی وانیلی',
    calories_per_unit: 137,
    unit: '100 گرم',
    category: 'دسر',
    protein: 2.3,
    carbs: 16,
    fat: 7.3
  },
  {
    name: 'کیک شکلاتی',
    calories_per_unit: 370,
    unit: '100 گرم',
    category: 'دسر',
    protein: 5,
    carbs: 50,
    fat: 18
  },
  {
    name: 'شکلات تلخ',
    calories_per_unit: 546,
    unit: '100 گرم',
    category: 'دسر',
    protein: 7.8,
    carbs: 61,
    fat: 31
  },
  {
    name: 'عسل',
    calories_per_unit: 64,
    unit: 'قاشق غذاخوری',
    category: 'دسر',
    protein: 0.1,
    carbs: 17,
    fat: 0
  },
  {
    name: 'مربا',
    calories_per_unit: 50,
    unit: 'قاشق غذاخوری',
    category: 'دسر',
    protein: 0,
    carbs: 13,
    fat: 0
  },
  {
    name: 'نان شیرمال',
    calories_per_unit: 95,
    unit: '¼ نان (30 گرم)',
    category: 'نان',
    protein: 2.5,
    carbs: 18,
    fat: 1.5
  },
  {
    name: 'رشته پلو',
    calories_per_unit: 180,
    unit: '100 گرم',
    category: 'غلات',
    protein: 6,
    carbs: 35,
    fat: 1.5
  },
  {
    name: 'شیر کاکائو',
    calories_per_unit: 180,
    unit: 'لیوان (250ml)',
    category: 'لبنیات',
    protein: 8,
    carbs: 26,
    fat: 5
  },
  {
    name: 'پنیر فتا',
    calories_per_unit: 70,
    unit: '30 گرم',
    category: 'لبنیات',
    protein: 4,
    carbs: 1,
    fat: 6
  },
  {
    name: 'دل و جگر',
    calories_per_unit: 160,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 25,
    carbs: 1,
    fat: 6
  },
  {
    name: 'زبان گوساله',
    calories_per_unit: 220,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 18,
    carbs: 0.1,
    fat: 16
  },
  {
    name: 'اسفناج پخته',
    calories_per_unit: 23,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 3,
    carbs: 3.6,
    fat: 0.3
  },
  {
    name: 'قارچ پخته',
    calories_per_unit: 28,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 3.1,
    carbs: 5.3,
    fat: 0.3
  },
  {
    name: 'گیلاس',
    calories_per_unit: 50,
    unit: '100 گرم',
    category: 'میوه',
    protein: 1,
    carbs: 12,
    fat: 0.3
  },
  {
    name: 'زردآلو',
    calories_per_unit: 48,
    unit: '100 گرم',
    category: 'میوه',
    protein: 1.4,
    carbs: 11,
    fat: 0.4
  },
  {
    name: 'روغن زیتون',
    calories_per_unit: 119,
    unit: 'قاشق غذاخوری',
    category: 'چربی',
    protein: 0,
    carbs: 0,
    fat: 13.5
  },
  {
    name: 'تخمه آفتابگردان',
    calories_per_unit: 175,
    unit: '30 گرم',
    category: 'چربی',
    protein: 6,
    carbs: 6,
    fat: 15
  },
  {
    name: 'ماش پخته',
    calories_per_unit: 105,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 7,
    carbs: 19,
    fat: 0.4
  },
  {
    name: 'لپه پخته',
    calories_per_unit: 115,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 8,
    carbs: 21,
    fat: 0.4
  },
  {
    name: 'قیمه',
    calories_per_unit: 170,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 11,
    carbs: 10,
    fat: 9
  },
  {
    name: 'باقالی پلو با گوشت',
    calories_per_unit: 240,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 16,
    carbs: 25,
    fat: 8
  },
  {
    name: 'ناگت مرغ',
    calories_per_unit: 290,
    unit: '100 گرم',
    category: 'فست فود',
    protein: 15,
    carbs: 18,
    fat: 18
  },
  {
    name: 'سالاد سزار',
    calories_per_unit: 180,
    unit: '100 گرم',
    category: 'فست فود',
    protein: 8,
    carbs: 5,
    fat: 14
  },
  {
    name: 'دلستر',
    calories_per_unit: 70,
    unit: 'قوطی (250ml)',
    category: 'نوشیدنی',
    protein: 0,
    carbs: 18,
    fat: 0
  },
  {
    name: 'ژله',
    calories_per_unit: 60,
    unit: '100 گرم',
    category: 'دسر',
    protein: 1.5,
    carbs: 15,
    fat: 0
  },
  {
    name: 'برنج کته',
    calories_per_unit: 125,
    unit: '100 گرم',
    category: 'غلات',
    protein: 2.6,
    carbs: 27,
    fat: 0.3
  },
  {
    name: 'ماست میوه‌ای',
    calories_per_unit: 90,
    unit: '100 گرم',
    category: 'لبنیات',
    protein: 3,
    carbs: 15,
    fat: 2
  },
  {
    name: 'سرشیر',
    calories_per_unit: 150,
    unit: 'قاشق غذاخوری (20 گرم)',
    category: 'لبنیات',
    protein: 0.5,
    carbs: 1,
    fat: 16
  },
  {
    name: 'املت',
    calories_per_unit: 150,
    unit: 'عدد (100 گرم)',
    category: 'پروتئین',
    protein: 10,
    carbs: 2,
    fat: 11
  },
  {
    name: 'ماهی تن در آب',
    calories_per_unit: 120,
    unit: '100 گرم',
    category: 'پروتئین',
    protein: 26,
    carbs: 0,
    fat: 1
  },
  {
    name: 'کلم سفید',
    calories_per_unit: 25,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 1.3,
    carbs: 6,
    fat: 0.1
  },
  {
    name: 'لوبیا سبز پخته',
    calories_per_unit: 35,
    unit: '100 گرم',
    category: 'سبزیجات',
    protein: 1.8,
    carbs: 8,
    fat: 0.2
  },
  {
    name: 'توت فرنگی',
    calories_per_unit: 32,
    unit: '100 گرم',
    category: 'میوه',
    protein: 0.7,
    carbs: 8,
    fat: 0.3
  },
  {
    name: 'هلو',
    calories_per_unit: 39,
    unit: '100 گرم',
    category: 'میوه',
    protein: 0.9,
    carbs: 10,
    fat: 0.3
  },
  {
    name: 'کره بادام زمینی',
    calories_per_unit: 190,
    unit: 'قاشق غذاخوری',
    category: 'چربی',
    protein: 8,
    carbs: 6,
    fat: 16
  },
  {
    name: 'بادام هندی',
    calories_per_unit: 165,
    unit: '30 گرم',
    category: 'چربی',
    protein: 5,
    carbs: 9,
    fat: 13
  },
  {
    name: 'باقالی پخته',
    calories_per_unit: 110,
    unit: '100 گرم',
    category: 'حبوبات',
    protein: 8,
    carbs: 20,
    fat: 0.5
  },
  {
    name: 'کله گنجشکی',
    calories_per_unit: 200,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 15,
    carbs: 10,
    fat: 12
  },
  {
    name: 'یتیمچه',
    calories_per_unit: 90,
    unit: '100 گرم',
    category: 'غذای ایرانی',
    protein: 2,
    carbs: 8,
    fat: 6
  },
  {
    name: 'استیک',
    calories_per_unit: 270,
    unit: '100 گرم',
    category: 'فست فود',
    protein: 25,
    carbs: 0,
    fat: 19
  },
  {
    name: 'سوپ جو',
    calories_per_unit: 80,
    unit: '100 گرم',
    category: 'فست فود',
    protein: 3,
    carbs: 12,
    fat: 2
  },
  {
    name: 'شربت',
    calories_per_unit: 80,
    unit: 'لیوان (250ml)',
    category: 'نوشیدنی',
    protein: 0,
    carbs: 20,
    fat: 0
  },
  {
    name: 'حلوا',
    calories_per_unit: 400,
    unit: '100 گرم',
    category: 'دسر',
    protein: 6,
    carbs: 50,
    fat: 20
  }
];