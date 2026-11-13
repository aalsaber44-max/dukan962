import React, { useState, useRef, useEffect } from 'react';
import {
  X, CheckCircle, Truck, ShieldCheck, Copy, Check, MessageCircle, Smartphone, AlertTriangle,
} from 'lucide-react';
import { CartItem, Product } from '../types/furniture';
import { db } from '../firebase';
import { collection, doc, increment, runTransaction } from 'firebase/firestore';
import {
  STORE_PHONE,
  STORE_PHONE_INTL,
  JORDAN_GOVERNORATES,
  calculateDeliveryFee,
  validateJordanPhone,
  detectGovernorateFromAddress,
} from '../utils/jordanLocations';
import { reconcileCart, aggregateItems } from '../utils/inventory';
import { stripUndefined } from '../utils/firestoreData';

/**
 * خطأ مخصص يُرفع من داخل transaction عند رفض الطلب (مخزون غير كافٍ أو تغيّر سعر).
 * نُرفقه بالمنتجات الجديدة (fresh) حتى تُحدَّث السلة تلقائياً بعد الفشل.
 */
class CheckoutRejected extends Error {
  readonly messages: string[];
  readonly freshProducts: Product[];
  constructor(messages: string[], freshProducts: Product[]) {
    super('CHECKOUT_REJECTED');
    this.name = 'CheckoutRejected';
    this.messages = messages;
    this.freshProducts = freshProducts;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  /** أحدث بيانات المنتجات (من App.tsx): تُستخدم لفحص مبدئي قبل المعاملة */
  products: Product[];
  /** يُستدعى إذا عدّل الفحص محتويات السلة (كمية مخفّضة/منتج نافد) لتحديث الواجهة */
  onCartChange?: (cart: CartItem[]) => void;
  onSuccessOrder: (orderData?: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  products,
  onCartChange,
  onSuccessOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cliq'>('cod');
  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [governorate, setGovernorate] = useState('عمان (العاصمة)');
  const [region, setRegion] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');
  const [cliqRef, setCliqRef] = useState('');
  const [copiedField, setCopiedField] = useState<'alias' | 'phone' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalWhatsAppUrl, setFinalWhatsAppUrl] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [phone1Error, setPhone1Error] = useState<string | null>(null);
  const [phone2Error, setPhone2Error] = useState<string | null>(null);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [streetError, setStreetError] = useState<string | null>(null);
  const [buildingError, setBuildingError] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string[]>([]);
  const [autoDetectedGov, setAutoDetectedGov] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const regionInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const buildingInputRef = useRef<HTMLInputElement>(null);

  // إعادة تصفير الجلسة عند كل فتح
  useEffect(() => {
    if (!isOpen) return;
    isSubmittingRef.current = false;
    setPaymentMethod('cod');
    setName('');
    setPhone1('');
    setPhone2('');
    setGovernorate('عمان (العاصمة)');
    setRegion('');
    setStreet('');
    setBuilding('');
    setNotes('');
    setCliqRef('');
    setCopiedField(null);
    setIsSubmitting(false);
    setOrderConfirmed(false);
    setOrderNumber('');
    setFinalWhatsAppUrl('');
    setNameError(null);
    setPhone1Error(null);
    setPhone2Error(null);
    setRegionError(null);
    setStreetError(null);
    setBuildingError(null);
    setCartError([]);
    setAutoDetectedGov(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const getItemUnitPrice = (item: CartItem) => {
    const colorPrice = Number(item.selectedColor?.price);
    const basePrice = Number(item.product?.basePrice);
    return Number.isFinite(colorPrice) && colorPrice > 0
      ? colorPrice
      : Number.isFinite(basePrice) && basePrice > 0
        ? basePrice
        : 0;
  };

  const subtotal = items.reduce(
    (acc, item) => acc + getItemUnitPrice(item) * Math.max(0, Number(item.quantity) || 0),
    0
  );
  const deliveryFee = calculateDeliveryFee(governorate, subtotal);
  const total = subtotal + deliveryFee;
  const totalItemsCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const cliqAlias = 'Mohammad Alkhatib';
  const cliqPhone = STORE_PHONE;

  const copyToClipboard = (text: string, field: 'alias' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegionChange = (val: string) => {
    setRegion(val);
    if (regionError && val.trim()) setRegionError(null);
    const detected = detectGovernorateFromAddress(val);
    if (detected) {
      setGovernorate(detected);
      setAutoDetectedGov(detected);
    } else {
      setAutoDetectedGov(null);
    }
  };

  const handlePhone1Change = (val: string) => {
    setPhone1(val);
    if (phone1Error) {
      const check = validateJordanPhone(val);
      if (check.isValid) setPhone1Error(null);
    }
  };

  const handlePhone2Change = (val: string) => {
    setPhone2(val);
    if (phone2Error) {
      const check = validateJordanPhone(val);
      if (check.isValid) setPhone2Error(null);
    }
  };

  const focusFirstError = (
    errors: { ref: React.RefObject<HTMLInputElement | null>; message: string | null }[]
  ): boolean => {
    const first = errors.find((e) => e.message !== null);
    if (first) {
      first.ref.current?.focus();
      first.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (items.length === 0) {
      setCartError(['السلة فارغة. أضف المنتجات قبل تأكيد الطلب.']);
      return;
    }

    // ── 1) تحقق من حقول النموذج ────────────────────────────────────────────
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    const nameOk = nameParts.length >= 4;
    setNameError(nameOk ? null : 'الرجاء إدخال الاسم الرباعي كاملاً (أربع مقاطع على الأقل) كما في هويتك.');

    const phone1Validation = validateJordanPhone(phone1);
    setPhone1Error(
      phone1Validation.isValid ? null : phone1Validation.error || 'رقم الهاتف الأساسي غير صالح.'
    );

    let phone2ErrorMsg: string | null = null;
    if (phone2.trim() !== '') {
      const phone2Validation = validateJordanPhone(phone2);
      if (!phone2Validation.isValid) {
        phone2ErrorMsg = phone2Validation.error || 'رقم الهاتف الإضافي غير صالح.';
      } else if (phone1Validation.cleaned === phone2Validation.cleaned) {
        phone2ErrorMsg = 'رقم الهاتف الإضافي يجب أن يكون مختلفاً عن الرقم الأساسي';
      }
    }
    setPhone2Error(phone2ErrorMsg);

    setRegionError(region.trim() ? null : 'اكتب المنطقة / الحي لتسهيل وصول المندوب');
    setStreetError(street.trim() ? null : 'اكتب اسم الشارع أو أقرب معلم واضح');
    setBuildingError(building.trim() ? null : 'اكتب رقم العمارة / البناية والطابق');

    const fieldsOk = focusFirstError([
      { ref: nameInputRef, message: nameOk ? null : 'err' },
      { ref: regionInputRef, message: region.trim() ? null : 'err' },
      { ref: streetInputRef, message: street.trim() ? null : 'err' },
      { ref: buildingInputRef, message: building.trim() ? null : 'err' },
    ]);
    if (!fieldsOk || !phone1Validation.isValid || phone2ErrorMsg !== null) return;

    // ── 2) فحص مبدئي على النسخة المحلية (لا يغني عن فحص المعاملة) ─────────
    const { cart: finalCart, messages: preflightMessages } = reconcileCart(items, products);
    if (preflightMessages.length > 0) {
      setCartError(preflightMessages);
      onCartChange?.(finalCart);
      return;
    }
    setCartError([]);

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // ── 3) المعاملة الذرية: فحص من السيرفر + خصم + إنشاء الطلب ──────────────
    let newOrderNumber = '';
    let newWhatsAppUrl = '';
    let newOrderData: any = null;

    try {
      await runTransaction(db, async (transaction) => {
        // (أ) قراءة كل المنتجات من السيرفر
        const aggregated = aggregateItems(finalCart);
        const productIds = Array.from(aggregated.keys());
        const productRefs = productIds.map((pid) => doc(db, 'products', pid));
        const productSnaps = await Promise.all(productRefs.map((r) => transaction.get(r)));

        const freshById = new Map<string, Product>();
        const stockErrors: string[] = [];
        const priceErrors: string[] = [];
        const toDeduct: Record<string, number> = {};

        // (ب) فحص المخزون
        for (let i = 0; i < productIds.length; i++) {
          const pid = productIds[i];
          const snap = productSnaps[i];
          if (!snap.exists()) {
            stockErrors.push(`أحد المنتجات في سلتك حُذف من المتجر`);
            continue;
          }
          const fresh = { ...snap.data(), id: pid } as Product;
          freshById.set(pid, fresh);

          const required = aggregated.get(pid) || 0;
          if (typeof fresh.stock === 'number') {
            const available = Math.max(0, Number(fresh.stock) || 0);
            if (available < required) {
              stockErrors.push(`${fresh.name}: المتاح ${available} فقط، المطلوب ${required}`);
            } else {
              toDeduct[pid] = required;
            }
          }
        }

        // (ج) فحص الأسعار والألوان
        finalCart.forEach((item) => {
          const fresh = freshById.get(item.product.id);
          if (!fresh) return; // سُجّل مسبقاً
          const freshColor = fresh.colors?.find((c) => c.name === item.selectedColor.name);
          if (!freshColor) {
            priceErrors.push(`${fresh.name}: اللون "${item.selectedColor.name}" لم يعد متاحاً`);
            return;
          }
          const clientPrice = Number(item.selectedColor.price) || Number(item.product.basePrice) || 0;
          const serverPrice = Number(freshColor.price) || Number(fresh.basePrice) || 0;
          if (Math.abs(clientPrice - serverPrice) > 0.01) {
            priceErrors.push(
              `${fresh.name}: السعر تغيّر من ${clientPrice.toFixed(2)} إلى ${serverPrice.toFixed(2)} د.أ`
            );
          }
        });

        // لو أي فحص فشل → نرفض المعاملة (لا يُحفظ شيء)
        if (stockErrors.length > 0 || priceErrors.length > 0) {
          throw new CheckoutRejected(
            [...stockErrors, ...priceErrors],
            Array.from(freshById.values())
          );
        }

        // (د) رقم طلب فريد عبر counter document
        const counterRef = doc(db, 'counters', 'orders');
        const counterSnap = await transaction.get(counterRef);
        const currentCount = Number(counterSnap.exists() ? counterSnap.data().count : 0) || 10000;
        const nextNumber = currentCount + 1;
        transaction.set(counterRef, { count: nextNumber }, { merge: true });
        newOrderNumber = `DUKAN-${nextNumber}`;

        // (هـ) حساب المجاميع من finalCart (الأسعار تحققت = أسعار السيرفر)
        const finalSubtotal = finalCart.reduce(
          (acc, it) => acc + getItemUnitPrice(it) * Math.max(0, Number(it.quantity) || 0),
          0
        );
        const finalDeliveryFee = calculateDeliveryFee(governorate, finalSubtotal);
        const finalTotal = finalSubtotal + finalDeliveryFee;

        // (و) خصم المخزون للمنتجات المتتبَّعة
        Object.entries(toDeduct).forEach(([pid, qty]) => {
          transaction.update(doc(db, 'products', pid), { stock: increment(-qty) });
        });

        // (ز) بناء مستند الطلب
        const payload = stripUndefined({
          id: newOrderNumber,
          name: name.trim(),
          phone: phone1Validation.cleaned,
          phone2: phone2.trim() ? validateJordanPhone(phone2).cleaned : '',
          governorate,
          address: `المنطقة: ${region.trim()} - الشارع: ${street.trim()} - العمارة: ${building.trim()}`,
          region: region.trim(),
          street: street.trim(),
          building: building.trim(),
          notes: notes.trim(),
          paymentMethod,
          cliqRef: paymentMethod === 'cliq' ? cliqRef.trim() : '',
          items: finalCart,
          subtotal: finalSubtotal,
          deliveryFee: finalDeliveryFee,
          total: finalTotal,
          status: 'جديد',
          stockDeducted: true,
          stockDeductions: toDeduct,
          createdAt: new Date().toISOString(),
        });

        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, payload);
        newOrderData = { ...payload, firestoreId: orderRef.id };

        // (ح) رابط واتساب
        const paymentLabel =
          paymentMethod === 'cod'
            ? 'الدفع كاش عند الاستلام بعد المعاينة'
            : `تحويل كليك CliQ${cliqRef ? ' (مرجع: ' + cliqRef + ')' : ''}`;
        const whatsAppText = encodeURIComponent(
          `*طلب جديد من دكان 962*\n\n` +
          `*رقم الطلب:* ${newOrderNumber}\n` +
          `*الاسم:* ${name.trim()}\n` +
          `*الهاتف:* ${phone1Validation.cleaned}\n` +
          (phone2.trim() ? `*هاتف بديل:* ${validateJordanPhone(phone2).cleaned}\n` : '') +
          `*العنوان:* ${governorate} - ${region.trim()} - ${street.trim()} - عمارة ${building.trim()}\n` +
          (notes.trim() ? `*ملاحظات:* ${notes.trim()}\n` : '') +
          `*طريقة الدفع:* ${paymentLabel}\n\n` +
          `*المنتجات:*\n` +
          finalCart.map((it, i) => {
            const imgUrl = it.selectedColor?.image || it.product?.images?.[0] || '';
            const isBase64 = imgUrl.startsWith('data:image');
            const imgText = isBase64 ? '(الصورة في لوحة التحكم)' : imgUrl;
            return `${i + 1}. *${it.product?.name || 'قطعة'}*\n- اللون: ${it.selectedColor?.name || '-'}\n- الكمية: ${it.quantity}\n- السعر: ${(getItemUnitPrice(it) * it.quantity).toFixed(2)} د.أ\n- الصورة: ${imgText}`;
          }).join('\n\n') +
          `\n\n------------------------\n` +
          `*المجموع الفرعي:* ${finalSubtotal.toFixed(2)} د.أ\n` +
          `*أجور التوصيل (${governorate}):* ${finalDeliveryFee === 0 ? 'مجاني' : finalDeliveryFee.toFixed(2) + ' د.أ'}\n` +
          `*الإجمالي النهائي:* ${finalTotal.toFixed(2)} دينار أردني\n\n` +
          `يرجى تأكيد استلام الطلب وتحديد موعد التوصيل.`
        );
        newWhatsAppUrl = `https://api.whatsapp.com/send?phone=${STORE_PHONE_INTL}&text=${whatsAppText}`;
      });

      // ── 4) النجاح ──────────────────────────────────────────────────────
      setOrderNumber(newOrderNumber);
      setFinalWhatsAppUrl(newWhatsAppUrl);
      setOrderConfirmed(true);
      setIsSubmitting(false);
      onSuccessOrder(newOrderData);
    } catch (error) {
      // ── 5) الفشل ────────────────────────────────────────────────────────
      if (error instanceof CheckoutRejected) {
        setCartError(error.messages);
        // حدّث السلة بأحدث بيانات (أسعار/مخزون) واعرضها للزبون
        onCartChange?.(reconcileCart(items, error.freshProducts).cart);
      } else {
        console.error('Checkout transaction error:', error);
        setCartError([
          'عذراً، تعذّر إتمام الطلب في السحابة. حاول مرة أخرى، أو أرسل الطلب مباشرة عبر واتساب.',
        ]);
      }
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const jordanGovernorates = JORDAN_GOVERNORATES;

  // قسم كليك (كما هو)
  const cliqSection =
    paymentMethod === 'cliq' ? (
      <div className="bg-[#7FD1A0]/10 border border-[#7FD1A0]/25 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7FD1A0]">
            <Smartphone className="w-4 h-4" />
            <span>بيانات التحويل:</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#141210] p-2.5 rounded-xl border border-[#7FD1A0]/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#A39A8B] block">اسم الحساب:</span>
              <strong className="text-[#F3EEE4] font-mono text-sm">{cliqAlias}</strong>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(cliqAlias, 'alias')}
              className="p-1.5 rounded-lg bg-[#1C1815] hover:bg-[#26211D] border cursor-pointer text-[10px] flex items-center gap-1"
            >
              {copiedField === 'alias' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="bg-[#141210] p-2.5 rounded-xl border border-[#7FD1A0]/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#A39A8B] block">رقم الهاتف:</span>
              <strong className="text-[#F3EEE4] font-mono text-sm">{cliqPhone}</strong>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(cliqPhone, 'phone')}
              className="p-1.5 rounded-lg bg-[#1C1815] hover:bg-[#26211D] border cursor-pointer text-[10px] flex items-center gap-1"
            >
              {copiedField === 'phone' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#7FD1A0] mb-1">
            رقم عملية التحويل أو اسم الحساب (اختياري):
          </label>
          <input
            type="text"
            value={cliqRef}
            onChange={(e) => setCliqRef(e.target.value)}
            placeholder="مثال: رقم العملية..."
            className="w-full text-xs py-2 px-3 bg-[#141210] border border-[#7FD1A0]/25 rounded-xl"
          />
        </div>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141210] rounded-3xl shadow-2xl border border-white/10 flex flex-col my-3 sm:my-6 max-h-[94vh] sm:max-h-[90vh]">

        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1C1815] rounded-t-3xl shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F3EEE4]">
              {orderConfirmed ? 'تم تأكيد طلبك في دكان 962' : 'إتمام الطلب وتحديد التوصيل'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#A39A8B] mt-0.5">
              {orderConfirmed
                ? 'شكراً لاختيارك طاولات دكان 962 للأثاث'
                : 'التوصيل لجميع المحافظات والدفع عند الاستلام أو كليك'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-[#141210]/10 hover:bg-[#141210]/15 text-[#F3EEE4] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8">
          {orderConfirmed ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-400/25">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-[#D4B06A] uppercase tracking-wider">رقم تتبع الطلب</span>
              <h4 className="text-2xl font-black text-[#F3EEE4] font-mono mt-1 mb-2">{orderNumber}</h4>

              <div className="inline-flex items-center gap-3 bg-[#1C1815] ring-1 ring-white/10 rounded-2xl px-4 py-2.5 mb-4 text-xs">
                <span className="text-[#A39A8B]">
                  القطع: <strong className="text-[#F3EEE4] font-mono">{totalItemsCount}</strong>
                </span>
                <span aria-hidden="true" className="h-3.5 w-px bg-white/15" />
                <span className="text-[#A39A8B]">
                  المبلغ النهائي:{' '}
                  <strong className="text-[#E8CC8A] font-mono">{total.toFixed(2)} د.أ</strong>
                </span>
              </div>

              <p className="text-xs text-[#B9B0A0] leading-relaxed max-w-md mx-auto mb-5">
                تم استلام طلبك وحفظه بنجاح، وحجز الكميات لك. يمكنك الآن إرسال نسخة من الطلب إلى واتساب
                مندوب المتجر لتأكيد موعد التسليم فوراً.
              </p>
              <div className="mb-6">
                <a
                  href={finalWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 text-xs sm:text-sm font-bold text-white bg-[#2E5339] hover:bg-[#1E3826] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>إرسال تفاصيل الطلب عبر واتساب</span>
                </a>
              </div>
              <button
                onClick={onClose}
                className="py-2.5 px-8 text-xs font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl transition-all cursor-pointer"
              >
                العودة إلى المعرض
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {cartError.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-3.5 space-y-1.5" role="alert">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>يرجى المراجعة قبل تأكيد الطلب:</span>
                  </div>
                  {cartError.map((msg, i) => (
                    <p key={i} className="text-[11px] text-rose-200/90 leading-relaxed pr-6">
                      • {msg}
                    </p>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#F3EEE4] mb-2">
                  اختر طريقة الدفع: <span className="text-rose-300">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#D4B06A] bg-[#1C1815] ring-1 ring-[#D4B06A]'
                        : 'border-white/10 hover:border-white/10'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#D4B06A] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#F3EEE4]">الدفع عند الاستلام</p>
                      <p className="text-[10px] text-[#A39A8B]">كاش بعد المعاينة</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cliq')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                      paymentMethod === 'cliq'
                        ? 'border-[#D4B06A] bg-[#1C1815] ring-1 ring-[#D4B06A]'
                        : 'border-white/10 hover:border-white/10'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#7FD1A0] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#7FD1A0]">دفع كليك (CliQ)</p>
                      <p className="text-[10px] text-[#A39A8B]">تحويل فوري</p>
                    </div>
                  </button>
                </div>
              </div>

              {cliqSection}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">
                    الاسم الكامل (الرباعي) *
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder="مثال: محمد أحمد علي محمود"
                    className={`w-full text-sm sm:text-xs py-2.5 sm:py-2 px-3 bg-[#1C1815] border rounded-xl ${
                      nameError ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'
                    }`}
                  />
                  {nameError && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">{nameError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">
                    رقم الهاتف الأساسي *
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    dir="ltr"
                    autoComplete="tel-national"
                    value={phone1}
                    onChange={(e) => handlePhone1Change(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className={`w-full text-sm sm:text-xs py-2.5 sm:py-2 px-3 bg-[#1C1815] border rounded-xl font-mono text-right ${
                      phone1Error ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'
                    }`}
                  />
                  {phone1Error && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">{phone1Error}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">
                    رقم هاتف إضافي (اختياري)
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    value={phone2}
                    onChange={(e) => handlePhone2Change(e.target.value)}
                    placeholder="رقم بديل..."
                    className={`w-full text-sm sm:text-xs py-2.5 sm:py-2 px-3 bg-[#1C1815] border rounded-xl font-mono text-right ${
                      phone2Error ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'
                    }`}
                  />
                  {phone2Error && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">{phone2Error}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-[#F3EEE4] mb-2">
                  عنوان التوصيل بالتفصيل <span className="text-rose-300">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">
                      المحافظة *
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => {
                        setGovernorate(e.target.value);
                        setAutoDetectedGov(null);
                      }}
                      className="w-full text-sm sm:text-xs py-2.5 sm:py-2 px-2 bg-[#1C1815] border border-white/10 rounded-xl"
                    >
                      {jordanGovernorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">
                      المنطقة / الحي *
                    </label>
                    <input
                      ref={regionInputRef}
                      type="text"
                      required
                      value={region}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      placeholder="مثال: جبل عمان"
                      className={`w-full text-sm sm:text-xs py-2.5 sm:py-2 px-2 bg-[#1C1815] border rounded-xl ${
                        regionError ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'
                      }`}
                    />
                    {regionError && (
                      <p className="text-[10px] text-rose-400 mt-1 font-semibold">{regionError}</p>
                    )}
                    {!regionError && autoDetectedGov && (
                      <span className="text-[9px] text-[#7FD1A0] mt-1 block">
                        تم تحديد المحافظة تلقائياً ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">
                      اسم الشارع / أقرب معلم *
                    </label>
                    <input
                      ref={streetInputRef}
                      type="text"
                      required
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        if (streetError && e.target.value.trim()) setStreetError(null);
                      }}
                      placeholder="مثال: شارع المدينة المنورة"
                      className={`w-full text-sm sm:text-xs py-2.5 sm:py-2 px-2 bg-[#1C1815] border rounded-xl ${
                        streetError ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'
                      }`}
                    />
                    {streetError && (
                      <p className="text-[10px] text-rose-400 mt-1 font-semibold">{streetError}</p>
                    )}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">
                      رقم العمارة / البناية والطابق *
                    </label>
                    <input
                      ref={buildingInputRef}
                      type="text"
                      required
                      value={building}
                      onChange={(e) => {
                        setBuilding(e.target.value);
                        if (buildingError && e.target.value.trim()) setBuildingError(null);
                      }}
                      placeholder="مثال: عمارة رقم 14، الطابق 2"
                      className={`w-full text-sm sm:text-xs py-2.5 sm:py-2 px-2 bg-[#1C1815] border rounded-xl ${
                        buildingError ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'
                      }`}
                    />
                    {buildingError && (
                      <p className="text-[10px] text-rose-400 mt-1 font-semibold">{buildingError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">
                  ملاحظات إضافية للتوصيل (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أوقات التوصيل المفضلة أو أي تفاصيل خاصة..."
                  className="w-full text-sm sm:text-xs py-2.5 sm:py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl"
                />
              </div>

              <div className="bg-[#1C1815] p-4 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#A39A8B]">
                  <span>المجموع الفرعي ({totalItemsCount} قطعة)</span>
                  <span className="font-mono font-bold text-[#F3EEE4]">{subtotal.toFixed(2)} د.أ</span>
                </div>
                <div className="flex justify-between text-[#A39A8B]">
                  <span>أجور التوصيل ({governorate})</span>
                  <span
                    className={`font-semibold font-mono ${
                      deliveryFee === 0 ? 'text-[#7FD1A0]' : 'text-[#F3EEE4]'
                    }`}
                  >
                    {deliveryFee === 0 ? 'مجاني' : `${deliveryFee.toFixed(2)} د.أ`}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-black text-sm text-[#F3EEE4]">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-mono text-base">{total.toFixed(2)} د.أ</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 text-sm font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'جارٍ التحقق والحفظ...' : 'تأكيد طلب الشراء الآن 🛒'}</span>
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[10px] text-[#8A8173]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7FD1A0]" />
                يتم فحص المخزون والسعر من السيرفر داخل معاملة واحدة — لن يُقبل طلب على منتج نافد أو بسعر قديم
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
