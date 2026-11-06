import React, { useState } from 'react';
import { UserAccount, RoleType, checkRoleAccess } from '../types';
import { INITIAL_USERS, BRANCHES } from '../data/mockData';
import { 
  X, 
  Check, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  UserCheck, 
  Building, 
  Layers,
  ArrowRight,
  Lock,
  LogOut,
  ShieldAlert
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
  onAccessDenied?: (reason: string, targetRole: RoleType) => void;
  onLogout?: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onAccessDenied,
  onLogout
}) => {
  const [deniedToast, setDeniedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAttemptSwitch = (targetUser: UserAccount) => {
    const access = checkRoleAccess(
      currentUser.role, 
      targetUser.role, 
      currentUser.department, 
      targetUser.department
    );

    if (!access.allowed) {
      const reason = access.reason || 'Role transition not permitted under GAT PPODAI RBAC policy.';
      setDeniedToast(reason);
      onAccessDenied?.(reason, targetUser.role);
      return;
    }

    setDeniedToast(null);
    onSelectUser(targetUser);
    onClose();
  };

  const handleSelectHOD = (branchCode: string) => {
    const branch = BRANCHES.find(b => b.code === branchCode) || BRANCHES[0];
    const hodUser: UserAccount = {
      id: `hod_${branch.code}`,
      name: `${branch.hod} (HOD ${branch.code})`,
      email: `hod.${branch.code.toLowerCase()}@gat.ac.in`,
      specialId: `HOD-${branch.code}-01`,
      password: `hod${branch.code.toLowerCase()}@gat2026`,
      role: 'hod',
      department: branch.code,
      branchName: branch.name,
      designation: `Professor & Head of Department - ${branch.name}`
    };

    handleAttemptSwitch(hodUser);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#0C2C47] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#97D3CD]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">Switch Role</h2>
              <p className="text-xs text-[#E4F2EA]">
                Current: <span className="font-bold text-[#E2A54D] uppercase">{currentUser.role}</span>
                {currentUser.department ? ` (${currentUser.department})` : ''} · ID: {currentUser.specialId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">

          {/* Denied Alert Toast */}
          {deniedToast && (
            <div className="p-3 bg-[#EFEAE6] border border-[#E2A54D] rounded-xl text-xs text-[#0C2C47] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#E2A54D] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Access Restricted</span>
                <p className="mt-0.5 text-[#2D5652]">{deniedToast}</p>
              </div>
              <button 
                onClick={() => setDeniedToast(null)}
                className="text-[#0C2C47] hover:text-[#2D5652] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Role specific notice */}
          {currentUser.role === 'student' ? (
            <div className="p-3 bg-[#EFEAE6] border border-[#E2A54D] rounded-xl text-xs text-[#0C2C47] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E2A54D] shrink-0" />
                <div>
                  <span className="font-bold block">Student Session Locked</span>
                  <p className="text-[11px] text-[#2D5652] mt-0.5">
                    Log out to switch to another role.
                  </p>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0C2C47] hover:bg-[#2D5652] text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          ) : currentUser.role === 'hr' ? (
            <div className="p-3 bg-[#EFEAE6] border border-[#97D3CD] rounded-xl text-xs text-[#0C2C47] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2D5652] shrink-0" />
              <div>
                <span className="font-bold block">HR Recruiter Session</span>
                <p className="text-[11px] text-[#2D5652] mt-0.5">
                  Restricted to recruiter portal.
                </p>
              </div>
            </div>
          ) : currentUser.role === 'hod' ? (
            <div className="p-3 bg-[#E4F2EA] border border-[#2D5652]/40 rounded-xl text-xs text-[#2D5652] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D5652] shrink-0" />
              <span>
                <strong>HOD Scope:</strong> Dept of <strong>{currentUser.department}</strong>.
              </span>
            </div>
          ) : (
            <div className="p-2.5 bg-[#E4F2EA]/40 border border-[#97D3CD]/50 rounded-lg text-xs text-[#2D5652] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D5652] shrink-0" />
              <span>Select a role to switch:</span>
            </div>
          )}

          {/* SET 1: FACULTY */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-[#2D5652]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2C47]">
                Set 1: Faculty (Management, Principal, Dean, HOD)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_USERS.filter(u => u.role === 'faculty_mgmt' || u.role === 'principal' || u.role === 'placement_dean').map(user => {
                const isSelected = currentUser.id === user.id;
                const access = checkRoleAccess(currentUser.role, user.role, currentUser.department, user.department);
                const isLocked = !access.allowed;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleAttemptSwitch(user)}
                    className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#0C2C47] bg-[#E4F2EA] ring-2 ring-[#0C2C47]/20' 
                        : isLocked
                        ? 'border-[#97D3CD]/30 bg-[#F8FAF9] opacity-60 hover:opacity-100 hover:border-[#E2A54D] cursor-not-allowed'
                        : 'border-[#97D3CD]/40 hover:border-[#2D5652] hover:bg-[#E4F2EA]/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#0C2C47] flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-[#E2A54D] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#2D5652]">{user.designation}</div>
                      <div className="text-[10px] text-[#0C2C47]/70 font-mono mt-0.5">{user.email}</div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-[#0C2C47] shrink-0" />
                    ) : isLocked ? (
                      <span className="text-[10px] text-[#0C2C47] font-bold bg-[#EFEAE6] px-1.5 py-0.5 rounded">
                        LOCKED
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {/* HOD with 15 branches selector */}
              <div className="col-span-1 sm:col-span-2 p-3 rounded-xl border border-[#97D3CD]/60 bg-[#E4F2EA]/30">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-[#0C2C47]">HOD (15 Branches)</span>
                    <p className="text-[11px] text-[#2D5652]">
                      {currentUser.role === 'hod' 
                        ? `Restricted to: ${currentUser.department}` 
                        : 'Departmental statistics & students'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#0C2C47] bg-[#97D3CD]/40 px-2 py-0.5 rounded">15 Branches</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BRANCHES.map(b => {
                    const isCurrentHOD = currentUser.role === 'hod' && currentUser.department === b.code;
                    const access = checkRoleAccess(currentUser.role, 'hod', currentUser.department, b.code);
                    const isBranchLocked = !access.allowed;

                    return (
                      <button
                        key={b.code}
                        onClick={() => handleSelectHOD(b.code)}
                        className={`px-2 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrentHOD
                            ? 'bg-[#0C2C47] text-white shadow-xs'
                            : isBranchLocked
                            ? 'bg-[#EFEAE6] text-[#2D5652]/50 border border-[#97D3CD]/30 opacity-60 hover:opacity-100 cursor-not-allowed'
                            : 'bg-white text-[#0C2C47] border border-[#97D3CD]/60 hover:border-[#0C2C47] hover:bg-[#E4F2EA]'
                        }`}
                        title={isBranchLocked ? `Locked: ${b.code}` : `${b.name} (${b.hod})`}
                      >
                        <span>{b.code}</span>
                        {isBranchLocked && <Lock className="w-2.5 h-2.5 text-[#E2A54D]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SET 2: PLACEMENT CO-ORDINATORS */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-[#2D5652]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2C47]">
                Set 2: Coordinators (PCC, FPC, SPC)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {INITIAL_USERS.filter(u => u.role === 'pcc' || u.role === 'fpc' || u.role === 'spc').map(user => {
                const isSelected = currentUser.id === user.id;
                const access = checkRoleAccess(currentUser.role, user.role, currentUser.department, user.department);
                const isLocked = !access.allowed;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleAttemptSwitch(user)}
                    className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#0C2C47] bg-[#E4F2EA] ring-2 ring-[#0C2C47]/20' 
                        : isLocked
                        ? 'border-[#97D3CD]/30 bg-[#F8FAF9] opacity-60 hover:opacity-100 hover:border-[#E2A54D] cursor-not-allowed'
                        : 'border-[#97D3CD]/40 hover:border-[#2D5652] hover:bg-[#E4F2EA]/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#0C2C47] flex items-center gap-1">
                        <span>{user.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-[#E2A54D] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#2D5652] font-medium">{user.designation}</div>
                      <div className="text-[10px] text-[#0C2C47]/70 font-mono mt-0.5">{user.email}</div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-[#0C2C47] shrink-0" />
                    ) : isLocked ? (
                      <span className="text-[10px] text-[#0C2C47] font-bold bg-[#EFEAE6] px-1 py-0.2 rounded">
                        LOCKED
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SET 3: STUDENT */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-[#2D5652]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2C47]">
                Set 3: Student (USN 1GA21CS042)
              </h3>
            </div>
            {INITIAL_USERS.filter(u => u.role === 'student').map(user => {
              const isSelected = currentUser.id === user.id;
              const access = checkRoleAccess(currentUser.role, user.role, currentUser.department, user.department);
              const isLocked = !access.allowed;

              return (
                <button
                  key={user.id}
                  onClick={() => handleAttemptSwitch(user)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                    isSelected 
                      ? 'border-[#0C2C47] bg-[#E4F2EA] ring-2 ring-[#0C2C47]/20' 
                      : isLocked
                      ? 'border-[#97D3CD]/30 bg-[#F8FAF9] opacity-60 hover:opacity-100 hover:border-[#E2A54D] cursor-not-allowed'
                      : 'border-[#97D3CD]/40 hover:border-[#2D5652] hover:bg-[#E4F2EA]/30'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-[#0C2C47] flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-[10px] font-mono bg-[#E2A54D] text-[#0C2C47] px-1.5 py-0.5 rounded font-bold">USN: {user.usn}</span>
                      {isLocked && <Lock className="w-3 h-3 text-[#E2A54D] shrink-0" />}
                    </div>
                    <div className="text-[11px] text-[#2D5652]">
                      CSE · Profile, skills, resumes & campus schedule
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0C2C47] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* SET 4 & SET 5: HR & ADMIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* SET 4: HR */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-[#2D5652]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2C47]">
                  Set 4: Corporate HR
                </h3>
              </div>
              {INITIAL_USERS.filter(u => u.role === 'hr').map(user => {
                const isSelected = currentUser.id === user.id;
                const access = checkRoleAccess(currentUser.role, user.role, currentUser.department, user.department);
                const isLocked = !access.allowed;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleAttemptSwitch(user)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#0C2C47] bg-[#E4F2EA] ring-2 ring-[#0C2C47]/20' 
                        : isLocked
                        ? 'border-[#97D3CD]/30 bg-[#F8FAF9] opacity-60 hover:opacity-100 hover:border-[#E2A54D] cursor-not-allowed'
                        : 'border-[#97D3CD]/40 hover:border-[#2D5652] hover:bg-[#E4F2EA]/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#0C2C47] flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-[#E2A54D] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#2D5652]">{user.company} · Recruiter</div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-[#0C2C47] shrink-0" />
                    ) : isLocked ? (
                      <span className="text-[10px] text-[#0C2C47] font-bold bg-[#EFEAE6] px-1 py-0.2 rounded">
                        LOCKED
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* SET 5: ADMIN */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5652]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2C47]">
                  Set 5: Admin / Super User
                </h3>
              </div>
              {INITIAL_USERS.filter(u => u.role === 'admin').map(user => {
                const isSelected = currentUser.id === user.id;
                const access = checkRoleAccess(currentUser.role, user.role, currentUser.department, user.department);
                const isLocked = !access.allowed;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleAttemptSwitch(user)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#0C2C47] bg-[#E4F2EA] ring-2 ring-[#0C2C47]/20' 
                        : isLocked
                        ? 'border-[#97D3CD]/30 bg-[#F8FAF9] opacity-60 hover:opacity-100 hover:border-[#E2A54D] cursor-not-allowed'
                        : 'border-[#97D3CD]/40 hover:border-[#2D5652] hover:bg-[#E4F2EA]/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#0C2C47] flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-[#E2A54D] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#2D5652]">{user.designation}</div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-[#0C2C47] shrink-0" />
                    ) : isLocked ? (
                      <span className="text-[10px] text-[#0C2C47] font-bold bg-[#EFEAE6] px-1 py-0.2 rounded">
                        LOCKED
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#F8FAF9] border-t border-[#97D3CD]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs text-[#2D5652]">
            Session: <strong className="text-[#0C2C47]">{currentUser.name}</strong> ({currentUser.specialId})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
