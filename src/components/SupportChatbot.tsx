import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, BookOpen, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { Product } from '../types/furniture'; // 💡 استيراد نوع المنتج

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  showFaqButton?: boolean;
};

type ApiHistoryMessage = {
  role: 'user' | 'model';
  text: string;
};

interface SupportChatbotProps {
  onOpenFAQ: () => void;
  products: Product[]; // 💡 إضافة المنتجات للـ props
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'أهلاً بك في دكان 962 👋 أنا "نشمي"، مساعدك الشخصي للتسوق. كيف بقدر أساعدك اليوم؟',
};

export const SupportChatbot: React.FC<SupportChatbotProps> = ({ onOpenFAQ, products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, messages, isSending]);

  // 💡 دالة لتحويل المنتجات إلى نص مختصر يسهل على الـ AI قراءته
  const getProductContext = () => {
    if (!products || products.length === 0) return 'لا توجد منتجات متاحة حالياً.';
    return products
      .filter(p => p.isActive !== false)
      .slice(0, 50) // نأخذ أول 50 منتج فقط لتجنب إطالة الرسالة
      .map(p => `- ${p.name} | السعر: ${p.basePrice} د.أ | القسم: ${p.categoryId}`)
      .join('\n');
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    if (message.length > 700) {
      setMessages((current) => [
        ...current,
        { id: `error-${Date.now()}`, role: 'assistant', text: 'الرجاء اختصار رسالتك إلى 700 حرف كحد أقصى.' },
      ]);
      return;
    }

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: message };

    const previousMessages = messages
      .filter((item) => item.id !== 'welcome')
      .slice(-6)
      .map<ApiHistoryMessage>((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        text: item.text,
      }));

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsSending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 💡 إرسال سياق المنتجات مع الرسالة
        body: JSON.stringify({ 
          message, 
          history: previousMessages,
          productContext: getProductContext() 
        }),
        signal: controller.signal,
      });

      const data = await response.json() as {
        success?: boolean;
        answer?: string;
        message?: string;
        showFaqButton?: boolean;
      };

      if (!response.ok || !data.success || !data.answer) {
        throw new Error(data.message || 'تعذر الحصول على إجابة الآن. حاول مرة أخرى.');
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.answer as string,
          showFaqButton: Boolean(data.showFaqButton),
        },
      ]);
    } catch (error) {
      const messageText = error instanceof Error && error.name === 'AbortError'
        ? 'استغرق الرد وقتًا أطول من المتوقع. حاول مرة أخرى.'
        : error instanceof Error ? error.message : 'حدث خطأ غير متوقع. حاول مرة أخرى.';

      setMessages((current) => [
        ...current,
        { id: `error-${Date.now()}`, role: 'assistant', text: messageText },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  return (
    // ... (نفس كود الواجهة الذي أرسلته بدون تغيير)
    <div dir="rtl" className="fixed bottom-24 md:bottom-6 left-4 sm:left-6 z-[80] font-sans">
      {isOpen && (
        <section
          aria-label="مساعد نشمي - دكان 962"
          className="mb-4 flex h-[min(560px,calc(100dvh-200px))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[26px] border border-[#D4B06A]/35 bg-[#100E0C] shadow-[0_24px_80px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <header className="relative flex shrink-0 items-center justify-between border-b border-[#D4B06A]/20 bg-[#191511] px-4 py-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#D4B06A] to-transparent" />
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#D4B06A]/35 bg-[#D4B06A]/10 text-[#E8CC8A]">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wide text-[#F3EEE4]">نشمي</h2>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#B9A77F]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  مساعدك الشخصي في دكان 962
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق المحادثة"
              className="grid h-9 w-9 place-items-center rounded-full text-[#B9B0A0] transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(212,176,106,0.07),transparent_55%)] px-3 py-4 sm:px-4">
            <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[9px] text-[#8F877B]">
              <Sparkles className="h-3 w-3 text-[#D4B06A]" />
              دعم ذكي لمساعدتك في التسوق
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[88%] ${message.role === 'user' ? 'items-start' : 'items-end'} flex flex-col gap-2`}>
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-[12px] leading-7 shadow-sm sm:text-[13px] ${
                      message.role === 'user'
                        ? 'rounded-tr-md border border-[#D4B06A]/25 bg-[#3B2F1D] text-[#F8EEDC]'
                        : 'rounded-tl-md border border-white/[0.07] bg-[#211E1A] text-[#E7E0D5]'
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.showFaqButton && (
                    <button
                      type="button"
                      onClick={() => { setIsOpen(false); onOpenFAQ(); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D4B06A]/55 bg-[#D4B06A] px-3.5 py-2.5 text-[11px] font-extrabold text-[#17120A] shadow-[0_5px_20px_rgba(212,176,106,0.13)] transition hover:-translate-y-0.5 hover:bg-[#E8CC8A] active:translate-y-0"
                    >
                      <BookOpen className="h-4 w-4" />
                      الأسئلة الشائعة وطريقة الطلب
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.07] bg-[#211E1A] px-4 py-3 text-xs text-[#C8BFAF]">
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#D4B06A]" />
                  نشمي يكتب الآن...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="shrink-0 border-t border-[#D4B06A]/15 bg-[#171411] p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0E0D0B] p-1.5 transition focus-within:border-[#D4B06A]/55">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={700}
                placeholder="اكتب سؤالك لنشمي هنا..."
                aria-label="اكتب رسالتك لنشمي"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-right text-xs text-[#F3EEE4] outline-none placeholder:text-[#777064]"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                aria-label="إرسال الرسالة"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#E8CC8A] to-[#B88D45] text-[#17120A] shadow-[0_3px_14px_rgba(212,176,106,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] text-[#777064]">قد يخطئ المساعد أحيانًا؛ راجع التفاصيل من الأسئلة الشائعة.</p>
          </form>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'إغلاق مساعد نشمي' : 'فتح مساعد نشمي'}
          aria-expanded={isOpen}
          className="group relative flex items-center gap-2.5 h-14 px-6 rounded-full border border-[#F0D99D]/65 bg-gradient-to-br from-[#E8CC8A] via-[#C49A53] to-[#8F682D] text-[#17120A] shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_25px_rgba(212,176,106,0.18)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_35px_rgba(0,0,0,0.5),0_0_32px_rgba(212,176,106,0.3)]"
        >
          <span className="absolute inset-0 rounded-full border border-[#F8E8BF]/50 transition duration-500 group-hover:scale-125 group-hover:opacity-0" />
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          <span className="text-sm font-bold whitespace-nowrap">{isOpen ? 'إغلاق' : 'تحدث مع نشمي'}</span>
        </button>
      </div>
    </div>
  );
};
