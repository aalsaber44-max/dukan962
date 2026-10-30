import React from 'react';
import { ArrowUpLeft, Check } from 'lucide-react';
import { Category } from '../types/furniture';

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
  // موبايل: إذا كان عدد الباقي فردياً يأخذ الأخير عرضاً كاملاً
  const mobile = isLast && rest % 2 === 1 ? 'col-span-2' : '';
  // كمبيوتر: ملء المنطقة اليمنى (عمودان × صفان)
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
    <section id="categories" className="py-8 sm:py-16 bg-[#FBFAF7]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-9">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#14110F] tracking-tight font-serif">
            تسوّق حسب القسم
          </h2>
          <button
            onClick={() => onSelectCategory('all')}
            className="group/all inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#78716C] hover:text-[#14110F] transition-colors cursor-pointer shrink-0"
          >
            <span>عرض كل المنتجات</span>
            <ArrowUpLeft className="w-4 h-4 transition-transform duration-300 group-hover/all:-translate-x-0.5 group-hover/all:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[168px] sm:auto-rows-[220px] gap-2.5 sm:gap-4 grid-flow-dense">
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat.id;
            const isFeatured = index === 0 && total >= 3 && total <= 5;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={isSelected}
                className={`group relative isolate overflow-hidden rounded-[20px] sm:rounded-[28px] text-right cursor-pointer flex flex-col justify-end bg-[#1C1917] transition-all duration-500 ease-out active:scale-[0.985] ${getSpanClasses(
                  index,
                  total
                )} ${
                  isSelected
                    ? 'ring-2 ring-[#E3C16F] ring-offset-2 ring-offset-[#FBFAF7] shadow-lift'
                    : 'ring-1 ring-black/5 shadow-soft hover:shadow-lift hover:-translate-y-1'
                }`}
              >
                <img
                  src={getThumbnail(cat.image)}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 -z-10 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                />
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-t transition-opacity duration-500 ${
                    isSelected
                      ? 'from-black/85 via-black/25 to-transparent'
                      : 'from-black/70 via-black/10 to-transparent group-hover:from-black/80'
                  }`}
                />

                {isSelected && (
                  <span className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#E3C16F] text-[#14110F] text-[11px] font-bold shadow-md">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    القسم الحالي
                  </span>
                )}

                {/* شريحة زجاجية للعنوان */}
                <div className="m-2 sm:m-3.5 flex items-center justify-between gap-3 rounded-2xl bg-white/12 backdrop-blur-xl ring-1 ring-white/20 px-3.5 py-2.5 sm:px-5 sm:py-3.5">
                  <h3
                    className={`font-serif font-bold text-white leading-tight ${
                      isFeatured ? 'text-lg sm:text-3xl' : 'text-base sm:text-xl'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <span className="grid place-items-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/20 text-white transition-all duration-500 group-hover:bg-white group-hover:text-[#14110F] group-hover:-rotate-12">
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
