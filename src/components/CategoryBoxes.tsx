import React from 'react';
import { Sparkles, Tv, Flame, Grid, Coffee } from 'lucide-react';
import { Product } from '../types/furniture';

interface CategoryBoxesProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryBoxes: React.FC<CategoryBoxesProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
}) => {
  // Helper to calculate the lowest price automatically for any category
  const getLowestPrice = (categoryId: string): number | null => {
    const list =
      categoryId === 'all'
        ? products
        : products.filter((p) => p.category === categoryId);

    if (list.length === 0) return null;

    const allPrices = list
      .flatMap((p) => [p.basePrice, ...(p.colors?.map((c) => c.price) || [])])
      .filter((pr) => typeof pr === 'number' && !isNaN(pr) && pr > 0);

    if (allPrices.length === 0) return null;
    return Math.min(...allPrices);
  };

  const getCategoryBadge = (categoryId: string, fallbackBadge: string): string => {
    const lowest = getLowestPrice(categoryId);
    if (lowest !== null) {
      return `تبدأ من ${lowest.toFixed(2)} د.أ`;
    }
    return fallbackBadge;
  };

  const categories = [
    {
      id: 'all',
      name: 'جميع الطاولات',
      subtitle: 'استكشف التشكيلة الكاملة',
      icon: Grid,
      badge: getCategoryBadge('all', 'الأكثر تنوعاً'),
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'center-tables',
      name: 'طاولات وسط وصالون',
      subtitle: 'أطقم هندسية ومضلعة خشب ثقيل',
      icon: Coffee,
      badge: getCategoryBadge('center-tables', 'الأكثر مبيعاً'),
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'tv-tables',
      name: 'طاولات شاشة وتلفزيون',
      subtitle: 'مقاسات 160 إلى 180 سم بحواف ذهبية',
      icon: Tv,
      badge: getCategoryBadge('tv-tables', 'تصاميم مودرن'),
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'fireplace-tables',
      name: 'طاولات شاشة مع مدفأة',
      subtitle: 'لهب كهربائي ديكور وأرجل ذهبية',
      icon: Flame,
      badge: getCategoryBadge('fireplace-tables', 'إصدار فاخر'),
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'side-tables',
      name: 'طاولات خدمة وضيافة',
      subtitle: 'أطقم متداخلة 3 قطع لتوفير المساحة',
      icon: Sparkles,
      badge: getCategoryBadge('side-tables', 'عروض التوفير'),
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D46] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>أقسام العفش والطاولات المتخصصة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight font-serif">
              تصفح حسب نوع الطاولة
            </h2>
          </div>
          <span className="text-xs text-[#78716C]">خشب تايلندي ثقيل نخب أول</span>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
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
                {/* Background ambient subtle image overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img
                    src={cat.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#332E2B] text-[#D4AF37]'
                          : 'bg-[#F4EFE6] text-[#8C6D46] group-hover:bg-[#1C1917] group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-[#2E5339] text-[#E8F5E9]'
                          : 'bg-[#EDF4EE] text-[#2E5339]'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold leading-tight mb-1">
                    {cat.name}
                  </h3>
                  <p
                    className={`text-[11px] line-clamp-1 ${
                      isSelected ? 'text-[#D6D0C7]' : 'text-[#78716C]'
                    }`}
                  >
                    {cat.subtitle}
                  </p>
                </div>

                <div className="relative z-10 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-medium">
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
