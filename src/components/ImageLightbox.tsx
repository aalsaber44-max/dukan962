import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** عارض صور بملء الشاشة: تكبير بالنقر، تنقل بالأسهم والكيبورد، وشريط صور مصغّرة */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, index, alt, onClose, onIndexChange }) => {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const count = images.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setZoomed(false);
      onIndexChange((index + dir + count) % count);
    },
    [index, count, onIndexChange]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') go(1); // واجهة RTL: السهم الأيسر = التالي
      else if (e.key === 'ArrowRight') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  const updateOrigin = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const btn =
    'grid place-items-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/15 text-[#F3EEE4] backdrop-blur-md transition-all active:scale-90 cursor-pointer';

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/95 animate-fade"
      onClick={(e) => {
        e.stopPropagation(); // لا يغلق نافذة المنتج خلفه
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="عرض الصورة"
    >
      <div className="flex items-center justify-between p-3 sm:p-5" onClick={stop}>
        <span className="text-xs font-mono text-[#A39A8B] bg-white/10 px-3 py-1 rounded-full">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? 'تصغير' : 'تكبير'}>
            {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button className={btn} onClick={onClose} aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <img
          key={images[index]}
          src={images[index]}
          alt={alt}
          referrerPolicy="no-referrer"
          draggable={false}
          onClick={(e) => {
            e.stopPropagation();
            setOrigin('50% 50%');
            setZoomed((z) => !z);
          }}
          onPointerMove={(e) => zoomed && updateOrigin(e)}
          style={{ transformOrigin: origin, touchAction: zoomed ? 'none' : 'auto' }}
          className={`max-h-full max-w-full object-contain select-none transition-transform duration-300 ${
            zoomed ? 'scale-[2.4] cursor-zoom-out' : 'cursor-zoom-in'
          }`}
        />

        {count > 1 && (
          <>
            <button
              className={`${btn} absolute right-3 sm:right-6 top-1/2 -translate-y-1/2`}
              onClick={(e) => { stop(e); go(-1); }}
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              className={`${btn} absolute left-3 sm:left-6 top-1/2 -translate-y-1/2`}
              onClick={(e) => { stop(e); go(1); }}
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="p-3 sm:p-5 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar" onClick={stop}>
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => { setZoomed(false); onIndexChange(i); }}
              className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-[#EFE9DE] transition-all cursor-pointer ${
                i === index ? 'ring-2 ring-[#D4B06A] scale-105' : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`الصورة ${i + 1}`}
            >
              <img src={src} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};
