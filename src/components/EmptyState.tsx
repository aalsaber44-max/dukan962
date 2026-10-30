import React from 'react';
import { motion } from 'motion/react';
import { SearchX, PackageOpen, RotateCcw, LayoutGrid, X } from 'lucide-react';

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface EmptyStateProps {
  /** no-results: الفلاتر لا تطابق شيئاً | no-products: لا توجد منتجات في المتجر أصلاً */
  variant: 'no-results' | 'no-products';
  searchQuery?: string;
  activeFilters?: ActiveFilter[];
  onReset?: () => void;
  onBrowseCategories?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  searchQuery,
  activeFilters = [],
  onReset,
  onBrowseCategories,
}) => {
  const isNoResults = variant === 'no-results';
  const Icon = isNoResults ? SearchX : PackageOpen;
  const query = searchQuery?.trim();

  const title = isNoResults ? 'لا توجد نتائج مطابقة' : 'المتجر قيد التجهيز';
  const body = isNoResults
    ? query
      ? `لم نجد منتجات تطابق "${query}" مع الفلاتر الحالية. جرّب كلمة أخرى أو أزل أحد الفلاتر.`
      : 'لا توجد منتجات تطابق الفلاتر الحالية. وسّع نطاق السعر أو جرّب قسماً آخر.'
    : 'لم تُنشر منتجات بعد. ستظهر هنا فور إضافتها.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#141210] ring-1 ring-white/10 shadow-soft px-6 py-14 sm:py-20 text-center"
    >
      {/* هالة ذهبية خفيفة في الخلفية */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(closest-side,rgba(227,193,111,0.22),transparent)] pointer-events-none"
      />

      <div className="relative mx-auto mb-7 grid place-items-center w-36 h-36">
        <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
        <span className="absolute inset-4 rounded-full ring-1 ring-white/10 bg-[#1C1815]/60" />
        <span className="absolute inset-9 rounded-full bg-gradient-to-br from-[#4A3A18] to-[#2A2110] ring-1 ring-[#D4B06A]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_30px_-10px_rgba(212,176,106,0.45)]" />
        <Icon className="relative w-9 h-9 text-[#D4B06A] animate-float-slow" strokeWidth={1.6} />
      </div>

      <h3 className="relative text-xl sm:text-2xl font-bold font-serif text-[#F3EEE4] mb-2">{title}</h3>
      <p className="relative text-sm text-[#A39A8B] leading-relaxed max-w-md mx-auto">{body}</p>

      {isNoResults && activeFilters.length > 0 && (
        <div className="relative flex flex-wrap items-center justify-center gap-2 mt-6">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={f.onRemove}
              aria-label={`إزالة فلتر ${f.label}`}
              className="group/chip inline-flex items-center gap-1.5 h-8 pr-3.5 pl-2 rounded-full bg-[#1C1815] ring-1 ring-[#D4B06A]/30 text-xs font-semibold text-[#D4B06A] transition-all hover:bg-[#26211D] active:scale-95 cursor-pointer"
            >
              <span>{f.label}</span>
              <span className="grid place-items-center w-4 h-4 rounded-full bg-[#5C4713]/10 group-hover/chip:bg-[#5C4713]/20 transition-colors">
                <X className="w-2.5 h-2.5" />
              </span>
            </button>
          ))}
        </div>
      )}

      {isNoResults && (
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-8">
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 w-full sm:w-auto rounded-full bg-[#D4B06A] text-[#0B0A09] text-sm font-bold shadow-[0_10px_24px_-10px_rgba(20,17,15,0.6)] transition-all hover:bg-[#E8CC8A] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة ضبط الفلاتر
          </button>
          <button
            onClick={onBrowseCategories}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 w-full sm:w-auto rounded-full bg-[#141210] text-[#F3EEE4] text-sm font-bold ring-1 ring-black/10 transition-all hover:bg-[#26211D] hover:ring-black/20 active:scale-95 cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            تصفح الأقسام
          </button>
        </div>
      )}
    </motion.div>
  );
};

/** هيكل تحميل بدل ومضة "لا توجد منتجات" أثناء جلب البيانات من Firebase */
export const ProductSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div aria-busy="true" aria-label="جاري تحميل المنتجات" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl bg-[#141210] ring-1 ring-white/10 overflow-hidden shadow-soft">
        <div className="aspect-4/3 skeleton-bg animate-skeleton" />
        <div className="p-5 space-y-3">
          <div className="h-3 w-1/3 rounded-full skeleton-bg animate-skeleton" />
          <div className="h-4 w-3/4 rounded-full skeleton-bg animate-skeleton" />
          <div className="h-3 w-full rounded-full skeleton-bg animate-skeleton" />
          <div className="flex items-center justify-between pt-4">
            <div className="h-6 w-24 rounded-full skeleton-bg animate-skeleton" />
            <div className="h-9 w-28 rounded-xl skeleton-bg animate-skeleton" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
