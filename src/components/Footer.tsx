import React from 'react';
import { MessageCircle, MapPin, ShieldCheck } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { Category } from '../types/furniture';
import { STORE_PHONE_INTL, STORE_WHATSAPP_HANDLE } from '../utils/jordanLocations';

interface FooterProps {
  categories: Category[]; 
  currentCategoryData?: Category | null; 
  onSelectCategory: (cat: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  categories, 
  currentCategoryData, 
  onSelectCategory, 
  onOpenAdmin 
}) => {
  
  const aboutText = currentCategoryData && currentCategoryData.id !== 'all' 
    ? `تصفح الآن أرقى تشكيلات ${currentCategoryData.name} في دكان 962. نوفر لك منتجات بجودة عالية وأسعار منافسة.`
    : "متخصصون في بيع أرقى تشكيلات الأثاث، الأحذية، العطور، وزينة رمضان. نوفر لك تجربة تسوق مميزة بأسعار منافسة وجودة عالية.";

  const sectionTitle = currentCategoryData && currentCategoryData.id !== 'all'
    ? `تصفح أقسام ${currentCategoryData.name}`
    : "أقسام المتجر";

  return (
    <footer className="relative bg-[#080706] text-[#F3EEE4] pt-16 pb-8 mt-10">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 gold-rule" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          
          {/* Column 1: About */}
          <div>
            <div className="mb-4">
              <DukanLogo variant="light" className="h-12" />
            </div>
            <p className="text-xs text-[#A39A8B] leading-relaxed mb-4">
              {aboutText}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7FD1A0] bg-[#7FD1A0]/10 px-3.5 py-2 rounded-full w-fit ring-1 ring-[#7FD1A0]/25">
              <ShieldCheck className="w-4 h-4" />
              <span>التوصيل متاح لجميع محافظات المملكة</span>
            </div>
          </div>

          {/* Column 2: Dynamic Categories Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">{sectionTitle}</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-xs transition-colors ${
                      currentCategoryData?.id === cat.id 
                        ? 'text-[#E8CC8A] font-bold' 
                        : 'text-[#A39A8B] hover:text-[#E8CC8A]'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Trust */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">التواصل والطلب المباشر</h4>
            <div className="space-y-3">
              <p className="text-xs text-[#A39A8B] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4B06A]" />
                <span>عمان - المملكة الأردنية الهاشمية</span>
              </p>
              
              {/* 💡 تم إزالة رقم الهاتف هنا واستبداله بحساب الواتساب فقط */}
              <div className="pt-2">
                <a 
                  href={`https://wa.me/${STORE_PHONE_INTL}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] px-5 py-2.5 rounded-full text-xs font-bold shadow-gold transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل عبر واتساب: {STORE_WHATSAPP_HANDLE}</span>
                </a>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] text-[#8A8173] mb-2">✨ يوجد معاينة عند وصول الطلب قبل الدفع</p>
                <p className="text-[10px] text-[#8A8173]">فعال: شحن سريع لجميع المناطق</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#8A8173]">
            © {new Date().getFullYear()} دكان 962 (Dukan 962). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#8A8173]">
            <button onClick={onOpenAdmin} className="hover:text-white transition-colors">لوحة التحكم</button>
            <span>·</span>
            <span>شحن لجميع المناطق</span>
            <span>·</span>
            <span>الدفع كاش أو كليك</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
