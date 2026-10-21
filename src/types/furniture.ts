// src/types/furniture.ts

// 1. شكل القسم (Category) - عشان نقدر نضيف أقسام جديدة
export interface Category {
  id: string;
  name: string; // اسم القسم (طاولات، أحذية...)
  image: string; // رابط صورة القسم
  isActive: boolean; // هل القسم مفعل ولا مخفي (عشان زينة رمضان)
  order: number; // ترتيب ظهور القسم في الصفحة الرئيسية
}

// 2. الخصائص الديناميكية (بديل لـ woodType و dimensions)
export interface ProductAttribute {
  name: string; // اسم الخاصية (مثلاً: المقاس، الخامة، الأبعاد)
  options: string[]; // القيم المتاحة (مثلاً: ["40", "41"] أو ["خشب", "رخام"])
}

// 3. ألوان المنتج
export interface ProductColor {
  name: string;
  hex: string;
  price: number; // السعر الخاص بهذا اللون
  originalPrice?: number; // السعر قبل الخصم
  image: string; // صورة هذا اللون
  additionalImages?: string[]; // زوايا إضافية
}

// 4. المنتج (Product) - تم تحديثه ليكون ديناميكي
export interface Product {
  id: string;
  itemNumber: number; // رقم المنتج
  name: string;
  nameEn?: string;
  categoryId: string; // يربط المنتج بالقسم (بدل الـ category الثابت)
  basePrice: number; // السعر الأساسي
  originalPrice?: number; // السعر قبل الخصم (للعروض)
  description: string;
  warranty: string; // ممكن نخليها ديناميكية بعدين لو حبينا
  images: string[];
  colors: ProductColor[];
  
  // الخصائص الديناميكية (هنا السر!)
  attributes?: ProductAttribute[]; 
  
  // مميزات إضافية
  isBestSeller?: boolean; // للأكثر مبيعاً
  isActive: boolean; // لإخفاء منتج معين
  createdAt?: string;
}

// 5. السلة (Cart)
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
  selectedAttributes?: Record<string, string>; // لحفظ المقاس أو الخامة اللي الزبون اختارها
}

// 6. الطلبات (Order) - تم إزالة الفيزا وإضافة رقمين وعنوان مفصل
export interface Order {
  id: string;
  createdAt: string;
  status: 'جديد' | 'جاري التجهيز' | 'جاري التوصيل' | 'تم التسليم' | 'ملغي';
  name: string;
  phone: string;
  phone2?: string; // الرقم الثاني
  governorate: string;
  address: string;
  region?: string; // المنطقة
  street?: string; // الشارع
  building?: string; // العمارة
  notes?: string;
  paymentMethod: 'cod' | 'cliq'; // شلنا card
  cliqRef?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
