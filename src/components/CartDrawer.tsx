import React from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { CartItem } from '../types/furniture';
import {
  STORE_PHONE_INTL,
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_FEE_MIN,
  DELIVERY_FEE_MAX,
  isFreeDelivery,
} from '../utils/jordanLocations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, colorName: string, delta: number) => void;
  onRemoveItem: (id: string, colorName: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  // 💡 تأمين حساب الأسعار
  const subtotal = items.reduce((acc, item) => {
    const colorPrice = Number(item.selectedColor?.price);
    const basePrice = Number(item.product?.basePrice);
    const unitPrice = Number.isFinite(colorPrice) && colorPrice > 0
      ? colorPrice
      : Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 0;
    return acc + unitPrice * Math.max(0, Number(item.quantity) || 0);
  }, 0);

  const freeThreshold = FREE_DELIVERY_THRESHOLD;
  const freeDelivery = isFreeDelivery(subtotal);
  const progressPercent = freeThreshold ? Math.min(100, (subtotal / freeThreshold) * 100) : 0;
  const deliveryRangeText = `${DELIVERY_FEE_MIN} - ${DELIVERY_FEE_MAX} د.أ حسب المحافظة`;

  const whatsAppUrl =
    items.length > 0
      ? `https://api.whatsapp.com/send?phone=${STORE_PHONE_INTL}&text=${encodeURIComponent(
          `مرحباً دكان 962 (Dukan 962)،\nأود تأكيد طلبي للأثاث التالي:\n\n` +
            items
              .map(
                (it, idx) => {
                  const imgUrl = it.selectedColor?.image || it.product.images?.[0] || '';
                  const isBase64 = imgUrl.startsWith('data:image');
                  const imgText = isBase64 ? '(الصورة متوفرة في لوحة التحكم)' : imgUrl;

                  const colorPrice = Number(it.selectedColor?.price);
                  const basePrice = Number(it.product?.basePrice);
                  const unitPrice = Number.isFinite(colorPrice) && colorPrice > 0
                    ? colorPrice
                    : Number.isFinite(basePrice) && basePrice > 0
                      ? basePrice
                      : 0;

                  return `${idx + 1}. *${it.product.name}*\n   - اللون: ${it.selectedColor?.name || 'غير محدد'}\n   - الكمية: ${it.quantity}\n   - السعر: ${(unitPrice * it.quantity).toFixed(2)} د.أ\n   - صورة المنتج: ${imgText}`;
                }
              )
              .join('\n\n') +
            `\n\n*المجموع الفرعي:* ${subtotal.toFixed(2)} دينار أردني\n*التوصيل:* ${freeDelivery ? 'مجاني' : 'يُحسب حسب المحافظة (5 د.أ داخل عمان، 8 د.أ خارجها، 10 د.أ العقبة)'}\n*طريقة الدفع:* الدفع عند الاستلام أو التحويل اليدوي عبر CliQ\n\nيرجى تأكيد موعد التوصيل للمحافظة.`
        )}`
      : '#';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0F0D0B] shadow-[0_0_80px_-20px_rgba(212,176,106,0.25)] flex flex-col justify-between border-r border-[#D4B06A]/15 animate-drawer">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#1C1815]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#D4B06A]/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#D4B06A]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F3EEE4] font-serif">حقيبة المشتريات</h2>
                <p className="text-[11px] text-[#A39A8B]">
                  لديك <span className="text-[#D4B06A] font-bold">{items.reduce((sum, i) => sum + i.quantity, 0)}</span> قطع
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#A39A8B] hover:text-[#F3EEE4] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          {freeThreshold !== null && items.length > 0 && (
            <div className="bg-[#1C1815]/50 p-4 border-b border-white/10">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-[#B9B0A0] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#D4B06A]" />
                  {freeDelivery ? (
                    <span className="text-[#7FD1A0] font-bold">
                      تهانينا! حصلت على توصيل مجاني 🎉
                    </span>
                  ) : (
                    <span>
                      تبقّى لك <strong className="text-[#E8CC8A] font-mono">{(freeThreshold - subtotal).toFixed(2)} د.أ</strong> للحصول على توصيل مجاني
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-[#141210] h-2 rounded-full overflow-hidden ring-1 ring-white/5 shadow-inner">
                <div
                  className="bg-gradient-to-l from-[#E8CC8A] to-[#D4B06A] h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(212,176,106,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#A39A8B]">
                <div className="w-20 h-20 rounded-3xl bg-[#1C1815] ring-1 ring-white/5 flex items-center justify-center mb-5 text-[#D4B06A] shadow-inner">
                  <ShoppingBag className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-[#F3EEE4] mb-2 font-serif">حقيبتك فارغة حالياً</h3>
                <p className="text-xs text-[#8A8173] mb-8 max-w-[200px] leading-relaxed">
                  اكتشف تشكيلاتنا الفاخرة واختر ما يناسب ذوقك.
                </p>
                <button
                  onClick={onClose}
                  className="py-3 px-8 text-xs font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] hover:from-[#E8CC8A] hover:to-[#E8CC8A] rounded-xl transition-all shadow-gold cursor-pointer active:scale-95"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = Number(item.selectedColor.price) || Number(item.product.basePrice) || 0;
                const itemTotal = itemPrice * item.quantity;
                const itemImage = item.selectedColor.image || item.product.images[0];

                return (
                  <div
                    key={`${item.product.id}-${item.selectedColor.name}`}
                    className="py-5 flex gap-4 items-start group"
                  >
                    {/* 💡 تحسين شكل الصورة لتناسب الهوية */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-b from-[#EFE9DE] to-[#DCD4C5] p-1.5 shrink-0 shadow-sm ring-1 ring-white/10">
                      <img
                        src={itemImage}
                        alt={`${item.product.name} - ${item.selectedColor.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-20">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#F3EEE4] leading-snug line-clamp-1 font-serif group-hover:text-[#E8CC8A] transition-colors">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-[#A39A8B] font-medium mt-1 flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20 inline-block shadow-inner"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span>{item.selectedColor.name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedColor.name)}
                          className="text-[#8A8173] hover:text-rose-400 hover:bg-rose-400/10 p-1.5 rounded-lg transition-all cursor-pointer opacity-50 group-hover:opacity-100"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* 💡 أزرار الكمية الفاخرة */}
                        <div className="flex items-center border border-white/10 rounded-full overflow-hidden bg-[#141210] shadow-inner h-8">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, -1)}
                            className="w-8 h-full flex items-center justify-center text-lg hover:bg-[#26211D] hover:text-[#D4B06A] transition-colors cursor-pointer text-[#F3EEE4]"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold tabular-nums text-[#F3EEE4] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, 1)}
                            className="w-8 h-full flex items-center justify-center text-lg hover:bg-[#26211D] hover:text-[#D4B06A] transition-colors cursor-pointer text-[#F3EEE4]"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-black text-[#E8CC8A] font-mono">
                          {itemTotal.toFixed(2)} <span className="text-[10px] text-[#A39A8B]">د.أ</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-white/10 bg-[#1C1815] space-y-5">
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[#A39A8B]">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono font-bold text-[#F3EEE4]">
                    {subtotal.toFixed(2)} دينار أردني
                  </span>
                </div>
                <div className="flex justify-between text-[#A39A8B]">
                  <span>أجور التوصيل</span>
                  <span className={`font-semibold ${freeDelivery ? 'text-[#7FD1A0]' : 'text-[#E8CC8A]'}`}>
                    {freeDelivery ? 'مجاني' : deliveryRangeText}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-black text-[#F3EEE4] items-end">
                  <span>{freeDelivery ? 'المبلغ الإجمالي' : 'المبلغ قبل التوصيل'}</span>
                  <span className="text-xl text-[#E8CC8A] font-mono leading-none">
                    {subtotal.toFixed(2)} <span className="text-xs text-[#A39A8B]">د.أ</span>
                  </span>
                </div>
                {!freeDelivery && (
                  <p className="text-[10px] text-[#8A8173] leading-relaxed">
                    * يظهر المبلغ النهائي شاملاً التوصيل بعد اختيار المحافظة في الخطوة التالية.
                  </p>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-4 px-4 text-sm font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] hover:from-[#E8CC8A] hover:to-[#E8CC8A] rounded-xl shadow-[0_8px_20px_-8px_rgba(212,176,106,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(212,176,106,0.8)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 text-xs font-bold text-[#7FD1A0] bg-[#7FD1A0]/10 hover:bg-[#7FD1A0]/20 border border-[#7FD1A0]/30 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-[#7FD1A0]" />
                  <span>تأكيد الطلب السريع عبر واتساب</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#7FD1A0] font-medium bg-[#7FD1A0]/10 py-2.5 px-3 rounded-xl border border-[#7FD1A0]/25">
                <ShieldCheck className="w-4 h-4 text-[#7FD1A0] shrink-0" />
                <span>✨ يوجد معاينة عند وصول الطلب · الدفع كاش أو كليك</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
