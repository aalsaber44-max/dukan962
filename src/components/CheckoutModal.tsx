import React, { useState, useRef } from 'react';
import { X, CheckCircle, Truck, ShieldCheck, Copy, Check, MessageCircle, Smartphone } from 'lucide-react';
import { CartItem } from '../types/furniture';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
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
  const [autoDetectedGov, setAutoDetectedGov] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.selectedColor.price) || Number(item.product.basePrice) || 0) * item.quantity,
    0
  );

  const deliveryFee = calculateDeliveryFee(governorate);
  const total = subtotal + deliveryFee;

  const cliqAlias = 'Mohammad Alkhatib';
  const cliqPhone = STORE_PHONE;

  const copyToClipboard = (text: string, field: 'alias' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegionChange = (val: string) => {
    setRegion(val);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setNameError('الرجاء إدخال الاسم الرباعي كاملاً (أربع مقاطع على الأقل).');
      return;
    }
    setNameError(null);

    const phone1Validation = validateJordanPhone(phone1);
    if (!phone1Validation.isValid) {
      setPhone1Error(phone1Validation.error || 'رقم الهاتف الأساسي غير صالح.');
      return;
    }
    setPhone1Error(null);

    if (phone2.trim() !== '') {
      const phone2Validation = validateJordanPhone(phone2);
      if (!phone2Validation.isValid) {
        setPhone2Error(phone2Validation.error || 'رقم الهاتف الإضافي غير صالح.');
        return;
      }
      
      if (phone1Validation.cleaned === phone2Validation.cleaned) {
        setPhone2Error('رقم الهاتف الإضافي يجب أن يكون مختلفاً عن الرقم الأساسي');
        return;
      }
      setPhone2Error(null);
    }

    if (!region || !street || !building) {
      alert('يرجى تعبئة جميع بيانات العنوان (المنطقة، الشارع، رقم العمارة)');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const num = 'DUKAN-' + Math.floor(10000 + Math.random() * 90000);
    setOrderNumber(num);

    const fullAddress = `المنطقة: ${region} - الشارع: ${street} - العمارة: ${building}`;

    const orderPayload = {
      id: num,
      name: name.trim(),
      phone: phone1Validation.cleaned,
      phone2: phone2.trim() ? validateJordanPhone(phone2).cleaned : '',
      governorate,
      address: fullAddress,
      region,
      street,
      building,
      notes: notes.trim(),
      paymentMethod,
      cliqRef: paymentMethod === 'cliq' ? cliqRef.trim() : '',
      items,
      subtotal,
      deliveryFee,
      total,
      status: 'جديد',
      createdAt: new Date().toISOString(),
    };

    const paymentLabel = paymentMethod === 'cod' ? 'الدفع كاش عند الاستلام بعد المعاينة' : `تحويل كليك CliQ (${cliqRef ? 'مرجع: ' + cliqRef : 'بانتظار التحويل'})`;
    
    const whatsAppText = encodeURIComponent(
      `*طلب جديد من متجر دكان 962 للأثاث*\n\n` +
      `*رقم الطلب:* ${num}\n` +
      `*الاسم:* ${name.trim()}\n` +
      `*رقم الهاتف 1:* ${phone1Validation.cleaned}\n` +
      (phone2 ? `*رقم الهاتف 2:* ${validateJordanPhone(phone2).cleaned}\n` : '') +
      `*العنوان:* ${governorate} - ${region} - ${street} - عمارة ${building}\n` +
      (notes.trim() ? `*ملاحظات:* ${notes.trim()}\n` : '') +
      `*طريقة الدفع:* ${paymentLabel}\n\n` +
      `*تفاصيل المنتجات المطلوبة:*\n` +
      items.map((it, i) => {
        const imgUrl = it.selectedColor?.image || it.product.images?.[0] || '';
        const isBase64 = imgUrl.startsWith('data:image');
        const imgText = isBase64 ? '(الصورة متوفرة في لوحة التحكم)' : imgUrl;
        return `${i + 1}. *${it.product.name}*\n- اللون: ${it.selectedColor.name}\n- الكمية: ${it.quantity}\n- السعر: ${(Number(it.selectedColor.price) * it.quantity).toFixed(2)} د.أ\n- صورة المنتج: ${imgText}`;
      }).join('\n\n') +
      `\n\n------------------------\n` +
      `*المجموع الفرعي:* ${subtotal.toFixed(2)} د.أ\n` +
      `*أجور التوصيل (${governorate}):* ${deliveryFee.toFixed(2)} د.أ\n` +
      `*المبلغ الإجمالي النهائي:* ${total.toFixed(2)} دينار أردني\n\n` +
      `يرجى تأكيد استلام الطلب وتحديد موعد التوصيل.`
    );

    setFinalWhatsAppUrl(`https://api.whatsapp.com/send?phone=${STORE_PHONE_INTL}&text=${whatsAppText}`);

    try {
      await addDoc(collection(db, 'orders'), orderPayload);
      setIsSubmitting(false);
      setOrderConfirmed(true);
      onSuccessOrder(orderPayload);
    } catch (error) {
      console.error('Error saving order to Firebase:', error);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      alert('عذراً، حدث خطأ أثناء حفظ طلبك في السحابة. يرجى المحاولة مرة أخرى أو إرسال الطلب مباشرة عبر واتساب.');
    }
  };

  const jordanGovernorates = JORDAN_GOVERNORATES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141210] rounded-3xl shadow-2xl border border-white/10 flex flex-col my-6 max-h-[90vh]">
        
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1C1815] rounded-t-3xl shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#F3EEE4]">
              {orderConfirmed ? 'تم تأكيد طلبك في دكان 962' : 'إتمام الطلب وتحديد التوصيل'}
            </h3>
            <p className="text-xs text-[#A39A8B] mt-0.5">
              {orderConfirmed ? 'شكراً لاختيارك طاولات دكان 962 للأثاث' : 'التوصيل لجميع المحافظات والدفع عند الاستلام أو كليك'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#141210]/10 hover:bg-[#141210]/15 text-[#F3EEE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {orderConfirmed ? (
            <div className="text-center">
              {/* 💡 تم إصلاح كلاس الخلفية هنا */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-400/25">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-[#D4B06A] uppercase tracking-wider">رقم تتبع الطلب</span>
              <h4 className="text-2xl font-black text-[#F3EEE4] font-mono mt-1 mb-2">{orderNumber}</h4>
              <p className="text-xs text-[#B9B0A0] leading-relaxed max-w-md mx-auto mb-5">
                تم استلام طلبك وحفظه بنجاح في السحابة! يمكنك الآن إرسال نسخة من الطلب مباشرة إلى واتساب مندوب المتجر لتأكيد موعد التسليم فوراً.
              </p>

              <div className="mb-6">
                {/* 💡 تم إصلاح لون النص هنا ليصبح أبيض */}
                <a href={finalWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 px-6 text-xs sm:text-sm font-bold text-white bg-[#2E5339] hover:bg-[#1E3826] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <MessageCircle className="w-5 h-5" />
                  <span>إرسال تفاصيل الطلب عبر واتساب</span>
                </a>
              </div>

              <button onClick={onClose} className="py-2.5 px-8 text-xs font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl transition-all cursor-pointer">
                العودة إلى المعرض
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-[#F3EEE4] mb-2">اختر طريقة الدفع:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => setPaymentMethod('cod')} className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${paymentMethod === 'cod' ? 'border-[#D4B06A] bg-[#1C1815] shadow-none ring-1 ring-[#D4B06A]' : 'border-white/10 hover:border-white/10'}`}>
                    <Truck className="w-5 h-5 text-[#D4B06A] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#F3EEE4]">الدفع عند الاستلام</p>
                      <p className="text-[10px] text-[#A39A8B]">كاش بعد المعاينة</p>
                    </div>
                  </button>

                  <button type="button" onClick={() => setPaymentMethod('cliq')} className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${paymentMethod === 'cliq' ? 'border-[#D4B06A] bg-[#1C1815] shadow-none ring-1 ring-[#D4B06A]' : 'border-white/10 hover:border-white/10'}`}>
                    <Smartphone className="w-5 h-5 text-[#7FD1A0] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#7FD1A0]">دفع كليك (CliQ)</p>
                      <p className="text-[10px] text-[#A39A8B]">تحويل فوري</p>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'cliq' && (
                {/* 💡 تم إصلاح الحدود هنا لتكون خضراء */}
                <div className="bg-[#7FD1A0]/10 border border-[#7FD1A0]/25 rounded-2xl p-4 space-y-3">
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
                      <button type="button" onClick={() => copyToClipboard(cliqAlias, 'alias')} className="p-1.5 rounded-lg bg-[#1C1815] hover:bg-[#26211D] border cursor-pointer text-[10px] flex items-center gap-1">
                        {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="bg-[#141210] p-2.5 rounded-xl border border-[#7FD1A0]/25 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#A39A8B] block">رقم الهاتف:</span>
                        <strong className="text-[#F3EEE4] font-mono text-sm">{cliqPhone}</strong>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(cliqPhone, 'phone')} className="p-1.5 rounded-lg bg-[#1C1815] hover:bg-[#26211D] border cursor-pointer text-[10px] flex items-center gap-1">
                        {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7FD1A0] mb-1">رقم عملية التحويل أو اسم الحساب (اختياري):</label>
                    <input type="text" value={cliqRef} onChange={(e) => setCliqRef(e.target.value)} placeholder="مثال: رقم العملية..." className="w-full text-xs py-2 px-3 bg-[#141210] border border-[#7FD1A0]/25 rounded-xl" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">الاسم الكامل (الرباعي) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }}
                    placeholder="مثال: محمد أحمد علي محمود"
                    className={`w-full text-xs py-2 px-3 bg-[#1C1815] border rounded-xl ${nameError ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'}`}
                  />
                  {nameError && <p className="text-[10px] text-rose-400 mt-1 font-semibold">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">رقم الهاتف الأساسي *</label>
                  <input
                    type="tel"
                    required
                    value={phone1}
                    onChange={(e) => handlePhone1Change(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className={`w-full text-xs py-2 px-3 bg-[#1C1815] border rounded-xl font-mono text-right ${phone1Error ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'}`}
                  />
                  {phone1Error && <p className="text-[10px] text-rose-400 mt-1 font-semibold">{phone1Error}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">رقم هاتف إضافي (اختياري)</label>
                  <input
                    type="tel"
                    value={phone2}
                    onChange={(e) => handlePhone2Change(e.target.value)}
                    placeholder="رقم بديل..."
                    className={`w-full text-xs py-2 px-3 bg-[#1C1815] border rounded-xl font-mono text-right ${phone2Error ? 'border-rose-400 bg-rose-500/10' : 'border-white/10'}`}
                  />
                  {phone2Error && <p className="text-[10px] text-rose-400 mt-1 font-semibold">{phone2Error}</p>}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-[#F3EEE4] mb-2">عنوان التوصيل بالتفصيل</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">المحافظة *</label>
                    <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setAutoDetectedGov(null); }} className="w-full text-xs py-2 px-2 bg-[#1C1815] border border-white/10 rounded-xl">
                      {jordanGovernorates.map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">المنطقة *</label>
                    <input type="text" required value={region} onChange={(e) => handleRegionChange(e.target.value)} placeholder="مثال: جبل عمان" className="w-full text-xs py-2 px-2 bg-[#1C1815] border border-white/10 rounded-xl" />
                    {autoDetectedGov && <span className="text-[9px] text-[#7FD1A0] mt-1 block">تم تحديد المحافظة تلقائياً ✓</span>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">اسم الشارع *</label>
                    <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="مثال: شارع المدينة المنورة" className="w-full text-xs py-2 px-2 bg-[#1C1815] border border-white/10 rounded-xl" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-[#A39A8B] mb-1">رقم العمارة / البناية *</label>
                    <input type="text" required value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="مثال: عمارة رقم 14، الطابق 2" className="w-full text-xs py-2 px-2 bg-[#1C1815] border border-white/10 rounded-xl" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">ملاحظات إضافية للتوصيل (اختياري)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أوقات التوصيل المفضلة أو أي تفاصيل خاصة..." className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl" />
              </div>

              <div className="bg-[#1C1815] p-4 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#A39A8B]">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono font-bold text-[#F3EEE4]">{subtotal.toFixed(2)} د.أ</span>
                </div>
                <div className="flex justify-between text-[#A39A8B]">
                  <span>أجور التوصيل ({governorate})</span>
                  <span className="font-semibold text-[#F3EEE4] font-mono">{deliveryFee.toFixed(2)} د.أ</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-black text-sm text-[#F3EEE4]">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-mono text-base">{total.toFixed(2)} د.أ</span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 px-6 text-sm font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <span>{isSubmitting ? 'جارٍ إرسال الطلب...' : 'تأكيد طلب الشراء الآن 🛒'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
