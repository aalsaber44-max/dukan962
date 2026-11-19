import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FAQ_POLICIES } from '../data/storePolicies';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="w-full bg-[#0B0A09] py-16 sm:py-20 border-t border-white/5"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#D4B06A]/10 text-[#D4B06A] mb-4 ring-1 ring-[#D4B06A]/30">
            <HelpCircle className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3EEE4] font-serif tracking-tight">
            الأسئلة الشائعة
          </h2>

          <p className="text-sm text-[#A39A8B] mt-2">
            كل ما تحتاج معرفته عن الطلب، التوصيل، والدفع في دكان 962.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_POLICIES.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#1C1815] border-[#D4B06A]/40 shadow-[0_0_20px_rgba(212,176,106,0.05)]'
                    : 'bg-[#141210] border-white/10 hover:border-[#D4B06A]/30'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 text-right cursor-pointer gap-4"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span
                    className={`text-sm font-bold transition-colors duration-300 ${
                      isOpen
                        ? 'text-[#E8CC8A]'
                        : 'text-[#F3EEE4] group-hover:text-[#E8CC8A]'
                    }`}
                  >
                    {faq.question}
                  </span>

                  <span
                    className={`grid place-items-center shrink-0 w-8 h-8 rounded-full transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#D4B06A] text-[#0B0A09] rotate-180'
                        : 'bg-white/5 text-[#A39A8B] group-hover:bg-[#D4B06A]/20'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-xs sm:text-sm text-[#B9B0A0] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
