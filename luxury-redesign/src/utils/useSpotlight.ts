import React from 'react';

/** يمرّر موضع المؤشر كمتغيرات CSS لعنصر .spotlight (إضاءة ذهبية تتبع الماوس) */
export const spotlightMove = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};
