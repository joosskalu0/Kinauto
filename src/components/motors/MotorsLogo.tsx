import React from 'react';

interface MotorsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MotorsLogo: React.FC<MotorsLogoProps> = ({ className = '', size = 'md' }) => {
  const height = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  return (
    <div className={`flex items-center select-none cursor-pointer group ${className}`}>
      {/* SVG recreation of the official MOTORS stylemix theme logo */}
      <svg 
        height={height} 
        viewBox="0 0 160 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Dynamic Curved Red & Dark Slate Car Swoop / Wing Silhouette */}
        <path 
          d="M6 18 C18 6, 42 3, 62 10 C46 12, 28 17, 16 23 Z" 
          fill="#e11d48" 
        />
        <path 
          d="M14 23 C30 16, 52 14, 76 18 C58 20, 36 24, 20 30 Z" 
          fill="#1e293b" 
        />
        <circle cx="28" cy="27" r="3" fill="#e11d48" />
        <circle cx="56" cy="25" r="3" fill="#1e293b" />

        {/* Brand Text 'motors' in bold lowercase italic stylized typeface */}
        <text
          x="34"
          y="42"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="30"
          letterSpacing="-1.5"
          fill="#0f172a"
          fontStyle="italic"
        >
          motors
        </text>
      </svg>
    </div>
  );
};
