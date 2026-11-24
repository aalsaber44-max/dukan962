import React, { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle, Sparkles, Truck } from 'lucide-react';
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

  return (
    <div className="fixed z-30 left-4 bottom-20 sm:left-6 sm:bottom-6 flex flex-col items-center gap-3">
      
      {/* زر العودة للأعلى */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="العودة للأعلى"
        tabIndex={showTop ? 0 : -1}
        title="العودة للأعلى"
        className={`grid place-items-center w-11 h-11 rounded-full bg-[#141210]/85 backdrop-blur-xl ring-1 ring-[#D4AF37]/40 text-[#E8CC75] shadow-soft transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#09090B] active:scale-90 cursor-pointer ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* زر تتبع الطلب */}
      {onOpenTracking && (
        <button
          onClick={onOpenTracking}
          aria-label="تتبع الطلب"
          title="تتبع حالة طلبك"
          className="grid place-items-center w-11 h-11 rounded-full bg-[#141210]/85 backdrop-blur-xl ring-1 ring-[#D4AF37]/40 text-[#E8CC75] shadow-soft transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#09090B] active:scale-90 cursor-pointer"
        >
          <Truck className="w-5 h-5" />
        </button>
      )}

      {/* زر العطور حسب الطلب */}
      <a
        href={customPerfumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اطلب عطرك المخصص"
        title="عطور حسب الطلب"
        className="grid place-items-center w-12 h-12 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#8A6D2F] text-[#09090B] shadow-[0_12px_30px_-8px_rgba(212,175,55,0.65)] transition-all duration-300 hover:scale-110 hover:shadow-[0_16px_36px_-8px_rgba(212,175,55,0.85)] active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
      </a>

      {/* زر الواتساب العام */}
      <a
        href={generalWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        title="تواصل عبر واتساب"
        className="grid place-items-center w-14 h-14 rounded-full bg-gradient-to-b from-[#3DDC84] to-[#1FAF5E] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-110 hover:shadow-[0_16px_36px_-8px_rgba(37,211,102,0.85)] active:scale-95"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
};
