import React from 'react';
import { motion } from 'motion/react';
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
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
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
  const bannerImage = displayData.bannerImage || displayData.image || defaultData.bannerImage;
  const badge = String(displayData.badgeText || 'يوجد معاينة').replace(/^[^\p{L}\p{N}]+/u, '');

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 sm:pb-14">
        {/* إطار البنر: حافة ذهبية رفيعة متدرجة */}
        <div className="relative rounded-[24px] sm:rounded-[34px] p-px bg-gradient-to-b from-[#D4B06A]/50 via-white/10 to-white/5 shadow-lift">
          <div className="relative isolate overflow-hidden rounded-[23px] sm:rounded-[33px] w-full aspect-[4/3] sm:aspect-[16/9] bg-[#0B0A09]">
            {/* خلفية مموهة + الصورة كاملة بدون قص */}
            <img
              src={bannerImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
            />
            <img
              key={bannerImage}
              src={bannerImage}
              alt={displayData.title || displayData.name}
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain z-10 animate-kenburns"
            />

            {/* تعتيم من جهة النص + تعتيم سفلي ناعم */}
            <div className="absolute inset-0 z-10 bg-gradient-to-l from-[#0B0A09]/95 via-[#0B0A09]/45 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 z-10 bg-gradient-to-t from-[#0B0A09]/80 to-transparent pointer-events-none" />

            <div className="absolute inset-0 z-20 flex items-center p-5 sm:p-10 lg:p-16">
              <motion.div
                key={displayData.title}
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-2xl text-[#F3EEE4]"
              >
                <motion.div variants={item} className="flex items-center gap-2.5 mb-3 sm:mb-5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8CC8A] opacity-70 animate-ping" />
                    <span className="relative inline-flex rounded-full h-full w-full bg-[#E8CC8A]" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#E8CC8A]">{badge}</span>
                </motion.div>

                <motion.h1
                  variants={item}
                  className="text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2] mb-3 sm:mb-5 text-balance font-serif"
                >
                  {displayData.title}
                </motion.h1>

                <motion.div variants={item} aria-hidden="true" className="w-16 sm:w-24 h-px mb-3 sm:mb-5 bg-gradient-to-l from-[#D4B06A] to-transparent" />

                <motion.p
                  variants={item}
                  className="text-sm sm:text-lg text-[#F3EEE4]/75 leading-relaxed mb-6 sm:mb-9 max-w-xl line-clamp-2 sm:line-clamp-3"
                >
                  {displayData.description}
                </motion.p>

                <motion.div variants={item} className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={onExploreClick}
                    className="group/btn relative overflow-hidden inline-flex items-center gap-2 h-11 sm:h-14 px-6 sm:px-8 rounded-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] text-sm sm:text-base font-bold shadow-gold transition-all duration-300 hover:shadow-[0_16px_40px_-10px_rgba(232,204,138,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    />
                    <span className="relative">{displayData.buttonText || 'استكشف الآن'}</span>
                    <ArrowLeft className="relative w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                  </button>

                  <span className="hidden sm:inline-flex items-center gap-2 h-14 px-5 rounded-full text-sm font-semibold text-[#F3EEE4] bg-white/[0.06] ring-1 ring-white/15 backdrop-blur-md">
                    <ShieldCheck className="w-5 h-5 text-[#E8CC8A]" />
                    يوجد معاينة عند وصول الطلب
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* شريط المميزات: بطاقة زجاجية داكنة بفواصل رفيعة */}
        <div className="mt-4 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 bg-white/[0.03] backdrop-blur-xl rounded-2xl sm:rounded-3xl ring-1 ring-white/10 shadow-soft overflow-hidden">
          {perks.map(({ Icon, title, sub }, i) => (
            <div
              key={title}
              className={`group/perk flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-5 transition-colors duration-300 hover:bg-white/[0.04] ${
                i % 2 === 0 ? 'border-l' : ''
              } ${i < 2 ? 'border-b lg:border-b-0' : ''} ${i !== 3 ? 'lg:border-l' : 'lg:border-l-0'} border-white/10`}
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D4B06A]/25 to-[#D4B06A]/5 ring-1 ring-[#D4B06A]/30 text-[#E8CC8A] grid place-items-center shrink-0 transition-transform duration-500 group-hover/perk:scale-110 group-hover/perk:-rotate-6">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm font-bold text-[#F3EEE4]">{title}</p>
                <p className="text-[10px] sm:text-xs text-[#A39A8B] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
