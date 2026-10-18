import React from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { CartItem } from '../types/furniture';

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

  const subtotal = items.reduce(
    (acc, item) => acc + (item.selectedColor.price || item.product.basePrice) * item.quantity,
    0
  );

  // Delivery: Free for orders over 150 JOD, otherwise 5 JOD inside Jordan
  const freeThreshold = 150;
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);
  const deliveryFee = subtotal >= freeThreshold ? 0 : 5;
  const grandTotal = subtotal + (items.length > 0 ? deliveryFee : 0);

  const whatsAppUrl =
    items.length > 0
      ? `https://wa.me/962790000000?text=${encodeURIComponent(
          `مرحباً دكان 962 (Dukan 962)،\nأود تأكيد طلبي للأثاث التالي:\n\n` +
            items
              .map(
                (it, idx) =>
                  `${idx + 1}. *${it.product.name}* (اللون: ${it.selectedColor.name}) - الكمية: ${it.quantity} - السعر: ${(it.selectedColor.price * it.quantity).toFixed(2)} د.أ`
              )
              .join('\n') +
            `\n\n*المجموع الفرعي:* ${subtotal.toFixed(2)} دينار أردني\n*التوصيل:* ${deliveryFee === 0 ? 'مجاني' : '5.00 د.أ'}\n*المجموع الإجمالي:* ${grandTotal.toFixed(2)} دينار أردني\n*طريقة الدفع:* الدفع عند الاستلام كاش أو بطاقة\n\nيرجى تأكيد موعد التوصيل للمحافظة.`
        )}`
      : '#';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-r border-[#EAE3D7]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EAE3D7] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8C6D46]" />
              <h2 className="text-base font-bold text-[#1C1917]">حقيبة المشتريات</h2>
              <span className="text-xs text-[#78716C] font-mono tabular-nums">
                ({items.reduce((sum, i) => sum + i.quantity, 0)} قطع)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Jordan Delivery Progress */}
          <div className="bg-[#FAF7F2] p-4 border-b border-[#EAE3D7]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#57534E]">
                {subtotal >= freeThreshold ? (
                  <span className="text-[#2E5339] font-bold">
                    تهانينا! حصلت على توصيل مجاني لكافة المحافظات 🎉
                  </span>
                ) : (
                  <span>
                    تبقّى لك{' '}
                    <strong className="text-[#1C1917] font-mono">
                      {(freeThreshold - subtotal).toFixed(2)} د.أ
                    </strong>{' '}
                    للحصول على توصيل مجاني
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-[#E5DDD0] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2E5339] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#F2EDE4]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#78716C]">
                <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] flex items-center justify-center mb-4 text-[#8C6D46]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-sm font-bold text-[#1C1917] mb-1">السلة فارغة حالياً</h3>
                <p className="text-xs text-[#8C827A] mb-6 max-w-xs">
                  اختر من بين تشكيلات طاولات الوسط، طاولات الشاشات والمدافئ الديكورية.
                </p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl transition-all cursor-pointer"
                >
                  استكشف طاولات دكان 962
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.selectedColor.price || item.product.basePrice;
                const itemTotal = itemPrice * item.quantity;
                const itemImage = item.selectedColor.image || item.product.images[0];

                return (
                  <div
                    key={`${item.product.id}-${item.selectedColor.name}`}
                    className="py-4 flex gap-4 items-start"
                  >
                    {/* Selected Color Image */}
                    <img
                      src={itemImage}
                      alt={`${item.product.name} - ${item.selectedColor.name}`}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover border border-[#E9E1D4] bg-[#F4EFE6] shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#1C1917] leading-snug line-clamp-1">
                            {item.product.name}
                          </h4>
                          {/* Explicit Selected Color Name as requested */}
                          <p className="text-[11px] text-[#8C6D46] font-semibold mt-1 flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-black/15 inline-block"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span>اللون المختار: {item.selectedColor.name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedColor.name)}
                          className="text-[#A8A29E] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-[#DDD5C7] rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, -1)}
                            className="px-2.5 py-1 text-xs hover:bg-[#F4EFE6] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold tabular-nums text-[#1C1917] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, 1)}
                            className="px-2.5 py-1 text-xs hover:bg-[#F4EFE6] cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Price per item / total in JOD */}
                        <span className="text-xs font-black text-[#1C1917] font-mono">
                          {itemTotal.toFixed(2)} د.أ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Panel */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EAE3D7] bg-[#FAF8F5] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#78716C]">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono font-bold text-[#1C1917]">
                    {subtotal.toFixed(2)} دينار أردني
                  </span>
                </div>
                <div className="flex justify-between text-[#78716C]">
                  <span>التوصيل للمحافظات</span>
                  <span className="font-semibold text-[#2E5339]">
                    {deliveryFee === 0 ? 'مجاني' : '5.00 د.أ'}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E7DFD2] flex justify-between text-sm font-black text-[#1C1917]">
                  <span>المبلغ الإجمالي</span>
                  <span className="text-base text-[#1C1917] font-mono">
                    {grandTotal.toFixed(2)} د.أ
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3.5 px-4 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>متابعة إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 text-xs font-bold text-[#2E5339] bg-[#EDF4EE] hover:bg-[#DEEFE0] border border-[#C5DEC8] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#2E5339]" />
                  <span>تأكيد الطلب السريع عبر واتساب</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#2E5339] font-medium bg-[#EDF4EE] py-2 px-3 rounded-lg border border-[#C5DEC8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E5339] shrink-0" />
                <span>✨ يوجد معاينة عند وصول الطلب · الدفع عند الاستلام كاش أو كليك</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
