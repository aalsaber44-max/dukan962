import React, { useState, useRef, useEffect } from 'react';
import { stripEmoji } from '../utils/emoji';
import { X, CheckCircle, Truck, ShieldCheck, Copy, Check, MessageCircle, Smartphone, AlertTriangle } from 'lucide-react';
import { CartItem, Product } from '../types/furniture';
import { db } from '../firebase';
import { collection, doc, runTransaction } from 'firebase/firestore';
import {
  STORE_PHONE,
  STORE_PHONE_INTL,
  JORDAN_GOVERNORATES,
  calculateDeliveryFee,
  validateJordanPhone,
  detectGovernorateFromAddress,
} from '../utils/jordanLocations';
import { reconcileCart } from '../utils/inventory';
import { stripUndefined } from '../utils/firestoreData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  products: Product[];
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
  const [paymentMethod, setPaymentMethod] = useState<'cod'| 'cliq'>('cod');
  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [governorate, setGovernorate] = useState('عمان (العاصمة)');
  const [region, setRegion] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');
  const [cliqRef, setCliqRef] = useState('');
  const [copiedField, setCopiedField] = useState<'alias'| 'phone'| null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalWhatsAppUrl, setFinalWhatsAppUrl] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [confirmedItemsCount, setConfirmedItemsCount] = useState(0);

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
  
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cartError.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center'});
    }
  }, [cartError]);

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
    setConfirmedTotal(0);
    setConfirmedItemsCount(0);
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

  const copyToClipboard = (text: string, field: 'alias'| 'phone') => {
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
      first.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center'});
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

    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    const nameOk = nameParts.length >= 4;
    setNameError(nameOk ? null : 'الرجاء إدخال الاسم الرباعي كاملاً (أربع مقاطع على الأقل) كما في هويتك.');

    const phone1Validation = validateJordanPhone(phone1);
    setPhone1Error(phone1Validation.isValid ? null : phone1Validation.error || 'رقم الهاتف الأساسي غير صالح.');

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
      { ref: nameInputRef, message: nameOk ? null : 'err'},
      { ref: regionInputRef, message: region.trim() ? null : 'err'},
      { ref: streetInputRef, message: street.trim() ? null : 'err'},
      { ref: buildingInputRef, message: building.trim() ? null : 'err'},
    ]);
    if (!fieldsOk || !phone1Validation.isValid || phone2ErrorMsg !== null) {
      return;
    }

    const { cart: preCart, messages: preMessages } = reconcileCart(items, products);
    if (preMessages.length > 0) {
      setCartError(preMessages);
      onCartChange?.(preCart);
      return;
    }
    if (preCart.length === 0) {
      setCartError(['لا توجد منتجات صالحة في السلة بعد الفحص.']);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setCartError([]);

    const fullAddress = `المنطقة: ${region.trim()} - الشارع: ${street.trim()} - العمارة: ${building.trim()}`;
    const paymentLabel = paymentMethod === 'cod'? 'الدفع كاش عند الاستلام بعد المعاينة': `تحويل كليك CliQ (${cliqRef ? 'مرجع: '+ cliqRef : 'بانتظار التحويل'})`;

    const orderDocRef = doc(collection(db, 'orders'));
    const counterDocRef = doc(db, 'counters', 'orders');

    try {
      const result = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterDocRef);
        const rawCount = counterSnap.exists() ? counterSnap.data().count : 10000;
        const currentCount = Number.isFinite(Number(rawCount)) ? Number(rawCount) : 10000;
        const nextCount = currentCount + 1;
        const orderNumberStr = `DUKAN-${nextCount}`;

        const uniqueProductIds = Array.from(
          new Set(preCart.map((it) => it.product?.id).filter((id): id is string => Boolean(id)))
        );
        const productSnaps = await Promise.all(
          uniqueProductIds.map((pid) => transaction.get(doc(db, 'products', pid)))
        );
        const serverProducts = new Map<string, any>();
        uniqueProductIds.forEach((pid, idx) => {
          const snap = productSnaps[idx];
          serverProducts.set(pid, snap.exists() ? { ...snap.data(), __ref: doc(db, 'products', pid) } : null);
        });

        const validationErrors: string[] = [];
        const rebuiltCart: CartItem[] = [];
        const updatedRootStockByProduct = new Map<string, number>();
        
        //إضافة متغير لحفظ الكميات المخصومة لكل منتج
        const stockDeductions: Record<string, number> = {}; 
        
        let finalSubtotal = 0;

        for (const cartItem of preCart) {
          const pid = cartItem.product?.id;
          if (!pid) {
            validationErrors.push('إحدى القطع في السلة بدون معرّف منتج صالح.');
            continue;
          }
          const serverProduct = serverProducts.get(pid);
          if (!serverProduct) {
            validationErrors.push(`المنتج "${cartItem.product?.name || pid}"لم يعد موجوداً في المتجر.`);
            continue;
          }

          const serverBasePrice = Number(serverProduct.basePrice);
          const serverColors: any[] = Array.isArray(serverProduct.colors) ? [...serverProduct.colors] : [];
          const needQty = Math.max(0, Number(cartItem.quantity) || 0);
          const cartPrice = getItemUnitPrice(cartItem);

          const productStock = typeof serverProduct.stock === 'number'? Math.max(0, Number(serverProduct.stock)) : Infinity;
          const prevStock = updatedRootStockByProduct.get(pid) ?? productStock;

          if (prevStock < needQty) {
             validationErrors.push(
                `الكمية المطلوبة من "${stripEmoji(serverProduct.name)}"غير متوفرة (المتاح: ${prevStock === Infinity ? 'غير محدود': prevStock}، المطلوب: ${needQty}).`);
             continue;
          }
          
          if (prevStock !== Infinity) {
             updatedRootStockByProduct.set(pid, prevStock - needQty);
             //تسجيل الكمية المخصومة
             stockDeductions[pid] = (stockDeductions[pid] || 0) + needQty;
          }

          if (serverColors.length > 0) {
            const colorName = cartItem.selectedColor?.name;
            const colorIdx = serverColors.findIndex((c) => c?.name === colorName);
            if (colorIdx === -1) {
              validationErrors.push(`اللون "${colorName || 'غير محدد'}"من "${stripEmoji(serverProduct.name)}"لم يعد متوفراً.`);
              continue;
            }
            const serverColor = serverColors[colorIdx];
            const serverColorPrice = Number(serverColor.price);
            
            const effectiveServerPrice = Number.isFinite(serverColorPrice) && serverColorPrice > 0
              ? serverColorPrice
              : (Number.isFinite(serverBasePrice) && serverBasePrice > 0 ? serverBasePrice : 0);

            if (Math.abs(effectiveServerPrice - cartPrice) > 0.01) {
              validationErrors.push(
                `تغيّر سعر "${stripEmoji(serverProduct.name)} - ${stripEmoji(colorName)}"من ${cartPrice.toFixed(2)} إلى ${effectiveServerPrice.toFixed(2)} د.أ. يرجى تحديث السلة.`);
              continue;
            }

            finalSubtotal += effectiveServerPrice * needQty;

            rebuiltCart.push({
              ...cartItem,
              quantity: needQty,
              product: { ...cartItem.product, basePrice: serverBasePrice, stock: serverProduct.stock },
              selectedColor: { ...cartItem.selectedColor, price: effectiveServerPrice },
            });
          } else {
            const effectiveServerPrice = Number.isFinite(serverBasePrice) && serverBasePrice > 0 ? serverBasePrice : 0;
            
            if (Math.abs(effectiveServerPrice - cartPrice) > 0.01) {
              validationErrors.push(
                `تغيّر سعر "${stripEmoji(serverProduct.name)}"من ${cartPrice.toFixed(2)} إلى ${effectiveServerPrice.toFixed(2)} د.أ. يرجى تحديث السلة.`);
              continue;
            }

            finalSubtotal += effectiveServerPrice * needQty;

            rebuiltCart.push({
              ...cartItem,
              quantity: needQty,
              product: { ...cartItem.product, basePrice: serverBasePrice, stock: serverProduct.stock },
            });
          }
        }

        if (validationErrors.length > 0) {
          const err: any = new Error('STOCK_VALIDATION_FAILED');
          err.validationErrors = validationErrors;
          throw err;
        }

        const finalDeliveryFee = calculateDeliveryFee(governorate, finalSubtotal);
        const finalTotal = finalSubtotal + finalDeliveryFee;

        const orderPayload = stripUndefined({
          id: orderNumberStr,
          name: name.trim(),
          phone: phone1Validation.cleaned,
          phone2: phone2.trim() ? validateJordanPhone(phone2).cleaned : '',
          governorate,
          address: fullAddress,
          region: region.trim(),
          street: street.trim(),
          building: building.trim(),
          notes: notes.trim(),
          paymentMethod,
          cliqRef: paymentMethod === 'cliq'? cliqRef.trim() : '',
          items: rebuiltCart,
          subtotal: finalSubtotal,
          deliveryFee: finalDeliveryFee,
          total: finalTotal,
          status: 'جديد',
          stockDeducted: true,
          stockDeductions: stockDeductions, //حفظ الكميات المخصومة في الفاتورة
          createdAt: new Date().toISOString(),
        });

        transaction.set(orderDocRef, orderPayload);
        transaction.set(counterDocRef, { count: nextCount }, { merge: true });

        for (const [pid, newStock] of updatedRootStockByProduct.entries()) {
          const ref = serverProducts.get(pid)?.__ref;
          if (ref) transaction.update(ref, { stock: newStock });
        }

        return {
          orderNumber: orderNumberStr,
          orderPayload,
          cart: rebuiltCart,
          subtotal: finalSubtotal,
          deliveryFee: finalDeliveryFee,
          total: finalTotal,
        };
      });

      setOrderNumber(result.orderNumber);
      setConfirmedTotal(result.total);
      setConfirmedItemsCount(result.cart.reduce((s, i) => s + i.quantity, 0));

      const whatsAppText = encodeURIComponent(
        `*طلب جديد من متجر دكان 962 للأثاث*\n\n`+
        `*رقم الطلب:* ${result.orderNumber}\n`+
        `*الاسم:* ${name.trim()}\n`+
        `*رقم الهاتف 1:* ${phone1Validation.cleaned}\n`+
        (phone2 ? `*رقم الهاتف 2:* ${validateJordanPhone(phone2).cleaned}\n`: '') +
        `*العنوان:* ${governorate} - ${region.trim()} - ${street.trim()} - عمارة ${building.trim()}\n`+
        (notes.trim() ? `*ملاحظات:* ${notes.trim()}\n`: '') +
        `*طريقة الدفع:* ${paymentLabel}\n\n`+
        `*تفاصيل المنتجات المطلوبة:*\n`+
        result.cart.map((it, i) => {
          const imgUrl = it.selectedColor?.image || it.product?.images?.[0] || '';
          const isBase64 = imgUrl.startsWith('data:image');
          const imgText = isBase64 ? '(الصورة متوفرة في لوحة التحكم)': imgUrl;
          return `${i + 1}. *${it.product?.name || 'قطعة'}*\n- اللون: ${it.selectedColor?.name || 'غير محدد'}\n- الكمية: ${it.quantity}\n- السعر: ${(getItemUnitPrice(it) * it.quantity).toFixed(2)} د.أ\n- صورة المنتج: ${imgText}`;
        }).join('\n\n') +
        `\n\n------------------------\n`+
        `*المجموع الفرعي:* ${result.subtotal.toFixed(2)} د.أ\n`+
        `*أجور التوصيل (${governorate}):* ${result.deliveryFee === 0 ? 'مجاني': `${result.deliveryFee.toFixed(2)} د.أ`}\n`+
        `*المبلغ الإجمالي النهائي:* ${result.total.toFixed(2)} دينار أردني\n\n`+
        `يرجى تأكيد استلام الطلب وتحديد موعد التوصيل.`);

      setFinalWhatsAppUrl(
        `https://api.whatsapp.com/send?phone=${STORE_PHONE_INTL}&text=${whatsAppText}`);

      setIsSubmitting(false);
      setOrderConfirmed(true);
      isSubmittingRef.current = false;

      onSuccessOrder({ ...result.orderPayload, firestoreId: orderDocRef.id });
    } catch (error: any) {
      console.error('Error processing order transaction:', error);
      isSubmittingRef.current = false;
      setIsSubmitting(false);

      if (error?.validationErrors && Array.isArray(error.validationErrors)) {
        setCartError(error.validationErrors);
        if (products && products.length > 0) {
          const { cart: syncedCart } = reconcileCart(items, products);
          onCartChange?.(syncedCart);
        }
      } else {
        setCartError([
          'عذراً، حدث خطأ أثناء حفظ طلبك في السحابة. يرجى المحاولة مرة أخرى أو إرسال الطلب مباشرة عبر واتساب.',
        ]);
      }
    }
  };

  const jordanGovernorates = JORDAN_GOVERNORATES;

  const cliqSection = paymentMethod === 'cliq'? (
    <div className="bg-[var(--sf-success)]/5 border border-[#7FD1A0]/20 rounded-2xl p-4 space-y-4 animate-fade">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--sf-success)]">
        <Smartphone className="w-4 h-4"/>
        <span>بيانات التحويل عبر تطبيق كليك (CliQ):</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-[var(--sf-surface)] p-3 rounded-xl border border-[#7FD1A0]/20 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-[var(--sf-muted)] block mb-0.5">اسم الحساب:</span>
            <strong className="text-[var(--sf-text)] font-mono text-sm">{cliqAlias}</strong>
          </div>
          <button type="button"onClick={() => copyToClipboard(cliqAlias, 'alias')} className="p-2 rounded-lg bg-[var(--sf-panel)] hover:bg-[var(--sf-panel-2)] border border-[var(--sf-border)] cursor-pointer text-[var(--sf-muted)] transition-colors">
            {copiedField === 'alias'? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
          </button>
        </div>

        <div className="bg-[var(--sf-surface)] p-3 rounded-xl border border-[#7FD1A0]/20 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-[var(--sf-muted)] block mb-0.5">رقم الهاتف:</span>
            <strong className="text-[var(--sf-text)] font-mono text-sm" dir="ltr">{cliqPhone}</strong>
          </div>
          <button type="button"onClick={() => copyToClipboard(cliqPhone, 'phone')} className="p-2 rounded-lg bg-[var(--sf-panel)] hover:bg-[var(--sf-panel-2)] border border-[var(--sf-border)] cursor-pointer text-[var(--sf-muted)] transition-colors">
            {copiedField === 'phone'? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-[var(--sf-success)] mb-1.5">رقم عملية التحويل (اختياري):</label>
        <input type="text" value={cliqRef} onChange={(e) => setCliqRef(e.target.value)} placeholder="مثال: رقم العملية..." className="w-full text-xs py-2.5 px-3 bg-[var(--sf-surface)] border border-[var(--sf-border)] focus:border-[#7FD1A0] focus:ring-1 focus:ring-[var(--sf-success)] rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] transition-all outline-none"/>
      </div>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade">
      <div className="relative w-full max-w-2xl bg-[var(--sf-surface)] rounded-3xl shadow-[0_0_80px_-20px_var(--sf-accent-soft)] border border-[var(--sf-border)] flex flex-col my-4 sm:my-6 max-h-[94vh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--sf-border)] flex items-center justify-between bg-[var(--sf-panel)] rounded-t-3xl shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--sf-text)] font-serif flex items-center gap-2">
              {orderConfirmed ? (
                <><CheckCircle className="w-5 h-5 text-emerald-400"/> تم تأكيد طلبك بنجاح</>
              ) : (
                'إتمام الطلب وتحديد التوصيل')}
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--sf-muted)] mt-1">
              {orderConfirmed ? 'شكراً لاختيارك دكان 962، نعتز بثقتك بنا.': 'التوصيل لجميع المحافظات والدفع عند الاستلام أو كليك'}
            </p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2.5 rounded-full bg-[var(--sf-surface)]/50 hover:bg-[var(--sf-surface)]/80 text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition-colors cursor-pointer disabled:opacity-50">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-8 custom-scrollbar">
          {orderConfirmed ? (
            /*شاشة النجاح الفاخرة */
            <div className="text-center py-6">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"/>
                <div className="relative w-full h-full rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border-2 border-emerald-400/30 shadow-inner">
                  <CheckCircle className="w-12 h-12"/>
                </div>
              </div>
              
              <span className="text-xs font-bold text-[var(--sf-muted)] uppercase tracking-wider mb-1 block">رقم تتبع الطلب</span>
              <h4 className="text-3xl sm:text-4xl font-black text-[var(--sf-accent)] font-mono mb-4 drop-shadow-md">{orderNumber}</h4>

              <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 bg-[var(--sf-panel)] ring-1 ring-[var(--sf-border)] rounded-2xl px-6 py-4 mb-6 text-sm shadow-lg">
                <span className="text-[var(--sf-muted)] flex items-center gap-2">
                  إجمالي القطع: <strong className="text-[var(--sf-text)] font-mono text-base">{confirmedItemsCount}</strong>
                </span>
                <span aria-hidden="true" className="hidden sm:block h-4 w-px bg-white/15"/>
                <span className="text-[var(--sf-muted)] flex items-center gap-2">
                  المبلغ النهائي: <strong className="text-[var(--sf-accent)] font-mono text-lg">{confirmedTotal.toFixed(2)} د.أ</strong>
                </span>
              </div>

              <p className="text-xs text-[var(--sf-muted)] leading-relaxed max-w-md mx-auto mb-8">
                تم استلام طلبك وحفظه بنجاح في السحابة. يمكنك الآن إرسال نسخة من الطلب مباشرة إلى واتساب مندوب المتجر لتأكيد موعد التسليم فوراً.
              </p>
              
              <div className="max-w-sm mx-auto space-y-3">
                <a href={finalWhatsAppUrl} target="_blank"rel="noopener noreferrer" className="w-full py-4 px-6 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1FAF5E] rounded-xl shadow-[0_8px_20px_-8px_rgba(37,211,102,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                  <MessageCircle className="w-5 h-5"/>
                  <span>إرسال الطلب إلى واتساب</span>
                </a>
                <button onClick={onClose} className="w-full py-3 px-6 text-sm font-bold text-[var(--sf-text)] bg-white/5 hover:bg-[var(--sf-soft-strong)] rounded-xl transition-all cursor-pointer">
                  العودة إلى المعرض
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6"noValidate>

              {/* Error Message Container */}
              {cartError.length > 0 && (
                <div ref={errorRef} className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-4 space-y-2 shadow-[0_0_15px_rgba(225,29,72,0.1)]" role="alert">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                    <AlertTriangle className="w-5 h-5 shrink-0"/>
                    <span>تعذر إتمام الطلب، يرجى المراجعة:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {cartError.map((msg, i) => (
                      <li key={i} className="text-xs text-rose-200/90 leading-relaxed pl-1">{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-[var(--sf-text)] mb-3">اختر طريقة الدفع <span className="text-rose-400">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button"onClick={() => setPaymentMethod('cod')} className={`p-4 rounded-2xl border text-right transition-all duration-300 flex items-center gap-3 cursor-pointer ${paymentMethod === 'cod'? 'border-[var(--sf-accent)] bg-[var(--sf-accent-soft)] shadow-[0_0_15px_var(--sf-accent-soft)] ring-1 ring-[var(--sf-accent)]': 'border-[var(--sf-border)] bg-[var(--sf-panel)] hover:border-[var(--sf-accent)]/50 hover:bg-white/5'}`}>
                    <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${paymentMethod === 'cod'? 'bg-[var(--sf-accent)] text-[var(--sf-accent-contrast)]': 'bg-white/5 text-[var(--sf-muted)]'}`}>
                      <Truck className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'cod'? 'text-[var(--sf-accent)]': 'text-[var(--sf-text)]'}`}>الدفع عند الاستلام</p>
                      <p className="text-[11px] text-[var(--sf-muted)] mt-0.5">كاش بعد المعاينة</p>
                    </div>
                  </button>
                  
                  <button type="button"onClick={() => setPaymentMethod('cliq')} className={`p-4 rounded-2xl border text-right transition-all duration-300 flex items-center gap-3 cursor-pointer ${paymentMethod === 'cliq'? 'border-[#7FD1A0] bg-[var(--sf-success-soft)] shadow-[0_0_15px_rgba(127,209,160,0.15)] ring-1 ring-[var(--sf-success)]': 'border-[var(--sf-border)] bg-[var(--sf-panel)] hover:border-[#7FD1A0]/50 hover:bg-white/5'}`}>
                    <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${paymentMethod === 'cliq'? 'bg-[var(--sf-success)] text-[var(--sf-accent-contrast)]': 'bg-white/5 text-[var(--sf-muted)]'}`}>
                      <Smartphone className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'cliq'? 'text-[var(--sf-success)]': 'text-[var(--sf-text)]'}`}>دفع كليك (CliQ)</p>
                      <p className="text-[11px] text-[var(--sf-muted)] mt-0.5">تحويل فوري</p>
                    </div>
                  </button>
                </div>
              </div>

              {cliqSection}

              {/* Personal Info */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-[var(--sf-accent)] border-b border-[var(--sf-border)] pb-2">بيانات المستلم</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">الاسم الكامل (الرباعي) <span className="text-rose-400">*</span></label>
                    <input
                      ref={nameInputRef}
                      type="text" value={name}
                      onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }}
                      placeholder="مثال: محمد أحمد علي محمود" className={`w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] transition-all outline-none ${nameError ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-500/5': 'border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)]'}`}
                    />
                    {nameError && <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{nameError}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">رقم الهاتف الأساسي <span className="text-rose-400">*</span></label>
                    <input
                      type="tel" dir="ltr" value={phone1}
                      onChange={(e) => handlePhone1Change(e.target.value)}
                      placeholder="07XXXXXXXX" className={`w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] font-mono text-right transition-all outline-none ${phone1Error ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-500/5': 'border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)]'}`}
                    />
                    {phone1Error && <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{phone1Error}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">رقم هاتف إضافي (اختياري)</label>
                    <input
                      type="tel" dir="ltr" value={phone2}
                      onChange={(e) => handlePhone2Change(e.target.value)}
                      placeholder="رقم بديل..." className={`w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] font-mono text-right transition-all outline-none ${phone2Error ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-500/5': 'border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)]'}`}
                    />
                    {phone2Error && <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{phone2Error}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-[var(--sf-accent)] border-b border-[var(--sf-border)] pb-2">عنوان التوصيل بالتفصيل</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">المحافظة <span className="text-rose-400">*</span></label>
                    <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setAutoDetectedGov(null); }} className="w-full text-sm py-3 px-3 bg-[var(--sf-panel)] border border-[var(--sf-border)] rounded-xl text-[var(--sf-text)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)] outline-none cursor-pointer appearance-none">
                      {jordanGovernorates.map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">المنطقة / الحي <span className="text-rose-400">*</span></label>
                    <input
                      ref={regionInputRef}
                      type="text" value={region}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      placeholder="مثال: جبل عمان" className={`w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] transition-all outline-none ${regionError ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-500/5': 'border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)]'}`}
                    />
                    {regionError && <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{regionError}</p>}
                    {!regionError && autoDetectedGov && <span className="text-[9px] text-[var(--sf-success)] mt-1 flex items-center gap-1"><Check className="w-3 h-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />تم تحديد المحافظة تلقائياً</span>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">اسم الشارع / أقرب معلم <span className="text-rose-400">*</span></label>
                    <input
                      ref={streetInputRef}
                      type="text" value={street}
                      onChange={(e) => { setStreet(e.target.value); if (streetError && e.target.value.trim()) setStreetError(null); }}
                      placeholder="مثال: شارع المدينة المنورة" className={`w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] transition-all outline-none ${streetError ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-500/5': 'border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)]'}`}
                    />
                    {streetError && <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{streetError}</p>}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">رقم العمارة / البناية والطابق <span className="text-rose-400">*</span></label>
                    <input
                      ref={buildingInputRef}
                      type="text" value={building}
                      onChange={(e) => { setBuilding(e.target.value); if (buildingError && e.target.value.trim()) setBuildingError(null); }}
                      placeholder="مثال: عمارة رقم 14، الطابق 2" className={`w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] transition-all outline-none ${buildingError ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-500/5': 'border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)]'}`}
                    />
                    {buildingError && <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{buildingError}</p>}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sf-muted)] mb-1.5">ملاحظات إضافية للتوصيل (اختياري)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أوقات التوصيل المفضلة أو أي تفاصيل خاصة..." className="w-full text-sm py-3 px-4 bg-[var(--sf-panel)] border border-[var(--sf-border)] focus:border-[var(--sf-accent)] focus:ring-1 focus:ring-[var(--sf-accent)] rounded-xl text-[var(--sf-text)] placeholder-[var(--sf-muted)] transition-all outline-none resize-none"/>
              </div>

              {/* Summary */}
              <div className="bg-[var(--sf-panel)] p-5 rounded-2xl border border-[var(--sf-border)] shadow-inner space-y-3 text-sm">
                <div className="flex justify-between text-[var(--sf-muted)]">
                  <span>المجموع الفرعي ({totalItemsCount} قطعة)</span>
                  <span className="font-mono font-bold text-[var(--sf-text)]">{subtotal.toFixed(2)} د.أ</span>
                </div>
                <div className="flex justify-between text-[var(--sf-muted)]">
                  <span>أجور التوصيل ({governorate})</span>
                  <span className={`font-semibold font-mono ${deliveryFee === 0 ? 'text-[var(--sf-success)]': 'text-[var(--sf-text)]'}`}>{deliveryFee === 0 ? 'مجاني': `${deliveryFee.toFixed(2)} د.أ`}</span>
                </div>
                <div className="pt-3 border-t border-[var(--sf-border)] flex justify-between font-black text-[var(--sf-text)] items-end">
                  <span className="text-base">المبلغ الإجمالي:</span>
                  <span className="font-mono text-2xl text-[var(--sf-accent)] leading-none">{total.toFixed(2)} <span className="text-sm font-bold text-[var(--sf-muted)]">د.أ</span></span>
                </div>
              </div>

              <button type="submit"disabled={isSubmitting} className="w-full py-4 px-6 text-base font-black text-[var(--sf-accent-contrast)] bg-gradient-to-b from-[var(--sf-accent-strong)] to-[var(--sf-accent)] hover:from-[var(--sf-accent-strong)] hover:to-[var(--sf-accent-strong)] rounded-xl shadow-gold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50">
                <span>{isSubmitting ? 'جارٍ التحقق وحفظ الطلب...': 'تأكيد طلب الشراء الآن'}</span>
              </button>

              <p className="flex items-center justify-center gap-2 text-[10px] text-[var(--sf-muted)]">
                <ShieldCheck className="w-4 h-4 text-[var(--sf-success)]"/>
                يُفحص السعر والمخزون من السيرفر لحظة الإرسال — الطلب محمي بمعاملة ذرّية
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
