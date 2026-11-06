import React from 'react';

interface GatLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  showSubtitle?: boolean;
}

export const GatLogo: React.FC<GatLogoProps> = ({ 
  className = '', 
  size = 'md',
  layout = 'horizontal',
  showSubtitle = true 
}) => {
  const isSm = size === 'sm';
  const isMd = size === 'md';
  const isLg = size === 'lg';

  // SVG Globe Emblem matching the uploaded official emblem
  const globeSizeClass = isSm 
    ? 'w-9 h-9' 
    : isMd 
    ? 'w-11 h-11 sm:w-12 sm:h-12' 
    : isLg 
    ? 'w-16 h-16 sm:w-20 sm:h-20' 
    : 'w-24 h-24 sm:w-28 sm:h-28';

  const GlobeEmblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${globeSizeClass}`}>
      <svg 
        viewBox="0 0 160 160" 
        className="w-full h-full drop-shadow-xs"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="gatGlobeGrad" cx="45%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#253e8a"/>
            <stop offset="70%" stopColor="#182b68"/>
            <stop offset="100%" stopColor="#0f1d4a"/>
          </radialGradient>
          <clipPath id="gatGlobeClip">
            <circle cx="80" cy="80" r="42" />
          </clipPath>
        </defs>

        {/* Globe Base Sphere */}
        <circle cx="80" cy="80" r="42" fill="url(#gatGlobeGrad)" stroke="#182b68" strokeWidth="1" />

        {/* Grid and Continents clipped inside sphere */}
        <g clipPath="url(#gatGlobeClip)">
          {/* Latitude / Parallel Lines */}
          <ellipse cx="80" cy="62" rx="38" ry="10" fill="none" stroke="#7e9bd1" strokeWidth="0.8" opacity="0.6"/>
          <ellipse cx="80" cy="80" rx="42" ry="11" fill="none" stroke="#7e9bd1" strokeWidth="0.8" opacity="0.6"/>
          <ellipse cx="80" cy="98" rx="38" ry="10" fill="none" stroke="#7e9bd1" strokeWidth="0.8" opacity="0.6"/>

          {/* Longitude / Meridian Lines */}
          <ellipse cx="80" cy="80" rx="14" ry="42" fill="none" stroke="#7e9bd1" strokeWidth="0.8" opacity="0.6"/>
          <ellipse cx="80" cy="80" rx="28" ry="42" fill="none" stroke="#7e9bd1" strokeWidth="0.8" opacity="0.6"/>
          <line x1="80" y1="38" x2="80" y2="122" stroke="#7e9bd1" strokeWidth="0.8" opacity="0.6"/>

          {/* Continents in Yellow/Olive Gold (#D4CF38) */}
          <path d="M60,52 C66,48 74,46 84,48 C94,50 105,54 112,60 C117,65 118,71 114,76 C110,79 104,78 99,74 C94,71 90,73 85,69 C80,66 75,67 70,62 C65,58 62,55 60,52 Z" fill="#D4CF38"/>
          <path d="M74,66 C77,64 82,68 83,72 C84,77 80,82 77,86 C74,82 72,76 70,71 C71,68 72,66 74,66 Z" fill="#D4CF38"/>
          <path d="M94,75 C97,73 102,76 105,80 C107,83 103,86 100,86 C97,85 93,80 94,75 Z" fill="#D4CF38"/>
          <circle cx="108" cy="89" r="2.5" fill="#D4CF38"/>
          <circle cx="99" cy="91" r="2.2" fill="#D4CF38"/>
          <path d="M50,60 C54,58 59,62 61,66 C62,71 58,76 53,79 C50,74 48,66 50,60 Z" fill="#D4CF38"/>
          <path d="M102,96 C107,93 113,94 116,99 C118,104 113,109 107,109 C103,107 100,101 102,96 Z" fill="#D4CF38"/>
        </g>

        {/* Two Crossing Orbital Rings */}
        <path d="M18,54 C9,67 11,83 28,97 C45,111 68,118 94,115" fill="none" stroke="#9ABCE8" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M94,115 C115,112 138,101 148,85 C156,72 151,59 134,48 C113,35 81,38 56,48" fill="none" stroke="#E2EDF9" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M40,58 L120,102" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>

        <path d="M142,54 C151,67 149,83 132,97 C115,111 92,118 66,115" fill="none" stroke="#9ABCE8" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M66,115 C45,112 22,101 12,85 C4,72 9,59 26,48 C47,35 79,38 104,48" fill="none" stroke="#E2EDF9" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M120,58 L40,102" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>

        {/* Center Orbital Intersection Glow */}
        <circle cx="80" cy="80" r="3" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );

  // If layout is vertical (for login card / hero emblem)
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {GlobeEmblem}
        <div className="mt-2.5 space-y-0.5">
          <span className="block font-extrabold text-[#0C2C47] text-sm sm:text-base tracking-wide uppercase leading-tight">
            GLOBAL ACADEMY
          </span>
          <span className="block font-extrabold text-[#0C2C47] text-sm sm:text-base tracking-wider uppercase leading-tight">
            OF TECHNOLOGY
          </span>
          {showSubtitle && (
            <>
              <span className="block text-[11px] sm:text-xs italic text-[#2D5652] font-medium tracking-wide pt-0.5">
                growing ahead of time
              </span>
              <span className="block text-[10px] sm:text-[11px] font-serif text-[#2D5652]/80">
                Autonomous Institute, Affiliated to VTU
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default horizontal layout (for navbar, card headers)
  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none min-w-0 ${className}`}>
      {GlobeEmblem}

      {/* College Typography */}
      <div className="flex flex-col text-left min-w-0">
        <span className={`font-extrabold tracking-tight text-[#0C2C47] leading-none truncate ${
          isSm ? 'text-xs sm:text-sm' : isLg ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
        }`}>
          GLOBAL ACADEMY
        </span>
        <span className={`font-extrabold tracking-tight text-[#0C2C47] leading-tight truncate ${
          isSm ? 'text-xs sm:text-sm' : isLg ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
        }`}>
          OF TECHNOLOGY
        </span>
        {showSubtitle && (
          <span className="text-[10px] sm:text-[11px] font-medium text-[#2D5652]/80 truncate mt-0.5">
            Autonomous Institute, Affiliated to VTU
          </span>
        )}
      </div>
    </div>
  );
};

