import React from 'react';

/**
 * Silhouettes Automobiles Professionnelles Haute Définition
 * Conçues avec des proportions réalistes de carrosserie, des jantes alliage détaillées,
 * des vitrages fumés et des finitions soignées pour un rendu plateforme automobile premium.
 */

// 1. SUV & 4x4 (Garde au sol surélevée, barres de toit, arches de roues musclées et marchepied)
export const BodySUV: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="suvBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="glassTint" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="rimAlloy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Ground Shadow */}
    <ellipse cx="80" cy="71" rx="66" ry="4.5" fill="#0f172a" opacity="0.18" />

    {/* Roof Rails */}
    <rect x="52" y="21" width="60" height="2" rx="1" fill="#64748b" />
    <rect x="58" y="23" width="3" height="3" fill="#475569" />
    <rect x="106" y="23" width="3" height="3" fill="#475569" />

    {/* Main Body Shell */}
    <path 
      d="M12 55 C12 52, 16 50, 24 50 L34 50 C36 44, 42 40, 50 40 C58 40, 64 44, 66 50 L108 50 C110 44, 116 40, 124 40 C132 40, 138 44, 140 50 L148 50 C154 50, 156 53, 154 57 L150 63 C148 65, 144 66, 138 66 L134 66 C132 60, 126 56, 120 56 C114 56, 108 60, 106 66 L72 66 C70 60, 64 56, 58 56 C52 56, 46 60, 44 66 L22 66 C16 66, 12 63, 12 58 Z" 
      fill="url(#suvBody)" 
    />

    {/* Greenhouse & Pillars */}
    <path 
      d="M38 48 L52 26 C54 24, 58 24, 62 24 L114 24 C120 24, 124 26, 128 32 L140 48 Z" 
      fill="url(#glassTint)" 
      stroke="#1e3a8a" 
      strokeWidth="1.5" 
    />
    {/* Window Separation Pillar (B & C pillars) */}
    <line x1="82" y1="24" x2="82" y2="48" stroke="#0f172a" strokeWidth="2.5" />
    <line x1="110" y1="24" x2="114" y2="48" stroke="#0f172a" strokeWidth="2" />
    
    {/* Side Mirror */}
    <path d="M50 44 L44 44 C42 44, 42 41, 45 41 L50 42 Z" fill="#1e3a8a" />

    {/* Front Headlight Accent (LED Glow) */}
    <path d="M14 53 L22 52 L18 57 Z" fill="#60a5fa" />
    {/* Rear Tail Light Accent */}
    <path d="M152 53 L146 54 L148 59 Z" fill="#ef4444" />

    {/* Rugged Black Wheel Arch Moldings */}
    <path d="M30 54 C34 46, 44 46, 48 54" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M112 54 C116 46, 126 46, 130 54" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Front Wheel Assembly (Tire + 5-spoke Alloy Rim + Brake) */}
    <g transform="translate(39, 63)">
      <circle cx="0" cy="0" r="12" fill="#0f172a" />
      <circle cx="0" cy="0" r="10" fill="#1e293b" />
      <circle cx="0" cy="0" r="7.5" fill="url(#rimAlloy)" />
      <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
      {/* Rim Spokes */}
      <line x1="0" y1="-7" x2="0" y2="7" stroke="#f8fafc" strokeWidth="1" />
      <line x1="-7" y1="0" x2="7" y2="0" stroke="#f8fafc" strokeWidth="1" />
    </g>

    {/* Rear Wheel Assembly */}
    <g transform="translate(121, 63)">
      <circle cx="0" cy="0" r="12" fill="#0f172a" />
      <circle cx="0" cy="0" r="10" fill="#1e293b" />
      <circle cx="0" cy="0" r="7.5" fill="url(#rimAlloy)" />
      <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
      {/* Rim Spokes */}
      <line x1="0" y1="-7" x2="0" y2="7" stroke="#f8fafc" strokeWidth="1" />
      <line x1="-7" y1="0" x2="7" y2="0" stroke="#f8fafc" strokeWidth="1" />
    </g>
  </svg>
);

// 2. BERLINE / SEDAN (Silhouette tricorps élégante, profil aérodynamique, jantes raffinées)
export const BodySedan: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sedanBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="sedanGlass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="chromeRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    {/* Ground Shadow */}
    <ellipse cx="80" cy="71" rx="68" ry="4" fill="#0f172a" opacity="0.18" />

    {/* Shark Fin Antenna */}
    <path d="M112 28 L116 25 L116 28 Z" fill="#1e293b" />

    {/* Main Sedan Body */}
    <path 
      d="M10 57 C10 54, 14 52, 22 52 L32 52 C35 46, 42 43, 49 43 C56 43, 63 46, 66 52 L108 52 C111 46, 118 43, 125 43 C132 43, 139 46, 142 52 L148 52 C154 52, 157 55, 155 59 L150 63 C147 65, 142 66, 136 66 L134 66 C131 60, 125 57, 119 57 C113 57, 107 60, 104 66 L70 66 C67 60, 61 57, 55 57 C49 57, 43 60, 40 66 L20 66 C14 66, 10 63, 10 59 Z" 
      fill="url(#sedanBody)" 
    />

    {/* Flowing Greenhouse Glass Roofline */}
    <path 
      d="M34 50 L56 29 C60 26, 68 25, 76 25 L106 25 C116 25, 124 28, 130 36 L144 50 Z" 
      fill="url(#sedanGlass)" 
      stroke="#0f172a" 
      strokeWidth="1.5" 
    />
    {/* Chrome Daylight Opening (DLO) Trim */}
    <path 
      d="M38 49 L58 30 C62 27, 70 26, 77 26 L105 26 C114 26, 122 29, 127 36 L141 49" 
      stroke="#cbd5e1" 
      strokeWidth="1" 
      fill="none" 
      opacity="0.8" 
    />
    {/* Pillars */}
    <line x1="84" y1="26" x2="84" y2="50" stroke="#0f172a" strokeWidth="2.5" />
    <line x1="112" y1="26" x2="116" y2="50" stroke="#0f172a" strokeWidth="2" />

    {/* Side Mirror */}
    <path d="M52 45 L46 45 C44 45, 44 42, 47 42 L52 43 Z" fill="#334155" />

    {/* LED Headlight Accent */}
    <path d="M12 55 L20 54 L16 58 Z" fill="#38bdf8" />
    {/* LED Taillight Accent */}
    <path d="M153 54 L146 55 L148 60 Z" fill="#ef4444" />

    {/* Front Wheel */}
    <g transform="translate(37, 63)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="9" fill="#1e293b" />
      <circle cx="0" cy="0" r="7" fill="url(#chromeRim)" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
      <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke="#475569" strokeWidth="1" />
      <line x1="-6.5" y1="0" x2="6.5" y2="0" stroke="#475569" strokeWidth="1" />
    </g>

    {/* Rear Wheel */}
    <g transform="translate(122, 63)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="9" fill="#1e293b" />
      <circle cx="0" cy="0" r="7" fill="url(#chromeRim)" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
      <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke="#475569" strokeWidth="1" />
      <line x1="-6.5" y1="0" x2="6.5" y2="0" stroke="#475569" strokeWidth="1" />
    </g>
  </svg>
);

// 3. PICK-UP / UTILITAIRE 4x4 (Double cabine, benne ouverte robuste, arceau sport, garde au sol haute)
export const BodyPickups: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pickupBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="60%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>
      <linearGradient id="pickupRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="80" cy="72" rx="68" ry="4.5" fill="#0f172a" opacity="0.2" />

    {/* Sports Roll Bar behind cabin */}
    <path d="M102 30 L112 30 L126 49 L122 49 L108 34 L102 34 Z" fill="#334155" />

    {/* Main Pickup Body & Open Cargo Bed */}
    <path 
      d="M10 56 C10 53, 14 50, 22 50 L32 50 C35 43, 42 39, 50 39 C58 39, 65 43, 68 50 L108 50 C111 43, 118 39, 126 39 C134 39, 141 43, 144 50 L152 50 C156 50, 158 53, 156 57 L153 64 C151 66, 147 67, 140 67 L136 67 C133 61, 127 57, 120 57 C113 57, 107 61, 104 67 L70 67 C67 61, 61 57, 54 57 C47 57, 41 61, 38 67 L18 67 C12 67, 10 63, 10 58 Z" 
      fill="url(#pickupBody)" 
    />

    {/* Pickup Bed Drop Edge */}
    <rect x="106" y="47" width="46" height="4" fill="#0f172a" rx="1" />

    {/* Double Cab Cabin Glasshouse */}
    <path 
      d="M38 48 L54 28 C57 25, 62 25, 68 25 L98 25 C102 25, 104 28, 104 32 L104 48 Z" 
      fill="#0f172a" 
      stroke="#7c2d12" 
      strokeWidth="1.5" 
    />
    <line x1="76" y1="25" x2="76" y2="48" stroke="#431407" strokeWidth="2.5" />

    {/* Flared Heavy-Duty Fender Arches */}
    <path d="M28 54 C32 44, 44 44, 48 54" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M112 54 C116 44, 128 44, 132 54" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

    {/* Rugged Off-Road Wheels */}
    <g transform="translate(38, 64)">
      <circle cx="0" cy="0" r="13" fill="#0f172a" />
      <circle cx="0" cy="0" r="10.5" fill="#1e293b" />
      <circle cx="0" cy="0" r="8" fill="url(#pickupRim)" />
      <circle cx="0" cy="0" r="3" fill="#f8fafc" />
    </g>
    <g transform="translate(122, 64)">
      <circle cx="0" cy="0" r="13" fill="#0f172a" />
      <circle cx="0" cy="0" r="10.5" fill="#1e293b" />
      <circle cx="0" cy="0" r="8" fill="url(#pickupRim)" />
      <circle cx="0" cy="0" r="3" fill="#f8fafc" />
    </g>
  </svg>
);

// 4. COUPÉ (Ligne de toit fastback fuyante, posture racée, 2 portes sport)
export const BodyCoupe: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="coupeBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="60%" stopColor="#b91c1c" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id="sportRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="80" cy="71" rx="66" ry="3.5" fill="#0f172a" opacity="0.2" />

    {/* Fastback Body */}
    <path 
      d="M10 58 C10 55, 14 53, 24 53 L34 53 C37 47, 44 44, 51 44 C58 44, 65 47, 68 53 L108 53 C111 47, 118 44, 125 44 C132 44, 139 47, 142 53 L148 53 C154 53, 157 56, 155 60 L149 64 C146 66, 141 67, 135 67 L133 67 C130 61, 124 58, 118 58 C112 58, 106 61, 103 67 L69 67 C66 61, 60 58, 54 58 C48 58, 42 61, 39 67 L18 67 C12 67, 10 63, 10 59 Z" 
      fill="url(#coupeBody)" 
    />

    {/* Long Hood and Sloping Fastback Canopy */}
    <path 
      d="M42 51 L66 28 C70 25, 78 24, 88 25 L106 28 C118 31, 132 39, 144 51 Z" 
      fill="#0f172a" 
      stroke="#7f1d1d" 
      strokeWidth="1.5" 
    />
    <line x1="88" y1="25" x2="90" y2="51" stroke="#450a0a" strokeWidth="2" />

    {/* Aerodynamic Side Skirt */}
    <line x1="68" y1="65" x2="104" y2="65" stroke="#450a0a" strokeWidth="2" />

    {/* Sport Turbine Wheels */}
    <g transform="translate(38, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="9" fill="#1e293b" />
      <circle cx="0" cy="0" r="7" fill="url(#sportRim)" />
      <circle cx="0" cy="0" r="2" fill="#dc2626" />
    </g>
    <g transform="translate(122, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="9" fill="#1e293b" />
      <circle cx="0" cy="0" r="7" fill="url(#sportRim)" />
      <circle cx="0" cy="0" r="2" fill="#dc2626" />
    </g>
  </svg>
);

// 5. CABRIOLET / DÉCAPOTABLE (Toit ouvert, pare-brise profilé, appuie-têtes et arceaux visibles)
export const BodyConvertible: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cabrioBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="60%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="71" rx="66" ry="3.5" fill="#0f172a" opacity="0.18" />

    {/* Sport Seats & Anti-Roll Hoops */}
    <rect x="74" y="34" width="8" height="12" rx="4" fill="#334155" />
    <circle cx="94" cy="38" r="4" stroke="#475569" strokeWidth="2" fill="none" />

    {/* Open Cockpit Shell */}
    <path 
      d="M12 57 C12 54, 16 52, 26 52 L36 52 C39 46, 46 43, 53 43 C60 43, 67 46, 70 52 L108 52 C111 46, 118 43, 125 43 C132 43, 139 46, 142 52 L148 52 C154 52, 157 55, 155 59 L148 64 C145 66, 140 67, 134 67 L132 67 C129 61, 123 58, 117 58 C111 58, 105 61, 102 67 L68 67 C65 61, 59 58, 53 58 C47 58, 41 61, 38 67 L18 67 C12 67, 10 63, 12 57 Z" 
      fill="url(#cabrioBody)" 
    />

    {/* Raked Frameless Windshield */}
    <path d="M48 52 L68 30 L74 31 L58 52 Z" fill="#94a3b8" opacity="0.8" />
    <line x1="48" y1="52" x2="68" y2="30" stroke="#cbd5e1" strokeWidth="2" />

    {/* Wheels */}
    <g transform="translate(39, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="7" fill="#cbd5e1" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
    </g>
    <g transform="translate(121, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="7" fill="#cbd5e1" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
    </g>
  </svg>
);

// 6. COMPACTE & CITADINE / HATCHBACK (Silhouette 2 volumes compacte, hayon incliné et becquet)
export const BodyHatchback: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hatchBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="60%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="71" rx="64" ry="3.5" fill="#0f172a" opacity="0.18" />

    {/* Roof Spoiler */}
    <rect x="124" y="27" width="8" height="2.5" rx="1" fill="#047857" />

    {/* Compact Hatch Shell */}
    <path 
      d="M14 57 C14 54, 18 52, 26 52 L36 52 C39 46, 46 43, 53 43 C60 43, 67 46, 70 52 L106 52 C109 46, 116 43, 123 43 C130 43, 137 46, 140 52 L146 52 C150 52, 153 55, 151 59 L146 64 C144 66, 140 67, 134 67 L132 67 C129 61, 123 58, 117 58 C111 58, 105 61, 102 67 L68 67 C65 61, 59 58, 53 58 C47 58, 41 61, 38 67 L20 67 C14 67, 12 63, 14 57 Z" 
      fill="url(#hatchBody)" 
    />

    {/* Two-box Greenhouse & Hatch Tailgate */}
    <path 
      d="M38 49 L58 29 C62 27, 68 27, 76 27 L116 27 C122 27, 126 30, 128 34 L138 49 Z" 
      fill="#0f172a" 
      stroke="#047857" 
      strokeWidth="1.5" 
    />
    <line x1="84" y1="27" x2="84" y2="49" stroke="#064e3b" strokeWidth="2.5" />

    {/* Wheels */}
    <g transform="translate(39, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="7" fill="#e2e8f0" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
    </g>
    <g transform="translate(119, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="7" fill="#e2e8f0" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
    </g>
  </svg>
);

// 7. SPORTIVE & SUPERCAR (Nez ras du sol, entrées d'air massives, aileron sport, jantes larges)
export const BodySportCar: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="supercarBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="71" rx="68" ry="3.5" fill="#0f172a" opacity="0.2" />

    {/* Rear Aerodynamic Wing */}
    <path d="M136 34 L150 34 L152 38 L138 38 Z" fill="#0f172a" />
    <line x1="140" y1="38" x2="142" y2="52" stroke="#0f172a" strokeWidth="2" />

    {/* Low Wedge Supercar Body */}
    <path 
      d="M8 60 C8 58, 12 55, 24 55 L34 55 C37 49, 44 46, 51 46 C58 46, 65 49, 68 55 L108 55 C111 49, 118 46, 125 46 C132 46, 139 49, 142 55 L150 55 C154 55, 156 57, 154 61 L148 65 C145 67, 140 68, 134 68 L132 68 C129 62, 123 59, 117 59 C111 59, 105 62, 102 68 L68 68 C65 62, 59 59, 53 59 C47 59, 41 62, 38 68 L16 68 C10 68, 8 64, 8 60 Z" 
      fill="url(#supercarBody)" 
    />

    {/* Low Aerodynamic Cockpit */}
    <path 
      d="M48 53 L72 32 C76 30, 84 30, 94 32 L112 38 L132 53 Z" 
      fill="#0f172a" 
      stroke="#b45309" 
      strokeWidth="1.5" 
    />

    {/* Side Air Intake Scoop */}
    <polygon points="98,48 114,48 108,54" fill="#0f172a" />

    {/* Competition Wheels */}
    <g transform="translate(37, 64)">
      <circle cx="0" cy="0" r="11.5" fill="#0f172a" />
      <circle cx="0" cy="0" r="7.5" fill="#f8fafc" />
      <circle cx="0" cy="0" r="2.5" fill="#d97706" />
    </g>
    <g transform="translate(123, 64)">
      <circle cx="0" cy="0" r="12" fill="#0f172a" />
      <circle cx="0" cy="0" r="8" fill="#f8fafc" />
      <circle cx="0" cy="0" r="2.5" fill="#d97706" />
    </g>
  </svg>
);

// 8. MONOSPACE & VAN VIP (Grand volume habitable, vitres panoramiques teintées, porte latérale)
export const BodyMinivan: React.FC<{ className?: string }> = ({ className = "w-24 h-12" }) => (
  <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vanBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="71" rx="66" ry="4" fill="#0f172a" opacity="0.18" />

    {/* Van Shell */}
    <path 
      d="M12 57 C12 54, 16 51, 24 51 L34 51 C37 45, 44 42, 51 42 C58 42, 65 45, 68 51 L108 51 C111 45, 118 42, 125 42 C132 42, 139 45, 142 51 L148 51 C154 51, 156 54, 154 58 L150 64 C148 66, 144 67, 138 67 L134 67 C131 61, 125 58, 119 58 C113 58, 107 61, 104 67 L70 67 C67 61, 61 58, 55 58 C49 58, 43 61, 40 67 L20 67 C14 67, 12 63, 12 57 Z" 
      fill="url(#vanBody)" 
    />

    {/* High Panoramic Privacy Glasshouse */}
    <path 
      d="M32 48 L48 24 C50 22, 54 22, 58 22 L138 22 C144 22, 148 26, 148 32 L148 48 Z" 
      fill="#0f172a" 
      stroke="#334155" 
      strokeWidth="1.5" 
    />
    {/* Large Sliding Door & Window Lines */}
    <line x1="68" y1="22" x2="68" y2="48" stroke="#1e293b" strokeWidth="2" />
    <line x1="104" y1="22" x2="104" y2="48" stroke="#1e293b" strokeWidth="2" />
    {/* Sliding Door Lower Track Guide */}
    <line x1="68" y1="52" x2="136" y2="52" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 2" />

    {/* Wheels */}
    <g transform="translate(39, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="7" fill="#cbd5e1" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
    </g>
    <g transform="translate(121, 64)">
      <circle cx="0" cy="0" r="11" fill="#0f172a" />
      <circle cx="0" cy="0" r="7" fill="#cbd5e1" />
      <circle cx="0" cy="0" r="2" fill="#0f172a" />
    </g>
  </svg>
);

export interface BodyStyleItem {
  id: string;
  name: string;
  subTitle: string;
  filterCategory: string;
  Component: React.FC<{ className?: string }>;
}

export const MOTORS_BODY_STYLES: BodyStyleItem[] = [
  { id: 'suv', name: 'SUV & 4x4', subTitle: 'Baroudeurs & Familiaux', filterCategory: 'SUV', Component: BodySUV },
  { id: 'sedan', name: 'Berline', subTitle: 'Confort & Prestige', filterCategory: 'Berline', Component: BodySedan },
  { id: 'pickups', name: 'Pick-up', subTitle: 'Robustesse & Charge', filterCategory: 'Pick-up', Component: BodyPickups },
  { id: 'coupe', name: 'Coupé', subTitle: 'Sport & Ligne Fuyante', filterCategory: 'Coupé', Component: BodyCoupe },
  { id: 'hatchback', name: 'Compacte', subTitle: 'Citadine & Agile', filterCategory: 'Berline', Component: BodyHatchback },
  { id: 'convertible', name: 'Cabriolet', subTitle: 'Plaisir Décapotable', filterCategory: 'Cabriolet', Component: BodyConvertible },
  { id: 'sport-car', name: 'Sportive', subTitle: 'Performance & Circuit', filterCategory: 'Coupé', Component: BodySportCar },
  { id: 'minivan', name: 'Monospace & Van', subTitle: 'Espace & Transport VIP', filterCategory: 'Monospace', Component: BodyMinivan },
];
