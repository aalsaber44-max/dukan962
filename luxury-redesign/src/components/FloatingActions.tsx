import React, { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { DeliveryIcon, PerfumeFlaconIcon } from './LuxuryIcons';
import { STORE_PHONE_INTL } from '../utils/jordanLocations';

interface FloatingActionsProps {
  onOpenTracking?: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ onOpenTracking }) => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const generalWhatsAppUrl = `https://wa.me/${STORE_PHONE_INTL}?text=${encodeURIComponent(
    'مرحباً دكان 962 (Dukan 962)، أرغب بالاستفسار عن منتج.'
  )}`;

  const customPerfumeUrl = `https://wa.me/${STORE_PHONE_INTL}?text=${encodeURIComponent(
    'مرحباً دكان 962،\nأرغب في طلب عطر مخصص (Custom Made).\n\nتفاصيل طلبي:\n- اسم البراند: \n- نوع العطر: \n- الحجم المطلوب: \n\nأرجو إبلاغي بالسعر ووقت التجهيز. شكراً لكم!'
  )}`;

  /* Frosted glass surface with a refined 1px gold hairline */
  const fab =
    'group relative grid place-items-center rounded-full border border-[var(--sf-border-strong)] bg-[var(--sf-glass)] backdrop-blur-xl text-[var(--sf-accent)] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)] transition-all duration-300 hover:border-[var(--sf-accent)] hover:bg-[var(--sf-accent-soft)] hover:text-[var(--sf-accent-strong)] active:scale-95 cursor-pointer';

  const softBtn = `${fab} w-9 h-9`;
  const primaryBtn = `${fab} w-11 h-11 sm:w-12 sm:h-12`;

  return (
    <div className="fixed z-30 left-3 sm:left-6 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-8 flex flex-col items-center gap-2.5">

      {/* زر العودة للأعلى */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="العودة للأعلى"
        tabIndex={showTop ? 0 : -1}
        title="العودة للأعلى"
        className={`${softBtn} ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <ArrowUp className="w-[15px] h-[15px]" strokeWidth={1.45} />
      </button>

      {/* زر تتبع الطلب */}
      {onOpenTracking && (
        <button onClick={onOpenTracking} aria-label="تتبع الطلب" title="تتبع حالة طلبك" className={softBtn}>
          <DeliveryIcon className="w-4 h-4" strokeWidth={1.3} />
        </button>
      )}

      {/* عطور حسب الطلب — عطر مخصص */}
      <a
        href={customPerfumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اطلب عطرك المخصص"
        title="عطور حسب الطلب"
        className={primaryBtn}
      >
        <PerfumeFlaconIcon className="w-[21px] h-[21px]" strokeWidth={1.25} />
      </a>

      {/* زر الواتساب العام */}
      <a
        href={generalWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        title="تواصل عبر واتساب"
        className={primaryBtn}
      >
        <MessageCircle className="w-[19px] h-[19px]" strokeWidth={1.35} />
      </a>
    </div>
  );
};
