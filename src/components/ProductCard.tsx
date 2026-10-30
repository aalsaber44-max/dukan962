import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { Product } from '../types/furniture';
import { spotlightMove } from '../utils/useSpotlight';

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

  const woodTypeText = product.woodType ? product.woodType.split(' - ')[0] : '';
  const hasDiscount = Number(product.originalPrice) > Number(product.basePrice);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.basePrice) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <article
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={spotlightMove}
      className="spotlight group flex flex-col bg-[#141210] rounded-[26px] ring-1 ring-white/10 shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-lift cursor-pointer"
    >
      {/* مسند العرض: خلفية عاجية دافئة تُظهر المنتج بوضوح داخل البطاقة الداكنة */}
      <div className="relative m-2 aspect-4/3 overflow-hidden rounded-[20px] bg-gradient-to-b from-[#EFE9DE] to-[#DCD4C5] shadow-[inset_0_0_40px_rgba(90,70,30,0.12)]">
        <img
          src={currentDisplayImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-center p-3 group-hover:scale-[1.07] transition-transform duration-700 ease-out"
        />

        {product.isOffer && (
          <div className="absolute top-3 right-3 bg-[#0B0A09] text-[#E8CC8A] text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ring-[#D4B06A]/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>عرض خاص</span>
          </div>
        )}

        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className={`absolute top-3 left-3 grid place-items-center w-9 h-9 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 ${
            isWishlisted
              ? 'bg-[#0B0A09] text-rose-400 ring-1 ring-rose-400/40'
              : 'bg-[#0B0A09]/60 text-[#F3EEE4] ring-1 ring-white/20 hover:bg-[#0B0A09] hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
        </button>

        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#0B0A09]/85 backdrop-blur-md rounded-full text-xs font-semibold text-[#F3EEE4] ring-1 ring-white/15">
            <Eye className="w-3.5 h-3.5 text-[#E8CC8A]" />
            <span>عرض التفاصيل</span>
          </span>
        </div>

        {hasDiscount && discountPct > 0 && (
          <span className="absolute bottom-3 right-3 h-7 px-2.5 grid place-items-center rounded-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] text-[11px] font-extrabold font-mono shadow-gold">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="px-5 pt-3 pb-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#A39A8B] mb-1.5 font-medium">
            <span>{product.categoryLabel || 'منتج'}</span>
            <span className="text-[#D4B06A]">{woodTypeText}</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#F3EEE4] group-hover:text-[#E8CC8A] transition-colors duration-300 leading-snug mb-2 line-clamp-1 font-serif">
            {product.name}
          </h3>

          <p className="text-xs text-[#A39A8B] leading-relaxed line-clamp-2 mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-2 mb-4">
            {product.colors && product.colors.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {product.colors.slice(0, 5).map((c, idx) => (
                  <span
                    key={idx}
                    title={`${c.name} - ${Number(c.price)} د.أ`}
                    className="w-4 h-4 rounded-full ring-1 ring-white/25 ring-offset-2 ring-offset-[#141210] hover:scale-125 transition-transform"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[11px] text-[#8A8173] font-mono">+{product.colors.length - 5}</span>
                )}
              </div>
            ) : (
              <span />
            )}

            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7FD1A0]">
              <ShieldCheck className="w-3 h-3" />
              معاينة عند الوصول
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#E8CC8A] tabular-nums font-mono">
                {Number(product.basePrice || 0).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-[#A39A8B]">د.أ</span>
            </div>
            {Number(product.originalPrice) > 0 && (
              <span className="text-[11px] text-[#8A8173] line-through tabular-nums font-mono">
                {Number(product.originalPrice).toFixed(2)} د.أ
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className={`relative overflow-hidden h-10 px-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              addedAnim
                ? 'bg-[#7FD1A0] text-[#0B0A09] ring-1 ring-[#7FD1A0]'
                : 'bg-white/[0.04] text-[#E8CC8A] ring-1 ring-[#D4B06A]/40 hover:bg-gradient-to-b hover:from-[#E8CC8A] hover:to-[#D4B06A] hover:text-[#0B0A09] hover:ring-[#D4B06A] hover:shadow-gold'
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
