import { useEffect } from 'react';

/**
 * كشف العناصر عند التمرير — خفيف جداً:
 * مراقب واحد + MutationObserver لإضافة العناصر الجديدة (البطاقات القادمة من Firestore).
 * يحترم إعداد prefers-reduced-motion عبر CSS.
 */
export const useScrollReveal = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = () => Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'));

    if (reduce || !('IntersectionObserver' in window)) {
      nodes().forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    const scan = () => nodes().forEach((el) => io.observe(el));
    scan();

    let frame = 0;
    const mo = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
};
