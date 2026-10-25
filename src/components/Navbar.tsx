import React from 'react';
import { ShoppingBag, Search, Heart } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { Category } from '../types/furniture';

interface NavbarProps {
  categories: Category[]; 
  currentCategoryData?: Category | null;
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
  currentCategoryData,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  searchQuery,
  onSearchChange,
  onSelectCategory,
}) => {
  
  const logoSubtitle = currentCategoryData && currentCategoryData.id !== 'all'
    ? `${currentCategoryData.name} · الأردن`
    : 'متجرك الشامل · الأردن';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8]">
      {/* الصف العلوي: الشعار والأدوات */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        <button
          type="button"
          onClick={onOpenAdmin}
          className="shrink-0 flex items-center cursor-pointer hover:opacity-90 transition-opacity text-right"
          title="شعار دكان 962"
        >
          <DukanLogo variant="dark" className="h-9 sm:h-12" subtitle={logoSubtitle} />
        </button>

        {/* روابط الكمبيوتر (تختفي في الموبايل) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#57534E]">
          <button
            onClick={() => onSelectCategory('all')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-8 ${
              currentCategoryData?.id === 'all' ? 'text-[#1C1917] font-bold' : 'hover:text-[#1C1917]'
            }`}
          >
            جميع الأقسام
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`transition-colors whitespace-nowrap cursor-pointer hover:underline underline-offset-8 ${
                currentCategoryData?.id === cat.id ? 'text-[#1C1917] font-bold' : 'hover:text-[#1C1917]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* أدوات البحث والسلة */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث..."
              className="text-xs w-36 lg:w-56 py-2 pr-8 pl-3 bg-[#F2EDE4] border border-[#DDD5C7] rounded-xl text-[#1C1917] placeholder-[#8C827A] focus:outline-hidden focus:border-[#8C6D46] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#8C827A] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={onOpenWishlist}
            className="relative p-2 sm:p-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#EAE2D5] text-[#1C1917] border border-[#DDD5C7] transition-all cursor-pointer shadow-2xs"
          >
            <Heart className="w-4 h-4 text-[#57534E]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <span className="bg-[#2E5339] text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 💡 شريط الأقسام الأفقي للموبايل فقط */}
      <div className="lg:hidden overflow-x-auto border-t border-[#E8E2D8] bg-[#FAF8F5]">
        <div className="flex items-center gap-2 px-4 py-2.5 whitespace-nowrap">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              currentCategoryData?.id === 'all' 
                ? 'bg-[#1C1917] text-white border-[#1C1917]' 
                : 'bg-white text-[#57534E] border-[#DDD5C7]'
            }`}
          >
            جميع الأقسام
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                currentCategoryData?.id === cat.id 
                  ? 'bg-[#1C1917] text-white border-[#1C1917]' 
                  : 'bg-white text-[#57534E] border-[#DDD5C7]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
