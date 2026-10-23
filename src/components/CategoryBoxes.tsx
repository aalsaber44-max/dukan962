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
  if (!categories || categories.length === 0) return null;

  // 💡 دالة لتصغير حجم الصورة من Cloudinary لجعل التحميل فورياً للمربعات
  const getThumbnail = (url: string) => {
    if (url && url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_600,c_fill,q_auto:good/');
    }
    return url;
  };

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative overflow-hidden rounded-2xl text-right transition-all duration-300 border cursor-pointer flex flex-col justify-end min-h-[180px] sm:min-h-[220px] ${
                  isSelected
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg'
                    : 'border-[#EAE1D3] hover:shadow-xl hover:border-[#8C6D46]'
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src={getThumbnail(cat.image)}
                    alt={cat.name}
                    loading="lazy" /* 💡 هذه الخاصية تجعل المتصفح ينتظر حتى يصل الزبون للصور ليقوم بتحميلها */
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                    isSelected 
                      ? 'from-[#1C1917]/95 via-[#1C1917]/40 to-transparent' 
                      : 'from-black/85 via-black/30 to-transparent group-hover:from-black/95'
                  }`}></div>
                </div>

                <div className="relative z-10 p-4 sm:p-5 w-full mt-auto">
                  <h3 className="text-lg sm:text-xl font-bold leading-tight mb-2 text-white drop-shadow-md">
                    {cat.name}
                  </h3>
                  
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? 'text-[#D4AF37]' : 'text-[#EAE1D3] group-hover:text-white transition-colors'}>
                      {isSelected ? '✓ القسم المختار حالياً' : 'استعراض القطع ←'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
