import React, { useState } from 'react';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, Copy, Check, MessageCircle, Smartphone } from 'lucide-react';
import { CartItem } from '../types/furniture';
import {
  STORE_PHONE,
  STORE_PHONE_INTL,
  JORDAN_GOVERNORATES,
  calculateDeliveryFee,
  validateJordanPhone,
  detectGovernorateFromAddress,
} from '../utils/jordanLocations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccessOrder: (orderData?: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onSuccessOrder,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cliq' | 'card'>('cod');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('عمان (العاصمة)');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [cliqRef, setCliqRef] = useState('');
  const [copiedField, setCopiedField] = useState<'alias' | 'phone' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [autoDetectedGov, setAutoDetectedGov] = useState<string | null>(null);

  const subtotal = items.reduce(
    (acc, item) => acc + (item.selectedColor.price || item.product.basePrice) * item.quantity,
    0
  );

  // Exact delivery fee based on store policy:
  // Amman = 5 JOD, Aqaba = 10 JOD, other governorates (Outside Amman) = 8 JOD (No free delivery)
  const deliveryFee = calculateDeliveryFee(governorate);
  const total = subtotal + deliveryFee;

  const cliqAlias = 'DUKAN962';
  const cliqPhone = STORE_PHONE; // 0779254134

  const copyToClipboard = (text: string, field: 'alias' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Address input handler with automatic area-to-governorate detection
  const handleAddressChange = (val: string) => {
    setAddress(val);
    const detected = detectGovernorateFromAddress(val);
    if (detected) {
      setGovernorate(detected);
      setAutoDetectedGov(detected);
    } else {
      setAutoDetectedGov(null);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError) {
      const check = validateJordanPhone(val);
      if (check.isValid) {
        setPhoneError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Jordan phone validation: must be 10 digits starting with 079, 077, or 078
    const phoneValidation = validateJordanPhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(
        phoneValidation.error ||
          'رقم الهاتف غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 079 أو 077 أو 078 (مثال: 0779254134)'
      );
      return;
    }
    setPhoneError(null);

    if (!name || !address) return;

    setIsSubmitting(true);
    const num = 'DUKAN-' + Math.floor(10000 + Math.random() * 90000);
    setOrderNumber(num);

    const orderPayload = {
      id: num,
      name: name.trim(),
      phone: phoneValidation.cleaned,
      governorate,
      address: address.trim(),
      notes: notes.trim(),
      paymentMethod,
      cliqRef: paymentMethod === 'cliq' ? cliqRef.trim() : '',
      items,
      subtotal,
      deliveryFee,
      total,
      createdAt: new Date().toISOString(),
    };

    // Save order to persistent server backend
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
    } catch (err) {
      console.warn('Backend order save error, fallback to local:', err);
    }

    // Save order locally too
    try {
      const existing = JSON.parse(localStorage.getItem('dukan962_orders_local') || '[]');
      existing.unshift(orderPayload);
      localStorage.setItem('dukan962_orders_local', JSON.stringify(existing));
    } catch {
      // fallback
    }

    setIsSubmitting(false);
    setOrderConfirmed(true);
    onSuccessOrder(orderPayload);
  };

  const jordanGovernorates = JORDAN_GOVERNORATES;

  const paymentLabel =
    paymentMethod === 'cod'
      ? 'الدفع كاش عند الاستلام بعد المعاينة'
      : paymentMethod === 'cliq'
      ? `تحويل كليك CliQ (${cliqRef ? 'مرجع: ' + cliqRef : 'بانتظار التحويل'})`
      : 'بطاقة بنكية';

  const whatsAppOrderText = encodeURIComponent(
    `👑 *طلب جديد من متجر دكان 962 للأثاث*\n\n` +
      `*رقم الطلب:* ${orderNumber}\n` +
      `*الاسم:* ${name}\n` +
      `*رقم الهاتف:* ${phone}\n` +
      `*المحافظة والعنوان:* ${governorate} - ${address}\n` +
      (notes ? `*ملاحظات إضافية:* ${notes}\n` : '') +
      `*طريقة الدفع:* ${paymentLabel}\n\n` +
      `📦 *تفاصيل الطاولات المطلوبة:*\n` +
      items
        .map(
          (it, i) =>
            `${i + 1}. ${it.product.name}\n   - الموديل: #${it.product.itemNumber}\n   - اللون المعتمد: *${it.selectedColor.name}*\n   - الكمية: ${it.quantity}\n   - السعر: ${(it.selectedColor.price * it.quantity).toFixed(2)} د.أ`
        )
        .join('\n\n') +
      `\n\n------------------------\n` +
      `*المجموع الفرعي:* ${subtotal.toFixed(2)} د.أ\n` +
      `*أجور التوصيل (${governorate}):* ${deliveryFee.toFixed(2)} د.أ\n` +
      `*المبلغ الإجمالي النهائي:* ${total.toFixed(2)} دينار أردني\n\n` +
      `يرجى تأكيد استلام الطلب وتحديد موعد التوصيل والمعاينة لباب البيت.`
  );

  const whatsAppUrl = `https://wa.me/${STORE_PHONE_INTL}?text=${whatsAppOrderText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E9E1D4] overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE3D7] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">
              {orderConfirmed ? 'تم تأكيد طلبك في دكان 962' : 'إتمام الطلب وتحديد التوصيل'}
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {orderConfirmed
                ? 'شكراً لاختيارك طاولات دكان 962 للأثاث'
                : 'التوصيل لجميع المحافظات والدفع عند الاستلام أو كليك'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EDE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderConfirmed ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-[#8C6D46] uppercase tracking-wider">
              رقم تتبع الطلب
            </span>
            <h4 className="text-2xl font-black text-[#1C1917] font-mono mt-1 mb-2">
              {orderNumber}
            </h4>
            <p className="text-xs text-[#57534E] leading-relaxed max-w-md mx-auto mb-5">
              تم استلام طلبك وحفظه بنجاح في نظام المتجر! يمكنك الآن إرسال نسخة من الطلب مباشرة إلى واتساب مندوب المتجر لتأكيد موعد التسليم فوراً.
            </p>

            {/* Direct WhatsApp Forward Button */}
            <div className="mb-6">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 text-xs sm:text-sm font-bold text-white bg-[#2E5339] hover:bg-[#1E3826] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال تفاصيل الطلب لمندوب دكان 962 عبر واتساب</span>
              </a>
              <span className="text-[11px] text-[#78716C] block mt-1.5">
                تصل الرسالة لمندوبنا متضمنة صور وألوان وأسعار القطع المطلوبة بدقة
              </span>
            </div>

            {/* Final Order Summary */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE3D7] text-right mb-6 space-y-3 text-xs">
              <div className="font-bold text-[#1C1917] border-b border-[#E5DDD0] pb-2">
                تفاصيل قطع العفش والألوان المطلوبة:
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[#44403C]">
                    <div>
                      <span className="font-semibold text-[#1C1917]">{item.product.name}</span>
                      <span className="text-[11px] text-[#8C6D46] block">
                        اللون المعتمد: {item.selectedColor.name} (الكمية: {item.quantity})
                      </span>
                    </div>
                    <span className="font-mono font-bold">
                      {(item.selectedColor.price * item.quantity).toFixed(2)} د.أ
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E5DDD0] space-y-1 text-[#78716C]">
                <div className="flex justify-between">
                  <span>المستلم:</span>
                  <span className="font-semibold text-[#1C1917]">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span>الهاتف:</span>
                  <span className="font-semibold text-[#1C1917] font-mono">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>المحافظة والعنوان:</span>
                  <span className="font-semibold text-[#1C1917]">
                    {governorate} - {address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="font-semibold text-[#2E5339]">{paymentLabel}</span>
                </div>
                <div className="pt-2 border-t border-[#E5DDD0] flex justify-between font-black text-sm text-[#1C1917]">
                  <span>المبلغ الإجمالي النهائي:</span>
                  <span className="font-mono text-base">{total.toFixed(2)} دينار أردني</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="py-2.5 px-8 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl transition-all cursor-pointer"
            >
              العودة إلى المعرض
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {/* Payment Options (COD, CliQ, Card) */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-2">
                اختر طريقة الدفع:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Cash On Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[#1C1917] bg-[#FAF8F5] shadow-xs ring-1 ring-[#1C1917]'
                      : 'border-[#E5DDD0] hover:border-[#C6BBAA]'
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#8C6D46] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1C1917]">الدفع عند الاستلام</p>
                    <p className="text-[10px] text-[#78716C]">كاش بعد المعاينة</p>
                  </div>
                </button>

                {/* CliQ Jordan */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cliq')}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === 'cliq'
                      ? 'border-[#1C1917] bg-[#FAF8F5] shadow-xs ring-1 ring-[#1C1917]'
                      : 'border-[#E5DDD0] hover:border-[#C6BBAA]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#2E5339] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#2E5339]">دفع كليك (CliQ)</p>
                    <p className="text-[10px] text-[#78716C]">تحويل فوري فوري</p>
                  </div>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#1C1917] bg-[#FAF8F5] shadow-xs ring-1 ring-[#1C1917]'
                      : 'border-[#E5DDD0] hover:border-[#C6BBAA]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#8C6D46] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1C1917]">بطاقة إلكترونية</p>
                    <p className="text-[10px] text-[#78716C]">فيزا / ماستركارد</p>
                  </div>
                </button>
              </div>
            </div>

            {/* CliQ Details Box when CliQ is selected */}
            {paymentMethod === 'cliq' && (
              <div className="bg-[#EDF4EE] border border-[#C5DEC8] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2E5339]">
                    <Smartphone className="w-4 h-4" />
                    <span>بيانات التحويل الفوري عبر كليك (CliQ):</span>
                  </div>
                  <span className="text-[10px] bg-[#2E5339] text-white px-2 py-0.5 rounded-md font-mono">
                    CliQ Jordan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Alias */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#C5DEC8] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#78716C] block">الاسم المستعار (Alias):</span>
                      <strong className="text-[#1C1917] font-mono text-sm">{cliqAlias}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cliqAlias, 'alias')}
                      className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE2D5] text-[#1C1917] border border-[#DDD5C7] cursor-pointer text-[10px] flex items-center gap-1"
                    >
                      {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'alias' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#C5DEC8] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#78716C] block">رقم هاتف كليك:</span>
                      <strong className="text-[#1C1917] font-mono text-sm">{cliqPhone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cliqPhone, 'phone')}
                      className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE2D5] text-[#1C1917] border border-[#DDD5C7] cursor-pointer text-[10px] flex items-center gap-1"
                    >
                      {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'phone' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2E5339] mb-1">
                    الرقم المرجعي للتحويل أو اسم الحساب المحول منه (اختياري للتحقق السريع):
                  </label>
                  <input
                    type="text"
                    value={cliqRef}
                    onChange={(e) => setCliqRef(e.target.value)}
                    placeholder="مثال: رقم العملية أو اسم حسابك في تطبيق البنك"
                    className="w-full text-xs py-2 px-3 bg-white border border-[#C5DEC8] rounded-xl text-[#1C1917]"
                  />
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد الخالدي"
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-hidden focus:border-[#8C6D46]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1C1917]">
                    رقم الهاتف للتوصيل *
                  </label>
                  <span className="text-[10px] text-[#8C6D46] font-mono">
                    10 أرقام (079 / 077 / 078)
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="مثال: 0779254134 أو 079xxxxxxx"
                  className={`w-full text-xs py-2 px-3 bg-[#FAF8F5] border rounded-xl focus:outline-hidden font-mono text-right transition-colors ${
                    phoneError
                      ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                      : 'border-[#DDD5C7] focus:border-[#8C6D46]'
                  }`}
                />
                {phoneError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  المحافظة *
                </label>
                <select
                  value={governorate}
                  onChange={(e) => {
                    setGovernorate(e.target.value);
                    setAutoDetectedGov(null);
                  }}
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-hidden focus:border-[#8C6D46] cursor-pointer"
                >
                  {jordanGovernorates.map((gov) => {
                    const fee = calculateDeliveryFee(gov);
                    return (
                      <option key={gov} value={gov}>
                        {gov} ({fee.toFixed(0)} د.أ)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1C1917]">
                    المنطقة واسم الشارع والعمارة *
                  </label>
                  <span className="text-[10px] text-[#78716C]">
                    (تحدد المحافظة تلقائياً عند كتابة المنطقة)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="مثال: جبل التاج، قرب الدوار، أو دابوق، عمارة 14"
                  className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-hidden focus:border-[#8C6D46]"
                />
                {autoDetectedGov && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#2E5339] bg-[#EDF4EE] px-2 py-1 rounded-md border border-[#C5DEC8]">
                    <span>📍</span>
                    <span>تم تحديد المحافظة تلقائياً: <strong>{autoDetectedGov}</strong> (أجور التوصيل: {deliveryFee.toFixed(2)} د.أ)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                ملاحظات إضافية للتوصيل (اختياري)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أوقات التوصيل المفضلة أو أي تفاصيل خاصة بالعنوان..."
                className="w-full text-xs py-2 px-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-hidden focus:border-[#8C6D46]"
              />
            </div>

            {/* Order Cost Preview */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EDE5D8] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#78716C]">
                <span>المجموع الفرعي ({items.reduce((s, i) => s + i.quantity, 0)} قطع)</span>
                <span className="font-mono font-bold text-[#1C1917]">
                  {subtotal.toFixed(2)} دينار أردني
                </span>
              </div>
              <div className="flex justify-between text-[#78716C]">
                <span>أجور التوصيل ({governorate})</span>
                <span className="font-semibold text-[#1C1917] font-mono">
                  {deliveryFee.toFixed(2)} د.أ
                </span>
              </div>
              <div className="text-[10px] text-[#8C6D46] bg-white p-2 rounded-lg border border-[#E8DFD3]">
                * لا يوجد توصيل مجاني: التوصيل داخل عمان 5 د.أ · خارج عمان 8 د.أ · العقبة 10 د.أ
              </div>
              <div className="pt-2 border-t border-[#E5DDD0] flex justify-between font-black text-sm text-[#1C1917]">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="font-mono text-base">{total.toFixed(2)} د.أ</span>
              </div>
            </div>

            <div className="p-3 bg-[#EDF4EE] border border-[#C5DEC8] rounded-xl flex items-start gap-2.5 text-xs text-[#2E5339]">
              <ShieldCheck className="w-4 h-4 text-[#2E5339] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#1E3B27] font-bold">✨ يوجد معاينة عند وصول الطلب</strong>
                <span className="text-[11px] leading-tight text-[#2E5339]">
                  يحق لك فحص ومعاينة الطاولة بالكامل عند وصول مندوب التوصيل لباب بيتك قبل الاستلام والدفع كاش أو عبر كليك (CliQ).
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 text-sm font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'جارٍ إرسال وتأكيد الطلب...' : 'تأكيد طلب الشراء الآن 🛒'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
