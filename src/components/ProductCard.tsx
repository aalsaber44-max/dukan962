import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Check, Sparkles } from 'lucide-react';
import { Product } from '../types/furniture';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  // Hover image switch
  const defaultImage = product.colors?.[0]?.image || product.images?.[0] || 'https://via.placeholder.com/400';
  const secondaryImage =
    product.colors?.[0]?.additionalImages?.[0] ||
    product.images?.[1] ||
    product.colors?.[1]?.image ||
    defaultImage;

  const currentDisplayImage = isHovered && secondaryImage ? secondaryImage : defaultImage;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  // 💡 حماية: قراءة نوع الخشب بأمان حتى لا ينهار الموقع للمنتجات الجديدة
  const woodTypeText = product.woodType ? product.woodType.split(' - ')[0] : '';

  return (
    <article
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-white rounded-2xl border border-[#ECE5D9] overflow-hidden hover:border-[#8C6D46] hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* 65%-75% Visual Height Container */}
      <div className="relative aspect-4/3 w-full bg-[#F5EFE6] overflow-hidden">
        <img
          src={currentDisplayImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-center p-2 group-hover:scale-105 transition-all duration-700 ease-out"
        />

        {/* Quiet Olive Green Offer Badge */}
        {product.isOffer && (
          <div className="absolute top-3 right-3 bg-[#2E5339] text-[#F0FDF4] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#A7F3D0]" />
            <span>عرض خاص</span>
          </div>
        )}

        {/* Floating Heart Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/80 hover:bg-white text-[#78716C] hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Hover quick angle notification */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
            زاوية أخرى
          </span>
        </div>

        {/* Quick View Floating Action */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white/95 backdrop-blur-md rounded-lg text-xs font-semibold text-[#1C1917] shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            <span>عرض التفاصيل</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-[#8C827A] mb-1.5 font-medium">
            <span>{product.categoryLabel || 'منتج'}</span>
            {/* 💡 هنا تم وضع النص الآمن بدلاً من الكود الذي كان يسبب الانهيار */}
            <span className="text-[#8C6D46]">{woodTypeText}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#8C6D46] transition-colors leading-snug mb-2 line-clamp-1 font-serif">
            {product.name}
          </h3>

          <p className="text-xs text-[#66605B] leading-relaxed line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Color preview dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[11px] text-[#A8A29E]">الألوان:</span>
              <div className="flex items-center gap-1">
                {product.colors.map((c, idx) => (
                  <span
                    key={idx}
                    title={`${c.name} - ${c.price} د.أ`}
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trust inspection badge */}
          <div className="mb-3 flex items-center gap-1.5 text-[10px] text-[#2E5339] font-medium bg-[#EDF4EE] px-2 py-1 rounded-md w-fit">
            <span>✨ يوجد معاينة عند وصول الطلب</span>
          </div>
        </div>

        {/* Price & Primary CTA */}
        <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-[#1C1917] tabular-nums font-mono">
                {product.basePrice?.toFixed(2) || '0.00'}
              </span>
              <span className="text-xs font-bold text-[#78716C]">
                د.أ
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-[11px] text-[#A8A29E] line-through tabular-nums font-mono">
                {product.originalPrice.toFixed(2)} د.أ
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              addedAnim
                ? 'bg-[#2E5339] text-white'
                : 'bg-[#1C1917] text-white hover:bg-[#38332E]'
            }`}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>أُضيفت</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
