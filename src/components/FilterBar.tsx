import React from 'react';
import { RotateCcw } from 'lucide-react';
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
  const colorOptions = [
    { name: 'الكل', hex: 'transparent' },
    { name: 'أبيض', hex: '#FFFFFF' },
    { name: 'بني جوزي', hex: '#3E2723' },
    { name: 'أسود', hex: '#1E1E1E' },
    { name: 'بيج / لاتيه', hex: '#D7C7B0' },
    { name: 'رمادي', hex: '#78716C' },
    { name: 'رخامي', hex: '#EAE6DF' },
  ];

  const chip = (active: boolean) =>
    `py-1.5 px-3.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap active:scale-95 ${
      active
        ? 'bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] shadow-gold'
        : 'bg-white/[0.04] text-[#A39A8B] ring-1 ring-white/10 hover:text-[#F3EEE4] hover:ring-[#D4B06A]/40'
    }`;

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[24px] ring-1 ring-white/10 p-4 sm:p-6 shadow-soft mb-8">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        
        {/* Category Filter */}
        <div className="space-y-2.5 w-full lg:w-auto">
          <label className="text-xs font-bold text-[#F3EEE4] block">التصنيف</label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => onSelectCategory('all')} className={chip(selectedCategory === 'all')}>
              جميع الأقسام
            </button>
            {/* 💡 هنا بنعرض الأقسام الديناميكية */}
            {categories?.map((cat) => (
              <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className={chip(selectedCategory === cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div className="space-y-2.5 w-full lg:w-auto">
          <label className="text-xs font-bold text-[#F3EEE4] block">اللون المفضل</label>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {colorOptions.map((c) => {
              const isSelected = selectedColor === c.name || (c.name === 'الكل' && selectedColor === '');
              return (
                <button
                  key={c.name}
                  onClick={() => onSelectColor(c.name === 'الكل' ? '' : c.name)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#D4B06A]/15 ring-1 ring-[#D4B06A] text-[#E8CC8A]'
                      : 'bg-white/[0.04] ring-1 ring-white/10 text-[#A39A8B] hover:text-[#F3EEE4] hover:ring-[#D4B06A]/40'
                  }`}
                >
                  {c.name !== 'الكل' && <span className="w-3.5 h-3.5 rounded-full ring-1 ring-white/30 shrink-0" style={{ backgroundColor: c.hex }} />}
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Filter & Reset Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start xl:items-center gap-4 w-full lg:w-auto">
          <div className="space-y-2.5 w-full sm:w-auto lg:w-full xl:w-auto lg:min-w-[220px]">
            <div className="flex justify-between items-center text-xs gap-4">
              <label className="font-bold text-[#F3EEE4]">نطاق السعر</label>
              <span className="font-mono text-[11px] text-[#E8CC8A] font-bold tabular-nums">{priceRange[0]} - {priceRange[1]} د.أ</span>
            </div>
            <input type="range" min="0" max="1000" step="10" value={priceRange[1]} onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])} className="w-full accent-[#D4B06A] cursor-pointer h-1.5" />
          </div>
          <button onClick={onResetFilters} className="h-10 px-5 w-full sm:w-auto text-xs text-[#A39A8B] hover:text-[#0B0A09] hover:bg-[#D4B06A] flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ring-1 ring-white/15 hover:ring-[#D4B06A] rounded-full whitespace-nowrap font-bold active:scale-95">
            <RotateCcw className="w-4 h-4" /><span>إعادة ضبط</span>
          </button>
        </div>

      </div>
    </div>
  );
};
