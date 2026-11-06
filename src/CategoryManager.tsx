import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Category } from '../types/furniture';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ ...doc.data(), id: doc.id } as Category);
      });
      setCategories(cats.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newImage) return alert('يرجى تعبئة اسم القسم ورابط صورة الكارت على الأقل');

    setIsAdding(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newName,
        image: newImage,
        bannerImage: newBannerImage || newImage,
        mobileBannerImage: newBannerImage || newImage,
        title: newTitle || newName,
        description: newDesc || '',
        buttonText: newButtonText || 'استكشف الآن',
        badgeText: newBadge || '✨ جودة ممتازة',
        isActive: true,
        order: categories.length + 1,
      });
      
      setNewName(''); setNewImage(''); setNewBannerImage(''); 
      setNewTitle(''); setNewDesc(''); setNewButtonText(''); setNewBadge('');
      
      showNotification('تمت إضافة القسم بنجاح! سيظهر فوراً في المتجر.');
    } catch (error) {
      alert('حدث خطأ أثناء إضافة القسم');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'categories', id), { isActive: !currentStatus });
      showNotification(!currentStatus ? 'تم إظهار القسم في المتجر' : 'تم إخفاء القسم من المتجر');
    } catch (error) {
      alert('حدث خطأ أثناء تعديل حالة القسم');
    }
  };

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
        <div className="bg-[#7FD1A0]/10 text-[#7FD1A0] p-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-[#7FD1A0]/25">
          <Check className="w-4 h-4" /> {successToast}
        </div>
      )}

      {/* فورم إضافة قسم */}
      <div className="bg-[#141210] p-5 rounded-2xl border border-white/10">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#F3EEE4]">
          <Plus className="w-5 h-5 text-[#D4B06A]" /> إضافة قسم جديد (وصفحة بانر خاصة به)
        </h3>
        
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">اسم القسم *</label>
              <input
                type="text"
                placeholder="مثال: أحذية"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">رابط صورة القسم (للكارت) *</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1C1815] p-4 rounded-xl border border-white/10">
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-[#D4B06A] mb-3 border-b border-white/10 pb-2">بيانات البانر الرئيسي (يظهر في أعلى الصفحة)</h4>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">رابط صورة البانر الكبيرة (اختياري)</label>
              <input
                type="text"
                placeholder="اتركه فارغاً لاستخدام صورة الكارت"
                value={newBannerImage}
                onChange={(e) => setNewBannerImage(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">عنوان البانر</label>
              <input
                type="text"
                placeholder="مثال: أحدث صيحات الأحذية"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">وصف البانر</label>
              <textarea
                placeholder="خامات عالية الجودة وتصاميم عصرية تناسب كل الأذواق..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">نص زر البانر</label>
              <input
                type="text"
                placeholder="مثال: استكشف الأحذية الآن"
                value={newButtonText}
                onChange={(e) => setNewButtonText(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">نص الشارة (Badge)</label>
              <input
                type="text"
                placeholder="مثال: ✨ خامات أصلية"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] px-5 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:from-[#E8CC8A] hover:to-[#E8CC8A] shadow-gold disabled:opacity-50 cursor-pointer transition-all"
          >
            {isAdding ? 'جاري الإضافة...' : 'حفظ وإضافة القسم'}
          </button>
        </form>
      </div>

      {/* جدول عرض الأقسام */}
      <div className="bg-[#141210] border border-white/10 rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#1C1815] text-[#A39A8B] border-b border-white/10">
            <tr>
              <th className="p-4">صورة القسم</th>
              <th className="p-4">اسم القسم / البانر</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-[#A39A8B]">جاري تحميل الأقسام من السحابة...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-[#8A8173]">لا توجد أقسام مضافة حتى الآن. أضف قسمك الأول من الأعلى.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <img src={cat.image} alt={cat.name} className="w-20 h-14 object-cover rounded-lg border border-white/10 bg-[#1C1815]" />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#F3EEE4] mb-1">{cat.name}</p>
                    {cat.title && <p className="text-[11px] text-[#D4B06A]">عنوان البانر: {cat.title}</p>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ring-1 ${cat.isActive ? 'bg-[#7FD1A0]/10 text-[#7FD1A0] ring-[#7FD1A0]/30' : 'bg-rose-500/10 text-rose-400 ring-rose-500/30'}`}>
                      {cat.isActive ? 'ظاهر في المتجر' : 'مخفي'}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => toggleCategoryStatus(cat.id, cat.isActive)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 inline-flex transition-colors cursor-pointer ${
                        cat.isActive 
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 ring-1 ring-amber-500/30' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 ring-1 ring-emerald-500/30'
                      }`}
                    >
                      {cat.isActive ? <><EyeOff className="w-3 h-3" /> إخفاء</> : <><Eye className="w-3 h-3" /> إظهار</>}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg inline-flex cursor-pointer transition-colors"
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
