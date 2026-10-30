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

  const badge = String(displayData.badgeText || 'يوجد معاينة').replace(/^[^\p{L}\p{N}]+/u, '');

  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.03]);

  return (
    <section className="relative bg-[#FBFAF7]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-6 sm:pb-12">
        <div
          ref={frameRef}
          className="relative isolate overflow-hidden rounded-[22px] sm:rounded-[32px] w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-[#14110F] shadow-lift ring-1 ring-black/5"
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
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </picture>
          </motion.div>

          {/* 💡 التدرج اللوني الذكي: أسود من اليمين، شفاف من الشمال، عشان ميغطيش على الصورة */}
          <div className="absolute inset-0 z-10 bg-gradient-to-l from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* الكلام بقى على الصورة مباشرة بدون صندوق زجاجي */}
          <div className="absolute inset-0 z-20 flex items-center p-5 sm:p-10 lg:p-16">
            <motion.div
              key={displayData.title}
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-2xl text-white"
            >
              <motion.div variants={item} className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-300 drop-shadow-md">{badge}</span>
              </motion.div>

              <motion.h1
                variants={item}
                className="text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2] mb-3 sm:mb-5 text-balance font-serif drop-shadow-lg"
              >
                {displayData.title}
              </motion.h1>

              <motion.p
                variants={item}
                className="text-sm sm:text-lg text-white/90 leading-relaxed mb-6 sm:mb-8 max-w-xl line-clamp-2 sm:line-clamp-3 drop-shadow-md font-medium"
              >
                {displayData.description}
              </motion.p>

              <motion.div variants={item} className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={onExploreClick}
                  className="group/btn relative overflow-hidden inline-flex items-center gap-2 h-11 sm:h-14 px-6 sm:px-8 rounded-full bg-[#E3C16F] text-[#14110F] text-sm sm:text-base font-bold shadow-xl transition-all duration-300 hover:bg-white hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                >
                  <span className="relative">{displayData.buttonText || 'استكشف الآن'}</span>
                  <ArrowLeft className="relative w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                </button>

                <span className="hidden sm:inline-flex items-center gap-2 h-14 px-5 rounded-full text-sm font-semibold text-white bg-black/30 ring-1 ring-white/20 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  يوجد معاينة عند وصول الطلب
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* شريط المميزات */}
        <div className="mt-4 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl ring-1 ring-black/[0.06] shadow-soft overflow-hidden">
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
