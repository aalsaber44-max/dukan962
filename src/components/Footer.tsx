import React from 'react';
import { Phone, MessageCircle, MapPin, ShieldCheck } from 'lucide-react';
import { DukanLogo } from './DukanLogo';
import { Category } from '../types/furniture';

interface FooterProps {
  categories: Category[]; // 💡 استقبال الأقسام من App.tsx
  onSelectCategory: (cat: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, onSelectCategory, onOpenAdmin }) => {
  return (
    <footer className="bg-[#1C1917] text-[#EDE8E0] pt-12 pb-6 border-t border-[#2C2825]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          
          {/* Column 1: About */}
          <div>
            <div className="mb-4">
              <DukanLogo variant="light" className="h-12" />
            </div>
            <p className="text-xs text-[#A8A29E] leading-relaxed mb-4">
              متخصصون في بيع أرقى تشكيلات الأثاث، الأحذية، العطور، وزينة رمضان. نوفر لك تجربة تسوق مميزة بأسعار منافسة وجودة عالية.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#A7F3D0] bg-[#2E5339]/50 px-3 py-2 rounded-lg w-fit border border-[#C5DEC8]/20">
              <ShieldCheck className="w-4 h-4" />
              <span>التوصيل متاح لجميع محافظات المملكة</span>
            </div>
          </div>

          {/* Column 2: Dynamic Categories Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">أقسام المتجر</h4>
            <ul className="space-y-2">
              {/* 💡 هنا السحر: بنقرأ الأقسام من السحابة ونعرضها كروابط */}
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-[#A8A29E] hover:text-[#D4AF37] transition-colors"
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
              <p className="text-xs text-[#A8A29E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8C6D46]" />
                <span>عمان - المملكة الأردنية الهاشمية</span>
              </p>
              {/* 💡 الأرقام دي وهمية زي ما قلت، بغيرها لما العميل يعطيك الأرقام الحقيقية */}
              <p className="text-xs text-[#A8A29E] flex items-center gap-2 font-mono" dir="ltr">
                <Phone className="w-4 h-4 text-[#8C6D46]" />
                <span>+962 79 000 0000</span>
              </p>
              <div className="pt-2">
                <a 
                  href="https://wa.me/962790000000" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 bg-[#2E5339] hover:bg-[#1E3826] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب للطلب والاستفسار</span>
                </a>
              </div>
              <div className="mt-4 pt-4 border-t border-[#2C2825]">
                <p className="text-[10px] text-[#78716C] mb-2">✨ يوجد معاينة عند وصول الطلب قبل الدفع</p>
                <p className="text-[10px] text-[#78716C]">فعال: شحن سريع لجميع المناطق</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#2C2825] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#78716C]">
            © {new Date().getFullYear()} دكان 962 (Dukan 962). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#78716C]">
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
