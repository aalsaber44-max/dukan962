import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { Review } from '../types/furniture';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revs: Review[] = [];
      snapshot.forEach((doc) => {
        revs.push({ id: doc.id, ...doc.data() } as Review);
      });
      // ترتيب التقييمات من الأحدث للأقدم
      revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(revs);
    });
    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        name: name.trim(),
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });
      setName('');
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding review:', error);
      alert('حدث خطأ أثناء إضافة التقييم. يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="border-t border-[var(--sf-border)] bg-[var(--sf-bg-alt)] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold font-serif text-[var(--sf-text)] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--sf-accent)]" />
            تقييمات وآراء العملاء
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Number(averageRating) ? 'text-[var(--sf-accent)] fill-[#D4B06A]' : 'text-white/20'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[var(--sf-text)] font-mono">{averageRating} / 5</span>
            <span className="text-xs text-[var(--sf-muted)]">({reviews.length} تقييم)</span>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="py-2.5 px-5 text-xs font-bold text-[var(--sf-accent-contrast)] bg-[var(--sf-accent)] hover:bg-[var(--sf-accent-strong)] rounded-xl transition-all shadow-gold active:scale-95"
          >
            أضف تقييمك
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-[var(--sf-panel)] p-5 rounded-2xl border border-[var(--sf-border)] animate-fade">
          <h4 className="text-sm font-bold text-[var(--sf-text)] mb-4">شاركنا رأيك بالمنتج</h4>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[var(--sf-muted)] mb-2">تقييمك:</label>
            <div className="flex items-center gap-1" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating) ? 'text-[var(--sf-accent)] fill-[#D4B06A]' : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--sf-muted)] mb-2">اسمك:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد محمد"
                className="w-full text-sm py-2.5 px-4 bg-[var(--sf-surface)] border border-[var(--sf-border)] rounded-xl focus:border-[var(--sf-accent)] text-[var(--sf-text)] outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[var(--sf-muted)] mb-2">رأيك بالمنتج:</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ما الذي أعجبك في المنتج؟"
              className="w-full text-sm py-3 px-4 bg-[var(--sf-surface)] border border-[var(--sf-border)] rounded-xl focus:border-[var(--sf-accent)] text-[var(--sf-text)] outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 text-xs font-bold text-[var(--sf-accent-contrast)] bg-[var(--sf-accent)] hover:bg-[var(--sf-accent-strong)] rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'جارٍ الإرسال...' : <><Send className="w-4 h-4" /> إرسال التقييم</>}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2.5 px-6 text-xs font-bold text-[var(--sf-muted)] hover:text-[var(--sf-text)] bg-white/5 hover:bg-[var(--sf-soft-strong)] rounded-xl transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-[var(--sf-surface)] rounded-2xl border border-[var(--sf-border)]">
            <p className="text-sm text-[var(--sf-muted)]">لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيّمه!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-[var(--sf-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--sf-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--sf-accent-soft)] text-[var(--sf-accent)] flex items-center justify-center font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--sf-text)]">{review.name}</p>
                    <div className="flex items-center gap-1 mt-0.5" dir="ltr">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= review.rating ? 'text-[var(--sf-accent)] fill-[#D4B06A]' : 'text-white/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--sf-muted)] font-mono">
                  {new Date(review.createdAt).toLocaleDateString('ar-JO')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--sf-muted)] leading-relaxed mt-3">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
