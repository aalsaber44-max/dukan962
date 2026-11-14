import React from 'react';
import { Home, SearchX, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onGoHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#0B0A09] storefront-theme" data-theme="dark">
      {/* 404 Graphic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#D4B06A]/20 rounded-full blur-3xl animate-pulse" />
        <h1 className="relative text-[120px] sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#E8CC8A] to-[#8A6D2F] leading-none select-none font-serif drop-shadow-2xl">
          404
        </h1>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4B06A] to-transparent opacity-50" />
      </div>

      {/* Message */}
      <div className="max-w-md mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F3EEE4] font-serif mb-3 flex items-center justify-center gap-3">
          <SearchX className="w-8 h-8 text-[#D4B06A]" />
          الصفحة غير موجودة
        </h2>
        <p className="text-sm text-[#A39A8B] leading-relaxed">
          عذراً، يبدو أنك وصلت إلى رابط غير صحيح أو أن هذه الصفحة قد تم نقلها أو حذفها. دعنا نعيدك إلى المكان الصحيح.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onGoHome}
        className="group relative inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] text-sm font-bold shadow-[0_8px_20px_-8px_rgba(212,176,106,0.6)] transition-all duration-300 hover:shadow-[0_12px_25px_-8px_rgba(212,176,106,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
      >
        <Home className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        <span>العودة إلى الصفحة الرئيسية</span>
        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
      </button>
    </div>
  );
};
