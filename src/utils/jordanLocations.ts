/**
 * Jordan Locations, Phone Validation & Delivery Rules for Dukan 962
 * Phone: 0780981214 (wa.me/962780981214)
 * Delivery:
 * - Amman (العاصمة عمان): 5 JOD
 * - Outside Amman (المحافظات): 8 JOD
 * - Aqaba (العقبة): 10 JOD
 * (لا يوجد توصيل مجاني)
 */

export const STORE_PHONE = '0780981214';
export const STORE_PHONE_INTL = '962780981214';
export const STORE_WHATSAPP_HANDLE = 'mohammadkh.99';

export const JORDAN_GOVERNORATES = [
  'عمان (العاصمة)',
  'إربد',
  'الزرقاء',
  'العقبة',
  'البلقاء / السلط',
  'مادبا',
  'جرش',
  'عجلون',
  'المفرق',
  'الكرك',
  'معان',
  'الطفيلة',
] as const;

export type JordanGovernorate = (typeof JORDAN_GOVERNORATES)[number];

/**
 * 💡 حد التوصيل المجاني (بالدينار). المصدر الوحيد لهذه القيمة في المشروع:
 * السلة وإتمام الطلب ورسائل الواتساب كلها تقرأ منه.
 *  - null  => لا يوجد توصيل مجاني (السياسة الحالية)
 *  - 150   => التوصيل مجاني للطلبات من 150 د.أ فما فوق
 */
export const FREE_DELIVERY_THRESHOLD: number | null = null;

export const DELIVERY_FEE_MIN = 5;   // داخل عمان
export const DELIVERY_FEE_MAX = 10;  // العقبة

export const isFreeDelivery = (subtotal: number): boolean =>
  FREE_DELIVERY_THRESHOLD !== null && subtotal >= FREE_DELIVERY_THRESHOLD;

/**
 * Calculates official delivery fee according to store policy:
 * - Inside Amman: 5 JOD
 * - Aqaba: 10 JOD
 * - All other governorates (Outside Amman): 8 JOD
 * - Free when subtotal reaches FREE_DELIVERY_THRESHOLD (if enabled)
 */
export const calculateDeliveryFee = (governorate: string, subtotal: number = 0): number => {
  if (isFreeDelivery(subtotal)) {
    return 0;
  }
  if (governorate.includes('العقبة')) {
    return 10;
  }
  if (governorate.includes('عمان') || governorate.includes('العاصمة')) {
    return 5;
  }
  return 8; // Outside Amman (Irbid, Zarqa, Balqa/Salt, Madaba, Jerash, Ajloun, Mafraq, Karak, Tafileh, Maan)
};

export const getDeliveryFeeLabel = (governorate: string): string => {
  const fee = calculateDeliveryFee(governorate);
  if (governorate.includes('العقبة')) {
    return `${fee.toFixed(2)} د.أ (العقبة)`;
  }
  if (governorate.includes('عمان') || governorate.includes('العاصمة')) {
    return `${fee.toFixed(2)} د.أ (داخل عمان)`;
  }
  return `${fee.toFixed(2)} د.أ (خارج عمان)`;
};

/**
 * Validate strictly for Jordanian mobile numbers:
 * Must be exactly 10 digits starting with 079, 077, or 078.
 */
export const validateJordanPhone = (
  rawPhone: string
): { isValid: boolean; cleaned: string; error?: string } => {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      cleaned: '',
      error: 'رقم الهاتف مطلوب لتأكيد التوصيل',
    };
  }

  // Remove whitespace, dashes, plus, and Arabic-indic numbers conversion
  let cleaned = rawPhone
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[\s\-\+]/g, '');

  // Convert international 9627X... to 07X...
  if (cleaned.startsWith('962')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('00962')) {
    cleaned = '0' + cleaned.substring(5);
  }

  // Must strictly be 10 digits starting with 079, 077, or 078
  const jordanMobileRegex = /^07[789]\d{7}$/;

  if (!jordanMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      cleaned,
      error: 'يرجى إدخال رقم هاتف إردني صحيح وخاص بك',
    };
  }

  // 💡 فحص الأرقام الوهمية والمكررة
  const dummyNumbers = [
    '0791234567', '0780000000', '0799999999', '0771234567', 
    '0770000000', '0781234567', '0790000000', '0789999999',
    '0777777777', '0788888888', '0796666666'
  ];

  if (dummyNumbers.includes(cleaned)) {
    return {
      isValid: false,
      cleaned,
      error: 'يرجى إدخال رقم هاتف إردني صحيح وخاص بك',
    };
  }

  return {
    isValid: true,
    cleaned,
  };
};

/**
 * Detect governorate automatically from address input.
 */
export const detectGovernorateFromAddress = (address: string): JordanGovernorate | null => {
  const text = address.trim().toLowerCase();
  if (!text) return null;

  // 1. Amman areas
  const ammanKeywords = [
    'جبل التاج', 'التاج', 'جبل اللويبدة', 'اللويبدة', 'جبل الحسين', 'جبل النزهة', 'النزهة',
    'جبل النصر', 'النصر', 'جبل الجوفة', 'الجوفة', 'جبل القصور', 'القصور', 'جبل القلعة',
    'جبل عمان', 'وسط البلد', 'عبدون', 'الصويفية', 'دير غبار', 'أم أذينة', 'الشميساني',
    'الرابية', 'تلاع العلي', 'خلدا', 'دابوق', 'الجبيهة', 'شفا بدران', 'أبو نصير',
    'مرج الحمام', 'البيادر', 'بيادر وادي السير', 'وادي السير', 'سحاب', 'الموقر',
    'القويسمة', 'المقابلين', 'الهاشمي الشمالي', 'الهاشمي الجنوبي', 'ماركا', 'طبربور',
    'حي نزال', 'الياسمين', 'ضاحية الرشيد', 'ضاحية الأقصى', 'ضاحية الأمير حسن',
    'شارع مكة', 'شارع المدينة', 'شارع الجامعة', 'صويلح', 'بدر الجديدة', 'اليادودة',
    'جاوا', 'الجيزة', 'ناعور', 'عمان', 'العاصمة', 'الرابع', 'الخامس', 'السادس', 'السابع',
    'الثامن', 'طريق المطار', 'مرج الحمام', 'طبربور', 'أبو علندا', 'الجويدة', 'خريبة السوق'
  ];

  // 2. Aqaba areas
  const aqabaKeywords = [
    'العقبة', 'عقبة', 'الشاطئ الجنوبي', 'وادي رم', 'القويرة', 'التاسعة',
    'الثامنة', 'العاشرة', 'المحدود', 'الكرامة', 'الشامية', 'الميناء', 'الريشة'
  ];

  // 3. Zarqa areas
  const zarqaKeywords = [
    'الزرقاء', 'الرصيفة', 'ياجوز', 'الهاشمية', 'خو', 'الضليل', 'الظليل',
    'حي معصوم', 'البتراوي', 'الغويرية', 'جناعة', 'وادي الحجر', 'بيرين', 'الأزرق'
  ];

  // 4. Irbid areas
  const irbidKeywords = [
    'إربد', 'اربد', 'الرمثا', 'الحصن', 'الصريح', 'بني كنانة', 'بني عبيد',
    'لواء الكورة', 'الأغوار الشمالية', 'المزار الشمالي', 'الطيبة', 'الوسطية',
    'دير أبي سعيد', 'حوارة', 'أيدون', 'بيت راس', 'كفريوبا', 'الشجرة', 'الطرة', 'اليرموك'
  ];

  // 5. Balqa / Salt
  const balqaKeywords = [
    'السلط', 'البلقاء', 'الفحيص', 'ماحص', 'عين الباشا', 'البقعة', 'مخيم البقعة',
    'دير علا', 'الشونة الجنوبية', 'وادي شعيب', 'زي', 'عيرا', 'يرقا', 'مؤاب'
  ];

  // 6. Madaba
  const madabaKeywords = ['مادبا', 'ذيبان', 'ماعين', 'حنينا', 'الفيصلية'];

  // 7. Jerash
  const jerashKeywords = ['جرش', 'سوف', 'ساكب', 'برما', 'المصطبة', 'ريمون', 'المعراض'];

  // 8. Ajloun
  const ajlounKeywords = ['عجلون', 'كفرنجة', 'عنجرة', 'صخرة', 'عبين', 'عبلين', 'اشتفينا', 'الروابي'];

  // 9. Mafraq
  const mafraqKeywords = ['المفرق', 'بلعما', 'الخالدية', 'الرويشد', 'الصفاوي', 'المنشية'];

  // 10. Karak
  const karakKeywords = ['الكرك', 'المزار الجنوبي', 'القصر', 'الأغوار الجنوبية', 'عي', 'فقوع', 'مؤتة', 'غور الصافي', 'القطرانة'];

  // 11. Tafileh
  const tafilehKeywords = ['الطفيلة', 'بصيرا', 'الحسا', 'ضانا', 'العيص', 'القادسية'];

  // 12. Ma'an
  const maanKeywords = ['معان', 'البتراء', 'البترا', 'وادي موسى', 'الشوبك', 'إيل', 'الجفر', 'الحسينية'];

  for (const kw of ammanKeywords) {
    if (text.includes(kw)) return 'عمان (العاصمة)';
  }
  for (const kw of aqabaKeywords) {
    if (text.includes(kw)) return 'العقبة';
  }
  for (const kw of zarqaKeywords) {
    if (text.includes(kw)) return 'الزرقاء';
  }
  for (const kw of irbidKeywords) {
    if (text.includes(kw)) return 'إربد';
  }
  for (const kw of balqaKeywords) {
    if (text.includes(kw)) return 'البلقاء / السلط';
  }
  for (const kw of madabaKeywords) {
    if (text.includes(kw)) return 'مادبا';
  }
  for (const kw of jerashKeywords) {
    if (text.includes(kw)) return 'جرش';
  }
  for (const kw of ajlounKeywords) {
    if (text.includes(kw)) return 'عجلون';
  }
  for (const kw of mafraqKeywords) {
    if (text.includes(kw)) return 'المفرق';
  }
  for (const kw of karakKeywords) {
    if (text.includes(kw)) return 'الكرك';
  }
  for (const kw of tafilehKeywords) {
    if (text.includes(kw)) return 'الطفيلة';
  }
  for (const kw of maanKeywords) {
    if (text.includes(kw)) return 'معان';
  }

  return null;
};
