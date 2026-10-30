import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, Heart, X } from 'lucide-react';
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

/** شارة العدّاد: تقفز قفزة صغيرة كل ما تغيّر الرقم */
const CountBadge: React.FC<{ count: number; className: string }> = ({ count, className }) => (
  <motion.span
    key={count}
    initial={{ scale: 1.7 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    className={className}
  >
    {count}
  </motion.span>
);

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  const logoSubtitle = currentCategoryData && currentCategoryData.id !== 'all'
    ? `${currentCategoryData.name} · الأردن`
    : 'متجرك الشامل · الأردن';

  const navItems = [{ id: 'all', name: 'جميع الأقسام' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  const activeId = currentCategoryData?.id ?? 'all';

  const iconBtn =
    'relative grid place-items-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-black/[0.07] text-[#44403C] shadow-[0_1px_2px_rgba(20,17,15,0.05)] transition-all duration-300 hover:bg-white hover:text-[#14110F] hover:shadow-soft active:scale-90 cursor-pointer';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#FBFAF7]/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-black/[0.06] shadow-[0_10px_30px_-18px_rgba(20,17,15,0.25)]'
          : 'bg-[#FBFAF7]/0 border-b border-transparent'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-[height] duration-500 ${
          scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}
      >
        <button
          type="button"
          onClick={onOpenAdmin}
          className="shrink-0 flex items-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95 text-right"
          title="شعار دكان 962"
        >
          <DukanLogo variant="dark" className="h-9 sm:h-12" subtitle={logoSubtitle} />
        </button>

        {/* روابط الكمبيوتر مع مؤشر منزلق للقسم النشط */}
        <nav
          aria-label="الأقسام"
          className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-black/[0.035] ring-1 ring-black/[0.04] max-w-[46%] overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-300 ${
                  isActive ? 'text-[#14110F]' : 'text-[#78716C] hover:text-[#14110F]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(20,17,15,0.12),0_6px_14px_-6px_rgba(20,17,15,0.18)]"
                  />
                )}
                <span className="relative">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* بحث الكمبيوتر: يتمدد عند التركيز */}
          <div className="relative hidden md:block group/search">
            <Search className="w-4 h-4 text-[#A8A29E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/search:text-[#B8923A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج أو رقمه"
              aria-label="بحث"
              className="text-[13px] w-40 focus:w-64 lg:w-48 lg:focus:w-72 h-10 pr-10 pl-9 bg-white/70 backdrop-blur-md ring-1 ring-black/[0.07] rounded-full text-[#14110F] placeholder-[#A8A29E] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#B8923A]/60 transition-all duration-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="مسح البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded-full bg-black/10 hover:bg-black/20 text-[#44403C] cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* بحث الموبايل (لم يكن متاحاً سابقاً) */}
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="بحث"
            aria-expanded={mobileSearchOpen}
            className={`${iconBtn} md:hidden`}
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          <button onClick={onOpenWishlist} aria-label="المفضلة" className={iconBtn}>
            <Heart className={`w-4 h-4 transition-colors ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <CountBadge
                count={wishlistCount}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full grid place-items-center font-mono ring-2 ring-[#FBFAF7]"
              />
            )}
          </button>

          <button
            onClick={onOpenCart}
            aria-label="السلة"
            className="group/cart relative flex items-center gap-2 h-10 pl-3.5 pr-3 sm:pl-4 text-[13px] font-bold text-white bg-[#14110F] rounded-full shadow-[0_6px_18px_-6px_rgba(20,17,15,0.55)] transition-all duration-300 hover:bg-[#2A2522] hover:shadow-[0_10px_24px_-8px_rgba(20,17,15,0.65)] hover:-translate-y-px active:translate-y-0 active:scale-95 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#E3C16F] transition-transform duration-300 group-hover/cart:-rotate-12" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <CountBadge
                count={cartCount}
                className="min-w-[20px] h-5 px-1.5 bg-[#E3C16F] text-[#14110F] text-[11px] font-extrabold rounded-full grid place-items-center font-mono"
              />
            )}
          </button>
        </div>
      </div>

      {/* شريط البحث المنسدل للموبايل */}
      <div
        className={`md:hidden grid transition-all duration-300 ${
          mobileSearchOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 relative">
            <Search className="w-4 h-4 text-[#A8A29E] absolute right-7 top-[calc(50%-6px)] -translate-y-1/2 pointer-events-none" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج أو رقمه"
              aria-label="بحث"
              tabIndex={mobileSearchOpen ? 0 : -1}
              className="w-full h-11 pr-11 pl-4 text-sm bg-white ring-1 ring-black/[0.08] rounded-2xl placeholder-[#A8A29E] focus:outline-hidden focus:ring-2 focus:ring-[#B8923A]/60"
            />
          </div>
        </div>
      </div>

      {/* شريط الأقسام للموبايل */}
      <div className="lg:hidden overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-4 pb-2.5 pt-0.5 whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 active:scale-95 ${
                  isActive
                    ? 'bg-[#14110F] text-white shadow-[0_6px_14px_-6px_rgba(20,17,15,0.5)]'
                    : 'bg-white/80 text-[#57534E] ring-1 ring-black/[0.07]'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
