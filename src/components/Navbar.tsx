import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, Heart, X, Sun, Moon } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { Category, Product } from '../types/furniture';

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
  isLightTheme: boolean;
  onToggleTheme: () => void;
  products?: Product[]; // 💡 تمرير المنتجات للبحث الذكي
  onSelectProduct?: (product: Product) => void; // 💡 دالة فتح المنتج
}

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
  isLightTheme,
  onToggleTheme,
  products = [],
  onSelectProduct,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  
  // 💡 حالة القائمة المنسدلة للبحث الذكي
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  // 💡 إغلاق البحث عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 💡 فلترة المنتجات للاقتراحات
  const suggestedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p => p.isActive !== false && (p.name.toLowerCase().includes(q) || String(p.itemNumber).includes(q)))
      .slice(0, 5);
  }, [searchQuery, products]);

  const logoSubtitle = currentCategoryData && currentCategoryData.id !== 'all'
    ? `${currentCategoryData.name} · الأردن`
    : 'متجرك الشامل · الأردن';

  const navItems = [{ id: 'all', name: 'جميع الأقسام' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  const activeId = currentCategoryData?.id ?? 'all';

  const iconBtn =
    'relative grid place-items-center w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md ring-1 ring-white/10 text-[#CFC7B8] transition-all duration-300 hover:bg-white/10 hover:text-[#F3EEE4] hover:ring-[#D4B06A]/40 active:scale-90 cursor-pointer';

  const handleSuggestionClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
      setShowSuggestions(false);
      onSearchChange(''); // اختياري: مسح البحث بعد اختيار المنتج
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0B0A09]/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.06),0_20px_40px_-24px_rgba(0,0,0,0.9)]'
          : 'bg-[#0B0A09]/0'
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute bottom-0 inset-x-0 gold-rule transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-[height] duration-500 ${
          scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}
      >
        <button
          type="button"
          onClick={onOpenAdmin}
          className="shrink-0 flex items-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95 text-right"
          title="شعار دكان 962"
        >
          <DukanLogo variant={isLightTheme ? "dark" : "light"} className="h-8 sm:h-12" subtitle={logoSubtitle} />
        </button>

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

        <div className="flex items-center gap-0.5 sm:gap-2.5 shrink-0">
          
          {/* 💡 حقل البحث الذكي للكمبيوتر */}
          <div className="relative hidden md:block group/search" ref={searchContainerRef}>
            <Search className="w-4 h-4 text-[#8A8173] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/search:text-[#D4B06A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="ابحث عن منتج أو رقمه"
              aria-label="بحث"
              className="text-[13px] w-40 focus:w-64 lg:w-48 lg:focus:w-72 h-10 pr-10 pl-9 bg-white/[0.04] backdrop-blur-md ring-1 ring-white/10 rounded-full text-[#F3EEE4] placeholder-[#8A8173] focus:outline-hidden focus:bg-white/[0.07] focus:ring-2 focus:ring-[#D4B06A]/60 transition-all duration-500"
            />
            {searchQuery && (
              <button
                onClick={() => { onSearchChange(''); setShowSuggestions(false); }}
                aria-label="مسح البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-[#F3EEE4] cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* 💡 القائمة المنسدلة للبحث الذكي */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 w-72 left-0 bg-[#141210] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade">
                {suggestedProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#A39A8B]">
                    لا توجد نتائج مطابقة لبحثك.
                  </div>
                ) : (
                  <>
                    <div className="p-2 space-y-1">
                      {suggestedProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSuggestionClick(p)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#1C1815] transition-colors text-right cursor-pointer group"
                        >
                          <img
                            src={p.colors?.[0]?.image || p.images?.[0] || ''}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-contain bg-gradient-to-b from-[#EFE9DE] to-[#DCD4C5] p-1 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#F3EEE4] truncate group-hover:text-[#E8CC8A] transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-[#D4B06A] font-mono mt-0.5">
                              {Number(p.basePrice).toFixed(2)} د.أ
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setShowSuggestions(false);
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 text-center text-[11px] font-bold text-[#E8CC8A] bg-[#1C1815] hover:bg-[#26211D] border-t border-white/5 transition-colors cursor-pointer"
                    >
                      عرض جميع النتائج
                    </button>
                  </>
                )}
              </div>
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

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isLightTheme ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع الصباحي'}
            aria-pressed={isLightTheme}
            title={isLightTheme ? 'الوضع الليلي' : 'الوضع الصباحي'}
            className={iconBtn}
          >
            {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
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
          <div className="px-4 pb-3 relative" ref={mobileSearchOpen ? searchContainerRef : null}>
            <Search className="w-4 h-4 text-[#8A8173] absolute right-7 top-[calc(50%-6px)] -translate-y-1/2 pointer-events-none" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="ابحث عن منتج أو رقمه"
              aria-label="بحث"
              tabIndex={mobileSearchOpen ? 0 : -1}
              className="w-full h-11 pr-11 pl-4 text-sm bg-white/[0.06] ring-1 ring-white/10 rounded-2xl text-[#F3EEE4] placeholder-[#8A8173] focus:outline-hidden focus:ring-2 focus:ring-[#D4B06A]/60"
            />
            {/* 💡 القائمة المنسدلة للموبايل */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-1 left-4 right-4 bg-[#141210] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {suggestedProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#A39A8B]">لا توجد نتائج مطابقة.</div>
                ) : (
                  <>
                    {suggestedProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { handleSuggestionClick(p); setMobileSearchOpen(false); }}
                        className="w-full flex items-center gap-3 p-3 border-b border-white/5 last:border-0 hover:bg-[#1C1815] transition-colors text-right"
                      >
                        <img src={p.colors?.[0]?.image || p.images?.[0] || ''} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-[#EFE9DE] p-1" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#F3EEE4] truncate">{p.name}</p>
                          <p className="text-[10px] text-[#D4B06A] font-mono">{Number(p.basePrice).toFixed(2)} د.أ</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
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
