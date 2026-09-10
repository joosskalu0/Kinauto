import React from 'react';

interface MotorsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MotorsLogo: React.FC<MotorsLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 30 : size === 'lg' ? 44 : 38;

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer group ${className}`}>
      {/* Sleek Custom Automotive Emblem (Original shield & speed-wing geometry) */}
      <div 
        style={{ width: iconSize, height: iconSize }}
        className="relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-700 rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105 border border-blue-400/20"
      >
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Aerodynamic car silhouette & speed curves */}
          <path 
            d="M8 24 C12 16, 20 12, 32 14 C26 18, 18 20, 10 26 Z" 
            fill="#38bdf8" 
          />
          <path 
            d="M12 28 C18 22, 26 19, 36 21 C30 25, 20 27, 14 31 Z" 
            fill="#ffffff" 
          />
          {/* Subtle central emblem dot */}
          <circle cx="20" cy="20" r="2.5" fill="#60a5fa" />
        </svg>
      </div>

      {/* Brand Text: AutoConcession */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Auto<span className="text-blue-600">Concession</span>
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
          Réseau Kinshasa
        </span>
      </div>
    </div>
  );
};

