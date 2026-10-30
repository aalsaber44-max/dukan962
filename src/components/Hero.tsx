import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';
import { Category } from '../types/furniture';

interface HeroProps {
  onExploreClick: () => void;
  categoryData?: Category | null;
}

const perks = [
  { Icon: ShieldCheck, title: 'جودة مضمونة', sub: 'خامات نخب أول' },
  { Icon: Truck, title: 'توصيل شامل', sub: 'لجميع المحافظات' },
  { Icon: Clock, title: 'توصيل سريع', sub: 'خلال 24-48 ساعة' },
  { Icon: Sparkles, title: 'ألوان حصرية', sub: 'تشكيلات متنوعة' },
];

// حركة دخول واحدة منسقة للنصوص (تُعاد عند تغيير القسم)
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export const Hero: React.FC<HeroProps> = ({ onExploreClick, categoryData }) => {
  const defaultData = {
    title: 'دكان 962.. وجهتك الأولى للأثاث والعطور والأحذية',
    description: 'أرقى التصاميم والمنتجات الفاخرة بجودة عالية وأسعار منافسة. تسوق الآن واستمتع بخدمة المعاينة عند الوصول والتوصيل لجميع المحافظات.',
    bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
    mobileBannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop',
    buttonText: 'استكشف تشكيلاتنا الآن',
    badgeText: '✨ جودة تستحق الاقتناء',
    name: 'دكـان 962',
  };

  const displayData: any = categoryData || defaultData;
  const desktopBanner = displayData.bannerImage || displayData.image || defaultData.bannerImage;
  const mobileBanner = displayData.mobileBannerImage || desktopBanner;

  // نحذف الإيموجي من بداية الشارة ليبدو النص أنظف
  const badge = String(displayData.badgeText || 'يوجد معاينة').replace(/^[^\p{L}\p{N}]+/u, '');

  // تكبير خفيف جداً للصورة مع التمرير (بدون إزاحة حتى لا يُقص نص البنر)
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);

  return (
    <section className="relative bg-[#FBFAF7]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-6 sm:pb-12">
        <div
          ref={frameRef}
          className="relative isolate overflow-hidden rounded-[22px] sm:rounded-[32px] w-full aspect-[4/3] sm:aspect-[16/9] bg-[#14110F] shadow-lift ring-1 ring-black/5"
        >
          <motion.div style={reduceMotion ? undefined : { scale }} className="absolute inset-0 will-change-transform">
            <picture key={desktopBanner}>
              <source media="(max-width: 639px)" srcSet={mobileBanner} />
              <source media="(min-width: 640px)" srcSet={desktopBanner} />
              <img
                src={desktopBanner}
                alt={displayData.title || displayData.name}
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-top animate-kenburns"
              />
            </picture>
          </motion.div>

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 z-20 p-2.5 sm:p-8 lg:p-10">
            <motion.div
              key={displayData.title}
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-2xl rounded-2xl sm:rounded-[28px] bg-black/30 backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/15 shadow-glass p-3.5 sm:p-8 text-white"
            >
              <motion.div variants={item} className="flex items-center gap-2 mb-2 sm:mb-4">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-full w-full bg-emerald-300" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-white/90">{badge}</span>
              </motion.div>

              <motion.h1
                variants={item}
                className="text-lg sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.25] mb-1.5 sm:mb-4 text-balance font-serif"
              >
                {displayData.title}
              </motion.h1>

              <motion.p
                variants={item}
                className="text-[11px] sm:text-base text-white/80 leading-relaxed mb-3 sm:mb-7 max-w-xl line-clamp-2 sm:line-clamp-3"
              >
                {displayData.description}
              </motion.p>

              <motion.div variants={item} className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onExploreClick}
                  className="group/btn relative overflow-hidden inline-flex items-center gap-2 h-9 sm:h-12 px-4 sm:px-6 rounded-full bg-white text-[#14110F] text-[11px] sm:text-sm font-bold shadow-[0_10px_30px_-10px_rgba(255,255,255,0.55)] transition-all duration-300 hover:shadow-[0_14px_36px_-10px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#E3C16F]/50 to-transparent"
                  />
                  <span className="relative">{displayData.buttonText || 'استكشف الآن'}</span>
                  <ArrowLeft className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                </button>

                <span className="hidden sm:inline-flex items-center gap-2 h-12 px-4 rounded-full text-xs font-semibold text-white/90 bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  يوجد معاينة عند وصول الطلب
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* شريط المميزات: بطاقة زجاجية واحدة بفواصل رفيعة */}
        <div className="mt-3 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl ring-1 ring-black/[0.06] shadow-soft overflow-hidden">
          {perks.map(({ Icon, title, sub }, i) => (
            <div
              key={title}
              className={`group/perk flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-5 transition-colors duration-300 hover:bg-[#FBF7EE] ${
                i % 2 === 0 ? 'border-l' : ''
              } ${i < 2 ? 'border-b lg:border-b-0' : ''} ${i !== 3 ? 'lg:border-l' : 'lg:border-l-0'} border-black/[0.06]`}
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F7EFD9] to-[#EEDFB8] text-[#8C6D1F] grid place-items-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-500 group-hover/perk:scale-110 group-hover/perk:-rotate-6">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm font-bold text-[#14110F]">{title}</p>
                <p className="text-[10px] sm:text-xs text-[#78716C] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
