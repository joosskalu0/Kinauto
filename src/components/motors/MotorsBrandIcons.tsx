import React from 'react';

/**
 * Logos Vectoriels Professionnels Haute Définition des Marques Automobiles
 * Conçus avec précision géométrique, reflets métalliques et couleurs officielles.
 */

// 1. TOYOTA (Emblème officiel aux 3 ovales entrelacés)
export const BrandToyotaLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-10" }) => (
  <svg viewBox="0 0 100 65" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="toyotaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
    {/* Outer Oval */}
    <path 
      d="M50 4 C24.5 4 4 16.5 4 32 C4 47.5 24.5 60 50 60 C75.5 60 96 47.5 96 32 C96 16.5 75.5 4 50 4 Z M50 9 C72 9 89.5 19.5 89.5 32 C89.5 44.5 72 55 50 55 C28 55 10.5 44.5 10.5 32 C10.5 19.5 28 9 50 9 Z" 
      fill="url(#toyotaGrad)" 
    />
    {/* Inner Horizontal Oval */}
    <path 
      d="M50 14 C33 14 20 20 20 27 C20 34 33 40 50 40 C67 40 80 34 80 27 C80 20 67 14 50 14 Z M50 18.5 C63.5 18.5 73.5 22.5 73.5 27 C73.5 31.5 63.5 35.5 50 35.5 C36.5 35.5 26.5 31.5 26.5 27 C26.5 22.5 36.5 18.5 50 18.5 Z" 
      fill="url(#toyotaGrad)" 
    />
    {/* Inner Vertical Oval */}
    <path 
      d="M50 14 C44.5 14 40 21 40 33 C40 45 44.5 55 50 55 C55.5 55 60 45 60 33 C60 21 55.5 14 50 14 Z M50 19 C52.8 19 54.5 24.5 54.5 33 C54.5 41.5 52.8 50 50 50 C47.2 50 45.5 41.5 45.5 33 C45.5 24.5 47.2 19 50 19 Z" 
      fill="url(#toyotaGrad)" 
    />
  </svg>
);

// 2. MERCEDES-BENZ (Étoile à trois branches en relief chromé et anneau argenté)
export const BrandMercedesLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mbChrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="mbDarkFacet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="mbLightFacet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
    </defs>
    {/* Outer Ring */}
    <circle cx="50" cy="50" r="46" stroke="url(#mbChrome)" strokeWidth="4.5" />
    <circle cx="50" cy="50" r="42" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
    
    {/* 3-Pointed Star - Light Facets */}
    <polygon points="50,6 50,50 44,48" fill="url(#mbLightFacet)" />
    <polygon points="12,72 50,50 48,56" fill="url(#mbLightFacet)" />
    <polygon points="88,72 50,50 56,48" fill="url(#mbLightFacet)" />
    
    {/* 3-Pointed Star - Dark Facets */}
    <polygon points="50,6 50,50 56,48" fill="url(#mbDarkFacet)" />
    <polygon points="12,72 50,50 44,48" fill="url(#mbDarkFacet)" />
    <polygon points="88,72 50,50 48,56" fill="url(#mbDarkFacet)" />
    
    {/* Center Hub */}
    <circle cx="50" cy="50" r="4" fill="#cbd5e1" />
  </svg>
);

// 3. BMW (Rondelle officielle bavaroise bleu & blanc, anneau noir et lettrage BMW)
export const BrandBmwLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bmwSilver" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    {/* Outer Border */}
    <circle cx="50" cy="50" r="48" fill="none" stroke="url(#bmwSilver)" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="46" fill="#0f172a" />
    
    {/* Letters B - M - W */}
    <text x="24" y="55" fill="#f8fafc" fontSize="13" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle">B</text>
    <text x="50" y="24" fill="#f8fafc" fontSize="13" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle">M</text>
    <text x="76" y="55" fill="#f8fafc" fontSize="13" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle">W</text>
    
    {/* Inner Quadrants Ring */}
    <circle cx="50" cy="50" r="28" fill="#ffffff" stroke="url(#bmwSilver)" strokeWidth="1.5" />
    {/* Blue Sectors */}
    <path d="M50 22 A28 28 0 0 1 78 50 L50 50 Z" fill="#0284c7" />
    <path d="M50 50 L22 50 A28 28 0 0 1 50 78 Z" fill="#0284c7" />
    {/* Center Division Lines */}
    <line x1="22" y1="50" x2="78" y2="50" stroke="url(#bmwSilver)" strokeWidth="1.5" />
    <line x1="50" y1="22" x2="50" y2="78" stroke="url(#bmwSilver)" strokeWidth="1.5" />
  </svg>
);

// 4. NISSAN (Emblème officiel avec cercle chromé, traverse et typographie NISSAN)
export const BrandNissanLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-10" }) => (
  <svg viewBox="0 0 100 65" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nissanChrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Upper and Lower Ring arcs */}
    <path d="M22 24 A30 30 0 1 1 78 24" fill="none" stroke="url(#nissanChrome)" strokeWidth="6" strokeLinecap="round" />
    <path d="M78 40 A30 30 0 1 1 22 40" fill="none" stroke="url(#nissanChrome)" strokeWidth="6" strokeLinecap="round" />
    
    {/* Central Bar */}
    <rect x="6" y="24" width="88" height="16" rx="2" fill="#0f172a" stroke="url(#nissanChrome)" strokeWidth="2" />
    
    {/* NISSAN Text */}
    <text 
      x="50" 
      y="36" 
      textAnchor="middle" 
      fill="#f8fafc" 
      fontSize="10" 
      fontWeight="900" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      letterSpacing="3"
    >
      NISSAN
    </text>
  </svg>
);

// 5. LAND ROVER (Ovale vert anglais emblématique avec double liseré doré et typographie)
export const BrandLandRoverLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-9" }) => (
  <svg viewBox="0 0 120 65" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lrGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
    </defs>
    {/* Deep Forest Green Oval */}
    <ellipse cx="60" cy="32.5" rx="57" ry="29" fill="#044723" stroke="url(#lrGold)" strokeWidth="3" />
    <ellipse cx="60" cy="32.5" rx="53" ry="25" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
    
    {/* Text LAND ROVER */}
    <text 
      x="60" 
      y="28" 
      textAnchor="middle" 
      fill="#fef08a" 
      fontSize="13" 
      fontWeight="900" 
      fontFamily="Arial Black, Impact, sans-serif" 
      letterSpacing="2"
    >
      LAND
    </text>
    <text 
      x="60" 
      y="44" 
      textAnchor="middle" 
      fill="#fef08a" 
      fontSize="13" 
      fontWeight="900" 
      fontFamily="Arial Black, Impact, sans-serif" 
      letterSpacing="2"
    >
      ROVER
    </text>
    
    {/* Dynamic connector line */}
    <path d="M22 32 L36 32 M84 32 L98 32" stroke="#fef08a" strokeWidth="1.5" />
  </svg>
);

// 6. LEXUS (Ovale aérodynamique et 'L' profilé argent chromé)
export const BrandLexusLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-10" }) => (
  <svg viewBox="0 0 100 65" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lexusChrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="40%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Outer Oval */}
    <ellipse cx="50" cy="32.5" rx="46" ry="28" stroke="url(#lexusChrome)" strokeWidth="5.5" />
    
    {/* Stylized Sharp 'L' */}
    <path 
      d="M68 18 L34 46 L76 46" 
      stroke="url(#lexusChrome)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// 7. AUDI (Quatre anneaux olympiques entrelacés en chrome brossé)
export const BrandAudiLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-9" }) => (
  <svg viewBox="0 0 110 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="audiRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22.5" r="17" stroke="url(#audiRing)" strokeWidth="4.5" />
    <circle cx="44" cy="22.5" r="17" stroke="url(#audiRing)" strokeWidth="4.5" />
    <circle cx="66" cy="22.5" r="17" stroke="url(#audiRing)" strokeWidth="4.5" />
    <circle cx="88" cy="22.5" r="17" stroke="url(#audiRing)" strokeWidth="4.5" />
  </svg>
);

// 8. VOLKSWAGEN (Monogramme VW officiel dans son cercle bleu & chrome)
export const BrandVolkswagenLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vwBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="vwChrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#vwBlue)" stroke="url(#vwChrome)" strokeWidth="4" />
    <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
    
    {/* V & W Intersecting Glyphs */}
    {/* Top V */}
    <path d="M30 24 L50 64 L70 24" fill="none" stroke="url(#vwChrome)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bottom W */}
    <path d="M22 38 L38 80 L50 60 L62 80 L78 38" fill="none" stroke="url(#vwChrome)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 9. FORD (Ovale bleu cobalt avec typographie calligraphique blanche et liseré)
export const BrandFordLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-9" }) => (
  <svg viewBox="0 0 120 60" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fordBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="30" rx="57" ry="27" fill="url(#fordBlue)" stroke="#e2e8f0" strokeWidth="3" />
    <ellipse cx="60" cy="30" rx="52" ry="23" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
    
    <text 
      x="60" 
      y="38" 
      textAnchor="middle" 
      fill="#ffffff" 
      fontSize="26" 
      fontFamily="Brush Script MT, Segoe Script, cursive, sans-serif" 
      fontStyle="italic"
      fontWeight="bold"
    >
      Ford
    </text>
  </svg>
);

// 10. HYUNDAI (H incliné représentant la poignée de main, dans son ovale bleu)
export const BrandHyundaiLogo: React.FC<{ className?: string }> = ({ className = "w-15 h-9" }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hyundaiBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="30" rx="46" ry="26" stroke="url(#hyundaiBlue)" strokeWidth="4.5" />
    {/* Stylized Slanted 'H' */}
    <path 
      d="M34 45 C37 25, 41 15, 41 15 C49 20, 54 20, 60 15 C60 15, 64 35, 67 45 C59 40, 42 40, 34 45 Z" 
      fill="url(#hyundaiBlue)" 
    />
    <path d="M38 31 C46 33, 54 33, 62 31" stroke="#ffffff" strokeWidth="2.5" />
  </svg>
);

// 11. PORSCHE (Blason de Stuttgart doré, bandes rouge/noir et cheval cabré)
export const BrandPorscheLogo: React.FC<{ className?: string }> = ({ className = "w-11 h-12" }) => (
  <svg viewBox="0 0 100 115" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="porscheGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
    </defs>
    {/* Shield Base */}
    <path 
      d="M16 12 L84 12 L78 68 C76 88, 50 106, 50 106 C50 106, 24 88, 22 68 Z" 
      fill="url(#porscheGold)" 
      stroke="#78350f" 
      strokeWidth="3" 
    />
    {/* Red and Black Stripes in Quadrants */}
    <rect x="23" y="44" width="24" height="6" fill="#dc2626" />
    <rect x="23" y="50" width="24" height="6" fill="#0f172a" />
    <rect x="23" y="56" width="24" height="6" fill="#dc2626" />
    
    <rect x="53" y="44" width="24" height="6" fill="#dc2626" />
    <rect x="53" y="50" width="24" height="6" fill="#0f172a" />
    <rect x="53" y="56" width="24" height="6" fill="#dc2626" />
    
    {/* Center Coat of Arms (Stuttgart Prancing Horse Silhouette) */}
    <path d="M48 48 C48 45, 52 45, 52 48 C52 54, 46 56, 50 64 L54 64" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Header PORSCHE text */}
    <rect x="20" y="16" width="60" height="14" rx="2" fill="#0f172a" />
    <text 
      x="50" 
      y="27" 
      textAnchor="middle" 
      fill="url(#porscheGold)" 
      fontSize="9" 
      fontWeight="900" 
      fontFamily="system-ui, sans-serif" 
      letterSpacing="2"
    >
      PORSCHE
    </text>
  </svg>
);

// 12. JEEP (Calandre légendaire à 7 fentes verticales et typographie robuste)
export const BrandJeepLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-8" }) => (
  <svg viewBox="0 0 110 40" className={className} xmlns="http://www.w3.org/2000/svg">
    <text 
      x="55" 
      y="32" 
      textAnchor="middle" 
      fill="#0f172a" 
      fontSize="36" 
      fontFamily="Impact, Arial Black, sans-serif" 
      fontWeight="900" 
      letterSpacing="2"
    >
      Jeep
    </text>
  </svg>
);

// 13. KIA (Nouveau logo officiel KIA angulaire et connecté)
export const BrandKiaLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-8" }) => (
  <svg viewBox="0 0 120 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 36 L26 8 L32 8 L22 22 L36 36 M46 8 L54 8 L54 36 L46 36 M66 36 L78 8 L86 8 L98 36 M72 24 L92 24" 
      stroke="#dc2626" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// 14. MITSUBISHI (Trois diamants rouges formant l'étoile triangulaire)
export const BrandMitsubishiLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-11" }) => (
  <svg viewBox="0 0 100 90" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Top Rhombus */}
    <polygon points="50,6 64,32 50,56 36,32" fill="#dc2626" />
    {/* Bottom Left Rhombus */}
    <polygon points="36,56 8,56 22,80 50,80" fill="#dc2626" />
    {/* Bottom Right Rhombus */}
    <polygon points="64,56 92,56 78,80 50,80" fill="#dc2626" />
  </svg>
);

// 15. PEUGEOT (Nouveau blason noir & chrome du lion rugissant)
export const BrandPeugeotLogo: React.FC<{ className?: string }> = ({ className = "w-11 h-12" }) => (
  <svg viewBox="0 0 100 115" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Shield */}
    <path d="M14 12 L86 12 L78 72 C74 94, 50 108, 50 108 C50 108, 26 94, 22 72 Z" fill="#0f172a" stroke="#475569" strokeWidth="3" />
    {/* PEUGEOT Text */}
    <text x="50" y="26" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">PEUGEOT</text>
    {/* Lion Head Silhouette */}
    <path 
      d="M34 76 C32 64, 38 48, 50 44 C62 40, 68 52, 68 62 C68 74, 56 84, 44 84 Z M52 50 C56 50, 60 54, 58 58" 
      fill="none" 
      stroke="#f8fafc" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
    />
    <path d="M60 62 L66 60 L60 66" stroke="#f8fafc" strokeWidth="2.5" fill="none" />
  </svg>
);

// 16. CHEVROLET (Nœud papillon doré avec double biseau chromé)
export const BrandChevroletLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-8" }) => (
  <svg viewBox="0 0 120 48" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chevyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Outer Chrome Border */}
    <path 
      d="M38 6 L82 6 L82 16 L116 16 L108 28 L82 28 L82 40 L38 40 L38 30 L4 30 L12 18 L38 18 Z" 
      fill="#cbd5e1" 
      stroke="#64748b" 
      strokeWidth="1.5" 
    />
    {/* Gold Center */}
    <path 
      d="M40 9 L80 9 L80 18 L111 18 L105 26 L80 26 L80 37 L40 37 L40 27 L9 27 L15 19 L40 19 Z" 
      fill="url(#chevyGold)" 
    />
  </svg>
);

// 17. HONDA (Monogramme 'H' chromé dans son rectangle adouci)
export const BrandHondaLogo: React.FC<{ className?: string }> = ({ className = "w-13 h-10" }) => (
  <svg viewBox="0 0 100 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hondaChrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Outer Rounded Trapezoid */}
    <path 
      d="M14 10 L86 10 C92 10, 96 14, 94 22 L86 58 C84 64, 80 66, 74 66 L26 66 C20 66, 16 64, 14 58 L6 22 C4 14, 8 10, 14 10 Z" 
      stroke="url(#hondaChrome)" 
      strokeWidth="4" 
    />
    {/* Bold 'H' with flaring top */}
    <path 
      d="M24 16 L34 60 M76 16 L66 60 M30 38 L70 38" 
      stroke="url(#hondaChrome)" 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
  </svg>
);

// 18. MAZDA (Ailes dynamiques 'M' chromées dans leur ovale)
export const BrandMazdaLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-11" }) => (
  <svg viewBox="0 0 100 75" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="37.5" rx="44" ry="32" stroke="#64748b" strokeWidth="4.5" />
    <path d="M26 32 Q50 62 74 32 Q50 42 26 32 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
  </svg>
);

// 19. SUZUKI (Grand 'S' angulaire rouge sang iconique)
export const BrandSuzukiLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 18 L80 18 L48 48 L80 48 L80 82 L20 82 L52 52 L20 52 Z" 
      fill="#dc2626" 
      stroke="#b91c1c" 
      strokeWidth="2" 
    />
  </svg>
);

// 20. RENAULT (Losange géométrique argent biseauté)
export const BrandRenaultLogo: React.FC<{ className?: string }> = ({ className = "w-11 h-13" }) => (
  <svg viewBox="0 0 90 110" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="45,6 84,55 45,104 6,55" stroke="#334155" strokeWidth="6" strokeLinejoin="round" />
    <polygon points="45,26 66,55 45,84 24,55" stroke="#94a3b8" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);

export interface BrandItem {
  id: string;
  name: string;
  count: number;
  country: string;
  popularInRdc?: boolean;
  Component: React.FC<{ className?: string }>;
}

export const MOTORS_BRANDS: BrandItem[] = [
  { id: 'Toyota', name: 'Toyota', count: 12, country: 'Japon', popularInRdc: true, Component: BrandToyotaLogo },
  { id: 'Mercedes-Benz', name: 'Mercedes-Benz', count: 9, country: 'Allemagne', popularInRdc: true, Component: BrandMercedesLogo },
  { id: 'Nissan', name: 'Nissan', count: 7, country: 'Japon', popularInRdc: true, Component: BrandNissanLogo },
  { id: 'Land Rover', name: 'Land Rover', count: 6, country: 'Royaume-Uni', popularInRdc: true, Component: BrandLandRoverLogo },
  { id: 'Lexus', name: 'Lexus', count: 5, country: 'Japon', popularInRdc: true, Component: BrandLexusLogo },
  { id: 'BMW', name: 'BMW', count: 8, country: 'Allemagne', popularInRdc: true, Component: BrandBmwLogo },
  { id: 'Hyundai', name: 'Hyundai', count: 6, country: 'Corée du Sud', popularInRdc: true, Component: BrandHyundaiLogo },
  { id: 'Volkswagen', name: 'Volkswagen', count: 5, country: 'Allemagne', popularInRdc: true, Component: BrandVolkswagenLogo },
  { id: 'Ford', name: 'Ford', count: 5, country: 'États-Unis', popularInRdc: true, Component: BrandFordLogo },
  { id: 'Audi', name: 'Audi', count: 4, country: 'Allemagne', popularInRdc: true, Component: BrandAudiLogo },
  { id: 'Porsche', name: 'Porsche', count: 3, country: 'Allemagne', popularInRdc: true, Component: BrandPorscheLogo },
  { id: 'Jeep', name: 'Jeep', count: 4, country: 'États-Unis', popularInRdc: true, Component: BrandJeepLogo },
  { id: 'Mitsubishi', name: 'Mitsubishi', count: 4, country: 'Japon', popularInRdc: true, Component: BrandMitsubishiLogo },
  { id: 'Kia', name: 'Kia', count: 5, country: 'Corée du Sud', popularInRdc: true, Component: BrandKiaLogo },
  { id: 'Peugeot', name: 'Peugeot', count: 3, country: 'France', popularInRdc: true, Component: BrandPeugeotLogo },
  { id: 'Suzuki', name: 'Suzuki', count: 4, country: 'Japon', popularInRdc: true, Component: BrandSuzukiLogo },
  { id: 'Chevrolet', name: 'Chevrolet', count: 3, country: 'États-Unis', Component: BrandChevroletLogo },
  { id: 'Honda', name: 'Honda', count: 4, country: 'Japon', Component: BrandHondaLogo },
  { id: 'Mazda', name: 'Mazda', count: 2, country: 'Japon', Component: BrandMazdaLogo },
  { id: 'Renault', name: 'Renault', count: 3, country: 'France', Component: BrandRenaultLogo },
];
