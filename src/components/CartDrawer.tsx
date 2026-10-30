import React from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react';
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
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.selectedColor.price) || Number(item.product.basePrice) || 0) * item.quantity,
    0
  );

  // 💡 التوصيل يُحسب حسب المحافظة في صفحة إتمام الطلب، والسلة تعرض نفس السياسة بدون تضارب
  const freeThreshold = FREE_DELIVERY_THRESHOLD;
  const freeDelivery = isFreeDelivery(subtotal);
  const progressPercent = freeThreshold ? Math.min(100, (subtotal / freeThreshold) * 100) : 0;
  const deliveryRangeText = `${DELIVERY_FEE_MIN} - ${DELIVERY_FEE_MAX} د.أ حسب المحافظة`;

  // 💡 بناء رابط الواتساب مع الفحص الذكي للصور واستخدام api.whatsapp.com
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

                  return `${idx + 1}. *${it.product.name}*\n   - اللون: ${it.selectedColor.name}\n   - الكمية: ${it.quantity}\n   - السعر: ${(Number(it.selectedColor.price) * it.quantity).toFixed(2)} د.أ\n   - صورة المنتج: ${imgText}`;
                }
              )
              .join('\n\n') +
            `\n\n*المجموع الفرعي:* ${subtotal.toFixed(2)} دينار أردني\n*التوصيل:* ${freeDelivery ? 'مجاني' : 'يُحسب حسب المحافظة (5 د.أ داخل عمان، 8 د.أ خارجها، 10 د.أ العقبة)'}\n*طريقة الدفع:* الدفع عند الاستلام كاش أو بطاقة\n\nيرجى تأكيد موعد التوصيل للمحافظة.`
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
          
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1C1815]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4B06A]" />
              <h2 className="text-base font-bold text-[#F3EEE4]">حقيبة المشتريات</h2>
              <span className="text-xs text-[#A39A8B] font-mono tabular-nums">
                ({items.reduce((sum, i) => sum + i.quantity, 0)} قطع)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A39A8B] hover:text-[#F3EEE4] hover:bg-[#26211D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {freeThreshold !== null && (
          <div className="bg-[#1C1815] p-4 border-b border-white/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#B9B0A0]">
                {freeDelivery ? (
                  <span className="text-[#7FD1A0] font-bold">
                    تهانينا! حصلت على توصيل مجاني لكافة المحافظات 🎉
                  </span>
                ) : (
                  <span>
                    تبقّى لك{' '}
                    <strong className="text-[#F3EEE4] font-mono">
                      {(freeThreshold - subtotal).toFixed(2)} د.أ
                    </strong>{' '}
                    للحصول على توصيل مجاني
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-l from-[#E8CC8A] to-[#D4B06A] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 divide-y divide-white/10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#A39A8B]">
                <div className="w-16 h-16 rounded-2xl bg-[#1C1815] flex items-center justify-center mb-4 text-[#D4B06A]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-sm font-bold text-[#F3EEE4] mb-1">السلة فارغة حالياً</h3>
                <p className="text-xs text-[#8A8173] mb-6 max-w-xs">
                  اختر من بين تشكيلاتنا المتنوعة.
                </p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 text-xs font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl transition-all cursor-pointer"
                >
                  استكشف دكان 962
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
                    className="py-4 flex gap-4 items-start"
                  >
                    <img
                      src={itemImage}
                      alt={`${item.product.name} - ${item.selectedColor.name}`}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover border border-white/10 bg-[#1C1815] shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#F3EEE4] leading-snug line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-[#D4B06A] font-semibold mt-1 flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-white/15 inline-block"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span>اللون المختار: {item.selectedColor.name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedColor.name)}
                          className="text-[#8A8173] hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-[#141210]">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, -1)}
                            className="px-2.5 py-1 text-xs hover:bg-[#26211D] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold tabular-nums text-[#F3EEE4] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, 1)}
                            className="px-2.5 py-1 text-xs hover:bg-[#26211D] cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-black text-[#F3EEE4] font-mono">
                          {itemTotal.toFixed(2)} د.أ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#1C1815] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#A39A8B]">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono font-bold text-[#F3EEE4]">
                    {subtotal.toFixed(2)} دينار أردني
                  </span>
                </div>
                <div className="flex justify-between text-[#A39A8B]">
                  <span>التوصيل للمحافظات</span>
                  <span className={`font-semibold ${freeDelivery ? 'text-[#7FD1A0]' : 'text-[#E8CC8A]'}`}>
                    {freeDelivery ? 'مجاني' : deliveryRangeText}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-[#F3EEE4]">
                  <span>{freeDelivery ? 'المبلغ الإجمالي' : 'المبلغ قبل التوصيل'}</span>
                  <span className="text-base text-[#F3EEE4] font-mono">
                    {subtotal.toFixed(2)} د.أ
                  </span>
                </div>
                {!freeDelivery && (
                  <p className="text-[11px] text-[#8A8173] leading-relaxed">
                    يظهر المبلغ النهائي بعد اختيار المحافظة في الخطوة التالية.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3.5 px-4 text-xs font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>متابعة إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 text-xs font-bold text-[#7FD1A0] bg-[#7FD1A0]/10 hover:bg-[#7FD1A0]/15 border border-[#7FD1A0]/25 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#7FD1A0]" />
                  <span>تأكيد الطلب السريع عبر واتساب</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#7FD1A0] font-medium bg-[#7FD1A0]/10 py-2 px-3 rounded-lg border border-[#7FD1A0]/25">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7FD1A0] shrink-0" />
                <span>✨ يوجد معاينة عند وصول الطلب · الدفع عند الاستلام كاش أو كليك</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
