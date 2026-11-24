import React from 'react';
import { X, ArrowRight, HelpCircle } from 'lucide-react';
import { FAQ } from './FAQ'; // نستخدم مكون الأسئلة الذي صممناه سابقاً

interface FAQPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] overflow-y-auto animate-fade">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1C1815]/90 backdrop-blur-md border-b border-white/10 px-4 py-4 sm:py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center ring-1 ring-[#D4AF37]/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#F3EEE4] font-serif">
              الأسئلة الشائعة وطريقة الطلب
            </h1>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-[#F3EEE4] text-xs font-bold transition-all cursor-pointer"
          >
            <span>رجوع للمتجر</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        <FAQ />
      </div>
    </div>
  );
};
