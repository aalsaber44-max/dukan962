import React from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';
import { Category } from '../types/furniture';

interface HeroProps {
  onExploreClick: () => void;
  categoryData?: Category | null; // 💡 استقبال بيانات القسم المختار
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, categoryData }) => {
  
  // 💡 بيانات احتياطية عامة جداً (في حال لم تصل أي بيانات من App.tsx)
  const defaultData = {
    title: "دكان 962.. وجهتك الأولى للأثاث والعطور والأحذية",
    description: "أرقى التصاميم والمنتجات الفاخرة بجودة عالية وأسعار منافسة. تسوق الآن واستمتع بخدمة المعاينة عند الوصول والتوصيل لجميع المحافظات.",
    bannerImage: "https://res.cloudinary.com/pxn4yowl/image/upload/f_auto,q_auto:best/Gemini_Generated_Image_tqd22ztqd22ztqd2", 
    buttonText: "استكشف تشكيلاتنا الآن",
    badgeText: "✨ جودة تستحق الاقتناء",
    name: "دكـان 962"
  };

  // 💡 نستخدم بيانات القسم الممرر من App.tsx (سواء كان الرئيسية أو قسماً فرعياً)
  const displayData = categoryData || defaultData;

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 pb-8">
        
        {/* Main Hero Visual Card */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5DDD0] shadow-xl min-h-[400px] sm:min-h-[500px] bg-[#1C1917]">
          
          {/* 💡 1. الخلفية المموهة: تملأ الفراغات في حال كانت الصورة لا تغطي الشاشة بالكامل */}
          <img
            src={displayData.bannerImage || displayData.image}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
          />

          {/* 💡 2. الصورة الأساسية: object-contain تضمن ظهور الصورة كاملة بدون قص */}
          <img
            src={displayData.bannerImage || displayData.image} 
            alt={displayData.title || displayData.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-contain object-center transition-all duration-700 z-10"
          />

          {/* Measured Contrast Scrim (تدرج لوني لضمان قراءة النص) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end z-20">
            <div className="p-4 sm:p-10 lg:p-14 max-w-3xl text-white w-full">
              
              {/* Olive Green Tag */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#E2D5C4] mb-3 font-medium">
                <span className="bg-[#2E5339] text-[#F0FDF4] px-2 py-0.5 rounded-md font-bold shadow-xs">
                  {displayData.name || 'دكـان 962'}
                </span>
                <span className="text-[#A7F3D0] font-bold">
                  {displayData.badgeText || "✨ يوجد معاينة"}
                </span>
                <span>· توصيل لجميع المحافظات</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.3] mb-3 sm:mb-4 text-balance font-serif">
                {displayData.title}
              </h1>

              {/* Short Elegant Copy */}
              <p className="text-[11px] sm:text-base text-[#EAE4DC] leading-relaxed mb-5 sm:mb-7 max-w-2xl font-light">
                {displayData.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onExploreClick}
                  className="py-3 px-5 text-xs sm:text-sm font-bold text-[#1C1917] bg-[#EAE2D5] hover:bg-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl active:scale-95 w-full sm:w-auto"
                >
                  <span>{displayData.buttonText || "استكشف الآن"}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-white/95 bg-[#2E5339]/90 backdrop-blur-md py-3 px-4 rounded-xl border border-[#A7F3D0]/30 font-semibold w-full sm:w-auto">
                  <ShieldCheck className="w-4 h-4 text-[#A7F3D0]" />
                  <span>يوجد معاينة عند وصول الطلب قبل الدفع</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Feature Strip under Hero */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-[#E9E1D4] shadow-2xs">
          <div className="flex items-center gap-2 p-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#1C1917]">جودة مضمونة</p>
              <p className="text-[9px] sm:text-[10px] text-[#78716C]">خامات نخب أول</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#1C1917]">توصيل شامل</p>
              <p className="text-[9px] sm:text-[10px] text-[#78716C]">لجميع المحافظات</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#1C1917]">توصيل سريع</p>
              <p className="text-[9px] sm:text-[10px] text-[#78716C]">خلال 24-48 ساعة</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#F4EFE6] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#1C1917]">ألوان حصرية</p>
              <p className="text-[9px] sm:text-[10px] text-[#78716C]">تشكيلات متنوعة</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
