import React from 'react';
import { UserAccount, RoleType } from '../types';
import { GatLogo } from './common/GatLogo';
import { 
  Users, 
  ChevronDown, 
  LogOut, 
  Menu, 
  X,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount;
  canSwitchRole: boolean;
  onOpenRoleSwitcher: () => void;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const ROLE_LABELS: Record<RoleType, { title: string; set: string; badgeColor: string }> = {
  faculty_mgmt: { title: 'Management', set: 'Set 1: Faculty', badgeColor: 'bg-[#EFEAE6] text-[#0C2C47] border-[#97D3CD]' },
  principal: { title: 'Principal', set: 'Set 1: Faculty', badgeColor: 'bg-[#E4F2EA] text-[#0C2C47] border-[#97D3CD]' },
  placement_dean: { title: 'Placement Dean', set: 'Set 1: Faculty', badgeColor: 'bg-[#E4F2EA] text-[#0C2C47] border-[#97D3CD]' },
  hod: { title: 'HOD', set: 'Set 1: Faculty', badgeColor: 'bg-[#EFEAE6] text-[#0C2C47] border-[#E2A54D]' },
  pcc: { title: 'PCC (PO)', set: 'Set 2: Co-ordinators', badgeColor: 'bg-[#E4F2EA] text-[#2D5652] border-[#2D5652]/40' },
  fpc: { title: 'FPC', set: 'Set 2: Co-ordinators', badgeColor: 'bg-[#E4F2EA] text-[#2D5652] border-[#2D5652]/40' },
  spc: { title: 'SPC', set: 'Set 2: Co-ordinators', badgeColor: 'bg-[#EFEAE6] text-[#2D5652] border-[#97D3CD]' },
  student: { title: 'Student', set: 'Set 3: Student', badgeColor: 'bg-[#EFEAE6] text-[#0C2C47] border-[#E2A54D]' },
  hr: { title: 'HR Recruiter', set: 'Set 4: HR', badgeColor: 'bg-[#E4F2EA] text-[#0C2C47] border-[#97D3CD]' },
  admin: { title: 'Admin', set: 'Set 5: Admin', badgeColor: 'bg-slate-100 text-[#0C2C47] border-slate-300' }
};

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  canSwitchRole,
  onOpenRoleSwitcher,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const roleInfo = ROLE_LABELS[currentUser.role] || { title: currentUser.role, set: '', badgeColor: 'bg-[#E4F2EA] text-[#0C2C47]' };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#97D3CD]/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <GatLogo size="sm" showSubtitle={false} />
            <div className="hidden lg:block border-l border-[#97D3CD]/50 pl-3">
              <span className="font-bold text-[#0C2C47] text-sm tracking-tight block">
                Placement Portal
              </span>
              <p className="text-[10px] text-[#2D5652]">
                Career Guidance & Decision Engine
              </p>
            </div>
          </div>

          {/* Active User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {canSwitchRole ? (
              <button
                onClick={onOpenRoleSwitcher}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-[#97D3CD]/60 hover:border-[#2D5652] bg-white hover:bg-[#E4F2EA]/40 transition-all text-left max-w-[170px] sm:max-w-xs"
                title="Preview another role"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#E4F2EA] text-[#0C2C47] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0C2C47] leading-tight flex items-center gap-1">
                    <span className="truncate">{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-[#2D5652]/70 shrink-0" />
                  </div>
                  <div className="text-[10px] text-[#2D5652] leading-tight truncate hidden sm:block">
                    {roleInfo.title} · <span className="font-mono font-medium text-[#0C2C47]">{currentUser.specialId}</span>
                  </div>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-[#97D3CD]/40 text-left max-w-[170px] sm:max-w-xs">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                currentUser.role === 'student' ? 'bg-[#E2A54D]/30 text-[#0C2C47]' : 'bg-[#E4F2EA] text-[#0C2C47]'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#0C2C47] leading-tight flex items-center gap-1">
                  <span className="truncate">{currentUser.name}</span>
                  {currentUser.role === 'student' ? (
                    <Lock className="w-3 h-3 text-[#E2A54D] shrink-0" />
                  ) : null}
                </div>
                <div className="text-[10px] text-[#2D5652] leading-tight truncate hidden sm:block">
                  {roleInfo.title} · <span className="font-mono font-medium text-[#0C2C47]">{currentUser.specialId}</span>
                </div>
              </div>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0C2C47] hover:text-red-700 hover:bg-red-50 rounded-lg border border-[#97D3CD]/50 hover:border-red-200 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#0C2C47] hover:bg-[#E4F2EA] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#97D3CD]/30 bg-[#F8FAF9] px-4 py-3 space-y-2.5">
          <div className="text-xs text-[#2D5652] font-medium">
            Active: <span className="font-bold text-[#0C2C47]">{currentUser.name}</span> ({roleInfo.title}) · <span className="font-mono text-[#0C2C47]">{currentUser.specialId}</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            {canSwitchRole && (
              <button
                onClick={() => {
                  onOpenRoleSwitcher();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0C2C47] bg-white border border-[#97D3CD]/50 rounded-lg flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2D5652]" />
                  Preview Role
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#2D5652]" />
              </button>
            )}

            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
