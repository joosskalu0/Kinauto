import React from 'react';

export const BodyConvertible: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Convertible open top */}
    <path 
      d="M15 52 L35 52 L50 42 L115 42 L132 50 L150 52 C154 54, 155 58, 150 62 L15 62 C10 60, 10 54, 15 52 Z" 
      fill="#cbd5e1" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M55 42 L65 26 L90 26 L80 42" stroke="#475569" strokeWidth="2" fill="#e2e8f0" />
    <circle cx="42" cy="62" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
    <circle cx="124" cy="62" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
  </svg>
);

export const BodyCoupe: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Sleek 2-door coupe */}
    <path 
      d="M12 55 C22 55, 30 46, 52 46 L70 30 C85 24, 108 24, 122 36 L144 48 L152 56 C155 60, 150 63, 142 63 L18 63 C10 63, 8 57, 12 55 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M72 32 L116 32 L132 46 L60 46 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="38" cy="63" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    <circle cx="124" cy="63" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
  </svg>
);

export const BodyHatchback: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Compact Hatchback */}
    <path 
      d="M15 56 L35 56 L55 38 L95 34 L128 34 L138 48 L150 52 C154 55, 154 62, 146 64 L16 64 C10 64, 10 58, 15 56 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M60 40 L95 36 L124 36 L118 48 L55 48 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="40" cy="64" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    <circle cx="122" cy="64" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
  </svg>
);

export const BodyMinivan: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Spacious Van / Minivan */}
    <path 
      d="M14 58 L24 58 L38 34 L134 32 C142 34, 148 40, 150 50 L152 58 C154 64, 148 66, 140 66 L18 66 C10 66, 10 60, 14 58 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M42 36 L80 35 L80 48 L32 48 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <path d="M84 35 L128 35 L128 48 L84 48 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="42" cy="66" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    <circle cx="120" cy="66" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
  </svg>
);

export const BodyPickups: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Pickup truck with open bed */}
    <path 
      d="M12 56 L34 56 L52 38 L100 36 L104 46 L148 46 L152 54 C155 60, 150 64, 142 64 L16 64 C10 64, 8 58, 12 56 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M56 40 L98 38 L98 48 L50 48 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="38" cy="64" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3.5" />
    <circle cx="126" cy="64" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3.5" />
  </svg>
);

export const BodySedan: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* 4-door classic Sedan / Berline */}
    <path 
      d="M12 56 L30 56 L50 40 L108 38 L128 48 L148 54 C153 58, 150 63, 142 63 L16 63 C10 63, 8 58, 12 56 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M54 41 L105 39 L120 48 L46 48 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="36" cy="63" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    <circle cx="126" cy="63" r="11" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
  </svg>
);

export const BodySportCar: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Ultra-low sport supercar */}
    <path 
      d="M8 58 C18 58, 32 50, 60 46 L82 32 C98 28, 118 30, 134 42 L152 52 C156 56, 152 61, 144 61 L14 61 C6 61, 4 59, 8 58 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M84 34 L124 36 L138 46 L70 46 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="34" cy="61" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
    <circle cx="128" cy="61" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
  </svg>
);

export const BodySUV: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none">
    {/* Tall, muscular SUV */}
    <path 
      d="M12 56 L28 56 L46 36 L118 34 L138 46 L150 52 C154 56, 152 64, 144 64 L16 64 C10 64, 8 58, 12 56 Z" 
      fill="#e2e8f0" 
      stroke="#475569" 
      strokeWidth="2" 
    />
    <path d="M50 38 L114 36 L128 46 L42 46 Z" fill="#94a3b8" opacity="0.6" stroke="#475569" strokeWidth="1.5" />
    <circle cx="36" cy="64" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3.5" />
    <circle cx="126" cy="64" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3.5" />
  </svg>
);

export interface BodyStyleItem {
  id: string;
  name: string;
  filterCategory: string;
  Component: React.FC<{ className?: string }>;
}

export const MOTORS_BODY_STYLES: BodyStyleItem[] = [
  { id: 'convertible', name: 'Convertible', filterCategory: 'Cabriolet', Component: BodyConvertible },
  { id: 'coupe', name: 'Coupe', filterCategory: 'Coupé', Component: BodyCoupe },
  { id: 'hatchback', name: 'Hatchback', filterCategory: 'Berline', Component: BodyHatchback },
  { id: 'minivan', name: 'Minivan', filterCategory: 'Monospace', Component: BodyMinivan },
  { id: 'pickups', name: 'Pickups', filterCategory: 'Pick-up', Component: BodyPickups },
  { id: 'sedan', name: 'Sedan', filterCategory: 'Berline', Component: BodySedan },
  { id: 'sport-car', name: 'Sport Car', filterCategory: 'Coupé', Component: BodySportCar },
  { id: 'suv', name: 'SUV', filterCategory: 'SUV', Component: BodySUV },
];
