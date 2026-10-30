// src/types/furniture.ts

// 1. شكل القسم (Category)
export interface Category {
  id: string;
  name: string;
  image: string; 
  bannerImage: string; 
  mobileBannerImage?: string; 
  title: string;
  description: string;
  buttonText: string;
  badgeText: string;
  isActive: boolean;
  order: number;
}

// 2. الخصائص الديناميكية
export interface ProductAttribute {
  name: string; 
  options: string[]; 
}

// 3. ألوان المنتج
export interface ProductColor {
  name: string;
  hex: string;
  price: number; 
  originalPrice?: number; 
  image: string; 
  additionalImages?: string[]; 
}

// 4. المنتج (Product)
export interface Product {
  id: string;
  itemNumber: number; 
  name: string;
  nameEn?: string;
  categoryId: string; 
  basePrice: number; 
  originalPrice?: number; 
  description: string;
  warranty: string; 
  images: string[];
  colors: ProductColor[];
  attributes?: ProductAttribute[]; 
  isBestSeller?: boolean; 
  isActive: boolean; 
  createdAt?: string;
  videoUrl?: string; // 💡 تمت إضافة هذا الحقل لرابط الفيديو
  woodType?: string;
  isOffer?: boolean;
  categoryLabel?: string;
  dimensions?: string;
}

// 5. السلة (Cart)
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
  selectedAttributes?: Record<string, string>; 
}

// 6. الطلبات (Order)
export interface Order {
  id: string;
  createdAt: string;
  status: 'جديد' | 'جاري التجهيز' | 'جاري التوصيل' | 'تم التسليم' | 'ملغي';
  name: string;
  phone: string;
  phone2?: string; 
  governorate: string;
  address: string;
  region?: string; 
  street?: string; 
  building?: string; 
  notes?: string;
  paymentMethod: 'cod' | 'cliq'; 
  cliqRef?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
