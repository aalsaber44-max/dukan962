import React from 'react';
import { Home, Truck, Heart, ShoppingBag } from 'lucide-react';

interface MobileBottomNavProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onGoHome: () => void;
  onOpenTracking: () => void; // 💡 تم التعديل
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onGoHome,
  onOpenTracking,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#141210]/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around h-16 px-2">
        
        {/* الرئيسية */}
        <button
          onClick={onGoHome}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-[#A39A8B] hover:text-[#E8CC8A] active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        {/* تتبع الطلب بدلاً من الأقسام */}
        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-[#A39A8B] hover:text-[#E8CC8A] active:scale-95 transition-all"
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-bold">تتبع طلبي</span>
        </button>

        {/* المفضلة */}
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1 text-[#A39A8B] hover:text-rose-400 active:scale-95 transition-all"
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-1.5 right-1/4 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full grid place-items-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-bold">المفضلة</span>
        </button>

        {/* السلة */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1 text-[#0B0A09] bg-[#D4B06A] rounded-xl mx-1 my-2 active:scale-95 transition-all shadow-gold"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#0B0A09] text-[#E8CC8A] text-[10px] font-extrabold rounded-full grid place-items-center font-mono">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-bold">السلة</span>
        </button>
      </div>
    </div>
  );
};
