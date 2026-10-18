import React from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        
        {/* Main Hero Visual Card */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5DDD0] shadow-xl aspect-16/10 sm:aspect-16/9 lg:aspect-21/9 min-h-[460px]">
          <img
            src="/src/assets/images/hero_luxury_living_1792320991767.jpg"
            alt="صالة معيشة فاخرة مع طاولات دكان 962"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Measured Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 flex items-end">
            <div className="p-6 sm:p-10 lg:p-14 max-w-3xl text-white">
              
              {/* Olive Green Tag */}
              <div className="flex items-center gap-2 text-xs text-[#E2D5C4] mb-3 font-medium">
                <span className="bg-[#2E5339] text-[#F0FDF4] px-2.5 py-0.5 rounded-md font-bold text-[11px] shadow-xs">
                  دكـان 962
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#A7F3D0] font-bold">
                  ✨ يوجد معاينة عند وصول الطلب
                </span>
                <span aria-hidden="true">·</span>
                <span>خشب تايلندي ثقيل نخب أول</span>
                <span aria-hidden="true">·</span>
                <span>توصيل لجميع المحافظات</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] mb-4 text-balance font-serif">
                أثاث يجمع بين الراحة والأناقة
              </h1>

              {/* Short Elegant Copy */}
              <p className="text-xs sm:text-base text-[#EAE4DC] leading-relaxed mb-7 max-w-2xl font-light">
                أرقى تصاميم طاولات الوسط، طاولات الشاشات الفاخرة، والمدافئ الديكورية النارية. قطع عملية متقنة مصنعة من أثقل وأجود أخشاب التايلندي لتزيد صالتك فخامة وسحراً.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  onClick={onExploreClick}
                  className="py-3 px-7 text-xs sm:text-sm font-bold text-[#1C1917] bg-[#EAE2D5] hover:bg-white rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-xl active:scale-98 whitespace-nowrap"
                >
                  <span>استكشف طاولات العرض الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs text-white/95 bg-[#2E5339]/80 backdrop-blur-md py-2.5 px-4 rounded-xl border border-[#A7F3D0]/30 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#A7F3D0]" />
                  <span>يوجد معاينة عند وصول الطلب قبل الدفع</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Feature Strip under Hero */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 bg-white rounded-2xl border border-[#E9E1D4] shadow-2xs">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1917]">خشب تايلندي ثقيل</p>
              <p className="text-[10px] text-[#78716C]">مقاوم للرطوبة والخدش</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1917]">توصيل لجميع المحافظات</p>
              <p className="text-[10px] text-[#78716C]">عمان، إربد، الزرقاء، العقبة...</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1917]">توصيل سريع 24-48 ساعة</p>
              <p className="text-[10px] text-[#78716C]">خدمة شحن سريعة لباب بيتك</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1917]">خيارات ألوان حصرية</p>
              <p className="text-[10px] text-[#78716C]">أبيض، جوزي، أسود، ورخامي</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
