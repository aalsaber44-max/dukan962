import React from 'react';
import { ShoppingBag, Search, Heart } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { Category } from '../types/furniture';

interface NavbarProps {
  categories: Category[]; // 💡 استقبال الأقسام
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  searchQuery,
  onSearchChange,
  onSelectCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Zone 1: Brand Logo */}
        <button
          type="button"
          onClick={onOpenAdmin}
          className="shrink-0 flex items-center cursor-pointer hover:opacity-90 transition-opacity text-right"
          title="شعار دكان 962 (اضغط للدخول للوحة الإدارة)"
        >
          <DukanLogo variant="dark" className="h-10 sm:h-12" />
        </button>

        {/* Zone 2: Navigation Links (Dynamic Categories) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#57534E]">
          <button
            onClick={() => onSelectCategory('all')}
            className="hover:text-[#1C1917] transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-8"
          >
            جميع الأقسام
          </button>
          {/* 💡 عرض الأقسام الديناميكية */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-8"
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Zone 3: Search, Wishlist & Cart */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Real-time Search Input */}
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="text-xs w-44 lg:w-56 py-2 pr-8 pl-3 bg-[#F2EDE4] border border-[#DDD5C7] rounded-xl text-[#1C1917] placeholder-[#8C827A] focus:outline-hidden focus:border-[#8C6D46] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#8C827A] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Wishlist Button with Counter */}
          <button
            onClick={onOpenWishlist}
            aria-label="المفضلة"
            className="relative p-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#EAE2D5] text-[#1C1917] border border-[#DDD5C7] transition-all cursor-pointer shadow-2xs"
          >
            <Heart className="w-4 h-4 text-[#57534E]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Button with Counter */}
          <button
            onClick={onOpenCart}
            aria-label="سلة الشراء"
            className="flex items-center gap-2 py-2 px-3.5 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <span className="bg-[#2E5339] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
