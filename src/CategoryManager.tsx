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
    if (!newName || !newImage) return alert('يرجى تعبئة اسم القسم ورابط الصورة');

    setIsAdding(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newName,
        image: newImage,
        isActive: true, // يبدأ مفعل تلقائياً
        order: categories.length + 1,
      });
      setNewName('');
      setNewImage('');
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
          <Plus className="w-5 h-5 text-[#8C6D46]" /> إضافة قسم جديد
        </h3>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="اسم القسم (مثال: أحذية)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full sm:w-1/3 text-sm py-2 px-3 border rounded-lg bg-white"
            required
          />
          <input
            type="text"
            placeholder="رابط صورة القسم (URL)"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            className="w-full sm:w-1/2 text-sm py-2 px-3 border rounded-lg bg-white"
            dir="ltr"
            required
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-[#1C1917] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#332E2B] disabled:opacity-50"
          >
            {isAdding ? 'جاري الإضافة...' : 'إضافة القسم'}
          </button>
        </form>
      </div>

      {/* جدول عرض الأقسام */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#FAF7F2] text-[#78716C] border-b border-[#E5DDD0]">
            <tr>
              <th className="p-4">صورة القسم</th>
              <th className="p-4">اسم القسم</th>
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
                  <td className="p-4 font-bold text-[#1C1917]">{cat.name}</td>
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
