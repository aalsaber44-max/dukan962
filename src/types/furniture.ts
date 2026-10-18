export interface ProductColor {
  name: string;
  hex: string;
  price: number; // Specific price for this color variant in JOD
  originalPrice?: number;
  image: string; // Image for this specific color
  additionalImages?: string[]; // Extra angles for this color
}

export interface Product {
  id: string;
  itemNumber: number; // The product number from the photos (e.g. 1, 2, 3...)
  name: string;
  nameEn?: string;
  category: 'center-tables' | 'tv-tables' | 'fireplace-tables' | 'side-tables';
  categoryLabel: string;
  basePrice: number; // in JOD
  originalPrice?: number;
  woodType: string; // e.g. "خشب تايلندي ثقيل"
  description: string;
  dimensions: string;
  warranty: string;
  images: string[]; // Primary and alternative angle images
  colors: ProductColor[];
  inStock: boolean;
  featured?: boolean;
  isOffer?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'جديد' | 'جاري التجهيز' | 'جاري التوصيل' | 'تم التسليم' | 'ملغي';
  name: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
  paymentMethod: 'cod' | 'cliq' | 'card';
  cliqRef?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}
