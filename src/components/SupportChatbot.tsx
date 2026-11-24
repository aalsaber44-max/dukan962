import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  BookOpen,
  LoaderCircle,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  X,
  Volume2,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Product, Category } from '../types/furniture';
import { availableQty } from '../utils/inventory';

type ChatAction =
  | { type: 'navigate_category'; categoryId: string }
  | { type: 'add_to_cart'; productId: string; quantity: number }
  | { type: 'show_products'; productIds: string[] };

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  showFaqButton?: boolean;
  actions?: ChatAction[];
};

type ApiHistoryMessage = {
  role: 'user' | 'model';
  text: string;
};

type CompactProductPayload = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  desc: string;
};

interface SupportChatbotProps {
  onOpenFAQ: () => void;
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenProduct: (product: Product) => void;
  onNavigateCategory: (categoryId: string) => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'أهلاً بك في دكان 962 👋 أنا "نشمي"، مساعدك الشخصي للتسوق. كيف بقدر أساعدك اليوم؟',
};

const MAX_CONTEXT_PRODUCTS = 80;

export const SupportChatbot: React.FC<SupportChatbotProps> = ({
  onOpenFAQ,
  products,
  categories,
  onAddToCart,
  onOpenProduct,
  onNavigateCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [hasVideoError, setHasVideoError] = useState(false);

  // 💡 حالات التحكم في السحب والإفلات (Dragging)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const hasDraggedRef = useRef(false); // لتمييز الضغطة العادية عن السحب

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasPlayedSoundRef = useRef(false);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  // 📦 ملخص مضغوط للمنتجات: الاسم، السعر، القسم، المتوفر، وصف مختصر — لتقليل التوكنز
  const compactProducts = useMemo<CompactProductPayload[]>(() => {
    const active = products.filter((product) => product.isActive !== false);

    const ranked = [...active].sort((a, b) => availableQty(b) - availableQty(a));

    return ranked.slice(0, MAX_CONTEXT_PRODUCTS).map((product) => {
      const basePrice = Number(product.basePrice) || 0;
      const cheapestColor = Array.isArray(product.colors) && product.colors.length > 0
        ? Math.min(...product.colors.map((color) => Number(color.price) || basePrice))
        : basePrice;
      // المنتجات غير المتتبَّعة تُعيد Infinity، و JSON يحوّلها إلى null — نستخدم رقماً كبيراً بدلاً منها
      const available = availableQty(product);

      return {
        id: product.id,
        name: product.name,
        price: cheapestColor > 0 ? cheapestColor : basePrice,
        category: categoryNameMap.get(product.categoryId) || product.categoryLabel || '',
        stock: Number.isFinite(available) ? available : 999,
        desc: (product.description || '').replace(/\s+/g, ' ').slice(0, 55),
      };
    });
  }, [products, categoryNameMap]);

  const compactCategories = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories]
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      window.setTimeout(() => inputRef.current?.focus(), 120);

      if (!hasPlayedSoundRef.current && audioRef.current) {
        audioRef.current.play().then(() => {
          hasPlayedSoundRef.current = true;
        }).catch((err) => {
          console.warn('المتصفح منع تشغيل الصوت تلقائياً:', err);
        });
      }
    }
  }, [isOpen, messages, isSending]);

  // تنفيذ أوامر الإضافة للسلة التي طلبها العميل صراحةً
  const applyInstantActions = (actions: ChatAction[]) => {
    actions.forEach((action) => {
      if (action.type === 'add_to_cart') {
        const product = productMap.get(action.productId);
        if (product) onAddToCart(product, action.quantity);
      }
    });
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
    const timeoutId = window.setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: previousMessages,
          products: compactProducts,
          categories: compactCategories,
        }),
        signal: controller.signal,
      });

      const data = await response.json() as {
        success?: boolean;
        answer?: string;
        message?: string;
        showFaqButton?: boolean;
        actions?: ChatAction[];
        cached?: boolean;
      };

      if (!response.ok || !data.success || !data.answer) {
        throw new Error(data.message || 'تعذر الحصول على إجابة الآن. حاول مرة أخرى.');
      }

      const actions: ChatAction[] = Array.isArray(data.actions) ? data.actions : [];

      if (actions.length > 0) applyInstantActions(actions);

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.answer as string,
          showFaqButton: Boolean(data.showFaqButton),
          actions,
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

  // 💡 دوال السحب والإفلات
  const onPointerDown = (e: React.PointerEvent) => {
    if (isOpen) return; // لا تسمح بالسحب إذا كانت المحادثة مفتوحة
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // إذا تحرك المؤشر مسافة أكثر من 5 بكسل، اعتبرها سحباً وليست ضغطة
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDraggedRef.current = true;
    }

    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const renderProductCards = (productIds: string[]) => {
    const found = productIds
      .map((id) => productMap.get(id))
      .filter((product): product is Product => Boolean(product))
      .slice(0, 4);

    if (found.length === 0) return null;

    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {found.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-xl border border-[#D4AF37]/25 bg-[#191511]"
          >
            <button
              type="button"
              onClick={() => onOpenProduct(product)}
              className="block w-full text-right"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[10px] text-[#8F877B]">
                    لا توجد صورة
                  </div>
                )}
              </div>
              <div className="px-2 pt-2">
                <p className="line-clamp-2 text-[11px] font-bold leading-5 text-[#F3EEE4]">{product.name}</p>
                <p className="mt-1 text-[11px] font-black text-[#E8CC75]">
                  {Number(product.basePrice || 0).toFixed(2)} د.أ
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 px-2 pb-2 pt-1.5">
              <button
                type="button"
                onClick={() => onAddToCart(product, 1)}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#D4AF37] px-2 py-1.5 text-[10px] font-extrabold text-[#17120A] transition hover:bg-[#E8CC75]"
              >
                <Plus className="h-3 w-3" />
                للسلة
              </button>
              <button
                type="button"
                onClick={() => onOpenProduct(product)}
                aria-label={`عرض تفاصيل ${product.name}`}
                className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-[#C8BFAF] transition hover:border-[#D4AF37]/40 hover:text-[#E8CC75]"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActions = (message: ChatMessage) => {
    const actions = message.actions || [];
    if (actions.length === 0) return null;

    const showProductsActions = actions.filter(
      (action): action is { type: 'show_products'; productIds: string[] } => action.type === 'show_products'
    );
    const navigateActions = actions.filter(
      (action): action is { type: 'navigate_category'; categoryId: string } => action.type === 'navigate_category'
    );
    const addedActions = actions.filter(
      (action): action is { type: 'add_to_cart'; productId: string; quantity: number } => action.type === 'add_to_cart'
    );

    return (
      <div className="flex flex-col gap-2">
        {addedActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {addedActions.map((action) => {
              const product = productMap.get(action.productId);
              if (!product) return null;
              return (
                <span
                  key={`${message.id}-added-${action.productId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300"
                >
                  <Plus className="h-3 w-3" />
                  أُضيف للسلة: {product.name} × {action.quantity}
                </span>
              );
            })}
          </div>
        )}

        {navigateActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {navigateActions.map((action) => {
              const name =
                action.categoryId === 'all'
                  ? 'الصفحة الرئيسية'
                  : categoryNameMap.get(action.categoryId) || 'قسم';
              return (
                <button
                  key={`${message.id}-nav-${action.categoryId}`}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateCategory(action.categoryId);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-bold text-[#E8CC75] transition hover:bg-[#D4AF37]/20"
                >
                  <ArrowLeft className="h-3 w-3" />
                  انتقل إلى {name}
                </button>
              );
            })}
          </div>
        )}

        {showProductsActions.map((action) => (
          <React.Fragment key={`${message.id}-products`}>
            {renderProductCards(action.productIds)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    // 💡 الحاوية الرئيسية تتحرك باستخدام transform بناءً على حالة السحب
    <div
      dir="rtl"
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 sm:bottom-auto sm:top-24 sm:left-6 sm:right-auto z-[80] font-sans flex flex-col gap-4 items-start"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <audio ref={audioRef} src="/nashmi-greeting.mp3" preload="auto" className="hidden" />

      {isOpen && (
        <section
          aria-label="مساعد نشمي - دكان 962"
          className="flex h-[calc(100dvh-160px)] sm:h-[min(560px,calc(100dvh-200px))] w-[calc(100vw-2rem)] sm:w-[390px] flex-col overflow-hidden rounded-[26px] border border-[#D4AF37]/35 bg-[#100E0C] shadow-[0_24px_80px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <header className="relative flex shrink-0 items-center justify-between border-b border-[#D4AF37]/20 bg-[#191511] px-4 py-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#D4AF37] to-transparent" />

            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 sm:h-12 sm:w-12 place-items-center overflow-hidden rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                {!hasVideoError ? (
                  <video
                    src="/nashmi.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={() => setHasVideoError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-[#E8CC75]" />
                )}
              </div>

              <div>
                <h2 className="text-sm font-black tracking-wide text-[#F3EEE4]">نشمي</h2>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#B9A77F]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  مساعدك الشخصي في دكان 962
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {});
                  }
                }}
                title="إعادة سماع الترحيب"
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-[#D4AF37] transition hover:bg-[#D4AF37]/15"
              >
                <Volume2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق المحادثة"
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-[#B9B0A0] transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.07),transparent_55%)] px-3 py-4 sm:px-4">
            <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[9px] text-[#8F877B]">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              دعم ذكي لمساعدتك في التسوق
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[88%] ${message.role === 'user' ? 'items-start' : 'items-end'} flex flex-col gap-2`}>
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-[12px] leading-7 shadow-sm sm:text-[13px] ${
                      message.role === 'user'
                        ? 'rounded-tr-md border border-[#D4AF37]/25 bg-[#3B2F1D] text-[#F8EEDC]'
                        : 'rounded-tl-md border border-white/[0.07] bg-[#211E1A] text-[#E7E0D5]'
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.role === 'assistant' && renderActions(message)}

                  {message.showFaqButton && (
                    <button
                      type="button"
                      onClick={() => { setIsOpen(false); onOpenFAQ(); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/55 bg-[#D4AF37] px-3.5 py-2.5 text-[11px] font-extrabold text-[#17120A] shadow-[0_5px_20px_rgba(212,175,55,0.13)] transition hover:-translate-y-0.5 hover:bg-[#E8CC75] active:translate-y-0"
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
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#D4AF37]" />
                  نشمي يكتب الآن...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="shrink-0 border-t border-[#D4AF37]/15 bg-[#171411] p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0E0D0B] p-1.5 transition focus-within:border-[#D4AF37]/55">
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
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#E8CC75] to-[#B88D45] text-[#17120A] shadow-[0_3px_14px_rgba(212,175,55,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] text-[#777064]">قد يخطئ المساعد أحيانًا؛ راجع التفاصيل من الأسئلة الشائعة.</p>
          </form>
        </section>
      )}

      {!isOpen && (
        <div
          // 💡 إضافة أحداث المؤشر لجعل الزر قابلاً للسحب
          className={`flex flex-col items-center justify-end group touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={(e) => {
            // إذا قام المستخدم بالسحب، لا تفتح المحادثة
            if (hasDraggedRef.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            setIsOpen(true);
          }}
        >
          <div className="relative mb-2 hidden bg-[#1C1815] text-[#E8CC75] px-3 py-1.5 sm:block sm:px-4 sm:py-2 rounded-2xl shadow-[0_4px_20px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30 animate-bounce text-[10px] sm:text-[13px] font-bold whitespace-nowrap transition-all duration-300 group-hover:bg-[#26211D]">
            تحدث مع نشمي
            <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1C1815] border-b border-r border-[#D4AF37]/30 rotate-45 group-hover:bg-[#26211D]"></div>
          </div>

          <div className="relative w-14 h-14 sm:w-32 sm:h-32 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_25px_rgba(212,175,55,0.3)]">
            {!hasVideoError ? (
              <video
                src="/nashmi.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={() => setHasVideoError(true)}
                className="w-full h-full object-cover bg-transparent pointer-events-none"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#E8CC75] to-[#8F682D] flex items-center justify-center text-[#17120A] pointer-events-none">
                <MessageCircle className="w-6 h-6 sm:w-12 sm:h-12" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
