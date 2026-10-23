import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Category } from '../types/furniture';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');
  
  // فورم إضافة قسم جديد
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  
  // 💡 حقول البانر الجديدة
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newButtonText, setNewButtonText] = useState('');
  const [newBadge, setNewBadge] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // جلب الأقسام من Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      // ترتيب الأقسام حسب حقل الترتيب (order)
      setCategories(cats.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // إضافة قسم جديد
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newImage) return alert('يرجى تعبئة اسم القسم ورابط صورة الكارت على الأقل');

    setIsAdding(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newName,
        image: newImage,
        // 💡 حفظ بيانات البانر (لو مفيش بانر بياخد صورة الكارت، ولو مفيش عنوان بياخد اسم القسم)
        bannerImage: newBannerImage || newImage,
        title: newTitle || newName,
        description: newDesc || '',
        buttonText: newButtonText || 'استكشف الآن',
        badgeText: newBadge || '✨ جودة ممتازة',
        isActive: true, // يبدأ مفعل تلقائياً
        order: categories.length + 1,
      });
      
      // تصفير الحقول
      setNewName(''); setNewImage(''); setNewBannerImage(''); 
      setNewTitle(''); setNewDesc(''); setNewButtonText(''); setNewBadge('');
      
      showNotification('تمت إضافة القسم بنجاح! سيظهر فوراً في المتجر.');
    } catch (error) {
      alert('حدث خطأ أثناء إضافة القسم');
    } finally {
      setIsAdding(false);
    }
  };

  // تفعيل / إخفاء القسم (بدل الحذف عشان زينة رمضان)
  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'categories', id), { isActive: !currentStatus });
      showNotification(!currentStatus ? 'تم إظهار القسم في المتجر' : 'تم إخفاء القسم من المتجر');
    } catch (error) {
      alert('حدث خطأ أثناء تعديل حالة القسم');
    }
  };

  // حذف قسم نهائياً
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم نهائياً؟ (المنتجات بداخله لن تُحذف ولكنها ستبقى مخفية)')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        showNotification('تم حذف القسم.');
      } catch (error) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="bg-[#EDF4EE] text-[#2E5339] p-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-[#C5DEC8]">
          <Check className="w-4 h-4" /> {successToast}
        </div>
      )}

      {/* فورم إضافة قسم */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E9E1D4]">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#8C6D46]" /> إضافة قسم جديد (وصفحة بانر خاصة به)
        </h3>
        
        <form onSubmit={handleAddCategory} className="space-y-4">
          {/* الصف الأول: الاسم والصورة الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">اسم القسم *</label>
              <input
                type="text"
                placeholder="مثال: أحذية"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">رابط صورة القسم (للكارت) *</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-white"
                dir="ltr"
                required
              />
            </div>
          </div>

          {/* الصف الثاني: بيانات البانر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#E9E1D4]">
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-[#8C6D46] mb-3 border-b pb-2">بيانات البانر الرئيسي (يظهر في أعلى الصفحة)</h4>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">رابط صورة البانر الكبيرة (اختياري)</label>
              <input
                type="text"
                placeholder="اتركه فارغاً لاستخدام صورة الكارت"
                value={newBannerImage}
                onChange={(e) => setNewBannerImage(e.target.value)}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-[#FAF8F5]"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">عنوان البانر</label>
              <input
                type="text"
                placeholder="مثال: أحدث صيحات الأحذية"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-[#FAF8F5]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">وصف البانر</label>
              <textarea
                placeholder="خامات عالية الجودة وتصاميم عصرية تناسب كل الأذواق..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">نص زر البانر</label>
              <input
                type="text"
                placeholder="مثال: استكشف الأحذية الآن"
                value={newButtonText}
                onChange={(e) => setNewButtonText(e.target.value)}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] mb-1">نص الشارة (Badge)</label>
              <input
                type="text"
                placeholder="مثال: ✨ خامات أصلية"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full text-sm py-2 px-3 border rounded-lg bg-[#FAF8F5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full bg-[#1C1917] text-white px-5 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#332E2B] disabled:opacity-50"
          >
            {isAdding ? 'جاري الإضافة...' : 'حفظ وإضافة القسم'}
          </button>
        </form>
      </div>

      {/* جدول عرض الأقسام */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#FAF7F2] text-[#78716C] border-b border-[#E5DDD0]">
            <tr>
              <th className="p-4">صورة القسم</th>
              <th className="p-4">اسم القسم / البانر</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">جاري تحميل الأقسام من السحابة...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">لا توجد أقسام مضافة حتى الآن. أضف قسمك الأول من الأعلى.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-4">
                    <img src={cat.image} alt={cat.name} className="w-20 h-14 object-cover rounded-lg border" />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#1C1917] mb-1">{cat.name}</p>
                    {cat.title && <p className="text-[11px] text-[#8C6D46]">عنوان البانر: {cat.title}</p>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {cat.isActive ? 'ظاهر في المتجر' : 'مخفي'}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => toggleCategoryStatus(cat.id, cat.isActive)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 inline-flex ${cat.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                    >
                      {cat.isActive ? <><EyeOff className="w-3 h-3" /> إخفاء</> : <><Eye className="w-3 h-3" /> إظهار</>}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg inline-flex"
                      title="حذف القسم نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
