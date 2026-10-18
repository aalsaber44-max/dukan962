import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedColor,
  onSelectColor,
  onResetFilters,
}) => {
  const categories = [
    { id: 'all', label: 'جميع الأقسام' },
    { id: 'center-tables', label: 'طاولات وسط وصالون' },
    { id: 'tv-tables', label: 'طاولات شاشة' },
    { id: 'fireplace-tables', label: 'طاولات مع مدفأة' },
    { id: 'side-tables', label: 'طاولات خدمة وضيافة' },
  ];

  const colorOptions = [
    { name: 'الكل', hex: 'transparent' },
    { name: 'أبيض', hex: '#FFFFFF' },
    { name: 'بني جوزي', hex: '#3E2723' },
    { name: 'أسود', hex: '#1E1E1E' },
    { name: 'بيج / لاتيه', hex: '#D7C7B0' },
    { name: 'رمادي', hex: '#78716C' },
    { name: 'رخامي', hex: '#EAE6DF' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E9E1D4] p-5 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Category Filter Pills / Segmented Controls */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1C1917] block">
            التصنيف:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#57534E] hover:bg-[#F2ECE1] border border-[#EDE5D8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1C1917] block">
            اللون المفضل:
          </label>
          <div className="flex items-center gap-2">
            {colorOptions.map((c) => {
              const isSelected = selectedColor === c.name || (c.name === 'الكل' && selectedColor === '');
              return (
                <button
                  key={c.name}
                  onClick={() => onSelectColor(c.name === 'الكل' ? '' : c.name)}
                  title={c.name}
                  className={`flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1C1917] bg-[#FAF8F5] shadow-xs'
                      : 'border-transparent text-[#78716C] hover:border-[#DDD5C7]'
                  }`}
                >
                  {c.name !== 'الكل' && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                  )}
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Filter (من - إلى) بالدينار الأردني */}
        <div className="space-y-1.5 min-w-[220px]">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-[#1C1917]">نطاق السعر:</label>
            <span className="font-mono text-[11px] text-[#8C6D46] font-bold">
              {priceRange[0]} د.أ - {priceRange[1]} د.أ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="160"
              step="5"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#1C1917] cursor-pointer h-1.5 bg-[#E5DDD0] rounded-lg"
            />
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <button
            onClick={onResetFilters}
            className="py-1.5 px-3 text-xs text-[#78716C] hover:text-[#1C1917] flex items-center gap-1 transition-colors cursor-pointer border border-[#E5DDD0] hover:bg-[#FAF7F2] rounded-lg whitespace-nowrap"
            title="إعادة ضبط الفلاتر"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
        </div>

      </div>
    </div>
  );
};
