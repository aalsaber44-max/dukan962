import React from 'react';

interface DukanLogoProps {
  className?: string;
  variant?: 'light'| 'dark';
  subtitle?: string; //خاصية جديدة لاستقبال اسم القسم
}

export const DukanLogo: React.FC<DukanLogoProps> = ({
  className = 'h-11',
  variant = 'dark',
  subtitle = 'متجرك الشامل · الأردن'//النص الافتراضي للصفحة الرئيسية
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Royal crest — architectural crown with a metallic gold finish */}
      <svg
        viewBox="0 0 96 84"
        className="h-7 sm:h-10 w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="dukanGoldFace" x1="12" y1="6" x2="84" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FDF3BE" />
            <stop offset="0.18" stopColor="#EFD488" />
            <stop offset="0.42" stopColor="#D9B24A" />
            <stop offset="0.68" stopColor="#B98A1E" />
            <stop offset="0.88" stopColor="#9A721A" />
            <stop offset="1" stopColor="#6F4F0C" />
          </linearGradient>
          <linearGradient id="dukanGoldBand" x1="48" y1="61" x2="48" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F3DC95" />
            <stop offset="0.55" stopColor="#C79B2A" />
            <stop offset="1" stopColor="#7A560B" />
          </linearGradient>
          <linearGradient id="dukanGoldEdge" x1="12" y1="4" x2="84" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFF8DC" />
            <stop offset="0.5" stopColor="#B98A1E" />
            <stop offset="1" stopColor="#5E420A" />
          </linearGradient>
          <filter id="dukanCrownShadow" x="-25%" y="-25%" width="150%" height="160%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" floodColor="#5E420A" floodOpacity="0.42" />
          </filter>
        </defs>

        {/* Crest body: three tapering spires on a slender band */}
        <path
          d="M12 62.5 17.6 25.6 37 45.4 48 13.2 59 45.4 78.4 25.6 84 62.5Z"
          fill="url(#dukanGoldFace)"
          stroke="url(#dukanGoldEdge)"
          strokeWidth="1.1"
          strokeLinejoin="miter"
          filter="url(#dukanCrownShadow)"
        />

        {/* Architectural hairlines — facet highlights and centre ribs */}
        <path d="M44.4 54.4V23.6M51.6 54.4V23.6" stroke="#6F4F0C" strokeOpacity="0.32" strokeWidth="0.9" />
        <path d="M20.6 58.6 22.8 33.4M75.4 58.6 73.2 33.4" stroke="#FFF4C8" strokeOpacity="0.34" strokeWidth="0.9" />
        <path d="M13.4 27.2 14 57.6" stroke="#FFF8DC" strokeOpacity="0.28" strokeWidth="0.8" />
        <path d="M82.6 27.2 82 57.6" stroke="#5E420A" strokeOpacity="0.22" strokeWidth="0.8" />

        {/* Plinth with milled edge and inset jewels */}
        <path
          d="M10.5 61.2H85.5L82 75.2H14Z"
          fill="url(#dukanGoldBand)"
          stroke="url(#dukanGoldEdge)"
          strokeWidth="1"
          strokeLinejoin="miter"
        />
        <path d="M14.4 63.9H81.6" stroke="#FFEFC0" strokeOpacity="0.5" strokeWidth="0.8" />
        <path d="M48 66.9 50.5 69.4 48 71.9 45.5 69.4Z" fill="#FFF6D2" stroke="#6F4F0C" strokeWidth="0.6" />
        <path d="M29 68.1 31 70.1 29 72.1 27 70.1Z" fill="#FFF6D2" stroke="#6F4F0C" strokeWidth="0.5" />
        <path d="M67 68.1 69 70.1 67 72.1 65 70.1Z" fill="#FFF6D2" stroke="#6F4F0C" strokeWidth="0.5" />

        {/* Finials: diamond pinnacles on each spire */}
        <path d="M17.6 18.2 20.4 22 17.6 25.8 14.8 22Z" fill="url(#dukanGoldFace)" stroke="url(#dukanGoldEdge)" strokeWidth="0.85" />
        <path d="M78.4 18.2 81.2 22 78.4 25.8 75.6 22Z" fill="url(#dukanGoldFace)" stroke="url(#dukanGoldEdge)" strokeWidth="0.85" />
        <path d="M48 4.6 51.6 9.4 48 14.2 44.4 9.4Z" fill="url(#dukanGoldFace)" stroke="url(#dukanGoldEdge)" strokeWidth="0.9" />
      </svg>

      {/* Typography: DUKAN 962 */}
      <div className="flex flex-col text-right">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`text-base sm:text-2xl font-black tracking-tight font-serif ${
              isDark ? 'text-[#1C1917]': 'text-white'}`}
          >
            DUKAN
          </span>
          <span className="text-base sm:text-2xl font-black text-[var(--sf-accent)] tracking-tight font-mono">
            962
          </span>
        </div>
        {/*هنا يتم عرض النص المتغير */}
        <span
          className={`hidden sm:block text-[10px] tracking-widest font-medium ${
            isDark ? 'text-[var(--sf-muted)]': 'text-[var(--sf-text)]'}`}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
};
