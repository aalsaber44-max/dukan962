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
    'relative grid place-items-center w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md ring-1 ring-white/10 text-[#CFC7B8] transition-all duration-300 hover:bg-white/10 hover:text-[#F3EEE4] hover:ring-[#D4B06A]/40 active:scale-90 cursor-pointer';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0B0A09]/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.06),0_20px_40px_-24px_rgba(0,0,0,0.9)]'
          : 'bg-[#0B0A09]/0'
      }`}
    >
      {/* خط ذهبي رفيع أسفل الهيدر يظهر عند التمرير */}
      <div
        aria-hidden="true"
        className={`absolute bottom-0 inset-x-0 gold-rule transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />

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
          <DukanLogo variant="light" className="h-9 sm:h-12" subtitle={logoSubtitle} />
        </button>

        {/* روابط الكمبيوتر مع مؤشر منزلق للقسم النشط */}
        <nav
          aria-label="الأقسام"
          className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] ring-1 ring-white/10 max-w-[46%] overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-300 ${
                  isActive ? 'text-[#0B0A09]' : 'text-[#A39A8B] hover:text-[#F3EEE4]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] shadow-[0_6px_18px_-6px_rgba(212,176,106,0.6)]"
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
            <Search className="w-4 h-4 text-[#8A8173] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/search:text-[#D4B06A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج أو رقمه"
              aria-label="بحث"
              className="text-[13px] w-40 focus:w-64 lg:w-48 lg:focus:w-72 h-10 pr-10 pl-9 bg-white/[0.04] backdrop-blur-md ring-1 ring-white/10 rounded-full text-[#F3EEE4] placeholder-[#8A8173] focus:outline-hidden focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4B06A]/60 transition-all duration-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="مسح البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-[#F3EEE4] cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* بحث الموبايل */}
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="بحث"
            aria-expanded={mobileSearchOpen}
            className={`${iconBtn} md:hidden`}
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          <button onClick={onOpenWishlist} aria-label="المفضلة" className={iconBtn}>
            <Heart className={`w-4 h-4 transition-colors ${wishlistCount > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
            {wishlistCount > 0 && (
              <CountBadge
                count={wishlistCount}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full grid place-items-center font-mono ring-2 ring-[#0B0A09]"
              />
            )}
          </button>

          <button
            onClick={onOpenCart}
            aria-label="السلة"
            className="group/cart relative flex items-center gap-2 h-10 pl-3.5 pr-3 sm:pl-4 text-[13px] font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] rounded-full shadow-gold transition-all duration-300 hover:shadow-[0_14px_34px_-10px_rgba(232,204,138,0.75)] hover:-translate-y-px active:translate-y-0 active:scale-95 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 transition-transform duration-300 group-hover/cart:-rotate-12" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <CountBadge
                count={cartCount}
                className="min-w-[20px] h-5 px-1.5 bg-[#0B0A09] text-[#E8CC8A] text-[11px] font-extrabold rounded-full grid place-items-center font-mono"
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
            <Search className="w-4 h-4 text-[#8A8173] absolute right-7 top-[calc(50%-6px)] -translate-y-1/2 pointer-events-none" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج أو رقمه"
              aria-label="بحث"
              tabIndex={mobileSearchOpen ? 0 : -1}
              className="w-full h-11 pr-11 pl-4 text-sm bg-white/[0.06] ring-1 ring-white/10 rounded-2xl text-[#F3EEE4] placeholder-[#8A8173] focus:outline-hidden focus:ring-2 focus:ring-[#D4B06A]/60"
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
                    ? 'bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] shadow-gold'
                    : 'bg-white/[0.05] text-[#A39A8B] ring-1 ring-white/10'
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
