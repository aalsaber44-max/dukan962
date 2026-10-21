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
  Star,
} from 'lucide-react';
import { Product, ProductColor, Order, Category, ProductAttribute } from '../types/furniture';
// استيراد Firebase
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// ✅ استيراد مكون إدارة الأقسام
import { CategoryManager } from './CategoryManager';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🔑 كلمة المرور الافتراضية للوحة التحكم
const DEFAULT_ADMIN_PASSWORD = 'Dukan962@Admin#2024!';
const PASSWORD_STORAGE_KEY = 'dukan962_admin_password';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'orders' | 'add' | 'settings' | 'categories'>('list');
  const [successToast, setSuccessToast] = useState('');
  
  // حالة المنتجات والأقسام من Firebase
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [newCategory, setNewCategory] = useState<string>('');
  const [newBasePrice, setNewBasePrice] = useState<number>(0);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | undefined>(undefined);
  const [newDesc, setNewDesc] = useState('');
  const [newWarranty, setNewWarranty] = useState('ضمان سنتين');
  const [newIsBestSeller, setNewIsBestSeller] = useState(false);
  const [newAttributes, setNewAttributes] = useState<ProductAttribute[]>([]);
  const [newColors, setNewColors] = useState<ProductColor[]>([
    {
      name: 'بني جوزي',
      hex: '#3E2723',
      price: 0,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80',
    },
  ]);
  
  // حالة لحفظ الروابط المؤقتة للزوايا الإضافية (للإضافة الجديدة)
  const [tempNewColorUrls, setTempNewColorUrls] = useState<Record<number, string>>({});

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // تعيين كلمة المرور الافتراضية عند أول تشغيل
  useEffect(() => {
    if (!localStorage.getItem(PASSWORD_STORAGE_KEY)) {
      localStorage.setItem(PASSWORD_STORAGE_KEY, DEFAULT_ADMIN_PASSWORD);
    }
  }, []);

  // جلب المنتجات والأقسام من Firebase مباشرة
  useEffect(() => {
    if (!isOpen) return;
    
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
      setLoadingProducts(false);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, [isOpen]);

  // Fetch orders
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

  if (!isOpen) return null;

  // --- Firebase Operations ---

  const handlePriceChange = (id: string, price: number) => {
    setEditingPrices((prev) => ({ ...prev, [id]: price }));
  };

  const handleSavePrice = async (id: string) => {
    const updatedPrice = editingPrices[id];
    if (updatedPrice === undefined) return;

    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    const nextColors = (productToUpdate.colors || []).map((c, i) => (i === 0 ? { ...c, price: updatedPrice } : c));

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

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setConfirmDeleteId(null);
      showNotification('تم حذف القطعة من السحابة بنجاح.');
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleSaveEditedProduct = async (updated: Product) => {
    try {
      const { id, ...dataToUpdate } = updated;
      await updateDoc(doc(db, 'products', id), dataToUpdate);
      setEditingProduct(null);
      showNotification(`تم حفظ وتحديث القطعة "${updated.name}" بنجاح في السحابة!`);
    } catch (error) {
      alert('حدث خطأ أثناء تعديل المنتج');
      console.error(error);
    }
  };

  // --- Dynamic Attributes Logic (For Add Form) ---
  const addAttribute = () => {
    setNewAttributes(prev => [...prev, { name: '', options: [] }]);
  };

  const updateAttributeName = (index: number, name: string) => {
    setNewAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, name } : attr));
  };

  const updateAttributeOptions = (index: number, optionsString: string) => {
    const options = optionsString.split(',').map(o => o.trim()).filter(Boolean);
    setNewAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, options } : attr));
  };

  const removeAttribute = (index: number) => {
    setNewAttributes(prev => prev.filter((_, i) => i !== index));
  };

  // --- Colors Logic ---
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

  const handleColorUpdate = (idx: number, field: keyof ProductColor, val: any) => {
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

  const handleAddAdditionalImageUrlToNewColor = (colorIdx: number) => {
    const url = tempNewColorUrls[colorIdx];
    if (!url) return;
    setNewColors((prev) =>
      prev.map((c, i) => {
        if (i === colorIdx) return { ...c, additionalImages: [...(c.additionalImages || []), url] };
        return c;
      })
    );
    setTempNewColorUrls((prev) => ({ ...prev, [colorIdx]: '' }));
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBasePrice || !newCategory) return alert('يرجى تعبئة الاسم، القسم، والسعر');

    const allImages = Array.from(
      new Set([
        ...newColors.map((c) => c.image),
        ...newColors.flatMap((c) => c.additionalImages || []),
      ].filter(Boolean))
    );

    const newProd: Omit<Product, 'id'> = {
      itemNumber: products.length + 1,
      name: newName,
      categoryId: newCategory,
      basePrice: Number(newBasePrice),
      originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
      description: newDesc,
      warranty: newWarranty,
      images: allImages,
      colors: newColors,
      attributes: newAttributes,
      isBestSeller: newIsBestSeller,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'products'), newProd);
      showNotification(`تمت إضافة القطعة "${newName}" ونشرها في السحابة بنجاح!`);
      setActiveTab('list');

      setNewName('');
      setNewBasePrice(0);
      setNewOriginalPrice(undefined);
      setNewDesc('');
      setNewAttributes([]);
      setNewIsBestSeller(false);
    } catch (error) {
      alert('حدث خطأ أثناء الإضافة. تأكد من حجم الصور.');
      console.error(error);
    }
  };

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

  // ✅ دالة حذف الطلب (تم إزالة التكرار)
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch {}

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    
    try {
      const local = JSON.parse(localStorage.getItem('dukan962_orders_local') || '[]');
      const updatedLocal = local.filter((o: any) => o.id !== orderId);
      localStorage.setItem('dukan962_orders_local', JSON.stringify(updatedLocal));
    } catch {}

    setConfirmDeleteOrderId(null);
    showNotification('تم حذف الطلب من السجل نهائياً.');
  };

  // 🔐 دالة تغيير كلمة المرور
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    const storedPass = localStorage.getItem(PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;

    if (currentPass !== storedPass) {
      setPassMsg({ text: 'كلمة المرور الحالية غير صحيحة، حاول مرة أخرى.', error: true });
      return;
    }

    if (!newPass || newPass.trim().length < 6) {
      setPassMsg({ text: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.', error: true });
      return;
    }

    localStorage.setItem(PASSWORD_STORAGE_KEY, newPass);
    setPassMsg({ text: 'تم تحديث كلمة المرور بنجاح! استخدمها في المرة القادمة.', error: false });
    setCurrentPass('');
    setNewPass('');
    showNotification('تم تحديث كلمة المرور بنجاح!');
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
            {`جدول المنتجات والأسعار (${products.length})`}
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
            <span>إضافة منتج جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إدارة الأقسام</span>
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
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#EDE5D8] p-8">
                  <p className="text-sm font-bold text-[#1C1917] mb-1">لا توجد منتجات مسجلة حتى الآن</p>
                  <p className="text-xs text-[#78716C]">قم بإضافة منتجاتك من تبويب "إضافة منتج جديد".</p>
                </div>
              ) : (
                <div className="border border-[#E5DDD0] rounded-2xl overflow-x-auto shadow-xs bg-white">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#FAF7F2] text-[#78716C] font-semibold border-b border-[#E5DDD0]">
                      <tr>
                        <th className="p-3.5">الرقم</th>
                        <th className="p-3.5">الصورة</th>
                        <th className="p-3.5">اسم القطعة</th>
                        <th className="p-3.5">القسم</th>
                        <th className="p-3.5">مميز</th>
                        <th className="p-3.5">السعر بالدينار (د.أ)</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE1]">
                      {products.map((p) => {
                        const isPriceEdited = editingPrices[p.id] !== undefined;
                        const currentPriceVal = isPriceEdited ? editingPrices[p.id] : p.basePrice;
                        const categoryName = categories.find(c => c.id === p.categoryId)?.name || 'غير محدد';

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="p-3.5 font-mono text-[#78716C]">{`#${p.itemNumber || '-'}`}</td>
                            <td className="p-3.5">
                              <img
                                src={p.colors?.[0]?.image || p.images?.[0] || 'https://via.placeholder.com/150'}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-[#E9E1D4] bg-[#F4EFE6]"
                              />
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-[#1C1917] leading-snug">{p.name}</p>
                            </td>
                            <td className="p-3.5 text-[#57534E] font-medium">{categoryName}</td>
                            <td className="p-3.5">
                              {p.isBestSeller ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : '-'}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={currentPriceVal || 0}
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

                    const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('ar-JO', {
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
                              {`الزبون: ${order.name}`}
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
                                href={`https://wa.me/962${order.phone?.replace(/^0+/, '')}`}
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
                              <span>{`${order.governorate} - ${order.address}`}</span>
                            </p>

                            <div className="pt-1">
                              <span className="text-[11px] text-[#78716C] block">طريقة الدفع:</span>
                              <span className="font-semibold text-[#2E5339] inline-flex items-center gap-1">
                                {order.paymentMethod === 'cod' ? (
                                  'الدفع عند الاستلام كاش'
                                ) : (
                                  <>
                                    <Smartphone className="w-3 h-3" />
                                    <span>تحويل كليك CliQ</span>
                                    {order.cliqRef && (
                                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#C5DEC8] font-mono">
                                        {`مرجع: ${order.cliqRef}`}
                                      </span>
                                    )}
                                  </>
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
                              {order.items?.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#E9E1D4]"
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={it.selectedColor?.image || it.product?.images?.[0] || 'https://via.placeholder.com/150'}
                                      alt=""
                                      className="w-8 h-8 rounded-md object-cover"
                                    />
                                    <div>
                                      <p className="font-bold text-[#1C1917]">{it.product?.name || 'قطعة'}</p>
                                      <span className="text-[10px] text-[#8C6D46]">
                                        {`اللون: ${it.selectedColor?.name || 'افتراضي'} | الكمية: ${it.quantity || 1}`}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-[#1C1917]">
                                    {`${((it.selectedColor?.price || 0) * (it.quantity || 1)).toFixed(2)} د.أ`}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-[#E5DDD0] flex justify-between items-center text-xs">
                              <span className="text-[#78716C]">
                                {`المجموع (شامل التوصيل ${order.deliveryFee === 0 ? 'مجاني' : (order.deliveryFee || 0) + ' د.أ'}):`}
                              </span>
                              <strong className="text-sm font-black text-[#1C1917] font-mono">
                                {`${(order.total || 0).toFixed(2)} دينار أردني`}
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

          {/* TAB 3: ADD NEW PRODUCT */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateProduct} className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E9E1D4] space-y-4">
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8C6D46]" />
                  <span>معلومات القطعة الأساسية</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="مثال: حذاء نايك الرياضي"
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      القسم *
                    </label>
                    <select
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46] cursor-pointer"
                    >
                      <option value="" disabled>-- اختر القسم --</option>
                      {categories.filter(c => c.isActive).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      السعر الأساسي (د.أ) *
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
                      السعر قبل الخصم (اختياري)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={newOriginalPrice || ''}
                      onChange={(e) => setNewOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46] font-mono"
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

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={newIsBestSeller} onChange={(e) => setNewIsBestSeller(e.target.checked)} className="w-4 h-4 accent-[#1C1917]" id="bestSeller" />
                  <label htmlFor="bestSeller" className="text-xs font-bold cursor-pointer text-[#1C1917]">تمييز كـ "الأكثر مبيعاً"</label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    الشرح والمواصفات العامة
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="شرح سلس عن مميزات المنتج..."
                    className="w-full text-xs py-2 px-3 bg-white border border-[#DDD5C7] rounded-lg focus:outline-hidden focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              {/* Dynamic Attributes Section */}
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E9E1D4] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">الخصائص الديناميكية</h3>
                    <p className="text-[10px] text-gray-500">
                      {"أضف خصائص تناسب هذا المنتج (مثال: المقاس من 40 إلى 45)"}
                    </p>
                  </div>
                  <button type="button" onClick={addAttribute} className="bg-[#1C1917] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> إضافة خاصية</button>
                </div>

                {newAttributes.map((attr, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-3 rounded-xl border border-[#DDD5C7]">
                    <input type="text" placeholder="اسم الخاصية (مثال: المقاس)" value={attr.name} onChange={(e) => updateAttributeName(idx, e.target.value)} className="w-full sm:w-1/3 text-xs p-2 border rounded-lg" />
                    <input type="text" placeholder="القيم مفصولة بفاصلة (مثال: 40, 41, 42)" value={attr.options.join(', ')} onChange={(e) => updateAttributeOptions(idx, e.target.value)} className="w-full text-xs p-2 border rounded-lg" />
                    <button type="button" onClick={() => removeAttribute(idx)} className="text-rose-600 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              {/* Colors & Photos Section */}
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E9E1D4] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                      ألوان وصور القطعة:
                    </h3>
                  </div>
                  <button type="button" onClick={handleAddColor} className="py-1.5 px-3 bg-[#1C1917] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#332E2B]"><Plus className="w-3.5 h-3.5" /> إضافة لون</button>
                </div>

                <div className="p-3 bg-[#FAF4E8] border border-[#E8DCB8] rounded-xl text-xs text-[#8C6D46] flex items-start gap-2 mb-3">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong className="block text-[#6D532B] font-bold">تنبيه بخصوص حجم الصور:</strong>
                    <span>
                      {"الحد الأقصى لحجم الصورة هو 800 كيلوبايت لتعمل مع السحابة. إذا كانت الصورة أكبر، استخدم رابط URL مباشر."}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {newColors.map((color, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-[#DDD5C7] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-[#78716C] mb-1">اسم اللون:</label>
                          <input type="text" value={color.name} onChange={(e) => handleColorUpdate(idx, 'name', e.target.value)} className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg" />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#78716C] mb-1">منتقي اللون:</label>
                          <div className="flex items-center gap-1.5">
                            <input type="color" value={color.hex} onChange={(e) => handleColorUpdate(idx, 'hex', e.target.value)} className="w-7 h-7 rounded-md border border-[#DDD5C7] cursor-pointer p-0" />
                            <span className="text-[10px] font-mono text-[#78716C]">{color.hex}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#78716C] mb-1">سعر اللون (د.أ):</label>
                          <input type="number" step="0.5" value={color.price} onChange={(e) => handleColorUpdate(idx, 'price', Number(e.target.value))} className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg font-mono font-bold" />
                        </div>

                        <div className="sm:col-span-4 bg-[#FAF7F2] p-2 rounded-lg border border-[#DDD5C7]">
                          <label className="block text-[10px] font-bold text-[#1C1917] mb-1">الصورة الرئيسية:</label>
                          <div className="flex flex-col gap-2">
                            <input type="text" value={color.image.startsWith('data:image') ? '' : color.image} onChange={(e) => handleColorUpdate(idx, 'image', e.target.value)} placeholder={color.image.startsWith('data:image') ? 'تم رفع الصورة ✓' : 'ضع رابط الصورة هنا...'} className="w-full text-xs py-1 px-2 border border-[#DDD5C7] rounded-lg" dir="ltr" />
                            <label className="flex items-center justify-center gap-1 p-1 bg-white border border-[#DDD5C7] rounded-lg cursor-pointer text-[10px] font-bold text-[#8C6D46] hover:bg-[#F2EDE4] transition-colors"><Upload className="w-3 h-3" /> رفع من الجهاز<input type="file" accept="image/*" onChange={(e) => handleColorImageUpload(idx, e)} className="hidden" /></label>
                          </div>
                        </div>

                        <div className="sm:col-span-1 text-center">
                          {newColors.length > 1 && (<button type="button" onClick={() => handleRemoveColor(idx)} className="text-[#A8A29E] hover:text-rose-600 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EAE3D7]/70">
                        <div className="flex flex-col gap-2 mb-2">
                          <span className="text-[11px] text-[#78716C]">
                            {`📷 زوايا إضافية لهذا اللون (${color.additionalImages?.length || 0}):`}
                          </span>
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                             <input type="text" placeholder="ضع رابط الصورة الإضافية هنا (URL)..." value={tempNewColorUrls[idx] || ''} onChange={(e) => setTempNewColorUrls(prev => ({...prev, [idx]: e.target.value}))} className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg bg-white" dir="ltr" />
                             <div className="flex gap-2">
                               <button type="button" onClick={() => handleAddAdditionalImageUrlToNewColor(idx)} className="bg-[#1C1917] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#332E2B] whitespace-nowrap">إضافة الرابط</button>
                               <label className="flex items-center justify-center gap-1 text-xs font-bold text-[#8C6D46] bg-[#FAF7F2] border border-[#DDD5C7] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#F2EDE4] whitespace-nowrap"><Upload className="w-3.5 h-3.5" /> رفع صورة<input type="file" accept="image/*" onChange={(e) => handleAddAdditionalImageToNewColor(idx, e)} className="hidden" /></label>
                             </div>
                          </div>
                        </div>
                        {color.additionalImages && color.additionalImages.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {color.additionalImages.map((addImg, aIdx) => (
                              <div key={aIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#DDD5C7] group">
                                <img src={addImg} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => handleRemoveAdditionalImageFromNewColor(idx, aIdx)} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3.5 h-3.5" /></button>
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
                <button type="button" onClick={() => setActiveTab('list')} className="py-2.5 px-5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] cursor-pointer">إلغاء</button>
                <button type="submit" className="py-3 px-8 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl shadow-md transition-all cursor-pointer">نشر القطعة في متجر دكان 962</button>
              </div>
            </form>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <CategoryManager />
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
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">كلمة المرور الحالية:</label>
                    <input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="أدخل كلمتك الحالية" className="w-full text-xs py-2.5 px-3 bg-white border border-[#DDD5C7] rounded-xl font-mono" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">كلمة المرور الجديدة:</label>
                    <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="أدخل كلمة المرور الجديدة" className="w-full text-xs py-2.5 px-3 bg-white border border-[#DDD5C7] rounded-xl font-mono" />
                  </div>

                  {passMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold ${passMsg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {passMsg.text}
                    </div>
                  )}

                  <button type="submit" className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl transition-all cursor-pointer">تحديث وحفظ كلمة المرور</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Edit Product Modal */}
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
            onSave={handleSaveEditedProduct}
          />
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// EditProductModal
// ----------------------------------------------------------------------
interface EditProductModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, categories, onClose, onSave }) => {
  const [name, setName] = useState(product.name || '');
  const [basePrice, setBasePrice] = useState(product.basePrice || 0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(product.originalPrice);
  const [categoryId, setCategoryId] = useState(product.categoryId || '');
  const [warranty, setWarranty] = useState(product.warranty || '');
  const [description, setDescription] = useState(product.description || '');
  const [isBestSeller, setIsBestSeller] = useState(product.isBestSeller || false);
  const [colors, setColors] = useState<ProductColor[]>(product.colors || []);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(product.attributes || []);

  const [tempColorUrls, setTempColorUrls] = useState<Record<number, string>>({});

  const handleColorUpdate = (idx: number, field: keyof ProductColor, val: any) => {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  };

  const handleColorImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { alert('الصورة كبيرة جداً! يجب أن تكون أقل من 800 كيلوبايت.'); return; }
      const reader = new FileReader();
      reader.onload = () => { if (reader.result) handleColorUpdate(idx, 'image', reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdditionalImageUrl = (colorIdx: number) => {
    const url = tempColorUrls[colorIdx];
    if (!url) return;
    setColors((prev) => prev.map((c, i) => {
        if (i === colorIdx) return { ...c, additionalImages: [...(c.additionalImages || []), url] };
        return c;
      })
    );
    setTempColorUrls((prev) => ({ ...prev, [colorIdx]: '' }));
  };

  const handleAddAdditionalImage = (colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { alert('الصورة كبيرة جداً! يجب أن تكون أقل من 800 كيلوبايت.'); return; }
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.result) {
            setColors((prev) => prev.map((c, i) => {
                if (i === colorIdx) return { ...c, additionalImages: [...(c.additionalImages || []), reader.result as string] };
                return c;
            }));
          }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAdditionalImage = (colorIdx: number, imgIdx: number) => {
    setColors((prev) => prev.map((c, i) => {
        if (i === colorIdx && c.additionalImages) return { ...c, additionalImages: c.additionalImages.filter((_, idx) => idx !== imgIdx) };
        return c;
    }));
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

  const addAttribute = () => {
    setAttributes(prev => [...prev, { name: '', options: [] }]);
  };
  const updateAttributeName = (index: number, name: string) => {
    setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, name } : attr));
  };
  const updateAttributeOptions = (index: number, optionsString: string) => {
    const options = optionsString.split(',').map(o => o.trim()).filter(Boolean);
    setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, options } : attr));
  };
  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
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
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      categoryId,
      warranty,
      description,
      colors,
      attributes,
      isBestSeller,
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
              {`تعديل القطعة: ${product.name}`}
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
              <label className="block text-xs font-bold text-[#1C1917] mb-1">القسم والتصنيف:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl bg-white"
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
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
              <label className="block text-xs font-bold text-[#1C1917] mb-1">السعر قبل الخصم (اختياري):</label>
              <input
                type="number"
                step="0.5"
                value={originalPrice || ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-xs py-2 px-3 border border-[#DDD5C7] rounded-xl font-mono"
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

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="w-4 h-4 accent-[#1C1917]" id="editBest" />
              <label htmlFor="editBest" className="text-xs font-bold cursor-pointer text-[#1C1917]">تمييز كـ "الأكثر مبيعاً"</label>
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

          {/* Attributes in Edit */}
          <div className="pt-4 border-t border-[#EAE3D7]">
             <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#1C1917]">الخصائص الديناميكية:</h4>
              <button type="button" onClick={addAttribute} className="text-xs py-1.5 px-3 bg-[#1C1917] text-white rounded-lg flex items-center gap-1 cursor-pointer"><Plus className="w-3.5 h-3.5" /> إضافة خاصية</button>
            </div>
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-[#FAF7F2] p-3 rounded-xl border border-[#DDD5C7] mb-2">
                <input type="text" placeholder="اسم الخاصية" value={attr.name} onChange={(e) => updateAttributeName(idx, e.target.value)} className="w-full sm:w-1/3 text-xs p-2 border border-[#DDD5C7] rounded-lg" />
                <input type="text" placeholder="القيم مفصولة بفاصلة" value={attr.options.join(', ')} onChange={(e) => updateAttributeOptions(idx, e.target.value)} className="w-full text-xs p-2 border border-[#DDD5C7] rounded-lg" />
                <button type="button" onClick={() => removeAttribute(idx)} className="text-rose-600 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Colors & Photos section */}
          <div className="pt-4 border-t border-[#EAE3D7]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#1C1917]">
                  ألوان القطعة والصور المخصصة لكل لون:
                </h4>
                <p className="text-[11px] text-[#78716C]">
                  يمكنك تحديد سعر مختلف لكل لون ورفع صور متعددة للزوايا من جهازك أو إضافة رابط
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

                    {/* الصورة الرئيسية */}
                    <div className="sm:col-span-4 bg-white p-2 rounded-lg border border-[#DDD5C7]">
                      <label className="block text-[10px] font-bold text-[#1C1917] mb-1">الصورة الرئيسية للون:</label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          value={color.image.startsWith('data:image') ? '' : color.image} 
                          onChange={(e) => handleColorUpdate(idx, 'image', e.target.value)} 
                          placeholder={color.image.startsWith('data:image') ? 'تم الرفع ✓' : 'رابط الصورة...'} 
                          className="w-full text-xs py-1 px-2 border border-[#DDD5C7] rounded-lg" 
                          dir="ltr" 
                        />
                        <label className="flex items-center justify-center gap-1 p-1 border border-[#DDD5C7] rounded-lg cursor-pointer text-[10px] font-bold text-[#8C6D46] hover:bg-[#F2EDE4]">
                          <Upload className="w-3 h-3" /> رفع من الجهاز
                          <input type="file" accept="image/*" onChange={(e) => handleColorImageUpload(idx, e)} className="hidden" />
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

                  {/* الزوايا الإضافية (مع رابط + رفع) في شاشة التعديل */}
                  <div className="pt-2 border-t border-[#EAE3D7]/70">
                    <div className="flex flex-col gap-2 mb-2">
                      <span className="text-[11px] text-[#78716C]">
                        {`📷 زوايا إضافية لهذا اللون (${color.additionalImages?.length || 0}):`}
                      </span>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                         <input 
                           type="text" 
                           placeholder="ضع رابط الصورة الإضافية هنا (URL)..." 
                           value={tempColorUrls[idx] || ''} 
                           onChange={(e) => setTempColorUrls(prev => ({...prev, [idx]: e.target.value}))} 
                           className="w-full text-xs py-1.5 px-2 border border-[#DDD5C7] rounded-lg bg-white" 
                           dir="ltr" 
                         />
                         <div className="flex gap-2">
                           <button 
                             type="button" 
                             onClick={() => handleAddAdditionalImageUrl(idx)} 
                             className="bg-[#1C1917] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#332E2B] whitespace-nowrap"
                           >
                             إضافة الرابط
                           </button>
                           
                           <label className="flex items-center justify-center gap-1 text-xs font-bold text-[#8C6D46] bg-white border border-[#DDD5C7] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#F2EDE4] whitespace-nowrap">
                             <Upload className="w-3.5 h-3.5" /> رفع صورة
                             <input type="file" accept="image/*" onChange={(e) => handleAddAdditionalImage(idx, e)} className="hidden" />
                           </label>
                         </div>
                      </div>
                    </div>

                    {color.additionalImages && color.additionalImages.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
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
