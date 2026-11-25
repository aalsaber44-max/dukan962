import React from 'react';
import { stripEmoji } from '../utils/emoji';
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

  //تأمين حساب الأسعار
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
          `مرحباً دكان 962 (Dukan 962)،\nأود تأكيد طلبي للأثاث التالي:\n\n`+
            items
              .map(
                (it, idx) => {
                  const imgUrl = it.selectedColor?.image || it.product.images?.[0] || '';
                  const isBase64 = imgUrl.startsWith('data:image');
                  const imgText = isBase64 ? '(الصورة متوفرة في لوحة التحكم)': imgUrl;

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
            `\n\n*المجموع الفرعي:* ${subtotal.toFixed(2)} دينار أردني\n*التوصيل:* ${freeDelivery ? 'مجاني': 'يُحسب حسب المحافظة (5 د.أ داخل عمان، 8 د.أ خارجها، 10 د.أ العقبة)'}\n*طريقة الدفع:* الدفع عند الاستلام أو التحويل اليدوي عبر CliQ\n\nيرجى تأكيد موعد التوصيل للمحافظة.`)}`: '#';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade"onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[var(--sf-bg-alt)] shadow-lift flex flex-col justify-between border-r border-[var(--sf-border)] animate-drawer">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--sf-border)] flex items-center justify-between bg-[var(--sf-panel)]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--sf-accent-soft)] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[var(--sf-accent)]"/>
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--sf-text)] font-serif">حقيبة المشتريات</h2>
                <p className="text-[11px] text-[var(--sf-muted)]">
                  لديك <span className="text-[var(--sf-accent)] font-bold">{items.reduce((sum, i) => sum + i.quantity, 0)}</span> قطع
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[var(--sf-muted)] hover:text-[var(--sf-text)] hover:bg-[var(--sf-soft-strong)] transition-colors cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          {freeThreshold !== null && items.length > 0 && (
            <div className="bg-[var(--sf-panel)] p-4 border-b border-[var(--sf-border)]">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-[var(--sf-muted)] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[var(--sf-accent)]"/>
                  {freeDelivery ? (
                    <span className="text-[var(--sf-success)] font-bold">
                      تهانينا! حصلت على توصيل مجاني</span>
                  ) : (
                    <span>
                      تبقّى لك <strong className="text-[var(--sf-accent)] font-mono">{(freeThreshold - subtotal).toFixed(2)} د.أ</strong> للحصول على توصيل مجاني
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-[var(--sf-surface)] h-2 rounded-full overflow-hidden ring-1 ring-[var(--sf-border)] shadow-inner">
                <div
                  className="bg-gradient-to-l from-[var(--sf-accent-strong)] to-[var(--sf-accent)] h-full transition-all duration-700 ease-out rounded-full " style={{ width: `${progressPercent}%`}}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-[var(--sf-border)]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--sf-muted)]">
                <div className="w-20 h-20 rounded-3xl bg-[var(--sf-panel)] ring-1 ring-[var(--sf-border)] flex items-center justify-center mb-5 text-[var(--sf-accent)] shadow-inner">
                  <ShoppingBag className="w-10 h-10 opacity-50"/>
                </div>
                <h3 className="text-lg font-bold text-[var(--sf-text)] mb-2 font-serif">حقيبتك فارغة حالياً</h3>
                <p className="text-xs text-[var(--sf-muted)] mb-8 max-w-[200px] leading-relaxed">
                  اكتشف تشكيلاتنا الفاخرة واختر ما يناسب ذوقك.
                </p>
                <button
                  onClick={onClose}
                  className="py-3 px-8 text-xs font-bold text-[var(--sf-accent-contrast)] bg-gradient-to-b from-[var(--sf-accent-strong)] to-[var(--sf-accent)] hover:from-[var(--sf-accent-strong)] hover:to-[var(--sf-accent-strong)] rounded-xl transition-all shadow-gold cursor-pointer active:scale-95">
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
                    className="py-5 flex gap-4 items-start group">
                    {/*تحسين شكل الصورة لتناسب الهوية */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-b from-[var(--sf-plate-a)] to-[var(--sf-plate-b)] p-1.5 shrink-0 shadow-sm ring-1 ring-[var(--sf-border)]">
                      <img
                        src={itemImage}
                        alt={`${stripEmoji(item.product.name)} - ${item.selectedColor.name}`}
                        referrerPolicy="no-referrer" className="w-full h-full object-contain"/>
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-20">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--sf-text)] leading-snug line-clamp-1 font-serif group-hover:text-[var(--sf-accent)] transition-colors">
                            {stripEmoji(item.product.name)}
                          </h4>
                          <p className="text-[11px] text-[var(--sf-muted)] font-medium mt-1 flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-[var(--sf-border)] inline-block shadow-inner" style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span>{item.selectedColor.name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedColor.name)}
                          className="text-[var(--sf-muted)] hover:text-rose-400 hover:bg-rose-400/10 p-1.5 rounded-lg transition-all cursor-pointer opacity-50 group-hover:opacity-100" title="حذف من السلة">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/*أزرار الكمية الفاخرة */}
                        <div className="flex items-center border border-[var(--sf-border)] rounded-full overflow-hidden bg-[var(--sf-surface)] shadow-inner h-8">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, -1)}
                            className="w-8 h-full flex items-center justify-center text-lg hover:bg-[var(--sf-panel-2)] hover:text-[var(--sf-accent)] transition-colors cursor-pointer text-[var(--sf-text)]">
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold tabular-nums text-[var(--sf-text)] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedColor.name, 1)}
                            className="w-8 h-full flex items-center justify-center text-lg hover:bg-[var(--sf-panel-2)] hover:text-[var(--sf-accent)] transition-colors cursor-pointer text-[var(--sf-text)]">
                            +
                          </button>
                        </div>

                        <span className="text-sm font-black text-[var(--sf-accent)] font-mono">
                          {itemTotal.toFixed(2)} <span className="text-[10px] text-[var(--sf-muted)]">د.أ</span>
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
            <div className="p-5 sm:p-6 border-t border-[var(--sf-border)] bg-[var(--sf-panel)] space-y-5">
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[var(--sf-muted)]">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono font-bold text-[var(--sf-text)]">
                    {subtotal.toFixed(2)} دينار أردني
                  </span>
                </div>
                <div className="flex justify-between text-[var(--sf-muted)]">
                  <span>أجور التوصيل</span>
                  <span className={`font-semibold ${freeDelivery ? 'text-[var(--sf-success)]': 'text-[var(--sf-accent)]'}`}>
                    {freeDelivery ? 'مجاني': deliveryRangeText}
                  </span>
                </div>
                <div className="pt-3 border-t border-[var(--sf-border)] flex justify-between text-sm font-black text-[var(--sf-text)] items-end">
                  <span>{freeDelivery ? 'المبلغ الإجمالي': 'المبلغ قبل التوصيل'}</span>
                  <span className="text-xl text-[var(--sf-accent)] font-mono leading-none">
                    {subtotal.toFixed(2)} <span className="text-xs text-[var(--sf-muted)]">د.أ</span>
                  </span>
                </div>
                {!freeDelivery && (
                  <p className="text-[10px] text-[var(--sf-muted)] leading-relaxed">
                    * يظهر المبلغ النهائي شاملاً التوصيل بعد اختيار المحافظة في الخطوة التالية.
                  </p>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-4 px-4 text-sm font-bold text-[var(--sf-accent-contrast)] bg-gradient-to-b from-[var(--sf-accent-strong)] to-[var(--sf-accent)] hover:from-[var(--sf-accent-strong)] hover:to-[var(--sf-accent-strong)] rounded-xl shadow-gold hover:shadow-gold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                  <span>إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4"/>
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"rel="noopener noreferrer" className="w-full py-3.5 px-4 text-xs font-bold text-[var(--sf-success)] bg-[var(--sf-success-soft)] hover:bg-[var(--sf-success-soft)] border border-[var(--sf-border)] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                  <MessageCircle className="w-4 h-4 text-[var(--sf-success)]"/>
                  <span>تأكيد الطلب السريع عبر واتساب</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--sf-success)] font-medium bg-[var(--sf-success-soft)] py-2.5 px-3 rounded-xl border border-[var(--sf-border)]">
                <ShieldCheck className="w-4 h-4 text-[var(--sf-success)] shrink-0"/>
                <span>يوجد معاينة عند وصول الطلب · الدفع كاش أو كليك</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
