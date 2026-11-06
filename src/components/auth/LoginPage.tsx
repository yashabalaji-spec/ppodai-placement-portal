import React, { useState } from 'react';
import { UserAccount, RoleType } from '../../types';
import { INITIAL_USERS, BRANCHES } from '../../data/mockData';
import { ROLE_LABELS } from '../Navbar';
import { GatLogo } from '../common/GatLogo';
import { PortalIcon, PortalMode } from '../common/PortalIcon';
import { 
  Lock, 
  KeyRound, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Database,
  Building,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  onOpenDbArchitecture: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenDbArchitecture
}) => {
  // 4 iconic visual modes from the uploaded images
  const [activePortalMode, setActivePortalMode] = useState<PortalMode>('student');

  // Sub-role within Placement Cell (if placement_cell is active)
  const [placementCellSubRole, setPlacementCellSubRole] = useState<RoleType>('pcc');

  const [selectedRole, setSelectedRole] = useState<RoleType>('student');
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [specialIdInput, setSpecialIdInput] = useState('1GA21CS042');
  const [passwordInput, setPasswordInput] = useState('student@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When user clicks one of the 4 big portal mode cards:
  const handlePortalModeSelect = (mode: PortalMode) => {
    setActivePortalMode(mode);
    setErrorMessage(null);

    if (mode === 'student') {
      setSelectedRole('student');
      setSpecialIdInput('1GA21CS042');
      setPasswordInput('student@2026');
    } else if (mode === 'placement_cell') {
      setSelectedRole(placementCellSubRole);
      if (placementCellSubRole === 'pcc') {
        setSpecialIdInput('PCC-OFFICER-01');
        setPasswordInput('pcc@gat2026');
      } else if (placementCellSubRole === 'fpc') {
        setSpecialIdInput('FPC-CSE-01');
        setPasswordInput('fpccse@gat2026');
      } else if (placementCellSubRole === 'spc') {
        setSpecialIdInput('SPC-1GA21CS005');
        setPasswordInput('spc@gat2026');
      } else if (placementCellSubRole === 'hod') {
        setSpecialIdInput(`HOD-${selectedBranch}-01`);
        setPasswordInput(`hod${selectedBranch.toLowerCase()}@gat2026`);
      } else if (placementCellSubRole === 'placement_dean') {
        setSpecialIdInput('GAT-DEAN-01');
        setPasswordInput('dean@gat2026');
      } else if (placementCellSubRole === 'principal') {
        setSpecialIdInput('GAT-PRIN-01');
        setPasswordInput('principal@gat2026');
      } else {
        setSpecialIdInput('GAT-MGMT-01');
        setPasswordInput('mgmt@gat2026');
      }
    } else if (mode === 'hr_staff') {
      setSelectedRole('hr');
      setSpecialIdInput('HR-AMAZON-01');
      setPasswordInput('amazon@hr2026');
    } else if (mode === 'admin') {
      setSelectedRole('admin');
      setSpecialIdInput('ADMIN-GAT-ROOT');
      setPasswordInput('admin@root2026');
    }

    // Smoothly scroll down to login form on click
    setTimeout(() => {
      const card = document.getElementById('login-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handlePlacementSubRoleChange = (subRole: RoleType) => {
    setPlacementCellSubRole(subRole);
    setSelectedRole(subRole);
    setErrorMessage(null);

    if (subRole === 'pcc') {
      setSpecialIdInput('PCC-OFFICER-01');
      setPasswordInput('pcc@gat2026');
    } else if (subRole === 'fpc') {
      setSpecialIdInput('FPC-CSE-01');
      setPasswordInput('fpccse@gat2026');
    } else if (subRole === 'spc') {
      setSpecialIdInput('SPC-1GA21CS005');
      setPasswordInput('spc@gat2026');
    } else if (subRole === 'hod') {
      setSpecialIdInput(`HOD-${selectedBranch}-01`);
      setPasswordInput(`hod${selectedBranch.toLowerCase()}@gat2026`);
    } else if (subRole === 'placement_dean') {
      setSpecialIdInput('GAT-DEAN-01');
      setPasswordInput('dean@gat2026');
    } else if (subRole === 'principal') {
      setSpecialIdInput('GAT-PRIN-01');
      setPasswordInput('principal@gat2026');
    } else {
      setSpecialIdInput('GAT-MGMT-01');
      setPasswordInput('mgmt@gat2026');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputId = specialIdInput.trim().toUpperCase();
    const inputPw = passwordInput.trim();

    // Find user by specialId, email, or usn
    let matchedUser = INITIAL_USERS.find(u => 
      u.role === selectedRole && (
        u.specialId.toUpperCase() === inputId ||
        u.email.toUpperCase() === inputId ||
        (u.usn && u.usn.toUpperCase() === inputId)
      )
    );

    // If HOD, allow any of the 15 branch codes as ID (e.g. HOD-ECE, HOD-AIML, etc.)
    if (selectedRole === 'hod' && !matchedUser) {
      const branchMatch = BRANCHES.find(b => 
        inputId.includes(b.code) || b.code === selectedBranch
      ) || BRANCHES[0];

      matchedUser = {
        id: `hod_${branchMatch.code}`,
        name: `${branchMatch.hod} (HOD ${branchMatch.code})`,
        email: `hod.${branchMatch.code.toLowerCase()}@gat.ac.in`,
        specialId: `HOD-${branchMatch.code}-01`,
        password: `hod${branchMatch.code.toLowerCase()}@gat2026`,
        role: 'hod',
        department: branchMatch.code,
        branchName: branchMatch.name,
        designation: `Professor & Head of Department - ${branchMatch.name}`
      };
    }

    if (!matchedUser) {
      setErrorMessage(`Invalid credentials for ${ROLE_LABELS[selectedRole].title}. Please verify your Special ID.`);
      return;
    }

    // Verify password if provided
    if (matchedUser.password && inputPw !== matchedUser.password) {
      setErrorMessage(`Incorrect password for ${matchedUser.name}. Required password: ${matchedUser.password}`);
      return;
    }

    onLoginSuccess(matchedUser);
  };

  // Quick 1-click test login
  const handleQuickLogin = (role: RoleType, branchCode?: string) => {
    let targetUser = INITIAL_USERS.find(u => u.role === role);
    if (role === 'hod' && branchCode) {
      const bObj = BRANCHES.find(b => b.code === branchCode) || BRANCHES[0];
      targetUser = {
        id: `hod_${bObj.code}`,
        name: `${bObj.hod} (HOD ${bObj.code})`,
        email: `hod.${bObj.code.toLowerCase()}@gat.ac.in`,
        specialId: `HOD-${bObj.code}-01`,
        password: `hod${bObj.code.toLowerCase()}@gat2026`,
        role: 'hod',
        department: bObj.code,
        branchName: bObj.name,
        designation: `Professor & Head of Department - ${bObj.name}`
      };
    }
    if (targetUser) {
      onLoginSuccess(targetUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between">
      
      {/* Top University Brand Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#97D3CD]/40 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <GatLogo size="md" showSubtitle={true} />

          <button
            onClick={onOpenDbArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0C2C47] bg-[#E4F2EA] hover:bg-[#97D3CD]/40 rounded-lg border border-[#97D3CD]/60 transition-colors shrink-0 cursor-pointer"
            title="Database Schema & Architecture"
          >
            <Database className="w-3.5 h-3.5 text-[#2D5652]" />
            <span className="hidden sm:inline">DB Architecture</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-2xl">
          
          {/* Official GAT Logo Emblem & Headline */}
          <div className="text-center mb-6 flex flex-col items-center">
            <GatLogo size="lg" layout="vertical" showSubtitle={true} className="mb-3" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4F2EA] border border-[#97D3CD]/60 text-xs font-bold text-[#0C2C47] mb-1">
              <span>Campus Recruitment Portal</span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D5652] mt-0.5 font-medium">
              Select your role below to sign in with your ID & password.
            </p>
          </div>

          {/* THE 4 ICON MODES - Responsive Grid, No Text Cut */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5">
            <PortalIcon
              mode="student"
              isSelected={activePortalMode === 'student'}
              onClick={() => handlePortalModeSelect('student')}
            />

            <PortalIcon
              mode="placement_cell"
              isSelected={activePortalMode === 'placement_cell'}
              onClick={() => handlePortalModeSelect('placement_cell')}
            />

            <PortalIcon
              mode="hr_staff"
              isSelected={activePortalMode === 'hr_staff'}
              onClick={() => handlePortalModeSelect('hr_staff')}
            />

            <PortalIcon
              mode="admin"
              isSelected={activePortalMode === 'admin'}
              onClick={() => handlePortalModeSelect('admin')}
            />
          </div>

          {/* Login Card Container */}
          <div id="login-card" className="bg-white border border-[#97D3CD]/60 shadow-sm rounded-2xl p-5 sm:p-7 scroll-mt-6">
            
            <div className="border-b border-[#97D3CD]/20 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#0C2C47] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#E2A54D]" />
                  <span>
                    {activePortalMode === 'student' && 'Student Login'}
                    {activePortalMode === 'placement_cell' && 'Placement Cell Login'}
                    {activePortalMode === 'hr_staff' && 'HR Recruiter Login'}
                    {activePortalMode === 'admin' && 'Admin Login'}
                  </span>
                </h2>
                <p className="text-[11px] text-[#2D5652]/70 mt-0.5">
                  Enter your assigned credentials
                </p>
              </div>

              <span className="self-start sm:self-auto text-[11px] font-bold font-mono px-2.5 py-0.5 rounded bg-[#E4F2EA] text-[#0C2C47] border border-[#97D3CD]/50">
                {ROLE_LABELS[selectedRole].title}
              </span>
            </div>

            {/* If Placement Cell is active, show the sub-role selector buttons */}
            {activePortalMode === 'placement_cell' && (
              <div className="mb-4 p-3 bg-[#EFEAE6]/50 border border-[#97D3CD]/40 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-[#0C2C47] block uppercase tracking-wider">
                  Select Role / Unit:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('pcc')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'pcc'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    PCC (PO)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('fpc')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'fpc'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    FPC (Faculty)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('spc')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'spc'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    SPC (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('hod')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'hod'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    HOD
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('placement_dean')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'placement_dean'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    Placement Dean
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('principal')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'principal'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    Principal
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlacementSubRoleChange('faculty_mgmt')}
                    className={`col-span-2 px-2.5 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                      placementCellSubRole === 'faculty_mgmt'
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs'
                        : 'bg-white text-[#0C2C47] border-[#97D3CD]/60 hover:bg-[#E4F2EA]'
                    }`}
                  >
                    Management
                  </button>
                </div>
              </div>
            )}

            {/* If HOD: Select branch */}
            {selectedRole === 'hod' && (
              <div className="mb-4 p-3 bg-[#E4F2EA]/60 border border-[#97D3CD] rounded-xl">
                <label className="text-xs font-semibold text-[#0C2C47] block mb-1">
                  Department:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSpecialIdInput(`HOD-${e.target.value}-01`);
                    setPasswordInput(`hod${e.target.value.toLowerCase()}@gat2026`);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#97D3CD] rounded-md font-medium text-[#0C2C47]"
                >
                  {BRANCHES.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name} ({b.hod})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              
              {/* Special ID / USN field */}
              <div>
                <label className="text-xs font-bold text-[#0C2C47] block mb-1">
                  {selectedRole === 'student' ? 'USN / ID *' : 
                   selectedRole === 'hr' ? 'HR ID *' :
                   selectedRole === 'admin' ? 'Admin ID *' :
                   'Special Login ID *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2D5652]/60">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedRole === 'student' ? 'e.g. 1GA21CS042' :
                      selectedRole === 'hr' ? 'e.g. HR-AMAZON-01' :
                      selectedRole === 'admin' ? 'e.g. ADMIN-GAT-ROOT' :
                      'e.g. PCC-OFFICER-01'
                    }
                    value={specialIdInput}
                    onChange={(e) => setSpecialIdInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#97D3CD]/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2C47] font-mono text-[#0C2C47]"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="text-xs font-bold text-[#0C2C47] block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2D5652]/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-[#97D3CD]/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2C47] font-mono text-[#0C2C47]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2D5652]/60 hover:text-[#0C2C47]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button - Concise & User-Friendly */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Quick 1-Click Credential Demo Pills */}
            <div className="mt-5 pt-4 border-t border-[#97D3CD]/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5652] block mb-2">
                Demo Accounts (1-Click)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    handlePortalModeSelect('student');
                    setSpecialIdInput('1GA21CS042');
                    setPasswordInput('student@2026');
                  }}
                  className="p-2 text-left rounded-lg bg-[#E4F2EA] hover:bg-[#97D3CD]/30 border border-[#97D3CD]/60 text-[#0C2C47] transition-colors"
                >
                  <div className="font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2D5652]"></span>
                    Student
                  </div>
                  <div className="text-[10px] text-[#2D5652] font-mono truncate">1GA21CS042</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handlePortalModeSelect('placement_cell');
                    handlePlacementSubRoleChange('pcc');
                    setSpecialIdInput('PCC-OFFICER-01');
                    setPasswordInput('pcc@gat2026');
                  }}
                  className="p-2 text-left rounded-lg bg-[#EFEAE6] hover:bg-[#E2A54D]/20 border border-[#E2A54D]/40 text-[#0C2C47] transition-colors"
                >
                  <div className="font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#E2A54D]"></span>
                    PCC (PO)
                  </div>
                  <div className="text-[10px] text-[#2D5652] font-mono truncate">PCC-OFFICER-01</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handlePortalModeSelect('hr_staff');
                    setSpecialIdInput('HR-AMAZON-01');
                    setPasswordInput('amazon@hr2026');
                  }}
                  className="p-2 text-left rounded-lg bg-[#E4F2EA] hover:bg-[#97D3CD]/30 border border-[#2D5652]/30 text-[#0C2C47] transition-colors"
                >
                  <div className="font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2D5652]"></span>
                    HR Recruiter
                  </div>
                  <div className="text-[10px] text-[#2D5652] font-mono truncate">HR-AMAZON-01</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handlePortalModeSelect('admin');
                    setSpecialIdInput('ADMIN-GAT-ROOT');
                    setPasswordInput('admin@root2026');
                  }}
                  className="p-2 text-left rounded-lg bg-[#EFEAE6] hover:bg-slate-200 border border-slate-300 text-[#0C2C47] transition-colors"
                >
                  <div className="font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0C2C47]"></span>
                    Admin
                  </div>
                  <div className="text-[10px] text-[#2D5652] font-mono truncate">ADMIN-GAT-ROOT</div>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 border-t border-[#97D3CD]/30 bg-white text-center text-xs text-[#2D5652] px-4">
        <p>Global Academy of Technology · Autonomous Institute Affiliated to VTU · Bengaluru</p>
      </footer>

    </div>
  );
};
