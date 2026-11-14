import React, { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle, Sparkles } from 'lucide-react';
import { STORE_PHONE_INTL } from '../utils/jordanLocations';

export const FloatingActions: React.FC = () => {
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
    // 💡 تم تغيير bottom-4 إلى bottom-20 في الموبايل لكي لا يتداخل مع الشريط السفلي
    <div className="fixed z-30 left-4 bottom-20 sm:left-6 sm:bottom-6 flex flex-col items-center gap-3">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="العودة للأعلى"
        tabIndex={showTop ? 0 : -1}
        className={`grid place-items-center w-11 h-11 rounded-full bg-[#141210]/85 backdrop-blur-xl ring-1 ring-[#D4B06A]/40 text-[#E8CC8A] shadow-soft transition-all duration-300 hover:bg-[#D4B06A] hover:text-[#0B0A09] active:scale-90 cursor-pointer ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <a
        href={customPerfumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اطلب عطرك المخصص"
        title="عطور حسب الطلب (Custom Made)"
        className="group relative grid place-items-center w-12 h-12 rounded-full bg-gradient-to-b from-[#D4B06A] to-[#8A6D2F] text-[#0B0A09] shadow-[0_12px_30px_-8px_rgba(212,176,106,0.65)] transition-all duration-300 hover:scale-110 hover:shadow-[0_16px_36px_-8px_rgba(212,176,106,0.85)] active:scale-95"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#1C1815] text-[#E8CC8A] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#D4B06A]/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          اطلب عطرك المخصص ✨
        </span>
      </a>

      <a
        href={generalWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        className="grid place-items-center w-14 h-14 rounded-full bg-gradient-to-b from-[#3DDC84] to-[#1FAF5E] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-110 hover:shadow-[0_16px_36px_-8px_rgba(37,211,102,0.85)] active:scale-95"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
};
