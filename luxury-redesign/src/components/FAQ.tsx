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
      className="w-full bg-[var(--sf-bg)] py-16 sm:py-20 border-t border-[var(--sf-border)]"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--sf-accent-soft)] text-[var(--sf-accent)] mb-4 ring-1 ring-[var(--sf-accent)]">
            <HelpCircle className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--sf-text)] font-serif tracking-tight">
            الأسئلة الشائعة
          </h2>

          <p className="text-sm text-[var(--sf-muted)] mt-2">
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
                    ? 'bg-[var(--sf-panel)] border-[var(--sf-border-strong)] shadow-[0_0_20px_rgba(212,176,106,0.05)]'
                    : 'bg-[var(--sf-surface)] border-[var(--sf-border)] hover:border-[var(--sf-border-strong)]'
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
                        ? 'text-[var(--sf-accent)]'
                        : 'text-[var(--sf-text)] group-hover:text-[var(--sf-accent)]'
                    }`}
                  >
                    {faq.question}
                  </span>

                  <span
                    className={`grid place-items-center shrink-0 w-8 h-8 rounded-full transition-all duration-300 ${
                      isOpen
                        ? 'bg-[var(--sf-accent)] text-[var(--sf-accent-contrast)] rotate-180'
                        : 'bg-white/5 text-[var(--sf-muted)] group-hover:bg-[var(--sf-accent)]/20'
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
                    <p className="px-5 pb-5 text-xs sm:text-sm text-[var(--sf-muted)] leading-relaxed">
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
