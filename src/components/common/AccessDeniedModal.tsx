import React from 'react';
import { ShieldAlert, Lock, X, LogOut, ArrowLeft } from 'lucide-react';
import { RoleType } from '../../types';
import { ROLE_LABELS } from '../Navbar';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  targetRole?: RoleType;
  currentRole: RoleType;
  onLogout?: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  reason,
  targetRole,
  currentRole,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#97D3CD]/50 overflow-hidden text-center p-5 sm:p-6 space-y-4">
        
        {/* Lock Animation Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-[#EFEAE6] border-2 border-[#E2A54D]/50 flex items-center justify-center text-[#0C2C47]">
          <Lock className="w-7 h-7 text-[#E2A54D]" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEAE6] text-[#0C2C47] text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#E2A54D]" />
            <span>Role Restricted</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#0C2C47]">
            Access Restricted
          </h3>

          <p className="text-xs text-[#2D5652] mt-1.5 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Transition details */}
        <div className="p-3 bg-[#F8FAF9] border border-[#97D3CD]/40 rounded-xl text-xs flex items-center justify-between font-mono">
          <div>
            <span className="text-[10px] text-[#2D5652]/70 block uppercase font-sans font-bold">Current</span>
            <span className="font-bold text-[#0C2C47]">{ROLE_LABELS[currentRole]?.title || currentRole}</span>
          </div>
          {targetRole && (
            <>
              <span className="text-[#2D5652]/50">➔</span>
              <div>
                <span className="text-[10px] text-[#2D5652]/70 block uppercase font-sans font-bold">Target (Locked)</span>
                <span className="font-bold text-[#0C2C47] line-through">{ROLE_LABELS[targetRole]?.title || targetRole}</span>
              </div>
            </>
          )}
        </div>

        {/* Institutional policy notice */}
        <div className="text-[11px] text-[#2D5652] bg-[#E4F2EA] border border-[#97D3CD] p-2.5 rounded-lg text-left">
          <strong>Access Policy:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#2D5652]">
            <li>HODs are restricted to their assigned department.</li>
            <li>Students and HR are restricted to their specific portals.</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-[#0C2C47] hover:bg-[#2D5652] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-[#EFEAE6] text-[#0C2C47] hover:bg-[#E2A54D]/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Log out and sign in as different user"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
