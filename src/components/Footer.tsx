import React from 'react';
import { MessageCircle, MapPin, ShieldCheck, Truck, Truck as Ship, Banknote, Landmark, ArrowUpLeft, HelpCircle, PackageSearch } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { Category } from '../types/furniture';
import { STORE_PHONE_INTL, STORE_WHATSAPP_HANDLE } from '../utils/jordanLocations';

interface FooterProps {
  categories: Category[];
  currentCategoryData?: Category | null;
  onSelectCategory: (cat: string) => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
}

const trust = [
  { Icon: Truck, title: 'توصيل لكل المحافظات', sub: '24 – 48 ساعة' },
  { Icon: ShieldCheck, title: 'معاينة قبل الدفع', sub: 'عند وصول الطلب' },
  { Icon: Banknote, title: 'الدفع عند الاستلام', sub: 'كاش' },
  { Icon: Landmark, title: 'تحويل CliQ', sub: 'سريع وآمن' },
];

export const Footer: React.FC<FooterProps> = ({
  categories,
  currentCategoryData,
  onSelectCategory,
  onOpenAdmin,
  onOpenTracking,
}) => {
  const aboutText = currentCategoryData && currentCategoryData.id !== 'all'
    ? `تصفح الآن أرقى تشكيلات ${currentCategoryData.name} في دكان 962 — جودة عالية وأسعار منافسة.`
    : 'دكان 962 — وجهتك الأولى للتسوق الشامل: أثاث وديكور، عطور، هدايا ومنتجات لايف ستايل، مختارة بعناية.';

  const sectionTitle = currentCategoryData && currentCategoryData.id !== 'all'
    ? `أقسام ${currentCategoryData.name}`
    : 'الأقسام';

  return (
    <footer className="relative mt-6 border-t border-[var(--sf-border)] bg-[var(--sf-bg-alt)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">

        {/* كتلة العلامة */}
        <div className="pt-12 sm:pt-16 pb-10 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <DukanLogo variant="light" className="h-10 mb-5" />
            <p className="text-[12.5px] leading-[1.95] text-[var(--sf-muted)] max-w-[46ch]">
              {aboutText}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {trust.slice(0, 2).map(({ Icon, title }) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--sf-border)] text-[10.5px] font-semibold text-[var(--sf-muted)]"
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--sf-accent)]" strokeWidth={1.5} />
                  {title}
                </span>
              ))}
            </div>
          </div>

          {/* الأقسام */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--sf-subtle)] mb-5">
              {sectionTitle}
            </h4>
            <ul className="space-y-3">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-[12.5px] transition-colors ${
                      currentCategoryData?.id === cat.id
                        ? 'text-[var(--sf-accent)]'
                        : 'text-[var(--sf-muted)] hover:text-[var(--sf-text)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* خدمة العملاء */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--sf-subtle)] mb-5">
              خدمة العملاء
            </h4>
            <ul className="space-y-3">
              <li>
                <button onClick={onOpenTracking} className="inline-flex items-center gap-2 text-[12.5px] text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition-colors">
                  <PackageSearch className="w-3.5 h-3.5" strokeWidth={1.5} />
                  تتبع الطلب
                </button>
              </li>
              <li>
                <a href={`https://wa.me/${STORE_PHONE_INTL}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[12.5px] text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  واتساب
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 text-[12.5px] text-[var(--sf-muted)]">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  عمّان · الأردن
                </span>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="inline-flex items-center gap-2 text-[12.5px] text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  لوحة التحكم
                </button>
              </li>
            </ul>
          </div>

          {/* التواصل المباشر */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--sf-subtle)] mb-5">
              الطلب المباشر
            </h4>
            <a
              href={`https://wa.me/${STORE_PHONE_INTL}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--sf-text)] border-b border-[var(--sf-accent)] pb-1"
            >
              <span dir="ltr" className="font-mono">{STORE_WHATSAPP_HANDLE}</span>
              <ArrowUpLeft className="w-3.5 h-3.5 text-[var(--sf-accent)] transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
            </a>
            <p className="text-[11px] leading-relaxed text-[var(--sf-subtle)] mt-4">
              يومياً 9 صباحاً — 10 مساءً
            </p>
          </div>
        </div>

        {/* شارات الثقة */}
        <div className="border-t border-[var(--sf-border)] py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trust.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 text-[var(--sf-accent)] shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[var(--sf-text)] truncate">{title}</p>
                <p className="text-[10px] text-[var(--sf-subtle)] truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* كلمة العلامة الكبيرة */}
        <div className="border-t border-[var(--sf-border)] py-8 flex items-end justify-between gap-6">
          <span className="font-mono font-extrabold text-[clamp(1.4rem,4.6vw,3.2rem)] leading-none text-[var(--sf-text)] tracking-[0.06em] opacity-[0.14] select-none">
            DUKAN 962
          </span>
          <span className="hidden sm:block text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--sf-subtle)] pb-1">
            Since 2024
          </span>
        </div>

        {/* السطر الأخير */}
        <div className="border-t border-[var(--sf-border)] py-5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[10.5px] text-[var(--sf-subtle)]">
            حقوق النشر {new Date().getFullYear()} دكان 962 (Dukan 962).
          </p>
          <div className="flex items-center gap-3 text-[10.5px] text-[var(--sf-subtle)]">
            <span className="inline-flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5" strokeWidth={1.5} />
              شحن لكل المناطق
            </span>
            <span aria-hidden="true" className="w-px h-3 bg-[var(--sf-border)]" />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              معاينة قبل الدفع
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
