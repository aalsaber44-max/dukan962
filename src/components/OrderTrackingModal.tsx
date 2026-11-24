import React, { useState } from 'react';
import { X, Search, Package, Clock, CheckCircle2, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Order } from '../types/furniture';
import { validateJordanPhone } from '../utils/jordanLocations';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statuses = [
  { id: 'جديد', label: 'تم استلام الطلب', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'جاري التجهيز', label: 'قيد التجهيز', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'جاري التوصيل', label: 'في الطريق إليك', icon: Truck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'تم التسليم', label: 'تم التسليم', icon: PackageCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    const cleanPhone = validateJordanPhone(phone).cleaned;
    if (!orderId.trim() || !cleanPhone) {
      setError('يرجى إدخال رقم الطلب ورقم الهاتف بشكل صحيح');
      return;
    }

    setIsLoading(true);
    try {
      // نبحث برقم الطلب فقط لتجنب مشاكل الـ Index في Firebase، ثم نتحقق من الهاتف
      const q = query(collection(db, 'orders'), where('id', '==', orderId.trim().toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('لم نجد أي طلب بهذا الرقم. يرجى التأكد من رقم الطلب.');
      } else {
        const foundOrder = snapshot.docs[0].data() as Order;
        if (foundOrder.phone !== cleanPhone) {
          setError('رقم الهاتف لا يطابق صاحب هذا الطلب.');
        } else {
          setOrder(foundOrder);
        }
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  // تحديد مؤشر الحالة الحالية
  const currentStatusIndex = order ? statuses.findIndex(s => s.id === order.status) : -1;
  // إذا كان الطلب ملغي، نعرض حالة خاصة
  const isCancelled = order?.status === 'ملغي';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade">
      <div className="relative w-full max-w-lg bg-[#141210] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1C1815]">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base font-bold text-[#F3EEE4]">تتبع حالة الطلب</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-[#A39A8B] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">رقم الطلب (مثال: DUKAN-10001)</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="DUKAN-XXXXX"
                className="w-full text-sm py-2.5 px-3 bg-[#1C1815] border border-white/10 rounded-xl focus:border-[#D4AF37] text-[#F3EEE4] font-mono placeholder-[#8A8173] uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                dir="ltr"
                className="w-full text-sm py-2.5 px-3 bg-[#1C1815] border border-white/10 rounded-xl focus:border-[#D4AF37] text-[#F3EEE4] font-mono text-right placeholder-[#8A8173]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#E8CC75] text-[#09090B] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'جارٍ البحث...' : <><Search className="w-4 h-4" /> بحث</>}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Order Results */}
          {order && (
            <div className="bg-[#1C1815] rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] text-[#A39A8B] block">رقم الطلب</span>
                  <strong className="text-sm font-mono text-[#E8CC75]">{order.id}</strong>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-[#A39A8B] block">الإجمالي</span>
                  <strong className="text-sm font-mono text-[#F3EEE4]">{order.total.toFixed(2)} د.أ</strong>
                </div>
              </div>

              {isCancelled ? (
                <div className="text-center py-6">
                  <X className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-rose-400">تم إلغاء هذا الطلب</h4>
                  <p className="text-xs text-[#A39A8B] mt-1">يرجى التواصل مع الدعم لمزيد من التفاصيل.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {statuses.map((status, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    const Icon = status.icon;

                    return (
                      <div key={status.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-[#141210] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-all duration-500 ${isCompleted ? 'border-[#D4AF37]' : 'border-white/10 opacity-50'}`}>
                          <Icon className={`w-4 h-4 ${isCompleted ? 'text-[#D4AF37]' : 'text-[#A39A8B]'}`} />
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border ${isCurrent ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-transparent border-transparent opacity-60'}`}>
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${isCompleted ? 'text-[#F3EEE4]' : 'text-[#A39A8B]'}`}>{status.label}</h4>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          {isCurrent && <p className="text-[10px] text-[#D4AF37] mt-1">حالتك الحالية</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
