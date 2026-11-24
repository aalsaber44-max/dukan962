import React, { useMemo } from 'react';
import { stripEmoji } from '../utils/emoji';
import { Clock, ArrowLeft } from 'lucide-react';
import { Product, CartItem } from '../types/furniture';

interface RecentlyViewedProps {
  products: Product[]; // نمرر المنتجات الحالية لضمان تحديث الأسعار والصور
  cart: CartItem[];
  onQuickView: (product: Product) => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ products, cart, onQuickView }) => {
  // قراءة المنتجات المحفوظة وتطابقها مع أحدث بيانات من السحابة
  const recentProducts = useMemo(() => {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem('dukan962_recently_viewed') || '[]');
      if (savedIds.length === 0) return [];
      
      // نجلب المنتجات الحية فقط (ونتجاهل المنتجات التي تم حذفها)
      return savedIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined && p.isActive !== false);
    } catch {
      return [];
    }
  }, [products]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--sf-accent)]" />
          <h2 className="text-lg font-bold text-[var(--sf-text)] font-serif">شوهدت مؤخراً</h2>
        </div>
      </div>

      {/* شريط تمرير أفقي للمنتجات */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {recentProducts.map((product) => (
          <div 
            key={product.id}
            onClick={() => onQuickView(product)}
            className="shrink-0 w-32 sm:w-40 group cursor-pointer"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--sf-surface)] border border-[var(--sf-border)] mb-2">
              <img
                src={product.colors?.[0]?.image || product.images?.[0] || ''}
                alt={stripEmoji(product.name)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ArrowLeft className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-[var(--sf-text)] line-clamp-1 group-hover:text-[var(--sf-accent)] transition-colors">
              {stripEmoji(product.name)}
            </h4>
            <p className="text-[11px] font-black text-[var(--sf-muted)] font-mono mt-0.5">
              {product.basePrice.toFixed(2)} د.أ
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
