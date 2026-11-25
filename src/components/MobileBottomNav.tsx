import React from 'react';
import { Heart } from 'lucide-react';
import { AtelierHomeIcon, BoutiqueBagIcon, DeliveryIcon } from './LuxuryIcons';

interface MobileBottomNavProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onGoHome: () => void;
  onOpenTracking: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onGoHome,
  onOpenTracking,
}) => {
  const item =
    'relative flex flex-col items-center justify-center w-full h-full gap-1.5 text-[var(--sf-muted)] hover:text-[var(--sf-text)] active:opacity-70 transition-colors duration-300';

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden sf-nav-glass border-t border-[var(--sf-border)] pb-safe">
      <div className="flex items-center justify-around h-[62px] px-1">

        <button onClick={onGoHome} className={item} aria-label="الرئيسية">
          <AtelierHomeIcon className="w-[20px] h-[20px]" strokeWidth={1.25} />
          <span className="text-[9.5px] font-medium tracking-wide">الرئيسية</span>
        </button>

        <button onClick={onOpenTracking} className={item} aria-label="تتبع الطلب">
          <DeliveryIcon className="w-[20px] h-[20px]" strokeWidth={1.25} />
          <span className="text-[9.5px] font-medium tracking-wide">تتبع</span>
        </button>

        <button onClick={onOpenWishlist} className={item} aria-label="المفضلة">
          <span className="relative">
            <Heart className="w-[19px] h-[19px]" strokeWidth={1.4} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 grid place-items-center rounded-full bg-rose-500 text-white text-[8.5px] font-bold font-mono">
                {wishlistCount}
              </span>
            )}
          </span>
          <span className="text-[9.5px] font-medium tracking-wide">المفضلة</span>
        </button>

        <button onClick={onOpenCart} className={item} aria-label="السلة">
          <span className="relative text-[var(--sf-accent)]">
            <BoutiqueBagIcon className="w-[20px] h-[20px]" strokeWidth={1.25} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 grid place-items-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-accent-contrast)] text-[8.5px] font-bold font-mono">
                {cartCount}
              </span>
            )}
          </span>
          <span className="text-[9.5px] font-medium tracking-wide text-[var(--sf-accent)]">السلة</span>
        </button>
      </div>
    </div>
  );
};
