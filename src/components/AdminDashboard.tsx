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
  Search,
  Download,
  DollarSign,
  Bell, 
  BarChart3,
} from 'lucide-react';
import { Product, ProductColor, Order, Category, ProductAttribute } from '../types/furniture';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'; 
import { CategoryManager } from './CategoryManager';
import { AdminStats } from './AdminStats';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ADMIN_PASSWORD = 'Dukan962@Admin#2024!';
const PASSWORD_STORAGE_KEY = 'dukan962_admin_password';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80';

const compressImage = (file: File, callback: (base64: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const scale = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/webp', 0.8));
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'orders' | 'add' | 'settings' | 'categories' | 'stats'>('list');
  const [successToast, setSuccessToast] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const [readOrders, setReadOrders] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dukan962_read_orders') || '[]');
    } catch { return []; }
  });

  const [editingPrices, setEditingPrices] = useState<Record<string, number | string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newBasePrice, setNewBasePrice] = useState<number | string>('');
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | string>('');
  const [newDesc, setNewDesc] = useState('');
  const [newWarranty, setNewWarranty] = useState('ضمان سنتين');
  const [newIsBestSeller, setNewIsBestSeller] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState(''); 
  const [newAttributes, setNewAttributes] = useState<ProductAttribute[]>([]);
  const [newColors, setNewColors] = useState<ProductColor[]>([
    {
      name: 'بني جوزي',
      hex: '#3E2723',
      price: 0,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80',
    },
  ]);
  
  const [tempNewColorUrls, setTempNewColorUrls] = useState<Record<number, string>>({});
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  useEffect(() => {
    if (!localStorage.getItem(PASSWORD_STORAGE_KEY)) {
      localStorage.setItem(PASSWORD_STORAGE_KEY, DEFAULT_ADMIN_PASSWORD);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoadingProducts(false);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => cats.push({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach((doc) => ords.push({ id: doc.id, ...doc.data() } as Order));
      setOrders(ords);
      setLoadingOrders(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeOrders();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, price: number | string) => {
    setEditingPrices((prev) => ({ ...prev, [id]: price }));
  };

  const handleSavePrice = async (id: string) => {
    const updatedPrice = editingPrices[id];
    if (updatedPrice === undefined || updatedPrice === '') return;

    const numPrice = Number(updatedPrice);
    if (isNaN(numPrice)) return;

    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    const nextColors = (productToUpdate.colors || []).map((c, i) => (i === 0 ? { ...c, price: numPrice } : c));

    try {
      await updateDoc(doc(db, 'products', id), {
        basePrice: numPrice,
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

  const addAttribute = () => {
    setNewAttributes(prev => [...prev, { name: '', options: [] }]);
  };

  const updateAttributeName = (index: number, name: string) => {
    setNewAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, name } : attr));
  };

  const updateAttributeOptions = (index: number, optionsString: string) => {
    const options = (optionsString || '').split(',').map(o => o.trim()).filter(Boolean);
    setNewAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, options } : attr));
  };

  const removeAttribute = (index: number) => {
    setNewAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    setNewColors((prev) => [
      ...prev,
      {
        name: `لون جديد ${prev.length + 1}`,
        hex: '#FFFFFF',
        price: Number(newBasePrice) || 0,
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
      compressImage(file, (compressedBase64) => {
        handleColorUpdate(idx, 'image', compressedBase64);
      });
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
      compressImage(file, (compressedBase64) => {
        setNewColors((prev) =>
          prev.map((c, i) => {
            if (i === colorIdx) {
              const addImages = c.additionalImages || [];
              return { ...c, additionalImages: [...addImages, compressedBase64] };
            }
            return c;
          })
        );
      });
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

    const finalImages = allImages.length > 0 ? allImages : [PLACEHOLDER_IMAGE];
    
    const safeColors = newColors.map(c => ({ 
      ...c, 
      image: c.image || PLACEHOLDER_IMAGE,
      price: Number(c.price) || 0 
    }));

    const newProd: Omit<Product, 'id'> = {
      itemNumber: products.length + 1,
      name: newName,
      categoryId: newCategory,
      basePrice: Number(newBasePrice) || 0,
      originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
      description: newDesc || 'لا يوجد وصف',
      warranty: newWarranty,
      images: finalImages,
      colors: safeColors,
      attributes: newAttributes,
      isBestSeller: newIsBestSeller,
      videoUrl: newVideoUrl.trim() !== '' ? newVideoUrl.trim() : undefined, 
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'products'), newProd);
      showNotification(`تمت إضافة القطعة "${newName}" ونشرها في السحابة بنجاح!`);
      setActiveTab('list');

      setNewName('');
      setNewBasePrice('');
      setNewOriginalPrice('');
      setNewDesc('');
      setNewAttributes([]);
      setNewIsBestSeller(false);
      setNewVideoUrl(''); 
    } catch (error) {
      alert('حدث خطأ أثناء الإضافة. تأكد من حجم الصور.');
      console.error(error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      showNotification(`تم تغيير حالة الطلب إلى "${newStatus}"`);
    } catch (error) {
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setConfirmDeleteOrderId(null);
      showNotification('تم حذف الطلب من السجل نهائياً.');
    } catch (error) {
      alert('حدث خطأ أثناء حذف الطلب');
    }
  };

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

  const handleMarkOrderAsRead = (orderId: string) => {
    if (!readOrders.includes(orderId)) {
      const newReadOrders = [...readOrders, orderId];
      setReadOrders(newReadOrders);
      localStorage.setItem('dukan962_read_orders', JSON.stringify(newReadOrders));
    }
  };

  const filteredOrders = orders.filter(order => {
    const query = orderSearchQuery.toLowerCase();
    return (
      order.name?.toLowerCase().includes(query) ||
      order.phone?.includes(query) ||
      order.id?.toLowerCase().includes(query)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
  );

  const totalRevenue = orders.reduce((sum, order) => (order.status === 'ملغي' ? sum : sum + Number(order.total || 0)), 0);
  const unreadCount = orders.filter(o => !readOrders.includes(o.id)).length;
  
  const handleExportExcel = () => {
    if (orders.length === 0) return alert('لا توجد طلبات لتصديرها');
    
    const headers = ['رقم الطلب', 'الاسم', 'الهاتف', 'المحافظة', 'العنوان', 'الإجمالي (د.أ)', 'طريقة الدفع', 'الحالة', 'التاريخ'];
    const rows = sortedOrders.map(o => [
      o.id,
      o.name,
      o.phone,
      o.governorate,
      o.address.replace(/,/g, ' '),
      o.total,
      o.paymentMethod === 'cod' ? 'كاش' : 'كليك',
      o.status,
      new Date(o.createdAt || Date.now()).toLocaleDateString('ar-JO')
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0B0A09] rounded-3xl shadow-[0_0_80px_-20px_rgba(212,176,106,0.25)] border border-white/10 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1C1815]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] flex items-center justify-center font-bold shadow-gold">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#F3EEE4] font-serif">
                لوحة تحكم إدارة دكان 962
              </h2>
              <p className="text-xs text-[#A39A8B]">
                إدارة طلبات الزبائن، الأسعار، الصور والألوان، والمزامنة السحابية الدائمة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#A39A8B] hover:text-[#F3EEE4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successToast && (
          <div className="bg-[#7FD1A0]/10 border-b border-[#7FD1A0]/25 px-6 py-2.5 text-xs text-[#7FD1A0] font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#7FD1A0]" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="px-6 pt-4 border-b border-white/10 flex flex-wrap items-center gap-2 sm:gap-4 bg-[#1C1815] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-[#D4B06A] text-[#E8CC8A]'
                : 'border-transparent text-[#A39A8B] hover:text-[#F3EEE4]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>الإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-[#D4B06A] text-[#E8CC8A]'
                : 'border-transparent text-[#A39A8B] hover:text-[#F3EEE4]'
            }`}
          >
            {`المنتجات والأسعار (${products.length})`}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#D4B06A] text-[#E8CC8A]'
                : 'border-transparent text-[#A39A8B] hover:text-[#F3EEE4]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات الواردة</span>
            {unreadCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                <Bell className="w-3 h-3" /> {unreadCount} جديد
              </span>
            ) : (
              <span className="bg-[#7FD1A0]/20 text-[#7FD1A0] text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-[#D4B06A] text-[#E8CC8A]'
                : 'border-transparent text-[#A39A8B] hover:text-[#F3EEE4]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-[#D4B06A] text-[#E8CC8A]'
                : 'border-transparent text-[#A39A8B] hover:text-[#F3EEE4]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأقسام</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#D4B06A] text-[#E8CC8A]'
                : 'border-transparent text-[#A39A8B] hover:text-[#F3EEE4]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>كلمة المرور</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'stats' && (
            <AdminStats orders={orders} products={products} loading={loadingOrders} />
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              <span className="text-xs text-[#A39A8B]">
                أي تعديل على الأسعار أو حذف أو إضافة يُحفظ في السحابة ويظهر فوراً في الموبايل واللابتوب.
              </span>

              {loadingProducts ? (
                <div className="text-center py-10 font-bold text-[#D4B06A]">جاري تحميل المنتجات من السحابة...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-[#141210] rounded-2xl border border-white/10 p-8">
                  <p className="text-sm font-bold text-[#F3EEE4] mb-1">لا توجد منتجات مسجلة حتى الآن</p>
                  <p className="text-xs text-[#A39A8B]">قم بإضافة منتجاتك من تبويب "إضافة منتج".</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-x-auto shadow-soft bg-[#141210]">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#1C1815] text-[#A39A8B] font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3.5">الرقم</th>
                        <th className="p-3.5">الصورة</th>
                        <th className="p-3.5">اسم القطعة</th>
                        <th className="p-3.5">القسم</th>
                        <th className="p-3.5">مميز</th>
                        <th className="p-3.5">السعر (د.أ)</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {products.map((p) => {
                        const isPriceEdited = editingPrices[p.id] !== undefined;
                        const currentPriceVal = isPriceEdited ? editingPrices[p.id] : p.basePrice;
                        const categoryName = categories.find(c => c.id === p.categoryId)?.name || 'غير محدد';

                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 font-mono text-[#A39A8B]">{`#${p.itemNumber || '-'}`}</td>
                            <td className="p-3.5">
                              <img
                                src={p.colors?.[0]?.image || p.images?.[0] || 'https://via.placeholder.com/150'}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-white/10 bg-[#1C1815]"
                              />
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-[#F3EEE4] leading-snug">{p.name}</p>
                            </td>
                            <td className="p-3.5 text-[#B9B0A0] font-medium">{categoryName}</td>
                            <td className="p-3.5">
                              {p.isBestSeller ? <Star className="w-4 h-4 text-[#D4B06A] fill-[#D4B06A]" /> : '-'}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={currentPriceVal === undefined ? '' : currentPriceVal}
                                  onChange={(e) => handlePriceChange(p.id, e.target.value)}
                                  className="w-20 py-1 px-2 bg-[#1C1815] border border-white/10 rounded-lg font-mono font-bold text-[#F3EEE4] text-left focus:border-[#D4B06A] focus:outline-none"
                                />
                                <span className="text-[11px] text-[#A39A8B]">د.أ</span>
                                {isPriceEdited && (
                                  <button
                                    onClick={() => handleSavePrice(p.id)}
                                    className="p-1 bg-[#D4B06A] text-[#0B0A09] rounded-md hover:bg-[#E8CC8A] cursor-pointer"
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
                                  className="py-1 px-2.5 text-[#E8CC8A] hover:text-[#0B0A09] bg-white/[0.04] hover:bg-[#D4B06A] rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px] ring-1 ring-[#D4B06A]/30"
                                  title="تعديل الصور والألوان"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>تعديل</span>
                                </button>

                                {confirmDeleteId === p.id ? (
                                  <div className="flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/30">
                                    <span className="text-[10px] text-rose-400 font-bold">تأكيد؟</span>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      نعم
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-[#F3EEE4] rounded text-[10px] cursor-pointer"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    className="p-1.5 text-[#8A8173] hover:text-rose-400 transition-colors cursor-pointer"
                                    title="حذف القطعة"
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

          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#141210] p-4 rounded-2xl border border-white/10 shadow-soft flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4B06A]/15 text-[#D4B06A] flex items-center justify-center shrink-0 ring-1 ring-[#D4B06A]/30">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A39A8B] font-semibold">إجمالي الطلبات</p>
                    <p className="text-xl font-black text-[#F3EEE4] font-mono">{orders.length}</p>
                  </div>
                </div>
                <div className="bg-[#141210] p-4 rounded-2xl border border-white/10 shadow-soft flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#7FD1A0]/15 text-[#7FD1A0] flex items-center justify-center shrink-0 ring-1 ring-[#7FD1A0]/30">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A39A8B] font-semibold">إجمالي المبيعات (د.أ)</p>
                    <p className="text-xl font-black text-[#F3EEE4] font-mono">{totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F3EEE4]">
                    سجل طلبات الزبائن
                  </h3>
                  <p className="text-xs text-[#A39A8B]">
                    الطلبات الأحدث تظهر في الأعلى.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-56">
                    <input
                      type="text"
                      placeholder="ابحث باسم أو رقم..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full text-xs py-2 pr-8 pl-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                    />
                    <Search className="w-4 h-4 text-[#8A8173] absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="py-2 px-3 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-bold text-[#F3EEE4] hover:bg-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="تصدير Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير</span>
                  </button>

                  <button
                    disabled={loadingOrders}
                    className="py-2 px-3 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-bold text-[#F3EEE4] hover:bg-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                    <span>تحديث</span>
                  </button>
                </div>
              </div>

              {loadingOrders ? (
                <div className="text-center py-10 font-bold text-[#D4B06A]">جاري تحميل الطلبات من السحابة...</div>
              ) : sortedOrders.length === 0 ? (
                <div className="py-16 text-center bg-[#141210] rounded-2xl border border-white/10 p-8">
                  <div className="w-12 h-12 rounded-full bg-[#1C1815] text-[#D4B06A] flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#F3EEE4] mb-1">لا توجد طلبات مسجلة حتى الآن</p>
                  <p className="text-xs text-[#A39A8B]">عندما يقوم أي زبون بتأكيد طلبه، ستظهر بياناته هنا فوراً.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedOrders.map((order) => {
                    const isUnread = !readOrders.includes(order.id);
                    const statusColors: Record<string, string> = {
                      'جديد': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      'جاري التجهيز': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      'جاري التوصيل': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                      'تم التسليم': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                      'ملغي': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    };

                    const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('ar-JO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleMarkOrderAsRead(order.id)}
                        className={`bg-[#141210] border rounded-2xl p-4 sm:p-5 shadow-soft transition-all cursor-pointer ${
                          isUnread ? 'border-rose-500/40 ring-1 ring-rose-500/30' : 'border-white/10 hover:border-[#D4B06A]/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            {isUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block" title="طلب جديد"></span>
                            )}
                            <span className="font-mono font-black text-sm text-[#F3EEE4]">
                              {order.id}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                                statusColors[order.status] || 'bg-white/5 text-[#F3EEE4]'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-[11px] text-[#8A8173] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{orderDate}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[11px] text-[#A39A8B]">الحالة:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs py-1 px-2.5 bg-[#1C1815] border border-white/10 rounded-lg font-bold text-[#F3EEE4] cursor-pointer focus:outline-none focus:border-[#D4B06A]"
                            >
                              <option value="جديد">جديد</option>
                              <option value="جاري التجهيز">جاري التجهيز</option>
                              <option value="جاري التوصيل">جاري التوصيل</option>
                              <option value="تم التسليم">تم التسليم</option>
                              <option value="ملغي">ملغي</option>
                            </select>

                            {confirmDeleteOrderId === order.id ? (
                              <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-lg border border-rose-500/30">
                                <span className="text-[10px] text-rose-400 font-bold">حذف؟</span>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px]"
                                >
                                  نعم
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteOrderId(null)}
                                  className="px-1.5 py-0.5 bg-white/10 text-[#F3EEE4] rounded text-[10px]"
                                >
                                  لا
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteOrderId(order.id)}
                                className="p-1 text-[#8A8173] hover:text-rose-400 cursor-pointer"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3">
                          <div className="md:col-span-5 space-y-2 text-xs">
                            <p className="font-bold text-[#F3EEE4] text-sm">
                              {`الزبون: ${order.name}`}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[#A39A8B]">الهاتف:</span>
                              <strong className="font-mono text-[#F3EEE4]" dir="ltr">
                                {order.phone}
                              </strong>
                              <a
                                href={`tel:${order.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded bg-white/[0.04] hover:bg-white/10 text-[#E8CC8A] border border-white/10"
                                title="اتصال"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/962${order.phone?.replace(/^0+/, '')}`}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-[#7FD1A0]/10 hover:bg-[#7FD1A0]/20 text-[#7FD1A0] border border-[#7FD1A0]/25"
                                title="واتساب"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>

                            <p className="text-[#B9B0A0] flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#D4B06A] shrink-0 mt-0.5" />
                              <span>{`${order.governorate} - ${order.address}`}</span>
                            </p>

                            <div className="pt-1">
                              <span className="text-[11px] text-[#A39A8B] block">طريقة الدفع:</span>
                              <span className="font-semibold text-[#7FD1A0] inline-flex items-center gap-1">
                                {order.paymentMethod === 'cod' ? (
                                  'الدفع عند الاستلام كاش'
                                ) : (
                                  <>
                                    <Smartphone className="w-3 h-3" />
                                    <span>تحويل كليك CliQ</span>
                                    {order.cliqRef && (
                                      <span className="text-[10px] bg-[#1C1815] px-1.5 py-0.5 rounded border border-[#7FD1A0]/25 font-mono">
                                        {`مرجع: ${order.cliqRef}`}
                                      </span>
                                    )}
                                  </>
                                )}
                              </span>
                            </div>

                            {order.notes && (
                              <p className="text-[11px] text-[#E8CC8A] bg-[#D4B06A]/10 p-2 rounded-lg border border-[#D4B06A]/20">
                                <strong>ملاحظات:</strong> {order.notes}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-7 bg-[#1C1815] p-3 rounded-xl border border-white/10 space-y-2">
                            <span className="text-[11px] font-bold text-[#D4B06A] block">
                              القطع المطلوبة:
                            </span>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {order.items?.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs bg-[#0B0A09] p-2 rounded-lg border border-white/10"
                                >
                                  <div className="flex items-center gap-3">
                                    <a 
                                      href={it.selectedColor?.image || it.product?.images?.[0] || 'https://via.placeholder.com/150'} 
                                      onClick={(e) => e.stopPropagation()}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        src={it.selectedColor?.image || it.product?.images?.[0] || 'https://via.placeholder.com/150'}
                                        alt=""
                                        className="w-14 h-14 rounded-lg object-contain bg-[#141210] border border-white/10 hover:scale-105 transition-transform"
                                      />
                                    </a>
                                    <div>
                                      <p className="font-bold text-[#F3EEE4] text-sm">{it.product?.name || 'قطعة'}</p>
                                      <span className="text-[11px] text-[#D4B06A] block mt-0.5">
                                        {`اللون: ${it.selectedColor?.name || 'افتراضي'} | الكمية: ${it.quantity || 1}`}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-[#E8CC8A]">
                                    {`${((it.selectedColor?.price || 0) * (it.quantity || 1)).toFixed(2)} د.أ`}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                              <span className="text-[#A39A8B]">
                                {`المجموع (توصيل ${order.deliveryFee === 0 ? 'مجاني' : (order.deliveryFee || 0) + ' د.أ'}):`}
                              </span>
                              <strong className="text-sm font-black text-[#F3EEE4] font-mono">
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

          {activeTab === 'add' && (
            <form onSubmit={handleCreateProduct} className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-[#141210] p-5 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-[#F3EEE4] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4B06A]" />
                  <span>معلومات القطعة الأساسية</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">اسم المنتج *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="مثال: حذاء نايك الرياضي"
                      className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">القسم *</label>
                    <select
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] cursor-pointer"
                    >
                      <option value="" disabled>-- اختر القسم --</option>
                      {categories.filter(c => c.isActive).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">السعر الحالي (د.أ) *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={newBasePrice}
                      onChange={(e) => setNewBasePrice(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">السعر القديم (اختياري)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newOriginalPrice}
                      onChange={(e) => setNewOriginalPrice(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">فترة الضمان</label>
                    <input
                      type="text"
                      value={newWarranty}
                      onChange={(e) => setNewWarranty(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={newIsBestSeller} onChange={(e) => setNewIsBestSeller(e.target.checked)} className="w-4 h-4 accent-[#D4B06A]" id="bestSeller" />
                  <label htmlFor="bestSeller" className="text-xs text-[#A39A8B] cursor-pointer">تمييز كـ "الأكثر مبيعاً"</label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">الشرح والمواصفات</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="شرح سلس عن مميزات المنتج..."
                    className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                  />
                </div>

                <div className="pt-2 border-t border-white/10">
                  <label className="block text-xs font-semibold text-[#F3EEE4] mb-1">رابط فيديو المنتج (اختياري)</label>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A] font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="bg-[#141210] p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#F3EEE4] uppercase tracking-wider">الخصائص الديناميكية</h3>
                    <p className="text-[10px] text-[#8A8173]">مثال: المقاس: 40, 41, 42</p>
                  </div>
                  <button type="button" onClick={addAttribute} className="bg-[#D4B06A] text-[#0B0A09] hover:bg-[#E8CC8A] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" /> إضافة خاصية
                  </button>
                </div>

                {newAttributes.map((attr, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-[#1C1815] p-3 rounded-xl border border-white/10">
                    <input type="text" placeholder="اسم الخاصية" value={attr.name} onChange={(e) => updateAttributeName(idx, e.target.value)} className="w-full sm:w-1/3 text-xs p-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" />
                    <input type="text" placeholder="القيم مفصولة بفاصلة" value={(attr.options || []).join(', ')} onChange={(e) => updateAttributeOptions(idx, e.target.value)} className="w-full text-xs p-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" />
                    <button type="button" onClick={() => removeAttribute(idx)} className="text-rose-400 p-2 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              <div className="bg-[#141210] p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#F3EEE4] uppercase tracking-wider">ألوان وصور القطعة</h3>
                  <button type="button" onClick={handleAddColor} className="py-1.5 px-3 bg-[#D4B06A] text-[#0B0A09] hover:bg-[#E8CC8A] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors">
                    <Plus className="w-3.5 h-3.5" /> إضافة لون
                  </button>
                </div>

                <div className="p-3 bg-[#D4B06A]/10 border border-[#D4B06A]/25 rounded-xl text-xs text-[#E8CC8A] flex items-start gap-2 mb-3">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong className="block text-[#E8CC8A] font-bold">تنبيه بخصوص حجم الصور:</strong>
                    <span>يتم ضغط الصور تلقائياً. إذا واجهت مشكلة، استخدم رابط URL مباشر.</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {newColors.map((color, idx) => (
                    <div key={idx} className="bg-[#1C1815] p-4 rounded-xl border border-white/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-[#A39A8B] mb-1">اسم اللون:</label>
                          <input type="text" value={color.name} onChange={(e) => handleColorUpdate(idx, 'name', e.target.value)} className="w-full text-xs py-1.5 px-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]" />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#A39A8B] mb-1">منتقي اللون:</label>
                          <div className="flex items-center gap-1.5">
                            <input type="color" value={color.hex} onChange={(e) => handleColorUpdate(idx, 'hex', e.target.value)} className="w-7 h-7 rounded-md border border-white/10 cursor-pointer p-0" />
                            <span className="text-[10px] font-mono text-[#A39A8B]">{color.hex}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#A39A8B] mb-1">سعر اللون (د.أ):</label>
                          <input type="text" inputMode="decimal" value={color.price} onChange={(e) => handleColorUpdate(idx, 'price', e.target.value)} className="w-full text-xs py-1.5 px-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] font-mono font-bold" />
                        </div>

                        <div className="sm:col-span-4 bg-[#0B0A09] p-2 rounded-lg border border-white/10">
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] font-bold text-[#F3EEE4]">الصورة الرئيسية:</label>
                            {color.image && (
                              <button type="button" onClick={() => handleColorUpdate(idx, 'image', '')} className="text-rose-400 text-[10px] font-bold hover:underline">حذف</button>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <input type="text" value={color.image.startsWith('data:image') ? '' : color.image} onChange={(e) => handleColorUpdate(idx, 'image', e.target.value)} placeholder={color.image.startsWith('data:image') ? 'تم رفع الصورة ✓' : 'ضع رابط الصورة...'} className="w-full text-xs py-1 px-2 bg-[#141210] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" dir="ltr" />
                            <label className="flex items-center justify-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer text-[10px] font-bold text-[#E8CC8A] hover:bg-white/10 transition-colors">
                              <Upload className="w-3 h-3" /> رفع من الجهاز
                              <input type="file" accept="image/*" onChange={(e) => handleColorImageUpload(idx, e)} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div className="sm:col-span-1 text-center">
                          {newColors.length > 1 && (<button type="button" onClick={() => handleRemoveColor(idx)} className="text-[#8A8173] hover:text-rose-400 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <div className="flex flex-col gap-2 mb-2">
                          <span className="text-[11px] text-[#A39A8B]">
                            {`📷 زوايا إضافية لهذا اللون (${color.additionalImages?.length || 0}):`}
                          </span>
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                             <input type="text" placeholder="رابط الصورة الإضافية..." value={tempNewColorUrls[idx] || ''} onChange={(e) => setTempNewColorUrls(prev => ({...prev, [idx]: e.target.value}))} className="w-full text-xs py-1.5 px-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" dir="ltr" />
                             <div className="flex gap-2">
                               <button type="button" onClick={() => handleAddAdditionalImageUrlToNewColor(idx)} className="bg-[#D4B06A] text-[#0B0A09] hover:bg-[#E8CC8A] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">إضافة الرابط</button>
                               <label className="flex items-center justify-center gap-1 text-xs font-bold text-[#E8CC8A] bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 whitespace-nowrap transition-colors">
                                 <Upload className="w-3.5 h-3.5" /> رفع صورة
                                 <input type="file" accept="image/*" onChange={(e) => handleAddAdditionalImageToNewColor(idx, e)} className="hidden" />
                               </label>
                             </div>
                          </div>
                        </div>
                        {color.additionalImages && color.additionalImages.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {color.additionalImages.map((addImg, aIdx) => (
                              <div key={aIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 group">
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveTab('list')} className="py-2.5 px-5 text-xs font-semibold text-[#A39A8B] hover:text-[#F3EEE4] cursor-pointer transition-colors">إلغاء</button>
                <button type="submit" className="py-3 px-8 text-xs font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] hover:from-[#E8CC8A] hover:to-[#E8CC8A] rounded-xl shadow-gold transition-all cursor-pointer">نشر القطعة في المتجر</button>
              </div>
            </form>
          )}

          {activeTab === 'categories' && (
            <CategoryManager />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto py-4 space-y-6">
              <div className="bg-[#141210] p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F3EEE4]">
                  <Lock className="w-5 h-5 text-[#D4B06A]" />
                  <span>تغيير كلمة مرور لوحة التحكم</span>
                </div>
                <p className="text-xs text-[#A39A8B]">
                  كلمة المرور الحالية هي التي تستخدمها للدخول عند الضغط على شعار دكان 962.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#F3EEE4] mb-1">كلمة المرور الحالية:</label>
                    <input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="أدخل كلمتك الحالية" className="w-full text-xs py-2.5 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A] font-mono" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#F3EEE4] mb-1">كلمة المرور الجديدة:</label>
                    <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="أدخل كلمة المرور الجديدة" className="w-full text-xs py-2.5 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A] font-mono" />
                  </div>

                  {passMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold ${passMsg.error ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-[#7FD1A0]/10 text-[#7FD1A0] border border-[#7FD1A0]/30'}`}>
                      {passMsg.text}
                    </div>
                  )}

                  <button type="submit" className="w-full py-2.5 px-4 text-xs font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] hover:from-[#E8CC8A] hover:to-[#E8CC8A] rounded-xl transition-all cursor-pointer shadow-gold">تحديث وحفظ كلمة المرور</button>
                </form>
              </div>
            </div>
          )}
        </div>

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

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, categories, onClose, onSave }) => {
  const [name, setName] = useState(product.name || '');
  const [basePrice, setBasePrice] = useState<number | string>(product.basePrice || '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(product.originalPrice || '');
  const [categoryId, setCategoryId] = useState(product.categoryId || '');
  const [warranty, setWarranty] = useState(product.warranty || '');
  const [description, setDescription] = useState(product.description || '');
  const [isBestSeller, setIsBestSeller] = useState(product.isBestSeller || false);
  const [videoUrl, setVideoUrl] = useState(product.videoUrl || ''); 
  const [colors, setColors] = useState<ProductColor[]>(product.colors || []);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(product.attributes || []);
  const [tempColorUrls, setTempColorUrls] = useState<Record<number, string>>({});

  const handleColorUpdate = (idx: number, field: keyof ProductColor, val: any) => {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  };

  const handleColorImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        handleColorUpdate(idx, 'image', compressedBase64);
      });
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
      compressImage(file, (compressedBase64) => {
        setColors((prev) => prev.map((c, i) => {
            if (i === colorIdx) return { ...c, additionalImages: [...(c.additionalImages || []), compressedBase64] };
            return c;
        }));
      });
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
        price: Number(basePrice) || 0,
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
    const options = (optionsString || '').split(',').map(o => o.trim()).filter(Boolean);
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

    const finalImages = allImages.length > 0 ? allImages : [PLACEHOLDER_IMAGE];
    
    const safeColors = colors.map(c => ({ 
      ...c, 
      image: c.image || PLACEHOLDER_IMAGE,
      price: Number(c.price) || 0 
    }));

    const updated: Product = {
      ...product,
      name,
      basePrice: Number(basePrice) || 0,
      originalPrice: originalPrice === '' ? undefined : Number(originalPrice),
      categoryId,
      warranty,
      description,
      colors: safeColors,
      attributes,
      isBestSeller,
      images: finalImages,
      videoUrl: videoUrl.trim() !== '' ? videoUrl.trim() : undefined,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0B0A09] rounded-3xl shadow-[0_0_80px_-20px_rgba(212,176,106,0.3)] border border-white/10 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1C1815]">
          <div>
            <h3 className="text-base font-bold text-[#F3EEE4] font-serif">
              {`تعديل القطعة: ${product.name}`}
            </h3>
            <p className="text-xs text-[#A39A8B]">
              تعديل الصور، أسعار الألوان، والمواصفات
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#A39A8B] hover:text-[#F3EEE4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">اسم القطعة:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">القسم:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] cursor-pointer"
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">السعر الحالي (د.أ):</label>
              <input
                type="text"
                inputMode="decimal"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">السعر القديم (اختياري):</label>
              <input
                type="text"
                inputMode="decimal"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F3EEE4] mb-1">فترة الضمان:</label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="w-4 h-4 accent-[#D4B06A]" id="editBest" />
              <label htmlFor="editBest" className="text-xs font-bold cursor-pointer text-[#F3EEE4]">تمييز كـ "الأكثر مبيعاً"</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F3EEE4] mb-1">الشرح والمواصفات:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="block text-xs font-bold text-[#F3EEE4] mb-1">رابط فيديو المنتج:</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-xl text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A] font-mono"
              dir="ltr"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
             <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#F3EEE4]">الخصائص الديناميكية:</h4>
              <button type="button" onClick={addAttribute} className="text-xs py-1.5 px-3 bg-[#D4B06A] text-[#0B0A09] hover:bg-[#E8CC8A] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /> إضافة خاصية</button>
            </div>
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-[#1C1815] p-3 rounded-xl border border-white/10 mb-2">
                <input type="text" placeholder="اسم الخاصية" value={attr.name} onChange={(e) => updateAttributeName(idx, e.target.value)} className="w-full sm:w-1/3 text-xs p-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" />
                <input type="text" placeholder="القيم مفصولة بفاصلة" value={(attr.options || []).join(', ')} onChange={(e) => updateAttributeOptions(idx, e.target.value)} className="w-full text-xs p-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" />
                <button type="button" onClick={() => removeAttribute(idx)} className="text-rose-400 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#F3EEE4]">
                  ألوان القطعة والصور:
                </h4>
                <p className="text-[11px] text-[#A39A8B]">
                  يمكنك تحديد سعر مختلف لكل لون ورفع صور متعددة
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                className="text-xs py-1.5 px-3 bg-[#D4B06A] text-[#0B0A09] hover:bg-[#E8CC8A] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة لون</span>
              </button>
            </div>

            <div className="space-y-4">
              {colors.map((color, idx) => (
                <div key={idx} className="p-4 bg-[#1C1815] border border-white/10 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#A39A8B] mb-1">اسم اللون:</label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorUpdate(idx, 'name', e.target.value)}
                        className="w-full text-xs py-1.5 px-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#A39A8B] mb-1">رمز اللون:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => handleColorUpdate(idx, 'hex', e.target.value)}
                          className="w-8 h-8 rounded-lg border border-white/10 p-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-[#A39A8B]">{color.hex}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#A39A8B] mb-1">سعر اللون (د.أ):</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={color.price}
                        onChange={(e) => handleColorUpdate(idx, 'price', e.target.value)}
                        className="w-full text-xs py-1.5 px-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A] font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-4 bg-[#0B0A09] p-2 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-[#F3EEE4]">الصورة الرئيسية:</label>
                        {color.image && (
                          <button type="button" onClick={() => handleColorUpdate(idx, 'image', '')} className="text-rose-400 text-[10px] font-bold hover:underline">حذف</button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          value={color.image.startsWith('data:image') ? '' : color.image} 
                          onChange={(e) => handleColorUpdate(idx, 'image', e.target.value)} 
                          placeholder={color.image.startsWith('data:image') ? 'تم الرفع ✓' : 'رابط الصورة...'} 
                          className="w-full text-xs py-1 px-2 bg-[#141210] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" 
                          dir="ltr" 
                        />
                        <label className="flex items-center justify-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer text-[10px] font-bold text-[#E8CC8A] hover:bg-white/10 transition-colors">
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
                          className="text-[#8A8173] hover:text-rose-400 p-1 cursor-pointer"
                          title="حذف اللون"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="flex flex-col gap-2 mb-2">
                      <span className="text-[11px] text-[#A39A8B]">
                        {`📷 زوايا إضافية (${color.additionalImages?.length || 0}):`}
                      </span>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                         <input 
                           type="text" 
                           placeholder="رابط الصورة الإضافية..." 
                           value={tempColorUrls[idx] || ''} 
                           onChange={(e) => setTempColorUrls(prev => ({...prev, [idx]: e.target.value}))} 
                           className="w-full text-xs py-1.5 px-2 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]" 
                           dir="ltr" 
                         />
                         <div className="flex gap-2">
                           <button 
                             type="button" 
                             onClick={() => handleAddAdditionalImageUrl(idx)} 
                             className="bg-[#D4B06A] text-[#0B0A09] hover:bg-[#E8CC8A] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
                           >
                             إضافة الرابط
                           </button>
                           
                           <label className="flex items-center justify-center gap-1 text-xs font-bold text-[#E8CC8A] bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 whitespace-nowrap transition-colors">
                             <Upload className="w-3.5 h-3.5" /> رفع صورة
                             <input type="file" accept="image/*" onChange={(e) => handleAddAdditionalImage(idx, e)} className="hidden" />
                           </label>
                         </div>
                      </div>
                    </div>

                    {color.additionalImages && color.additionalImages.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {color.additionalImages.map((addImg, aIdx) => (
                          <div key={aIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 group">
                            <img src={addImg} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalImage(idx, aIdx)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="حذف"
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 text-xs font-semibold text-[#A39A8B] hover:text-[#F3EEE4] cursor-pointer transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="py-2.5 px-8 text-xs font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] hover:from-[#E8CC8A] hover:to-[#E8CC8A] rounded-xl shadow-gold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
