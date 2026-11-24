import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowDown, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { Category } from '../types/furniture';

interface HeroProps {
  onExploreClick: () => void;
  categoryData?: Category | null;
}

const facts = [
  { Icon: Truck, label: 'توصيل لكل المحافظات', value: '24 – 48 ساعة' },
  { Icon: Wallet, label: 'الدفع', value: 'كاش أو كليك' },
  { Icon: ShieldCheck, label: 'المعاينة', value: 'قبل الدفع' },
];

export const Hero: React.FC<HeroProps> = ({ onExploreClick, categoryData }) => {
  const fallback = {
    title: 'دكان 962.. وجهتك الأولى للتسوق الشامل',
    description:
      'أثاث وديكور، عطور، هدايا ومنتجات لايف ستايل — مختارة بعناية لتليق ببيتك وأسلوبك، مع المعاينة عند الوصول والتوصيل لكل المحافظات.',
    bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1800&auto=format&fit=crop',
    buttonText: 'استكشف التشكيلة',
    name: 'DUKAN 962',
  };

  const data: any = categoryData || fallback;
  const image = data.bannerImage || data.image || fallback.bannerImage;

  const frameRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  // بارالاكس خفيف — يعمل فقط على الشاشات الكبيرة ويحترم تقليل الحركة
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || window.innerWidth < 1024) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const node = frameRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
        setShift(Math.round(progress * 46));
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{ background: 'radial-gradient(65% 100% at 70% 0%, var(--sf-accent-soft), transparent 72%)' }}
      />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-14 lg:min-h-[calc(100svh-5.5rem)] py-8 lg:py-16">

          {/* ── العمود التحريري ── */}
          <div className="lg:col-span-5 order-2 lg:order-1" data-reveal>
            <div className="flex items-center gap-3 mb-6 lg:mb-9">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--sf-subtle)]">01</span>
              <span aria-hidden="true" className="h-px w-10 bg-[var(--sf-border-strong)]" />
              <span className="text-[10px] font-semibold tracking-[0.16em] text-[var(--sf-muted)] uppercase">
                Dukan 962 — Amman
              </span>
            </div>

            <h1 className="sf-mega text-[var(--sf-text)] text-balance mb-5 lg:mb-7">
              {data.title}
            </h1>

            <p className="text-[13.5px] sm:text-[15px] leading-[2] text-[var(--sf-muted)] max-w-[38ch] mb-8 lg:mb-10">
              {data.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onExploreClick}
                className="sf-btn sf-btn-gold group/cta w-full sm:w-auto px-7"
              >
                <span>{data.buttonText || 'استكشف التشكيلة'}</span>
                <ArrowLeft className="w-4 h-4 transition-transform duration-500 group-hover/cta:-translate-x-1" strokeWidth={1.5} />
              </button>

              {/* كبسولة زجاجية عائمة */}
              <span className="sf-quick inline-flex items-center justify-center gap-2 h-[2.9rem] px-4 rounded-full border border-[var(--sf-border)] bg-[var(--sf-surface)] text-[11.5px] font-semibold text-[var(--sf-text)] shadow-soft">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--sf-accent)] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--sf-accent)]" />
                </span>
                {(() => {
                  const badge = String(data.badgeText || 'معاينة عند الاستلام').replace(/^[^\p{L}\p{N}]+/u, '');
                  return badge;
                })()}
              </span>
            </div>

            {/* مؤشرات ثقة أفقية */}
            <div className="mt-10 lg:mt-14 pt-6 border-t border-[var(--sf-border)] grid grid-cols-3 gap-4">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="min-w-0">
                  <Icon className="w-4 h-4 text-[var(--sf-accent)] mb-2" strokeWidth={1.5} />
                  <p className="text-[10px] text-[var(--sf-subtle)] truncate">{label}</p>
                  <p className="text-[11px] sm:text-[12px] font-semibold text-[var(--sf-text)] truncate mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── العمود البصري ── */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div
              ref={frameRef}
              className="relative overflow-hidden rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-bg-alt)] aspect-[16/11] sm:aspect-[16/12] lg:aspect-[16/11]"
            >
              <div className="absolute inset-0 sf-plate" />
              <img
                src={image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-[0.12] scale-110"
              />
              <img
                key={image}
                src={image}
                alt={data.title || data.name}
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain p-2 sm:p-5 transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translate3d(0, -${shift}px, 0)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

              {/* إطار داخلي رفيع */}
              <div aria-hidden="true" className="absolute inset-2 sm:inset-4 border border-white/20 pointer-events-none" />

              {/* بطاقة زجاجية سفلية */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 sm:max-w-[260px]">
                <div className="sf-quick rounded-full border border-white/25 bg-black/35 px-4 py-2.5 flex items-center justify-between gap-3 whitespace-nowrap">
                  <span className="text-[11px] font-semibold text-white/90">تشكيلة الموسم</span>
                  <span className="h-3 w-px bg-white/25" />
                  <span className="text-[11px] font-mono font-bold text-[var(--sf-accent-strong)]">
                    {data.name && typeof data.name === 'string' && /^\d|DUKAN/i.test(data.name) ? 'CURATED' : 'مختارة'}
                  </span>
                </div>
              </div>

              {/* تسمية عمودية على الحافة */}
              <span className="hidden lg:block absolute top-6 left-6 sf-vert text-[9px] font-semibold tracking-[0.35em] text-white/55 uppercase">
                Lifestyle · Home · Gifts
              </span>
            </div>

            {/* مؤشر التمرير */}
            <button
              onClick={onExploreClick}
              className="hidden lg:flex items-center gap-3 mt-6 text-[var(--sf-subtle)] hover:text-[var(--sf-accent)] transition-colors cursor-pointer"
              aria-label="تابع للأسفل"
            >
              <span className="relative block h-10 w-px bg-[var(--sf-border)] overflow-hidden">
                <span className="absolute inset-x-0 -top-2 h-2 bg-[var(--sf-accent)] sf-scroll-dot" />
              </span>
              <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase">Scroll</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
