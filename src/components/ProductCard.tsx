import React, { useState } from 'react';
import { stripEmoji } from '../utils/emoji';
import { CategoryIcon } from './CategoryIcon';
import { Plus, Check, Heart, ShieldCheck } from 'lucide-react';
import { Product } from '../types/furniture';
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
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);

  const primary = product.colors?.[0]?.image || product.images?.[0] || 'https://via.placeholder.com/600';
  const secondary =
    product.colors?.[0]?.additionalImages?.[0] ||
    product.images?.[1] ||
    product.colors?.[1]?.image ||
    primary;

  const stockState = getStockState(product);
  const isOut = stockState === 'out';

  const hasDiscount = Number(product.originalPrice) > Number(product.basePrice);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.basePrice) / Number(product.originalPrice)) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOut) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  return (
    <article
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-reveal
      className="group relative flex flex-col cursor-pointer"
    >
      {/* المعرض */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[var(--sf-panel)]">
        <div className="absolute inset-0 sf-plate" />

        <img
          src={primary}
          alt={stripEmoji(product.name)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full object-contain p-4 sm:p-6 transition-all duration-[900ms] ease-out ${
            hover ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
          }`}
        />
        <img
          src={secondary}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full object-contain p-4 sm:p-6 transition-all duration-[900ms] ease-out ${
            hover ? 'opacity-100 scale-[1.03]' : 'opacity-0 scale-100'
          }`}
        />

        {isOut && (
          <div className="absolute inset-0 grid place-items-center bg-[var(--sf-bg)]/55 backdrop-blur-[1px]">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--sf-text)] border-b border-[var(--sf-accent)] pb-1">
              Sold out
            </span>
          </div>
        )}

        {/* علامات علوية */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {product.isBestSeller && (
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-[var(--sf-accent)]">
              Bestseller
            </span>
          )}
          {hasDiscount && discountPct > 0 && (
            <span className="text-[9px] font-semibold font-mono text-[var(--sf-muted)]">
              −{discountPct}%
            </span>
          )}
        </div>

        {/* مفضلة — تظهر عند التمرير */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className={`absolute top-2.5 left-2.5 grid place-items-center w-8 h-8 rounded-full sf-quick border transition-all duration-500 cursor-pointer ${
            isWishlisted
              ? 'opacity-100 bg-[var(--sf-surface)] border-[var(--sf-border)] text-rose-500'
              : 'opacity-0 group-hover:opacity-100 bg-[var(--sf-surface)]/80 border-[var(--sf-border)] text-[var(--sf-muted)] hover:text-rose-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} strokeWidth={1.5} />
        </button>

        {/* إضافة سريعة */}
        <button
          onClick={handleAdd}
          disabled={isOut}
          aria-label={`إضافة ${stripEmoji(product.name)} إلى السلة`}
          title="إضافة سريعة"
          className={`absolute bottom-3 left-3 grid place-items-center w-10 h-10 rounded-full border transition-all duration-500 cursor-pointer ${
            isOut
              ? 'opacity-0 pointer-events-none'
              : 'bg-[var(--sf-surface)]/92 sf-quick border-[var(--sf-border)] text-[var(--sf-text)] hover:bg-[var(--sf-accent)] hover:text-[var(--sf-accent-contrast)] hover:border-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
          }`}
        >
          {added ? <Check className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>

      {/* البيانات */}
      <div className="pt-3.5 pb-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 min-w-0 text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[var(--sf-subtle)]">
            <CategoryIcon name={product.categoryLabel} className="w-3 h-3 shrink-0" />
            <span className="truncate">{stripEmoji(product.categoryLabel) || 'Dukan 962'}</span>
          </span>
          {stockState === 'low' && (
            <span className="text-[9.5px] text-[var(--sf-accent)] shrink-0">آخر {product.stock}</span>
          )}
        </div>

        <h3 className="text-[14px] sm:text-[15px] font-semibold text-[var(--sf-text)] leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-[var(--sf-accent)] transition-colors duration-500">
          {stripEmoji(product.name)}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[14px] font-bold text-[var(--sf-text)] font-mono tabular-nums">
            {Number(product.basePrice || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-[var(--sf-muted)]">د.أ</span>
          {hasDiscount && (
            <span className="text-[10.5px] text-[var(--sf-subtle)] line-through font-mono tabular-nums">
              {Number(product.originalPrice).toFixed(2)}
            </span>
          )}
          {!isOut && (
            <ShieldCheck className="w-3 h-3 text-[var(--sf-success)] ms-auto shrink-0" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
