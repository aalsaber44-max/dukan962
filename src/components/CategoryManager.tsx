import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff, Save, X, Video } from 'lucide-react';
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
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 🎬 محرر فيديو لكل قسم (inline)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoUrlDraft, setVideoUrlDraft] = useState('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);

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

    const videoUrl = newVideoUrl.trim();
    if (videoUrl && !/^https?:\/\/.+/i.test(videoUrl)) {
      return alert('رابط الفيديو يجب أن يبدأ بـ http:// أو https://');
    }

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
        videoUrl: videoUrl || null,
        isActive: true,
        order: categories.length + 1,
      });

      setNewName(''); setNewImage(''); setNewBannerImage('');
      setNewTitle(''); setNewDesc(''); setNewButtonText(''); setNewBadge(''); setNewVideoUrl('');

      showNotification('تمت إضافة القسم بنجاح!');
    } catch (error) {
      alert('حدث خطأ أثناء إضافة القسم');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'categories', id), { isActive: !currentStatus });
      showNotification(!currentStatus ? 'تم إظهار القسم' : 'تم إخفاء القسم');
    } catch (error) {
      alert('حدث خطأ أثناء تعديل حالة القسم');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم نهائياً؟')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        showNotification('تم حذف القسم.');
      } catch (error) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const openVideoEditor = (cat: Category) => {
    setEditingVideoId(cat.id);
    setVideoUrlDraft(cat.videoUrl || '');
    setVideoError(null);
  };

  const closeVideoEditor = () => {
    setEditingVideoId(null);
    setVideoUrlDraft('');
    setVideoError(null);
  };

  // ✅ الدالة تستقبل الرابط كمعامل مباشر (لحل مشكلة الحذف)
  const saveVideoUrl = async (cat: Category, rawUrl: string) => {
    const url = rawUrl.trim();

    if (url && !/^https?:\/\/.+/i.test(url)) {
      setVideoError('الرابط يجب أن يبدأ بـ http:// أو https://');
      return;
    }

    setSavingVideo(true);
    setVideoError(null);
    try {
      await updateDoc(doc(db, 'categories', cat.id), {
        videoUrl: url || null,
      });
      showNotification(url ? 'تم حفظ رابط الفيديو.' : 'تم حذف الفيديو من القسم.');
      closeVideoEditor();
    } catch (error) {
      setVideoError('فشل حفظ الرابط. حاول مرة أخرى.');
    } finally {
      setSavingVideo(false);
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
          <Plus className="w-5 h-5 text-[#D4B06A]" /> إضافة قسم جديد
        </h3>

        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">اسم القسم *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">رابط صورة القسم *</label>
              <input
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1C1815] p-4 rounded-xl border border-white/10">
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-[#D4B06A] mb-3 border-b border-white/10 pb-2">
                بيانات البانر (اختياري)
              </h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">رابط صورة البانر</label>
              <input
                type="text"
                value={newBannerImage}
                onChange={(e) => setNewBannerImage(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">عنوان البانر</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">وصف البانر</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">نص زر البانر</label>
              <input
                type="text"
                value={newButtonText}
                onChange={(e) => setNewButtonText(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1">نص الشارة</label>
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] focus:outline-none focus:border-[#D4B06A]"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-white/10">
              <label className="block text-[11px] font-bold text-[#F3EEE4] mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#D4B06A]" />
                رابط فيديو البانر (اختياري)
              </label>
              <input
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/.../video/upload/.../file.mp4"
                className="w-full text-sm py-2 px-3 bg-[#0B0A09] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                dir="ltr"
              />
              <p className="text-[10px] text-[#8A8173] mt-1">
                ⚠️ يجب أن يكون رابط فيديو مباشر (يحتوي <code className="text-[#E8CC8A]">/video/upload/</code> في Cloudinary)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] px-5 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-gold disabled:opacity-50 cursor-pointer"
          >
            {isAdding ? 'جاري الإضافة...' : 'حفظ وإضافة القسم'}
          </button>
        </form>
      </div>

      {/* جدول الأقسام */}
      <div className="bg-[#141210] border border-white/10 rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#1C1815] text-[#A39A8B] border-b border-white/10">
            <tr>
              <th className="p-4">صورة القسم</th>
              <th className="p-4">اسم القسم</th>
              <th className="p-4">الفيديو</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-[#A39A8B]">جاري التحميل...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-[#8A8173]">لا توجد أقسام.</td></tr>
            ) : (
              categories.map((cat) => (
                <React.Fragment key={cat.id}>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <img src={cat.image} alt={cat.name} className="w-20 h-14 object-cover rounded-lg border border-white/10 bg-[#1C1815]" />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#F3EEE4] mb-1">{cat.name}</p>
                      {cat.title && <p className="text-[11px] text-[#D4B06A]">{cat.title}</p>}
                    </td>
                    <td className="p-4">
                      {cat.videoUrl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7FD1A0] bg-[#7FD1A0]/10 px-2 py-1 rounded-md ring-1 ring-[#7FD1A0]/25">
                          <Video className="w-3 h-3" /> مضاف
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8A8173]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ring-1 ${cat.isActive ? 'bg-[#7FD1A0]/10 text-[#7FD1A0] ring-[#7FD1A0]/30' : 'bg-rose-500/10 text-rose-400 ring-rose-500/30'}`}>
                        {cat.isActive ? 'ظاهر' : 'مخفي'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => editingVideoId === cat.id ? closeVideoEditor() : openVideoEditor(cat)}
                          className="text-xs px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 bg-white/[0.04] text-[#E8CC8A] hover:bg-[#D4B06A]/15 ring-1 ring-[#D4B06A]/30 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          {editingVideoId === cat.id ? 'إغلاق' : 'فيديو'}
                        </button>
                        <button
                          onClick={() => toggleCategoryStatus(cat.id, cat.isActive)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer ${cat.isActive ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'}`}
                        >
                          {cat.isActive ? <><EyeOff className="w-3 h-3" /> إخفاء</> : <><Eye className="w-3 h-3" /> إظهار</>}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg inline-flex cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {editingVideoId === cat.id && (
                    <tr>
                      <td colSpan={5} className="p-4 bg-[#0B0A09] border-t border-white/10">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[#F3EEE4] flex items-center gap-2">
                              <Video className="w-4 h-4 text-[#D4B06A]" />
                              فيديو قسم "{cat.name}"
                            </h5>
                            <button onClick={closeVideoEditor} className="text-[#8A8173] hover:text-[#F3EEE4] p-1 cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {cat.videoUrl && (
                            <div className="rounded-xl overflow-hidden ring-1 ring-white/10 bg-black aspect-video">
                              <video src={cat.videoUrl} controls preload="metadata" className="w-full h-full object-contain" />
                            </div>
                          )}

                          {videoError && (
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-[11px] text-rose-300">
                              {videoError}
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-bold text-[#F3EEE4] mb-1">رابط الفيديو (URL مباشر)</label>
                            <input
                              type="text"
                              value={videoUrlDraft}
                              onChange={(e) => setVideoUrlDraft(e.target.value)}
                              dir="ltr"
                              placeholder="https://res.cloudinary.com/.../video/upload/.../file.mp4"
                              className="w-full text-xs py-2 px-3 bg-[#1C1815] border border-white/10 rounded-lg text-[#F3EEE4] placeholder-[#8A8173] focus:outline-none focus:border-[#D4B06A]"
                            />
                          </div>

                          <div className="flex gap-2">
                            {/* ✅ إصلاح: تمرير الرابط الحالي مباشرة */}
                            <button
                              onClick={() => saveVideoUrl(cat, videoUrlDraft)}
                              disabled={savingVideo}
                              className="flex-1 py-2 px-3 text-xs font-bold text-[#0B0A09] bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {savingVideo ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                            {cat.videoUrl && (
                              /* ✅ إصلاح: تمرير '' مباشرة بدل الاعتماد على setState */
                              <button
                                onClick={() => saveVideoUrl(cat, '')}
                                disabled={savingVideo}
                                className="py-2 px-3 text-xs font-bold text-rose-400 bg-rose-500/10 ring-1 ring-rose-500/30 rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> حذف
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
