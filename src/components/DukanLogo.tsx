import React from 'react';

interface DukanLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  subtitle?: string; // 💡 خاصية جديدة لاستقبال اسم القسم
}

export const DukanLogo: React.FC<DukanLogoProps> = ({ 
  className = 'h-11', 
  variant = 'dark',
  subtitle = 'متجرك الشامل · الأردن' // 💡 النص الافتراضي للصفحة الرئيسية
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Golden Crown Emblem */}
      <svg
        viewBox="0 0 100 85"
        className="h-10 w-auto shrink-0 drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="50%" stopColor="#C99824" />
            <stop offset="100%" stopColor="#8A6410" />
          </linearGradient>
          <filter id="crownGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#8A6410" floodOpacity="0.4" />
          </filter>
        </defs>
        <path
          d="M10 65 L90 65 L84 75 L16 75 Z"
          fill="url(#goldCrown)"
          filter="url(#crownGlow)"
        />
        <path
          d="M12 62 L18 26 L38 46 L50 14 L62 46 L82 26 L88 62 Z"
          fill="url(#goldCrown)"
          stroke="#7A560B"
          strokeWidth="1.5"
          filter="url(#crownGlow)"
        />
        <circle cx="18" cy="24" r="3.5" fill="#FFF2A3" stroke="#8A6410" strokeWidth="1" />
        <circle cx="50" cy="12" r="4.5" fill="#FFF2A3" stroke="#8A6410" strokeWidth="1" />
        <circle cx="82" cy="24" r="3.5" fill="#FFF2A3" stroke="#8A6410" strokeWidth="1" />
        <circle cx="28" cy="70" r="2" fill="#D32F2F" />
        <circle cx="50" cy="70" r="2.5" fill="#1976D2" />
        <circle cx="72" cy="70" r="2" fill="#D32F2F" />
      </svg>

      {/* Typography: DUKAN 962 */}
      <div className="flex flex-col text-right">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight font-serif ${
              isDark ? 'text-[#1C1917]' : 'text-white'
            }`}
          >
            DUKAN
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#D32F2F] tracking-tight font-mono">
            962
          </span>
        </div>
        {/* 💡 هنا يتم عرض النص المتغير */}
        <span
          className={`text-[10px] tracking-widest font-medium ${
            isDark ? 'text-[#78716C]' : 'text-[#D6D0C7]'
          }`}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
};
