import React from 'react';

export type PortalMode = 'student' | 'placement_cell' | 'hr_staff' | 'admin';

interface PortalIconProps {
  mode: PortalMode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PortalIcon: React.FC<PortalIconProps> = ({
  mode,
  isSelected = false,
  onClick,
  className = '',
  size = 'md'
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-between text-center rounded-xl border transition-all cursor-pointer overflow-hidden p-2.5 sm:p-3 w-full ${
        isSelected
          ? 'border-[#0C2C47] bg-[#E4F2EA]/40 ring-2 ring-[#0C2C47] shadow-sm'
          : 'border-[#97D3CD]/60 bg-white hover:border-[#2D5652] hover:bg-[#EFEAE6]/30'
      } ${className}`}
    >
      {/* 1. STUDENT ICON */}
      {mode === 'student' && (
        <>
          <div className="w-full flex-1 flex flex-col items-center justify-center py-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#E4F2EA] flex items-center justify-center p-1 border border-[#97D3CD]/50">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,15 88,32 50,48 12,32" fill="#97D3CD" stroke="#0C2C47" strokeWidth="4" strokeLinejoin="round" />
                <path d="M30 40 L30 58 C30 68, 70 68, 70 58 L70 40" fill="#2D5652" stroke="#0C2C47" strokeWidth="4" />
                <path d="M78 30 C84 38, 86 48, 85 55" stroke="#E2A54D" strokeWidth="3" strokeLinecap="round" />
                <circle cx="85" cy="57" r="3" fill="#E2A54D" />
                <rect x="22" y="70" width="56" height="18" rx="8" fill="#EFEAE6" stroke="#0C2C47" strokeWidth="4" />
                <rect x="44" y="68" width="12" height="22" rx="2" fill="#E2A54D" stroke="#0C2C47" strokeWidth="3" />
              </svg>
            </div>
          </div>
          <div className="w-full mt-1 border-t border-[#97D3CD]/30 pt-1">
            <span className="font-bold text-xs sm:text-sm text-[#0C2C47] block truncate">
              Student
            </span>
          </div>
        </>
      )}

      {/* 2. PLACEMENT CELL ICON */}
      {mode === 'placement_cell' && (
        <>
          <div className="w-full flex-1 flex flex-col items-center justify-center py-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#EFEAE6] flex items-center justify-center p-1 border border-[#E2A54D]/40">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M48 18 L24 30 L24 72 L62 72 L62 26 Z" fill="#E4F2EA" stroke="#0C2C47" strokeWidth="4" strokeLinejoin="round" />
                <rect x="16" y="40" width="14" height="32" fill="#97D3CD" stroke="#0C2C47" strokeWidth="3" />
                <line x1="32" y1="36" x2="36" y2="36" stroke="#0C2C47" strokeWidth="3" strokeLinecap="round" />
                <line x1="32" y1="44" x2="36" y2="44" stroke="#0C2C47" strokeWidth="3" strokeLinecap="round" />
                <path d="M26 68 L58 36 L76 18 M64 18 L76 18 L76 30" stroke="#E2A54D" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="46" y="54" width="34" height="24" rx="4" fill="#2D5652" stroke="#0C2C47" strokeWidth="3.5" />
                <path d="M57 54 L57 48 C57 46, 69 46, 69 48 L69 54" stroke="#0C2C47" strokeWidth="3" fill="none" />
              </svg>
            </div>
          </div>
          <div className="w-full mt-1 border-t border-[#97D3CD]/30 pt-1">
            <span className="font-bold text-xs sm:text-sm text-[#0C2C47] block truncate">
              Placement Cell
            </span>
          </div>
        </>
      )}

      {/* 3. HR (STAFF) ICON */}
      {mode === 'hr_staff' && (
        <>
          <div className="w-full flex-1 flex flex-col items-center justify-center py-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#E4F2EA] flex items-center justify-center p-1 border border-[#2D5652]/30">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="38" y="16" width="46" height="66" rx="6" fill="#EFEAE6" stroke="#0C2C47" strokeWidth="4" />
                <rect x="52" y="12" width="18" height="8" rx="2" fill="#E2A54D" stroke="#0C2C47" strokeWidth="3" />
                <circle cx="50" cy="32" r="3.5" fill="#2D5652" />
                <line x1="58" y1="32" x2="74" y2="32" stroke="#0C2C47" strokeWidth="3" strokeLinecap="round" />
                <path d="M47 46 L51 50 L57 42" stroke="#2D5652" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="62" y1="46" x2="74" y2="46" stroke="#0C2C47" strokeWidth="3" strokeLinecap="round" />
                <circle cx="28" cy="36" r="12" fill="#97D3CD" stroke="#0C2C47" strokeWidth="4" />
                <path d="M12 76 C12 60, 44 60, 44 76 Z" fill="#2D5652" stroke="#0C2C47" strokeWidth="4" />
              </svg>
            </div>
          </div>
          <div className="w-full mt-1 border-t border-[#97D3CD]/30 pt-1">
            <span className="font-bold text-xs sm:text-sm text-[#0C2C47] block truncate">
              HR / Recruiter
            </span>
          </div>
        </>
      )}

      {/* 4. ADMIN ICON */}
      {mode === 'admin' && (
        <>
          <div className="w-full flex-1 flex flex-col items-center justify-center py-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#EFEAE6] flex items-center justify-center p-1 border border-[#97D3CD]/40">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="36" cy="46" r="18" fill="#97D3CD" stroke="#0C2C47" strokeWidth="4" />
                <circle cx="36" cy="46" r="7" fill="#0C2C47" stroke="#0C2C47" strokeWidth="2" />
                <rect x="33" y="24" width="6" height="6" fill="#0C2C47" rx="1" />
                <rect x="33" y="62" width="6" height="6" fill="#0C2C47" rx="1" />
                <rect x="14" y="43" width="6" height="6" fill="#0C2C47" rx="1" />
                <rect x="52" y="43" width="6" height="6" fill="#0C2C47" rx="1" />
                <circle cx="68" cy="24" r="8" fill="#E2A54D" stroke="#0C2C47" strokeWidth="3.5" />
                <path d="M50 56 Q66 50 82 56 Q82 78 66 90 Q50 78 50 56 Z" fill="#2D5652" stroke="#0C2C47" strokeWidth="4" />
                <path d="M58 72 L64 78 L74 66" stroke="#EFEAE6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="w-full mt-1 border-t border-[#97D3CD]/30 pt-1">
            <span className="font-bold text-xs sm:text-sm text-[#0C2C47] block truncate">
              Admin
            </span>
          </div>
        </>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E2A54D] ring-2 ring-[#0C2C47]"></span>
      )}
    </button>
  );
};
