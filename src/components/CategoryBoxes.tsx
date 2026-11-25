import React, { useRef } from 'react';
import { stripEmoji } from '../utils/emoji';
import { CategoryIcon } from './CategoryIcon';
import { ArrowLeft, ArrowRight, ArrowUpLeft, Check } from 'lucide-react';
import { Category } from '../types/furniture';

interface CategoryBoxesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryBoxes: React.FC<CategoryBoxesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const railRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) return null;

  const thumbnail = (url: string) =>
    url && url.includes('res.cloudinary.com')
      ? url.replace('/upload/', '/upload/w_1000,c_fill,q_auto:good/')
      : url;

  // في RTL التمرير للأمام يعني سالب
  const nudge = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * -Math.round(rail.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <section id="categories" className="sf-section-pad">
      <div className="mx-auto max-w-[1440px]">
        {/* رأس تحريري */}
        <div className="px-4 sm:px-6 lg:px-10 flex items-end justify-between gap-6 mb-8 lg:mb-12" data-reveal>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--sf-subtle)]">02</span>
              <span aria-hidden="true" className="h-px w-10 bg-[var(--sf-border-strong)]" />
              <span className="text-[10px] font-semibold tracking-[0.16em] text-[var(--sf-muted)] uppercase">Lookbook</span>
            </div>
            <h2 className="sf-title-lg text-[var(--sf-text)]">تسوّق حسب القسم</h2>
            <p className="text-[12px] text-[var(--sf-muted)] mt-2 max-w-md">
              تشكيلات مختارة بعناية — اسحب أفقياً لاستعراض الأقسام.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectCategory('all')}
              className="text-[11px] font-semibold text-[var(--sf-muted)] hover:text-[var(--sf-accent)] transition-colors inline-flex items-center gap-1.5"
            >
              عرض الكل
              <ArrowUpLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <span aria-hidden="true" className="w-px h-4 bg-[var(--sf-border)] mx-1" />
            <button
              onClick={() => nudge(-1)}
              aria-label="السابق"
              className="grid place-items-center w-8 h-8 rounded-full border border-[var(--sf-border)] text-[var(--sf-muted)] hover:text-[var(--sf-text)] hover:border-[var(--sf-border-strong)] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="التالي"
              className="grid place-items-center w-8 h-8 rounded-full border border-[var(--sf-border)] text-[var(--sf-muted)] hover:text-[var(--sf-text)] hover:border-[var(--sf-border-strong)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* المسار الأفقي */}
        <div
          ref={railRef}
          className="sf-lookbook flex gap-3 sm:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-2"
        >
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat.id;
            const offset = index % 2 === 1 ? 'lg:mt-14' : 'lg:mt-0';
            const width =
              index === 0
                ? 'w-[80vw] sm:w-[52vw] lg:w-[34vw]'
                : 'w-[64vw] sm:w-[38vw] lg:w-[23vw]';

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={isSelected}
                data-reveal
                style={{ '--reveal-delay': `${Math.min(index, 5) * 70}ms` } as React.CSSProperties}
                className={`group relative shrink-0 overflow-hidden rounded-[3px] sf-hover-zoom text-right cursor-pointer transition-transform duration-700 ${width} ${offset} ${
                  index === 0 ? 'aspect-[3/3.4] lg:aspect-[3/3.6]' : 'aspect-[3/4]'
                } ${isSelected ? 'ring-1 ring-[var(--sf-accent)]' : 'ring-1 ring-[var(--sf-border)]'}`}
              >
                <img
                  src={thumbnail(cat.image)}
                  alt={`قسم ${stripEmoji(cat.name)} - دكان 962`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                {/* قناع متدرّج */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent opacity-70" />

                {/* رقم + حالة */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold text-white/70 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[var(--sf-accent-strong)]">
                      <Check className="w-3 h-3" strokeWidth={2} />
                      الحالي
                    </span>
                  )}
                </div>

                {/* النص */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 text-white font-bold leading-tight text-[17px] sm:text-[20px] lg:text-[22px]">
                    <CategoryIcon name={cat.name} className="w-4 h-4 shrink-0 text-[var(--sf-accent)]" />
                    <span>{stripEmoji(cat.name)}</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="block h-px w-6 bg-[var(--sf-accent)] transition-all duration-700 group-hover:w-14" />
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/70 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      استعرض
                      <ArrowUpLeft className="w-3 h-3" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* بلاطة ختامية */}
          <button
            onClick={() => onSelectCategory('all')}
            className="group shrink-0 w-[64vw] sm:w-[34vw] lg:w-[19vw] aspect-[3/4] lg:mt-14 rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-panel)] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[var(--sf-border-strong)] transition-colors"
          >
            <ArrowUpLeft className="w-5 h-5 text-[var(--sf-accent)] transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1" strokeWidth={1.5} />
            <span className="text-[13px] font-bold text-[var(--sf-text)]">كل المنتجات</span>
            <span className="text-[10px] text-[var(--sf-subtle)] tracking-[0.14em] uppercase">View all</span>
          </button>
        </div>

        <div aria-hidden="true" className="mx-4 sm:mx-6 lg:mx-10 mt-8 h-px bg-[var(--sf-border)]" />
      </div>
    </section>
  );
};
