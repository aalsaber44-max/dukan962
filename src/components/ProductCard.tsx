import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Check, Sparkles, ShieldCheck, Star } from 'lucide-react';
import { Product } from '../types/furniture';
import { spotlightMove } from '../utils/useSpotlight';
import { getStockState } from '../utils/inventory';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
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
    if (isOut) return;
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const stockState = getStockState(product);
  const isOut = stockState === 'out';

  const woodTypeText = product.woodType ? product.woodType.split(' - ')[0] : '';
  const hasDiscount = Number(product.originalPrice) > Number(product.basePrice);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.basePrice) / Number(product.originalPrice)) * 100)
    : 0;

  // 💡 حساب ما إذا كان المنتج "جديداً" (تم إضافته خلال آخر 14 يوماً)
  const isNew = product.createdAt 
    ? (new Date().getTime() - new Date(product.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 
    : false;

  return (
    <article
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={spotlightMove}
      className="spotlight group flex flex-col bg-[#141210] rounded-[24px] ring-1 ring-white/10 shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-lift hover:ring-[#D4B06A]/30 cursor-pointer overflow-hidden"
    >
      {/* مسند العرض: خلفية عاجية دافئة تُظهر المنتج بوضوح */}
      <div className="relative m-2 aspect-[4/3] overflow-hidden rounded-[18px] bg-gradient-to-b from-[#EFE9DE] to-[#DCD4C5] shadow-[inset_0_0_40px_rgba(90,70,30,0.12)]">
        <img
          src={currentDisplayImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-center p-3 group-hover:scale-[1.08] transition-transform duration-700 ease-out"
        />

        {isOut && (
          <div className="absolute inset-0 z-[5] grid place-items-center bg-[#0B0A09]/60 backdrop-blur-[2px]">
            <span className="px-4 py-1.5 rounded-full bg-[#0B0A09] text-rose-300 text-xs font-bold ring-1 ring-rose-400/40">
              نفدت الكمية
            </span>
          </div>
        )}

        {/* 💡 شارات أعلى اليمين (الأكثر مبيعاً / جديد / خصم) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
          {product.isBestSeller && (
            <span className="flex items-center gap-1 bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-gold">
              <Star className="w-3 h-3 fill-[#0B0A09]" />
              الأكثر مبيعاً
            </span>
          )}
          
          {hasDiscount && discountPct > 0 && (
            <span className="h-6 px-2.5 grid place-items-center rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-lg font-mono">
              خصم {discountPct}%
            </span>
          )}

          {isNew && !hasDiscount && !product.isBestSeller && (
            <span className="flex items-center gap-1 bg-[#7FD1A0] text-[#0B0A09] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg">
              <Sparkles className="w-3 h-3" />
              جديد
            </span>
          )}
        </div>

        {/* زر المفضلة */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className={`absolute top-3 left-3 grid place-items-center w-9 h-9 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 z-10 ${
            isWishlisted
              ? 'bg-[#0B0A09] text-rose-400 ring-1 ring-rose-400/40'
              : 'bg-[#0B0A09]/50 text-[#F3EEE4] ring-1 ring-white/20 hover:bg-[#0B0A09] hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
        </button>

        {/* زر عرض التفاصيل السريع */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-10">
          <span className="inline-flex items-center gap-1.5 h-8 px-4 bg-[#0B0A09]/85 backdrop-blur-md rounded-full text-xs font-semibold text-[#F3EEE4] ring-1 ring-white/15 shadow-xl">
            <Eye className="w-3.5 h-3.5 text-[#E8CC8A]" />
            <span>عرض سريع</span>
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#A39A8B] mb-1.5 font-medium">
            <span>{product.categoryLabel || 'منتج'}</span>
            {woodTypeText && <span className="text-[#D4B06A]/80">{woodTypeText}</span>}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#F3EEE4] group-hover:text-[#E8CC8A] transition-colors duration-300 leading-snug mb-1.5 line-clamp-1 font-serif">
            {product.name}
          </h3>

          <p className="text-xs text-[#A39A8B] leading-relaxed line-clamp-2 mb-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-2 mb-3">
            {/* دوائر الألوان */}
            {product.colors && product.colors.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {product.colors.slice(0, 5).map((c, idx) => (
                  <span
                    key={idx}
                    title={`${c.name} - ${Number(c.price)} د.أ`}
                    className="w-4.5 h-4.5 rounded-full ring-1 ring-white/30 ring-offset-2 ring-offset-[#141210] hover:scale-125 transition-transform shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[10px] text-[#8A8173] font-mono bg-white/5 px-1.5 rounded-full">+{product.colors.length - 5}</span>
                )}
              </div>
            ) : (
              <span />
            )}

            {/* حالة المخزون */}
            {stockState === 'low' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                آخر {product.stock} قطع
              </span>
            ) : isOut ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md">غير متوفر</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7FD1A0] bg-[#7FD1A0]/10 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                معاينة
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-auto">
          {/* 💡 تحسين شكل السعر */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#E8CC8A] tabular-nums font-mono leading-none">
                {Number(product.basePrice || 0).toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-[#A39A8B]">د.أ</span>
            </div>
            {hasDiscount && (
              <span className="text-[11px] text-[#8A8173] line-through tabular-nums font-mono mt-1">
                {Number(product.originalPrice).toFixed(2)} د.أ
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOut}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className={`relative overflow-hidden h-10 px-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 ${
              isOut
                ? 'bg-white/[0.04] text-[#8A8173] ring-1 ring-white/10 cursor-not-allowed'
                : addedAnim
                ? 'bg-[#7FD1A0] text-[#0B0A09] ring-1 ring-[#7FD1A0] shadow-[0_0_15px_rgba(127,209,160,0.4)]'
                : 'bg-white/[0.04] text-[#E8CC8A] ring-1 ring-[#D4B06A]/40 hover:bg-gradient-to-b hover:from-[#E8CC8A] hover:to-[#D4B06A] hover:text-[#0B0A09] hover:ring-[#D4B06A] hover:shadow-gold'
            }`}
          >
            {isOut ? (
              <span>محذوف</span>
            ) : addedAnim ? (
              <>
                <Check className="w-4 h-4" strokeWidth={3} />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
