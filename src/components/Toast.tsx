import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, Heart, HeartOff, CircleCheck, X } from 'lucide-react';

export type ToastVariant = 'cart' | 'wishlist' | 'remove' | 'success';

export interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

const variants: Record<ToastVariant, { title: string; Icon: React.ElementType; tile: string }> = {
  cart: {
    title: 'أُضيف إلى السلة',
    Icon: ShoppingBag,
    tile: 'from-emerald-400/30 to-emerald-600/30 text-emerald-200 ring-emerald-300/30',
  },
  wishlist: {
    title: 'أُضيف إلى المفضلة',
    Icon: Heart,
    tile: 'from-rose-400/30 to-rose-600/30 text-rose-200 ring-rose-300/30',
  },
  remove: {
    title: 'أُزيل من المفضلة',
    Icon: HeartOff,
    tile: 'from-white/15 to-white/5 text-white/80 ring-white/20',
  },
  success: {
    title: 'تم بنجاح',
    Icon: CircleCheck,
    tile: 'from-emerald-400/30 to-emerald-600/30 text-emerald-200 ring-emerald-300/30',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => (
  <div
    aria-live="polite"
    className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8"
  >
    <AnimatePresence mode="wait">
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          initial={{ opacity: 0, y: 28, scale: 0.94, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 16, scale: 0.97, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="pointer-events-auto relative overflow-hidden w-full max-w-md flex items-center gap-3.5 pl-3 pr-3.5 py-3 rounded-[22px] bg-[#14110F]/80 backdrop-blur-2xl backdrop-saturate-150 text-white ring-1 ring-white/10 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          {(() => {
            const { Icon, tile, title } = variants[toast.variant];
            return (
              <>
                <div className={`grid place-items-center w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br ring-1 ${tile}`}>
                  <Icon className={`w-5 h-5 ${toast.variant === 'wishlist' ? 'fill-rose-300' : ''}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-tight">{title}</p>
                  <p className="text-xs text-white/65 mt-0.5 truncate">{toast.message}</p>
                </div>

                {toast.actionLabel && toast.onAction && (
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      onDismiss();
                    }}
                    className="shrink-0 h-8 px-3.5 rounded-full bg-white text-[#14110F] text-xs font-bold transition-all hover:bg-[#E3C16F] active:scale-95 cursor-pointer"
                  >
                    {toast.actionLabel}
                  </button>
                )}

                <button
                  onClick={onDismiss}
                  aria-label="إغلاق"
                  className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <span
                  key={`bar-${toast.id}`}
                  className="absolute bottom-0 inset-x-0 h-[3px] origin-right bg-gradient-to-l from-[#E3C16F] to-[#B8923A] animate-toast-progress"
                />
              </>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
