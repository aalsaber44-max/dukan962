import React from 'react';
import { ArrowUpLeft, Check } from 'lucide-react';
import { Category } from '../types/furniture';
import { spotlightMove } from '../utils/useSpotlight';

interface CategoryBoxesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

/**
 * تخطيط Bento: أول قسم كبير، والباقي يملأ الشبكة بدون فراغات.
 * يعمل تلقائياً مع 3-5 أقسام، وما زاد عن ذلك يتحول لشبكة متساوية.
 */
const getSpanClasses = (index: number, total: number): string => {
  const rest = total - 1;
  const bento = total >= 3 && total <= 5;
  if (!bento) return '';
  if (index === 0) return 'col-span-2 lg:row-span-2';

  const isLast = index === total - 1;
  const mobile = isLast && rest % 2 === 1 ? 'col-span-2' : '';
  let desktop = '';
  if (rest === 3 && isLast) desktop = 'lg:col-span-2';
  if (rest === 2) desktop = 'lg:col-span-2';
  return `${mobile} ${desktop}`.trim();
};

export const CategoryBoxes: React.FC<CategoryBoxesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (!categories || categories.length === 0) return null;

  // 💡 دالة لتصغير حجم الصورة من Cloudinary (إذا كنت تستخدمه)
  const getThumbnail = (url: string) => {
    if (url && url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_900,c_fill,q_auto:good/');
    }
    return url;
  };

  const total = categories.length;

  return (
    <section id="categories" className="py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F3EEE4] tracking-tight font-serif">
            تسوّق حسب القسم
          </h2>
          <button
            onClick={() => onSelectCategory('all')}
            className="group/all inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#A39A8B] hover:text-[#E8CC8A] transition-colors cursor-pointer shrink-0"
          >
            <span>عرض كل المنتجات</span>
            <ArrowUpLeft className="w-4 h-4 transition-transform duration-300 group-hover/all:-translate-x-0.5 group-hover/all:-translate-y-0.5" />
          </button>
        </div>
        <div aria-hidden="true" className="gold-rule mb-5 sm:mb-9" />

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[168px] sm:auto-rows-[220px] gap-2.5 sm:gap-4 grid-flow-dense">
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat.id;
            const isFeatured = index === 0 && total >= 3 && total <= 5;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                onMouseMove={spotlightMove}
                aria-pressed={isSelected}
                className={`spotlight group relative isolate overflow-hidden rounded-[20px] sm:rounded-[28px] text-right cursor-pointer flex flex-col justify-end bg-[#141210] transition-all duration-500 ease-out active:scale-[0.985] ${getSpanClasses(
                  index,
                  total
                )} ${
                  isSelected
                    ? 'ring-2 ring-[#D4B06A] shadow-lift'
                    : 'ring-1 ring-white/10 shadow-soft hover:-translate-y-1 hover:shadow-lift'
                }`}
              >
                <img
                  src={getThumbnail(cat.image)}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 -z-10 w-full h-full object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                />
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-t transition-opacity duration-500 ${
                    isSelected
                      ? 'from-[#0B0A09]/90 via-[#0B0A09]/30 to-transparent'
                      : 'from-[#0B0A09]/80 via-[#0B0A09]/15 to-transparent group-hover:from-[#0B0A09]/90'
                  }`}
                />

                {isSelected && (
                  <span className="absolute z-10 top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] text-[11px] font-bold shadow-gold">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    القسم الحالي
                  </span>
                )}

                {/* شريحة زجاجية للعنوان */}
                <div className="relative z-10 m-2 sm:m-3.5 flex items-center justify-between gap-3 rounded-2xl bg-[#0B0A09]/45 backdrop-blur-xl ring-1 ring-white/15 px-3.5 py-2.5 sm:px-5 sm:py-3.5">
                  <h3
                    className={`font-serif font-bold text-[#F3EEE4] leading-tight ${
                      isFeatured ? 'text-lg sm:text-3xl' : 'text-base sm:text-xl'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <span className="grid place-items-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/10 ring-1 ring-white/15 text-[#F3EEE4] transition-all duration-500 group-hover:bg-[#D4B06A] group-hover:text-[#0B0A09] group-hover:ring-[#D4B06A] group-hover:-rotate-12">
                    <ArrowUpLeft className="w-4 h-4" />
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
