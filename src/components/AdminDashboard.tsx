import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  Upload,
  Check,
  RefreshCw,
  Layers,
  ShoppingBag,
  Phone,
  MessageCircle,
  Lock,
  KeyRound,
  Smartphone,
  Clock,
  MapPin,
} from 'lucide-react';
import { Product, ProductColor, Order } from '../types/furniture';
// استيراد Firebase
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'list' | 'orders' | 'add' | 'settings'>('list');
  const [successToast, setSuccessToast] = useState('');
  
  // حالة المنتجات من Firebase
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Inline price editing state: { [productId]: newPrice }
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});

  // Confirm delete state (no window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  // Edit existing product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'center-tables' | 'tv-tables' | 'fireplace-tables' | 'side-tables'>('center-tables');
  const [newBasePrice, setNewBasePrice] = useState<number>(69.99);
  const [newWoodType, setNewWoodType] = useState('خشب تايلندي ثقيل');
  const [newDesc, setNewDesc] = useState('');
  const [newDimensions, setNewDimensions] = useState('طول 120 سم × عرض 60 سم × ارتفاع 45 سم');
  const [newWarranty, setNewWarranty] = useState('ضمان سنتين');
  const [newColors, setNewColors] = useState<ProductColor[]>([
    {
      name: 'بني جوزي',
      hex: '#3E2723',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80',
    },
  ]);

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // جلب المنتجات من Firebase مباشرة (Live Sync)
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
      setLoadingProducts(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  // Fetch orders from server whenever modal opens or tab changes to 'orders'
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setLoadingOrders(false);
        return;
      }
    } catch {
      // fallback
    }

    // Local fallback
    try {
      const local = JSON.parse(localStorage.getItem('dukan962_orders_local') || '[]');
      setOrders(local);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, activeTab]);

  // --- Firebase Operations ---

  // Inline price editing
  const handlePriceChange = (id: string, price: number) => {
    setEditingPrices((prev) => ({ ...prev, [id]: price }));
  };

  const handleSavePrice = async (id: string) => {
    const updatedPrice = editingPrices[id];
    if (updatedPrice === undefined) return;

    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    const nextColors = productToUpdate.colors.map((c, i) => (i === 0 ? { ...c, price: updatedPrice } : c));

    try {
      await updateDoc(doc(db, 'products', id), {
        basePrice: updatedPrice,
        colors: nextColors
      });
      
      setEditingPrices((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      showNotification('تم تحديث السعر وحفظه بنجاح في السحابة!');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ في السحابة');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setConfirmDeleteId(null);
      showNotification('تم حذف القطعة من السحابة بنجاح.');
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  // Save edited existing product
  const handleSaveEditedProduct = async (updated: Product) => {
    try {
      await updateDoc(doc(db, 'products', updated.id), { ...updated });
      setEditingProduct(null);
      showNotification(`تم حفظ وتحديث القطعة "${updated.name}" بنجاح في السحابة!`);
    } catch (error) {
      alert('حدث خطأ أثناء تعديل المنتج');
    }
  };

  // Color management in Add form
  const handleAddColor = () => {
    setNewColors((prev) => [
      ...prev,
      {
        name: `لون جديد ${prev.length + 1}`,
        hex: '#FFFFFF',
        price: newBasePrice,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      },
    ]);
  };

  const handleRemoveColor = (idx: number) => {
    if (newColors.length <= 1) return;
    setNewColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleColorUpdate = (idx: number, field: keyof ProductColor, val: string | number) => {
    setNewColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  };

  const handleColorImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('الصورة كبيرة جداً! يجب أن تكون أقل من 800 كيلوبايت لتعمل مع السحابة.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          handleColorUpdate(idx, 'image', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdditionalImageToNewColor = (colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('الصورة كبيرة جداً! يجب أن تكون أقل من 800 كيلوبايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setNewColors((prev) =>
            prev.map((c, i) => {
              if (i === colorIdx) {
                const addImages = c.additionalImages || [];
                return { ...c, additionalImages: [...addImages, reader.result as string] };
              }
              return c;
            })
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAdditionalImageFromNewColor = (colorIdx: number, imgIdx: number) => {
    setNewColors((prev) =>
      prev.map((c, i) => {
        if (i === colorIdx && c.additionalImages) {
          return {
            ...c,
            additionalImages: c.additionalImages.filter((_, idx) => idx !== imgIdx),
          };
        }
        return c;
      })
    );
  };

  // Submit new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBasePrice) return;

    const categoryLabels = {
      'center-tables': 'طاولات وسط وصالون',
      'tv-tables': 'طاولات شاشة وتلفزيون',
      'fireplace-tables': 'طاولات شاشة مع مدفأة',
      'side-tables': 'طاولات خدمة وضيافة',
    };

    const allImages = Array.from(
      new Set([
        ...newColors.map((c) => c.image),
        ...newColors.flatMap((c) => c.additionalImages || []),
      ].filter(Boolean))
    );

    const newProd: Omit<Product, 'id'> = {
      itemNumber: products.length + 1,
      name: newName,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      basePrice: Number(newBasePrice),
      woodType: newWoodType,
      description: newDesc || 'طاولة خشبية فاخرة بتصميم مودرن مميز وخشب تايلندي ثقيل.',
      dimensions: newDimensions,
      warranty: newWarranty,
      images: allImages,
      colors: newColors,
      inStock: true,
      featured: true,
      isOffer: true,
    };

    try {
      await addDoc(collection(db, 'products'), newProd);
      showNotification(`تمت إضافة القطعة "${newName}" ونشرها في السحابة بنجاح!`);
      setActiveTab('list');

      // Reset form
      setNewName('');
      setNewBasePrice(69.99);
      setNewDesc('');
    } catch (error) {
      alert('حدث خطأ أثناء الإضافة. تأكد من حجم الصور.');
      console.error(error);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
    );
    showNotification(`تم تغيير حالة الطلب #${orderId} إلى "${newStatus}"`);
  };

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch {}

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setConfirmDeleteOrderId(null);
    showNotification('تم حذف الطلب من السجل.');
  };

  // Change Password (Mock)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!currentPass || !newPass) return;

    if (currentPass.trim() === '962' || currentPass.trim() === 'dukan962') {
      setPassMsg({ text: 'تم تغيير كلمة المرور بنجاح!', error: false });
      setCurrentPass('');
      setNewPass('');
    } else {
      setPassMsg({ text: 'كلمة المرور الحالية غير صحيحة', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE3D7] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#D4AF37] flex items-center justify-center font-bold">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1C1917]">
                لوحة تحكم إدارة دكان 962 (Admin Dashboard)
              </h2>
              <p className="text-xs text-[#78716C]">
                إدارة طلبات الزبائن، الأسعار، الصور والألوان، والمزامنة السحابية الدائمة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EDE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast banner */}
        {successToast && (
          <div className="bg-[#EDF4EE] border-b border-[#C5DEC8] px-6 py-2.5 text-xs text-[#2E5339] font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#2E5339]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-[#EAE3D7] flex flex-wrap items-center gap-2 sm:gap-4 bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'list'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            جدول المنتجات والأسعار ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#8C6D46]" />
            <span>طلبات الزبائن الواردة</span>
            <span className="bg-[#2E5339] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عفش / طاولة جديدة</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>كلمة المرور</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: PRODUCTS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-[#78716C]">
                  أي تعديل على الأسعار أو حذف أو إضافة يُحفظ في السحابة ويظهر فوراً في الموبايل واللابتوب.
                </span>
              </div>

              {loadingProducts ? (
                <div className="text-center py-10 font-bold text-[#8C6D46]">جاري تحميل المنتجات من السحابة...</div>
              ) : (
                <div className="border border-[#E5DDD0] rounded-2xl overflow-x-auto shadow-xs bg-white">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#FAF7F2] text-[#78716C] font-semibold border-b border-[#E5DDD0]">
                      <tr>
                        <th className="p-3.5">الرقم</th>
                        <th className="p-3.5">الصورة</th>
                        <th className="p-3.5">اسم القطعة</th>
                        <th className="p-3.5">القسم</th>
                        <th className="p-3.5">الألوان المتاحة</th>
                        <th className="p-3.5">السعر بالدينار (د.أ)</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE1]">
                      {products.map((p) => {
                        const isPriceEdited = editingPrices[p.id] !== undefined;
                        const currentPriceVal = isPriceEdited ? editingPrices[p.id] : p.basePrice;

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="p-3.5 font-mono text-[#78716C]">#{p.itemNumber}</td>
                            <td className="p-3.5">
                              <img
                                src={p.colors[0]?.image || p.images[0]}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-[#E9E1D4] bg-[#F4EFE6]"
                              />
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-[#1C1917] leading-snug">{p.name}</p>
                              <p className="text-[11px] text-[#8C827A] mt-0.5">{p.woodType}</p>
                            </td>
                            <td className="p-3.5 text-[#57534E] font-medium">{p.categoryLabel}</td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1">
                                {p.colors.map((c) => (
                                  <span
                                    key={c.name}
                                    title={`${c.name} (${c.price} د.أ)`}
                                    className="w-3.5 h-3.5 rounded-full border border-black/15"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={currentPriceVal}
                                  onChange={(e) => handlePriceChange(p.id, Number(e.target.value))}
                                  className="w-20 py-1 px-2 border border-[#DDD5C7] rounded-lg font-mono font-bold text-[#1C1917] text-left"
                                />
                                <span className="text-[11px] text-[#78716C]">د.أ</span>
                                {isPriceEdited && (
                                  <button
                                    onClick={() => handleSavePrice(p.id)}
                                    className="p-1 bg-[#2E5339] text-white rounded-md hover:bg-[#1E3826] cursor-pointer"
                                    title="حفظ السعر الجديد"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="py-1 px-2.5 text-[#57534E] hover:text-[#1C1917] bg-[#F4EFE6] hover:bg-[#EAE2D5] rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                  title="تعديل الصور والألوان وتفاصيل القطعة"
                                >
                                  <Edit2 className="w-3 h-3 text-[#8C6D46]" />
                                  <span>تعديل</span>
                                </button>

                                {confirmDeleteId === p.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                                    <span className="text-[10px] text-rose-700 font-bold">تأكيد؟</span>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      نعم
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-0.5 bg-gray-200 hover:bg-gray-300 text-[#1C1917] rounded text-[10px] cursor-pointer"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    className="p-1.5 text-[#A8A29E] hover:text-rose-600 transition-colors cursor-pointer"
                                    title="حذف القطعة من المتجر"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    سجل طلبات الزبائن (يصلك هنا كل طلب يقوم به أي زبون)
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    يعرض كافة تفاصيل الطلبات، أرقام الهواتف للتواصل، الألوان المطلوبة، وحالة الدفع والتوصيل.
                  </p>
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={loadingOrders}
                  className="py-1.5 px-3 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F2EDE4] flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span>تحديث السجل</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-[#EDE5D8] p-8">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#8C6D46] flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#1C1917] mb-1">
                    لا توجد طلبات مسجلة حتى الآن
                  </p>
                  <p className="text-xs text-[#78716C]">
                    عندما يقوم أي زبون بتأكيد طلبه من الموقع، ستظهر بياناته هنا فوراً.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      'جديد': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      'جاري التجهيز': 'bg-amber-50 text-amber-800 border-amber-200',
                      'جاري التوصيل': 'bg-blue-50 text-blue-800 border-blue-200',
                      'تم التسليم': 'bg-purple-50 text-purple-800 border-purple-200',
                      'ملغي': 'bg-rose-50 text-rose-800 border-rose-200',
                    };

                    const orderDate = new Date(order.createdAt).toLocaleString('ar-JO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#8C6D46] transition-all"
                      >
                        {/* Top row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE1]">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-sm text-[#1C1917]">
                              {order.id}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                                statusColors[order.status] || 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-[11px] text-[#A8A29E] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{orderDate}</span>
                            </span>
                          </div>

                          {/* Status changer & Delete */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#78716C]">تغيير الحالة:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs py-1 px-2.5 bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg font-bold text-[#1C1917] cursor-pointer"
                            >
                              <option value="جديد">جديد</option>
                              <option value="جاري التجهيز">جاري التجهيز</option>
                              <option value="جاري التوصيل">جاري التوصيل</option>
                              <option value="تم التسليم">تم التسليم</option>
                              <option value="ملغي">ملغي</option>
                            </select>

                            {confirmDeleteOrderId === order.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                                <span className="text-[10px] text-rose-700 font-bold">حذف؟</span>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px]"
                                >
                                  نعم
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteOrderId(null)}
                                  className="px-1.5 py-0.5 bg-gray-200 text-black rounded text-[10px]"
                                >
                                  لا
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteOrderId(order.id)}
                                className="p-1 text-[#A8A29E] hover:text-rose-600 cursor-pointer"
                                title="حذف هذا الطلب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Middle: Customer details & Items */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3">
                          {/* Customer info */}
                          <div className="md:col-span-5 space-y-2 text-xs">
                            <p className="font-bold text-[#1C1917] text-sm">
                              الزبون: {order.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[#78716C]">الهاتف:</span>
                              <strong className="font-mono text-[#1C1917]" dir="ltr">
                                {order.phone}
                              </strong>
                              <a
                                href={`tel:${order.phone}`}
                                className="p-1 rounded bg-[#FAF7F2] hover:bg-[#EAE2D5] text-[#1C1917] border border-[#DDD5C7]"
                                title="اتصال هاتفي"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/962${order.phone.replace(/^0+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-[#EDF4EE] hover:bg-[#DEEFE0] text-[#2E5339] border border-[#C5DEC8]"
                                title="محادثة واتساب"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>

                            <p className="text-[#57534E] flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8C6D46] shrink-0 mt-0.5" />
                              <span>{order.governorate} - {order.address}</span>
                            </p>

                            <div className="pt-1">
                              <span className="text-[11px] text-[#78716C] block">طريقة الدفع:</span>
                              <span className="font-semibold text-[#2E5339] inline-flex items-center gap-1">
                                {order.paymentMethod === 'cod' ? (
                                  'الدفع عند الاستلام كاش'
                                ) : order.paymentMethod === 'cliq' ? (
                                  <>
                                    <Smartphone className="w-3 h-3" />
                                    <span>تحويل كليك CliQ</span>
                                    {order.cliqRef && (
                                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#C5DEC8] font-mono">
                                        مرجع: {order.cliqRef}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  'بطاقة بنكية'
                                )}
                              </span>
                            </div>

                            {order.notes && (
                              <p className="text-[11px] text-[#8C6D46] bg-[#FAF4E8] p-2 rounded-lg">
                                <strong>ملاحظات الزبون:</strong> {order.notes}
                              </p>
                            )}
                          </div>

                          {/* Items ordered list */}
                          <div className="md:col-span-7 bg-[#FAF7F2] p-3 rounded-xl border border-[#EDE5D8] space-y-2">
                            <span className="text-[11px] font-bold text-[#8C6D46] block">
                              القطع المطلوبة:
                            </span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {order.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#E9E1D4]"
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={it.selectedColor.image || it.product.images[0]}
                                      alt=""
                                      className="w-8 h-8 rounded-md object-cover"
                                    />
                                    <div>
                                      <p className="font-bold text-[#1C1917]">{it.product.name}</p>
                                      <span className="text-[10px] text-[#8C6D46]">
                                        اللون: {it.selectedColor.name} | الكمية: {it.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-[#1C1917]">
                                    {(it.selectedColor.price * it.quantity).toFixed(2)} د.أ
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-[#E5DDD0] flex justify-between items-center text-xs">
                              <span className="text-[#78716C]">
                                المجموع (شامل التوصيل {order.deliveryFee === 0 ? 'مجاني' : order.deliveryFee + ' د.أ'}):
                              </span>
                              <strong className="text-sm font-black text-[#1C1917] font-mono">
                                {order.total.toFixed(2)} دينار أردني
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW FURNITURE */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateProduct} className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E9E1D4] space-y-4">
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8C6D46]" />
                  <span>معلومات القطعة الأساسية</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      اسم قطعة العفش / الطاولة *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="مثال: طقم طاولات قهوة مودرن رخام"
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      القسم *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46] cursor-pointer"
                    >
                      <option value="center-tables">طاولات وسط وصالون</option>
                      <option value="tv-tables">طاولات شاشة وتلفزيون</option>
                      <option value="fireplace-tables">طاولات شاشة مع مدفأة</option>
                      <option value="side-tables">طاولات خدمة وضيافة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      السعر الأساسي بالدينار الأردني (د.أ) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newBasePrice}
                      onChange={(e) => setNewBasePrice(Number(e.target.value))}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      نوعية الخشب / الخامة *
                    </label>
                    <input
                      type="text"
                      value={newWoodType}
                      onChange={(e) => setNewWoodType(e.target.value)}
                      placeholder="مثال: خشب تايلندي ثقيل نخب أول"
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      المقاسات والأبعاد
                    </label>
                    <input
                      type="text"
                      value={newDimensions}
                      onChange={(e) => setNewDimensions(e.target.value)}
                      placeholder="مثال: قطر 90 سم × ارتفاع 45 سم"
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      فترة الضمان
                    </label>
                    <input
                      type="text"
                      value={newWarranty}
                      onChange={(e) => setNewWarranty(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    الشرح والمواصفات العامة
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="شرح سلس عن مميزات الطاولة..."
                    className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              {/* Colors & Photos Section */}
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E9E1D4] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                      ألوان وصور القطعة:
                    </h3>
                    <p className="text-[11px] text-[#78716C]">
                      اختر اللون وحدد سعره الخاص وارفع صورته من جهازك
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="py-1.5 px-3 bg-[#1C1917] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#332E2B]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة لون</span>
                  </button>
                </div>

                <div className="p-3 bg-[#FAF4E8] border border-[#E8DCB8] rounded-xl text-xs text-[#8C6D46] flex items-start gap-2 mb-3">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong className="block text-[#6D532B] font-bold">تنبيه بخصوص حجم الصور:</strong>
                    <span>الحد الأقصى لحجم الصورة هو 800 كيلوبايت لتعمل مع السحابة. إذا كانت الصورة أكبر، استخدم رابط URL مباشر.</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {newColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl border border-[#DDD5C7] space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-[#78716C] mb-1">اسم اللون:</label>
                          <input
                            type="text"
                            value={color.name}
                            onChange={(e) => handleColorUpdate(idx, 'name', e.target.value)}
                            className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#78716C] mb-1">منتقي اللون:</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={color.hex}
                              onChange={(e) => handleColorUpdate(idx, 'hex', e.target.value)}
                              className="w-7 h-7 rounded-md border border-[#DDD5C7] cursor-pointer p-0"
                            />
                            <span className="text-[10px] font-mono text-[#78716C]">{color.hex}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#78716C] mb-1">سعر اللون (د.أ):</label>
                          <input
                            type="number"
                            step="0.5"
                            value={color.price}
                            onChange={(e) => handleColorUpdate(idx, 'price', Number(e.target.value))}
                            className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg font-mono font-bold"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-[#78716C] mb-1">صورة هذا اللون (الرئيسية):</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={color.image}
                              onChange={(e) => handleColorUpdate(idx, 'image', e.target.value)}
                              placeholder="رابط URL أو ارفع صورة"
                              className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg"
                            />
                            <label className="p-1.5 border border-[#DDD5C7] rounded-lg hover:bg-[#F2EDE4] cursor-pointer shrink-0" title="رفع من جهازك">
                              <Upload className="w-4 h-4 text-[#8C6D46]" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleColorImageUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="sm:col-span-1 text-center">
                          {newColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(idx)}
                              className="text-[#A8A29E] hover:text-rose-600 p-1 cursor-pointer"
                              title="حذف هذا اللون"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Additional angles for this color */}
                      <div className="pt-2 border-t border-[#EAE3D7]/70">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-[#78716C]">
                            📷 زوايا تصوير إضافية لهذا اللون ({color.additionalImages?.length || 0}):
                          </span>
                          <label className="text-[10px] font-bold text-[#8C6D46] hover:text-[#1C1917] cursor-pointer flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            <span>إضافة صورة زاوية</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleAddAdditionalImageToNewColor(idx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {color.additionalImages && color.additionalImages.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {color.additionalImages.map((addImg, aIdx) => (
                              <div key={aIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#DDD5C7] group">
                                <img src={addImg} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdditionalImageFromNewColor(idx, aIdx)}
                                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="حذف هذه الزاوية"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="py-2.5 px-5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-3 px-8 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl shadow-md transition-all cursor-pointer"
                >
                  نشر القطعة في متجر دكان 962
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PASSWORD SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto py-4 space-y-6">
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E9E1D4] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1C1917]">
                  <Lock className="w-5 h-5 text-[#8C6D46]" />
                  <span>تغيير كلمة مرور لوحة التحكم</span>
                </div>
                <p className="text-xs text-[#78716C]">
                  كلمة المرور الحالية هي التي تستخدمها للدخول عند الضغط على شعار دكان 962.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      كلمة المرور الحالية:
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="أدخل كلمتك الحالية"
                      className="w-full text-xs py-2.5 px-3 bg-white border border-[#DDD5C7] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      كلمة المرور الجديدة:
                    </label>
                    <input
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="w-full text-xs py-2.5 px-3 bg-white border border-[#DDD5C7] rounded-xl font-mono"
                    />
                  </div>

                  {passMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold ${
                        passMsg.error
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {passMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl transition-all cursor-pointer"
                  >
                    تحديث وحفظ كلمة المرور
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Edit Product Modal for editing existing models' colors, prices & photos */}
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={handleSaveEditedProduct}
          />
        )}
      </div>
    </div>
  );
};

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState(product.name);
  const [basePrice, setBasePrice] = useState(product.basePrice);
  const [category, setCategory] = useState(product.category);
  const [woodType, setWoodType] = useState(product.woodType);
  const [dimensions, setDimensions] = useState(product.dimensions);
  const [warranty, setWarranty] = useState(product.warranty);
  const [description, setDescription] = useState(product.description);
  const [colors, setColors] = useState<ProductColor[]>(product.colors);

  const categoryLabels = {
    'center-tables': 'طاولات وسط وصالون',
    'tv-tables': 'طاولات شاشة وتلفزيون',
    'fireplace-tables': 'طاولات شاشة مع مدفأة',
    'side-tables': 'طاولات خدمة وضيافة',
  };

  const handleColorUpdate = (idx: number, field: keyof ProductColor, val: string | number) => {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  };

  const handleColorImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('الصورة كبيرة جداً! يجب أن تكون أقل من 800 كيلوبايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          handleColorUpdate(idx, 'image', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdditionalImage = (colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('الصورة كبيرة جداً! يجب أن تكون أقل من 800 كيلوبايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setColors((prev) =>
            prev.map((c, i) => {
              if (i === colorIdx) {
                const addImages = c.additionalImages || [];
                return { ...c, additionalImages: [...addImages, reader.result as string] };
              }
              return c;
            })
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAdditionalImage = (colorIdx: number, imgIdx: number) => {
    setColors((prev) =>
      prev.map((c, i) => {
        if (i === colorIdx && c.additionalImages) {
          return {
            ...c,
            additionalImages: c.additionalImages.filter((_, idx) => idx !== imgIdx),
          };
        }
        return c;
      })
    );
  };

  const handleAddColor = () => {
    setColors((prev) => [
      ...prev,
      {
        name: `لون جديد ${prev.length + 1}`,
        hex: '#FFFFFF',
        price: basePrice,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
        additionalImages: [],
      },
    ]);
  };

  const handleRemoveColor = (idx: number) => {
    if (colors.length <= 1) return;
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allImages = Array.from(
      new Set([
        ...colors.map((c) => c.image),
        ...colors.flatMap((c) => c.additionalImages || []),
      ].filter(Boolean))
    );

    const updated: Product = {
      ...product,
      name,
      basePrice: Number(basePrice),
      category,
      categoryLabel: categoryLabels[category],
      woodType,
      dimensions,
      warranty,
      description,
      colors,
      images: allImages.length > 0 ? allImages : product.images,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6 max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-[#EAE3D7] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">
              تعديل القطعة رقم #{product.itemNumber}: {product.name}
            </h3>
            <p className="text-xs text-[#78716C]">
              تعديل الصور بالزوايا المختلفة، أسعار الألوان، والمواصفات (يُحفظ بشكل دائم لجميع الروابط والأجهزة)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EDE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">اسم القطعة:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">السعر الأساسي (دينار أردني د.أ):</label>
              <input
                type="number"
                step="0.5"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">القسم والتصنيف:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl bg-white"
              >
                <option value="center-tables">طاولات وسط وصالون</option>
                <option value="tv-tables">طاولات شاشة وتلفزيون</option>
                <option value="fireplace-tables">طاولات شاشة مع مدفأة</option>
                <option value="side-tables">طاولات خدمة وضيافة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">نوع الخشب / الخامة:</label>
              <input
                type="text"
                value={woodType}
                onChange={(e) => setWoodType(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">المقاسات والأبعاد:</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">فترة الضمان:</label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">الشرح والمواصفات العامة:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl"
            />
          </div>

          {/* Colors & Photos section */}
          <div className="pt-4 border-t border-[#EAE3D7]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#1C1917]">
                  ألوان القطعة والصور المخصصة لكل لون:
                </h4>
                <p className="text-[11px] text-[#78716C]">
                  يمكنك تحديد سعر مختلف لكل لون ورفع صور متعددة للزوايا من جهازك
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                className="text-xs py-1.5 px-3 bg-[#1C1917] text-white rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة لون جديد</span>
              </button>
            </div>

            <div className="space-y-4">
              {colors.map((color, idx) => (
                <div key={idx} className="p-4 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#78716C] mb-1">اسم اللون:</label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorUpdate(idx, 'name', e.target.value)}
                        className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#78716C] mb-1">رمز اللون:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => handleColorUpdate(idx, 'hex', e.target.value)}
                          className="w-8 h-8 rounded-lg border border-[#DDD5C7] p-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono">{color.hex}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#78716C] mb-1">سعر هذا اللون (د.أ):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={color.price}
                        onChange={(e) => handleColorUpdate(idx, 'price', Number(e.target.value))}
                        className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg font-mono font-bold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-[#78716C] mb-1">الصورة الرئيسية للون:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={color.image}
                          onChange={(e) => handleColorUpdate(idx, 'image', e.target.value)}
                          placeholder="رابط الصورة أو ارفعها"
                          className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg bg-white"
                        />
                        <label className="p-1.5 bg-white border border-[#DDD5C7] rounded-lg hover:bg-[#F2EDE4] cursor-pointer shrink-0" title="رفع من جهازك">
                          <Upload className="w-4 h-4 text-[#8C6D46]" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleColorImageUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-1 text-center">
                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-[#A8A29E] hover:text-rose-600 p-1 cursor-pointer"
                          title="حذف هذا اللون"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional angles for this color */}
                  <div className="pt-2 border-t border-[#EAE3D7]/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-[#78716C]">
                        زوايا إضافية لهذا اللون ({color.additionalImages?.length || 0}):
                      </span>
                      <label className="text-[10px] font-bold text-[#8C6D46] hover:text-[#1C1917] cursor-pointer flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        <span>إضافة صورة زاوية</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAddAdditionalImage(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {color.additionalImages && color.additionalImages.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {color.additionalImages.map((addImg, aIdx) => (
                          <div key={aIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#DDD5C7] group">
                            <img src={addImg} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalImage(idx, aIdx)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="حذف هذه الزاوية"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D7]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="py-2.5 px-8 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>حفظ تعديلات القطعة لجميع الأجهزة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
