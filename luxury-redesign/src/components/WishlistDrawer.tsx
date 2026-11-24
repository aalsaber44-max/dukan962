import React from 'react';
import { stripEmoji } from '../utils/emoji';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types/furniture';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade"onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[var(--sf-bg-alt)] shadow-lift flex flex-col justify-between border-r border-[var(--sf-border)] animate-drawer">
          
          {/* Header */}
          <div className="p-6 border-b border-[var(--sf-border)] flex items-center justify-between bg-[var(--sf-panel)]">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-600"/>
              <h2 className="text-base font-bold text-[var(--sf-text)]">قائمة المفضلة</h2>
              <span className="text-xs text-[var(--sf-muted)] font-mono tabular-nums">
                ({wishlist.length} قطع)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--sf-muted)] hover:text-[var(--sf-text)] hover:bg-[var(--sf-panel-2)] transition-colors cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[var(--sf-border)]">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--sf-muted)]">
                <div className="w-16 h-16 rounded-2xl bg-[var(--sf-panel)] flex items-center justify-center mb-4 text-rose-500">
                  <Heart className="w-8 h-8 opacity-60"/>
                </div>
                <h3 className="text-sm font-bold text-[var(--sf-text)] mb-1">
                  قائمة المفضلة فارغة حالياً
                </h3>
                <p className="text-xs text-[var(--sf-muted)] mb-6 max-w-xs">
                  اضغط على رمز القلب في أي قطعة لحفظها والرجوع إليها لاحقاً.
                </p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 text-xs font-bold text-[var(--sf-accent-contrast)] bg-[var(--sf-accent)] hover:bg-[var(--sf-accent-strong)] rounded-xl transition-all cursor-pointer">
                  {/*تم تعديل النص هنا */}
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              wishlist.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <img
                    src={item.colors[0]?.image || item.images[0]}
                    alt={stripEmoji(item.name)}
                    referrerPolicy="no-referrer" className="w-20 h-20 rounded-xl object-cover border border-[var(--sf-border)] bg-[var(--sf-panel)] shrink-0"/>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[var(--sf-text)] leading-snug line-clamp-1 mb-1">
                      {stripEmoji(item.name)}
                    </h4>
                    <p className="text-xs font-black text-[var(--sf-text)] font-mono mb-2">
                      {item.basePrice.toFixed(2)} دينار أردني
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onAddToCart(item);
                          onRemoveFromWishlist(item);
                        }}
                        className="py-1 px-3 text-[11px] font-bold text-[var(--sf-accent-contrast)] bg-[var(--sf-accent)] hover:bg-[var(--sf-accent-strong)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                        <ShoppingBag className="w-3 h-3"/>
                        <span>نقل إلى السلة</span>
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(item)}
                        className="text-[var(--sf-muted)] hover:text-rose-400 transition-colors p-1 cursor-pointer" title="حذف من المفضلة">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-4 border-t border-[var(--sf-border)] bg-[var(--sf-panel)]">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-bold text-[var(--sf-text)] bg-[var(--sf-panel)] hover:bg-[var(--sf-panel-2)] rounded-xl transition-colors cursor-pointer">
                متابعة تصفح المتجر
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
