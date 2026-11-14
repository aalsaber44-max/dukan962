
import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'كيف يمكنني تأكيد طلبي؟',
    a: 'يمكنك تأكيد الطلب مباشرة من خلال الموقع عبر الضغط على "إتمام الطلب"، أو عبر التواصل معنا مباشرة عبر الواتساب لتجهيز طلبك يدوياً.'
  },
  {
    q: 'ما هي مدة التوصيل المتوقعة؟',
    a: 'يستغرق التوصيل عادة من 24 إلى 48 ساعة داخل عمان، ومن 2 إلى 4 أيام عمل لبقية المحافظات، حسب توفر المنتج والكمية المطلوبة.'
  },
  {
    q: 'هل يوجد خدمة معاينة قبل الدفع؟',
    a: 'نعم، نوفر خدمة فحص ومعاينة المنتج بالكامل عند وصول المندوب لباب منزلك وقبل الاستلام والدفع، لضمان رضاك التام.'
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'نوفر الدفع النقدي (كاش) عند الاستلام بعد المعاينة، بالإضافة إلى خيار التحويل المالي عبر تطبيق كليك (CliQ).'
  },
  {
    q: 'هل يمكنني إرجاع أو استبدال المنتج؟',
    a: 'نظراً لطبيعة الأثاث، يمكنك رفض المنتج أثناء المعاينة (قبل الدفع) إذا لم يطابق الوصف. لا يوجد إرجاع بعد الدفع إلا في حالات الضمان.'
  },

  // الأسئلة الجديدة

  {
    q: 'كيف يمكنني تتبع طلبي بعد تأكيده؟',
    a: 'يمكنك استخدام صفحة تتبع الطلبات في الموقع وإدخال رقم طلبك لمعرفة آخر حالة للطلب. احتفظ برقم الطلب بعد إتمام عملية الشراء.'
  },
  {
    q: 'هل رسوم التوصيل مشمولة في سعر المنتج؟',
    a: 'رسوم التوصيل تُحسب بشكل منفصل حسب منطقة التوصيل وقيمة الطلب، ويمكنك معرفة إجمالي المبلغ شاملاً التوصيل قبل تأكيد طلبك.'
  },
  {
    q: 'هل يمكنني شراء أكثر من منتج في طلب واحد؟',
    a: 'بالتأكيد! يمكنك إضافة عدة منتجات إلى سلة التسوق، وتعديل الكميات قبل إتمام الطلب، ثم تأكيد جميع المنتجات ضمن طلب واحد.'
  },
  {
    q: 'هل يمكنني تعديل طلبي بعد إرساله؟',
    a: 'إذا رغبت بتغيير الكمية أو المنتج أو عنوان التوصيل، تواصل معنا عبر الواتساب في أسرع وقت. إمكانية التعديل تعتمد على حالة الطلب ومرحلة تجهيزه.'
  },
  {
    q: 'كيف أعرف إذا كان المنتج متوفراً؟',
    a: 'يمكنك مراجعة حالة توفر المنتج في صفحة تفاصيله. وإذا كنت غير متأكد من الكمية المتاحة، تواصل معنا قبل إتمام الطلب للتأكد.'
  },
  {
    q: 'هل صور المنتجات ومواصفاتها دقيقة؟',
    a: 'نحرص على عرض صور ومعلومات تساعدك على معرفة تفاصيل المنتج قبل الشراء. ننصحك أيضاً بقراءة الوصف والمقاسات والألوان المتاحة، ويمكنك التواصل معنا للاستفسار عن أي تفصيل.'
  },
  {
    q: 'ماذا أفعل إذا وصلني منتج تالف أو غير مطابق للوصف؟',
    a: 'يرجى معاينة المنتج عند وصول المندوب وقبل الدفع. إذا لاحظت وجود تلف أو اختلاف عن الوصف، يمكنك رفض الاستلام وإبلاغ المندوب بالمشكلة.'
  },
  {
    q: 'هل يمكنني الاستفسار عن المنتج قبل شرائه؟',
    a: 'بكل تأكيد! يمكنك التواصل معنا عبر الواتساب للاستفسار عن السعر أو المقاسات أو الألوان أو أي تفاصيل أخرى قبل اتخاذ قرار الشراء.'
  },
  {
    q: 'هل أستطيع الطلب من خلال الواتساب مباشرة؟',
    a: 'نعم، يمكنك التواصل معنا عبر الواتساب وإرسال المنتجات التي ترغب بها، وسنساعدك في تجهيز طلبك وتوضيح تفاصيله.'
  }
];

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
          {faqs.map((faq, index) => {
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
                    {faq.q}
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
                      {faq.a}
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
