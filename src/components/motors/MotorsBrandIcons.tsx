import React from 'react';

export const BrandAudiLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-10" }) => (
  <svg viewBox="0 0 100 40" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="23" cy="20" r="14" />
    <circle cx="41" cy="20" r="14" />
    <circle cx="59" cy="20" r="14" />
    <circle cx="77" cy="20" r="14" />
  </svg>
);

export const BrandBmwLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="none" stroke="#1e293b" strokeWidth="4" />
    <circle cx="50" cy="50" r="40" fill="#0f172a" />
    <text x="50" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">M</text>
    <text x="24" y="56" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">B</text>
    <text x="76" y="56" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">W</text>
    <circle cx="50" cy="50" r="26" fill="#ffffff" />
    <path d="M50 24 A26 26 0 0 1 76 50 L50 50 Z" fill="#0284c7" />
    <path d="M50 50 L24 50 A26 26 0 0 1 50 76 Z" fill="#0284c7" />
  </svg>
);

export const BrandChevroletLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-10" }) => (
  <svg viewBox="0 0 120 50" className={className}>
    <path 
      d="M38 10 L82 10 L82 20 L115 20 L108 30 L82 30 L82 40 L38 40 L38 30 L5 30 L12 20 L38 20 Z" 
      fill="#d97706" 
      stroke="#b45309" 
      strokeWidth="2"
    />
    <path 
      d="M40 13 L80 13 L80 22 L110 22 L105 28 L80 28 L80 37 L40 37 L40 28 L10 28 L15 22 L40 22 Z" 
      fill="#f59e0b" 
    />
  </svg>
);

export const BrandFordLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-10" }) => (
  <svg viewBox="0 0 120 60" className={className}>
    <ellipse cx="60" cy="30" rx="56" ry="26" fill="#1d4ed8" stroke="#cbd5e1" strokeWidth="3" />
    <ellipse cx="60" cy="30" rx="51" ry="22" fill="none" stroke="#ffffff" strokeWidth="1.5" />
    <text 
      x="60" 
      y="38" 
      textAnchor="middle" 
      fill="#ffffff" 
      fontSize="26" 
      fontFamily="cursive, 'Brush Script MT', 'Segoe Script', sans-serif" 
      fontStyle="italic"
      fontWeight="bold"
    >
      Ford
    </text>
  </svg>
);

export const BrandHyundaiLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-10" }) => (
  <svg viewBox="0 0 100 60" className={className}>
    <ellipse cx="50" cy="30" rx="44" ry="24" fill="none" stroke="#0369a1" strokeWidth="4" />
    <path 
      d="M36 44 L40 16 C48 20, 52 20, 60 16 L64 44 C56 39, 44 39, 36 44 Z" 
      fill="#0284c7" 
    />
  </svg>
);

export const BrandJeepLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-8" }) => (
  <svg viewBox="0 0 100 40" className={className}>
    <text 
      x="50" 
      y="30" 
      textAnchor="middle" 
      fill="#0f172a" 
      fontSize="32" 
      fontFamily="Arial Black, Impact, sans-serif" 
      fontWeight="900"
      letterSpacing="1"
    >
      Jeep
    </text>
  </svg>
);

export const BrandKiaLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-8" }) => (
  <svg viewBox="0 0 120 40" className={className}>
    <path 
      d="M10 32 L22 8 L28 8 L18 20 L30 32 M38 8 L44 8 L44 32 L38 32 M54 32 L66 8 L72 8 L84 32 M60 22 L78 22" 
      stroke="#dc2626" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none" 
    />
  </svg>
);

export const BrandMazdaLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-12" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" stroke="#475569" strokeWidth="4">
    <ellipse cx="50" cy="40" rx="42" ry="34" />
    <path d="M26 34 Q50 62 74 34 Q50 44 26 34 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
  </svg>
);

export const BrandMercedesLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#64748b" strokeWidth="3" />
    <path 
      d="M50 8 L50 50 L14 71 L50 50 L86 71 Z" 
      fill="none" 
      stroke="#334155" 
      strokeWidth="3.5" 
      strokeLinejoin="round" 
    />
    <path 
      d="M50 8 L52 50 L86 71 L50 48 L14 71 L48 50 Z" 
      fill="#94a3b8" 
    />
  </svg>
);

export const BrandPorscheLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path 
      d="M20 18 L80 18 L74 65 L50 86 L26 65 Z" 
      fill="#b45309" 
      stroke="#78350f" 
      strokeWidth="3"
    />
    <path d="M50 18 L50 86" stroke="#000000" strokeWidth="2" />
    <text x="50" y="30" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">PORSCHE</text>
  </svg>
);

export const BrandToyotaLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-10" }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" stroke="#dc2626" strokeWidth="3">
    <ellipse cx="50" cy="30" rx="44" ry="24" />
    <ellipse cx="50" cy="24" rx="20" ry="15" />
    <ellipse cx="50" cy="30" rx="9" ry="24" />
  </svg>
);

export interface BrandItem {
  id: string;
  name: string;
  count: number;
  Component: React.FC<{ className?: string }>;
}

export const MOTORS_BRANDS: BrandItem[] = [
  { id: 'Audi', name: 'Audi', count: 4, Component: BrandAudiLogo },
  { id: 'BMW', name: 'BMW', count: 6, Component: BrandBmwLogo },
  { id: 'Chevrolet', name: 'Chevrolet', count: 3, Component: BrandChevroletLogo },
  { id: 'Ford', name: 'Ford', count: 5, Component: BrandFordLogo },
  { id: 'Hyundai', name: 'Hyundai', count: 4, Component: BrandHyundaiLogo },
  { id: 'Jeep', name: 'Jeep', count: 3, Component: BrandJeepLogo },
  { id: 'Kia', name: 'Kia', count: 5, Component: BrandKiaLogo },
  { id: 'Mazda', name: 'Mazda', count: 2, Component: BrandMazdaLogo },
  { id: 'Mercedes-Benz', name: 'Mercedes-Benz', count: 7, Component: BrandMercedesLogo },
  { id: 'Porsche', name: 'Porsche', count: 2, Component: BrandPorscheLogo },
  { id: 'Toyota', name: 'Toyota', count: 8, Component: BrandToyotaLogo },
];
