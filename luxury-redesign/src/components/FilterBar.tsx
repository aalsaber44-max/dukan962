import React from 'react';
import { stripEmoji } from '../utils/emoji';
import { CategoryIcon } from './CategoryIcon';
import { RotateCcw, X } from 'lucide-react';
import { Category } from '../types/furniture';

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onResetFilters: () => void;
}

const COLORS = [
  { name: 'الكل', hex: 'transparent' },
  { name: 'أبيض', hex: '#FFFFFF' },
  { name: 'بني جوزي', hex: '#3E2723' },
  { name: 'أسود', hex: '#1E1E1E' },
  { name: 'بيج / لاتيه', hex: '#D7C7B0' },
  { name: 'رمادي', hex: '#78716C' },
  { name: 'رخامي', hex: '#EAE6DF' },
];

const labelClass =
  'text-[9.5px] font-semibold tracking-[0.18em] uppercase text-[var(--sf-subtle)]';

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedColor,
  onSelectColor,
  onResetFilters,
}) => {
  return (
    <div className="border-y border-[var(--sf-border)] py-5 mb-9" data-reveal>
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-10">

        {/* التصنيف */}
        <div className="min-w-0 flex-1">
          <p className={`${labelClass} mb-3`}>التصنيف</p>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            {[{ id: 'all', name: 'الكل' }, ...(categories || [])].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  aria-pressed={active}
                  data-active={active}
                  className={`shrink-0 text-[12px] font-medium sf-link-quiet cursor-pointer whitespace-nowrap ${
                    active ? 'text-[var(--sf-accent)]' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CategoryIcon name={cat.name} className="w-3.5 h-3.5 shrink-0" />
                    {stripEmoji(cat.name)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <span aria-hidden="true" className="hidden xl:block w-px h-10 bg-[var(--sf-border)]" />

        {/* اللون */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className={labelClass}>اللون</p>
            {selectedColor && (
              <span className="text-[9.5px] text-[var(--sf-accent)]">· {selectedColor}</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {COLORS.map((c) => {
              const active = selectedColor === c.name || (c.name === 'الكل' && selectedColor === '');
              return (
                <button
                  key={c.name}
                  onClick={() => onSelectColor(c.name === 'الكل' ? '' : c.name)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={active}
                  className={`relative grid place-items-center w-6 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                    active ? 'ring-1 ring-[var(--sf-accent)] ring-offset-2 ring-offset-[var(--sf-bg)]' : 'ring-1 ring-[var(--sf-border)] hover:ring-[var(--sf-border-strong)]'
                  }`}
                  style={{ backgroundColor: c.name === 'الكل' ? 'transparent' : c.hex }}
                >
                  {c.name === 'الكل' && (
                    <X className="w-3 h-3 text-[var(--sf-muted)]" strokeWidth={1.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <span aria-hidden="true" className="hidden xl:block w-px h-10 bg-[var(--sf-border)]" />

        {/* السعر */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <p className={labelClass}>السعر</p>
            <span className="text-[10.5px] font-mono font-semibold text-[var(--sf-text)] tabular-nums">
              <span dir="ltr">{priceRange[0]} – {priceRange[1]}</span> د.أ
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
            aria-label="الحد الأعلى للسعر"
            className="w-full xl:w-44 cursor-pointer h-1"
          />
        </div>

        {/* إعادة الضبط */}
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--sf-muted)] hover:text-[var(--sf-accent)] transition-colors cursor-pointer self-start xl:self-center shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          إعادة ضبط
        </button>
      </div>
    </div>
  );
};
