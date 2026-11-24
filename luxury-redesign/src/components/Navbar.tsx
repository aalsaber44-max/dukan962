import React, { useEffect, useRef, useState, useMemo } from 'react';
import { stripEmoji } from '../utils/emoji';
import { motion } from 'motion/react';
import { Search, Heart, X, Sun, Moon, Menu, ArrowUpLeft } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { BoutiqueBagIcon } from './LuxuryIcons';
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
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
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
  isLightTheme,
  onToggleTheme,
  products = [],
  onSelectProduct,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // قفل تمرير الصفحة عند فتح قائمة الموبايل
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const suggestedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.isActive !== false && (p.name.toLowerCase().includes(q) || String(p.itemNumber).includes(q)))
      .slice(0, 6);
  }, [searchQuery, products]);

  const logoSubtitle = currentCategoryData && currentCategoryData.id !== 'all'
    ? `${stripEmoji(currentCategoryData.name)} · الأردن`
    : 'متجرك الشامل · الأردن';

  const navItems = [{ id: 'all', name: 'جميع الأقسام' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  const activeId = currentCategoryData?.id ?? 'all';

  const pickSuggestion = (product: Product) => {
    if (!onSelectProduct) return;
    onSelectProduct(product);
    setSearchOpen(false);
    onSearchChange('');
  };

  const iconClass =
    'grid place-items-center w-9 h-9 rounded-full text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition-colors duration-300 cursor-pointer';

  return (
    <header className="sticky top-0 z-40">
      <div
        className={`border-b transition-all duration-500 ${
          scrolled
            ? 'sf-nav-glass border-[var(--sf-border)]'
            : 'bg-[var(--sf-bg)] border-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-3 sm:gap-6 h-16 lg:h-[76px]">

          {/* الشعار */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="shrink-0 flex items-center cursor-pointer transition-opacity duration-300 hover:opacity-80"
            title="دكان 962"
          >
            <DukanLogo variant={isLightTheme ? 'dark' : 'light'} className="h-8 sm:h-10" subtitle={logoSubtitle} />
          </button>

          {/* روابط سطح المكتب */}
          <nav aria-label="الأقسام" className="hidden lg:flex items-center gap-7 min-w-0 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  data-active={isActive}
                  className="relative shrink-0 text-[12.5px] font-medium sf-link-quiet cursor-pointer whitespace-nowrap py-1"
                >
                  {stripEmoji(item.name)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute -bottom-1 inset-x-0 h-px bg-[var(--sf-accent)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* الأدوات */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false); }}
              aria-label="بحث"
              aria-expanded={searchOpen}
              className={iconClass}
            >
              {searchOpen ? <X className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />}
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isLightTheme ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع الصباحي'}
              aria-pressed={isLightTheme}
              className={`${iconClass} hidden sm:grid`}
            >
              {isLightTheme ? <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />}
            </button>

            <button onClick={onOpenWishlist} aria-label="المفضلة" className={`${iconClass} relative hidden sm:grid`}>
              <Heart className={`w-[18px] h-[18px] ${wishlistCount > 0 ? 'text-rose-500' : ''}`} strokeWidth={1.5} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 grid place-items-center rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              aria-label="السلة"
              className="relative ms-1 inline-flex items-center gap-2 h-9 ps-3 pe-3 rounded-full border border-[var(--sf-border)] hover:border-[var(--sf-accent)] text-[var(--sf-text)] transition-colors duration-300 cursor-pointer group/cart"
            >
              <BoutiqueBagIcon className="w-[17px] h-[17px] text-[var(--sf-accent)]" strokeWidth={1.3} />
              <span className="text-[11px] font-semibold hidden sm:inline">السلة</span>
              <span className="text-[10px] font-mono font-bold text-[var(--sf-muted)] tabular-nums">
                {cartCount}
              </span>
            </button>

            <button
              onClick={() => { setMenuOpen(true); setSearchOpen(false); }}
              aria-label="القائمة"
              className={`${iconClass} lg:hidden`}
            >
              <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* لوحة البحث */}
        <div
          className={`grid transition-all duration-500 ease-out ${
            searchOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-5">
              <div className="flex items-center gap-3 border-b border-[var(--sf-border)] pb-3">
                <Search className="w-4 h-4 text-[var(--sf-subtle)] shrink-0" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="ابحث عن قطعة، قسم، أو رقم منتج"
                  aria-label="بحث"
                  tabIndex={searchOpen ? 0 : -1}
                  className="flex-1 bg-transparent border-0 outline-none text-[14px] sm:text-[15px] text-[var(--sf-text)] placeholder:text-[var(--sf-subtle)] py-1"
                />
                {searchQuery && (
                  <button onClick={() => onSearchChange('')} aria-label="مسح" className="text-[10px] text-[var(--sf-muted)] hover:text-[var(--sf-text)]">
                    مسح
                  </button>
                )}
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="pt-3">
                  {suggestedProducts.length === 0 ? (
                    <p className="text-[11.5px] text-[var(--sf-subtle)] py-1">لا توجد نتائج مطابقة.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {suggestedProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => pickSuggestion(p)}
                          className="group text-right"
                        >
                          <div className="aspect-square overflow-hidden rounded-[2px] sf-plate">
                            <img
                              src={p.colors?.[0]?.image || p.images?.[0] || ''}
                              alt={p.name}
                              className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <p className="mt-1.5 text-[11px] font-semibold text-[var(--sf-text)] truncate group-hover:text-[var(--sf-accent)] transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] font-mono text-[var(--sf-muted)]">
                            {Number(p.basePrice).toFixed(2)} د.أ
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-400 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-sm bg-[var(--sf-bg)] border-l border-[var(--sf-border)] flex flex-col transition-transform duration-500 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--sf-border)]">
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--sf-subtle)]">الأقسام</span>
            <button onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة" className={iconClass}>
              <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelectCategory(item.id); setMenuOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 text-right border-b border-[var(--sf-border)] transition-colors ${
                    isActive ? 'text-[var(--sf-accent)]' : 'text-[var(--sf-text)] hover:text-[var(--sf-accent)]'
                  }`}
                >
                  <span className="text-[15px] font-medium">{stripEmoji(item.name)}</span>
                  <ArrowUpLeft className="w-4 h-4 opacity-40" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>

          <div className="px-5 py-4 border-t border-[var(--sf-border)] flex items-center justify-between">
            <button onClick={() => { onOpenWishlist(); setMenuOpen(false); }} className="text-[11.5px] font-semibold text-[var(--sf-muted)]">
              المفضلة ({wishlistCount})
            </button>
            <button onClick={() => { onToggleTheme(); }} className="text-[11.5px] font-semibold text-[var(--sf-muted)]">
              {isLightTheme ? 'الوضع الليلي' : 'الوضع الصباحي'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
