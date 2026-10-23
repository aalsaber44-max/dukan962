import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';
import { Category } from '../types/furniture';

interface HeroProps {
  onExploreClick: () => void;
  categoryData?: Category | null;
}

/**
 * يبني رابط Cloudinary بتحويل جديد، ويشيل أي تحويلات قديمة من الرابط
 */
export const buildCloudinary = (url: string, transform: string) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const [base, rest] = url.split('/upload/');
  const parts = rest.split('/');
  const vIdx = parts.findIndex((p) => /^v\d+$/.test(p));
  const clean = vIdx >= 0 ? parts.slice(vIdx) : parts.filter((p) => !p.includes(','));
  return `${base}/upload/${transform}/${clean.join('/')}`;
};

// عروض الصور لكل نوع شاشة
const MOBILE_WIDTHS = [480, 720, 960];
const DESKTOP_WIDTHS = [1024, 1600, 2000, 2400];

export const Hero: React.FC<HeroProps> = ({ onExploreClick, categoryData }) => {
  const defaultData = {
    title: 'دكان 962.. وجهتك الأولى للأثاث والعطور والأحذية',
    description:
      'أرقى التصاميم والمنتجات الفاخرة بجودة عالية وأسعار منافسة. تسوق الآن واستمتع بخدمة المعاينة عند الوصول والتوصيل لجميع المحافظات.',
    bannerImage:
      'https://res.cloudinary.com/pxn4yowl/image/upload/f_auto,q_auto:best/Gemini_Generated_Image_tqd22ztqd22ztqd2',
    buttonText: 'استكشف تشكيلاتنا الآن',
    badgeText: '✨ جودة تستحق الاقتناء',
    name: 'دكـان 962',
  };

  const displayData: any = categoryData || defaultData;
  const rawBanner: string = displayData.bannerImage || displayData.image || '';

  // 💡 التعديل هنا: استخدمنا c_scale بدلاً من c_fill لكي لا يتم قص الصورة، بل تصغيرها فقط
  const mobileSrcSet = MOBILE_WIDTHS.map(
    (w) => `${buildCloudinary(rawBanner, `c_scale,w_${w},f_auto,q_auto:good`)} ${w}w`
  ).join(', ');

  const desktopSrcSet = DESKTOP_WIDTHS.map(
    (w) => `${buildCloudinary(rawBanner, `c_scale,w_${w},f_auto,q_auto:good`)} ${w}w`
  ).join(', ');

  const fallbackSrc = buildCloudinary(rawBanner, 'c_scale,w_1600,f_auto,q_auto:good');

  // نسخة صغيرة جداً تظهر فوراً وتُستخدم كخلفية مموهة أثناء تحميل الصورة الكبيرة
  const placeholderSrc = buildCloudinary(rawBanner, 'c_limit,w_60,q_30,f_auto');

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [rawBanner]);

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 pb-8">
        
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5DDD0] shadow-xl min-h-[460px] sm:min-h-[460px] lg:min-h-[520px] flex items-center bg-[#1C1917]">
          
          {/* الخلفية المموهة: تملأ الفراغات الجانبية بشكل فخم */}
          <img
            key={`bg-${rawBanner}`}
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
          />

          {/* الصورة الأساسية */}
          <picture key={rawBanner}>
            <source media="(max-width: 639px)" srcSet={mobileSrcSet} sizes="100vw" />
            <source media="(min-width: 640px)" srcSet={desktopSrcSet} sizes="(min-width: 1280px) 1280px, 100vw" />
            <img
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
              }}
              src={fallbackSrc}
              alt={displayData.title || displayData.name}
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setLoaded(true)}
              /* 💡 التعديل هنا: استخدمنا object-contain لكي تظهر الصورة كاملة 100% */
              className={`absolute inset-0 w-full h-full object-contain object-center z-10 transition-opacity duration-500 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </picture>

          {/* Scrim: تدرج لوني لضمان قراءة النص */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end z-20">
            <div className="p-4 sm:p-10 lg:p-14 max-w-3xl text-white w-full">
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#E2D5C4] mb-3 font-medium">
                <span className="bg-[#2E5339] text-[#F0FDF4] px-2 py-0.5 rounded-md font-bold shadow-xs">
                  {displayData.name || 'دكـان 962'}
                </span>
                <span className="text-[#A7F3D0] font-bold">
                  {displayData.badgeText || '✨ يوجد معاينة'}
                </span>
                <span>· توصيل لجميع المحافظات</span>
              </div>

              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.3] mb-3 sm:mb-4 text-balance font-serif">
                {displayData.title}
              </h1>

              <p className="text-[11px] sm:text-base text-[#EAE4DC] leading-relaxed mb-5 sm:mb-7 max-w-2xl font-light">
                {displayData.description}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onExploreClick}
                  className="py-3 px-5 text-xs sm:text-sm font-bold text-[#1C1917] bg-[#EAE2D5] hover:bg-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl active:scale-95 w-full sm:w-auto"
                >
                  <span>{displayData.buttonText || 'استكشف الآن'}</span>
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
