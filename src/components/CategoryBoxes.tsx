import React from 'react';
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
  // 💡 الحماية عشان الصفحة متضربش لو الأقسام لسه بتتحمل
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D46] mb-1">
              <span>تشكيلاتنا المتنوعة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight font-serif">
              تسوق حسب القسم
            </h2>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-right transition-all duration-300 border cursor-pointer flex flex-col justify-between min-h-[170px] ${
                  isSelected
                    ? 'border-[#1C1917] bg-[#1C1917] text-white shadow-md'
                    : 'border-[#EAE1D3] bg-white hover:border-[#8C6D46] hover:shadow-md text-[#1C1917]'
                }`}
              >
                {/* Background image */}
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <img
                    src={cat.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent"></div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-base font-bold leading-tight mb-1 mt-10">
                    {cat.name}
                  </h3>
                </div>

                <div className="relative z-10 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-[#D4AF37]' : 'text-[#8C6D46]'}>
                    {isSelected ? 'القسم المختار حالياً' : 'استعراض القطع ←'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
