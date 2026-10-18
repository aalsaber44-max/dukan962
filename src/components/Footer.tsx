import React from 'react';
import { Phone, MapPin, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { DukanLogo } from './DukanLogo';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-[#1C1917] text-[#D6D0C7] pt-16 pb-12 border-t border-[#292524]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#322E2B]">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="cursor-pointer hover:opacity-90 transition-opacity text-right"
              title="دكان 962"
            >
              <DukanLogo variant="light" className="h-10" />
            </button>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              متخصصون في بيع أرقى طاولات الوسط، طاولات الشاشات الفاخرة، ومدافئ الديكور النارية المصنعة من خشب تايلندي ثقيل بأعلى معايير المتانة.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#E8F5E9]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>التوصيل متاح لجميع محافظات المملكة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              أقسام الطاولات
            </h4>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li><a href="#catalog" className="hover:text-white transition-colors">طاولات وسط وصالون مضلعة</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">طاولات شاشة وتلفزيون مودرن</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">طاولات شاشة مع مدفأة ديكور</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">طاولات خدمة وضيافة 3 قطع</a></li>
            </ul>
          </div>

          {/* Guarantee & Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              الضمان والشحن
            </h4>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#CBB28D] shrink-0" />
                <span className="font-semibold text-white">✨ يوجد معاينة عند وصول الطلب قبل الدفع</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#CBB28D] shrink-0" />
                <span>توصيل لباب بيتك لجميع المحافظات</span>
              </li>
              <li><span>ضمان شامل ضد عيوب التصنيع</span></li>
              <li><span>الدفع نقداً عند الاستلام</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              التواصل والطلب المباشر
            </h4>
            <div className="space-y-2.5 text-xs text-[#A8A29E]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#CBB28D] shrink-0" />
                <span>عمان - المملكة الأردنية الهاشمية</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#CBB28D] shrink-0" />
                <span className="font-mono" dir="ltr">+962 79 000 0000</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/962790000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 px-3.5 bg-[#2E5339] hover:bg-[#1E3826] text-white rounded-xl text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>محادثة واتساب للطلب والاستفسار</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <p>© 2026 دكان 962 (Dukan 962). جميع الحقوق محفوظة للمملكة الأردنية الهاشمية.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>خشب تايلندي ثقيل</span>
            <span aria-hidden="true">·</span>
            <span>تصميم عصري فاخر</span>
            <span aria-hidden="true">·</span>
            <span>الدفع بالدينار الأردني</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
