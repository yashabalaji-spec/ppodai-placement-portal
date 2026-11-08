import React, { useState } from 'react';
import { UserAccount, RoleType } from '../../types';
import { BRANCHES } from '../../data/mockData';
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
  const [specialIdInput, setSpecialIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // When user clicks one of the 4 big portal mode cards:
  const handlePortalModeSelect = (mode: PortalMode) => {
  setActivePortalMode(mode);
  setErrorMessage(null);
  setSpecialIdInput('');
  setPasswordInput('');

  if (mode === 'student') {
    setSelectedRole('student');
  } else if (mode === 'placement_cell') {
    setSelectedRole(placementCellSubRole);
  } else if (mode === 'hr_staff') {
    setSelectedRole('hr');
  } else if (mode === 'admin') {
    setSelectedRole('admin');
  }

  setTimeout(() => {
    document.getElementById('login-card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, 100);
};

  const handlePlacementSubRoleChange = (subRole: RoleType) => {
  setPlacementCellSubRole(subRole);
  setSelectedRole(subRole);
  setErrorMessage(null);
  setSpecialIdInput('');
  setPasswordInput('');
};

  const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage(null);
  setIsLoggingIn(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        identifier: specialIdInput.trim(),
        password: passwordInput,
        role: selectedRole
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(
        data.message || 'Login failed. Please check your credentials.'
      );
      return;
    }

    onLoginSuccess(data.user);
  } catch (error) {
    console.error('Login request failed:', error);
    setErrorMessage('Unable to connect to the server. Please try again.');
  } finally {
    setIsLoggingIn(false);
  }
};

// PASTE THE NEW handleForgotPassword FUNCTION HERE
const handleForgotPassword = async () => {
  if (!forgotIdentifier.trim()) {
    setForgotMessage('Please enter your registered ID, USN or email.');
    return;
  }

  setIsRequestingOtp(true);
  setForgotMessage('');
  setDemoOtp('');

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        identifier: forgotIdentifier.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setForgotMessage(data.message || 'Unable to request OTP.');
      return;
    }

    setForgotMessage(data.message || 'OTP request processed.');

    if (data.demoOtp) {
      setDemoOtp(data.demoOtp);
    }
  } catch (error) {
    console.error('Forgot password request failed:', error);
    setForgotMessage('Unable to connect to the server. Please try again.');
  } finally {
    setIsRequestingOtp(false);
  }
};

const handleResetPassword = async () => {
  setForgotMessage('');

  if (!/^\d{6}$/.test(forgotOtp)) {
    setForgotMessage('Enter the six-digit OTP.');
    return;
  }

  if (newPassword.length < 12) {
    setForgotMessage('Password must contain at least 12 characters.');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    setForgotMessage('Passwords do not match.');
    return;
  }

  setIsResettingPassword(true);

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        identifier: forgotIdentifier.trim(),
        otp: forgotOtp,
        newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setForgotMessage(data.message || 'Password reset failed.');
      return;
    }

    setForgotMessage('Password reset successfully! You can now sign in.');
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setDemoOtp('');
  } catch (error) {
    console.error('Password reset request failed:', error);
    setForgotMessage('Unable to connect to the server. Please try again.');
  } finally {
    setIsResettingPassword(false);
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
                    setSpecialIdInput('');
                    setPasswordInput('');
                    setErrorMessage(null);
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
              {/* Forgot Password Link */}
              <div className="flex justify-end">
              <button
              type="button"
              onClick={() => {
              setForgotIdentifier(specialIdInput);
              setForgotMessage('');
              setDemoOtp('');
              setShowForgotPassword(true);
             }}
             className="text-xs font-semibold text-[#0C2C47] hover:text-[#2D5652] hover:underline"
             >
             Forgot Password?
             </button>
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
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
              <span>{isLoggingIn ? 'Signing In...' : 'Sign In'}</span>
              {!isLoggingIn && <ArrowRight className="w-4 h-4" />}
              </button>

            </form>
          </div>

        </div>
      </div>
{/* Forgot Password Popup */}
{showForgotPassword && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0C2C47]">
          Reset Password
        </h2>
        <button
          type="button"
          onClick={() => setShowForgotPassword(false)}
          className="text-xl text-gray-500 hover:text-gray-800"
        >
          ×
        </button>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Enter your registered ID, USN or email to request a password-reset OTP.
      </p>

      <label className="mb-1 block text-xs font-bold text-[#0C2C47]">
        Registered ID / USN / Email
      </label>

      <input
        type="text"
        value={forgotIdentifier}
        onChange={(e) => setForgotIdentifier(e.target.value)}
        placeholder="Enter your registered ID or email"
        className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      <button
        type="button"
        onClick={handleForgotPassword}
        disabled={isRequestingOtp}
        className="w-full rounded-lg bg-[#0C2C47] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {isRequestingOtp ? 'Requesting OTP...' : 'Request OTP'}
      </button>

      {demoOtp && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-900">
            DEMO OTP — DEVELOPMENT ONLY
          </p>
          <p className="mt-1 text-lg font-bold tracking-widest text-amber-900">
            {demoOtp}
          </p>
        </div>
      )}
{demoOtp && (
  <div className="mt-4 space-y-3">
    <div>
      <label className="mb-1 block text-xs font-bold text-[#0C2C47]">
        Enter 6-digit OTP
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={forgotOtp}
        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter OTP"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-bold text-[#0C2C47]">
        New Password
      </label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Minimum 12 characters"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-bold text-[#0C2C47]">
        Confirm New Password
      </label>
      <input
        type="password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        placeholder="Re-enter new password"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </div>

    <button
      type="button"
      onClick={handleResetPassword}
      disabled={isResettingPassword}
      className="w-full rounded-lg bg-[#2D5652] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
    >
      {isResettingPassword ? 'Resetting Password...' : 'Reset Password'}
    </button>
  </div>
)}

      {forgotMessage && (
        <p className="mt-3 text-sm text-[#2D5652]">
          {forgotMessage}
        </p>
      )}
    </div>
  </div>
)}

      {/* Footer */}
      <footer className="py-3 border-t border-[#97D3CD]/30 bg-white text-center text-xs text-[#2D5652] px-4">
        <p>Global Academy of Technology · Autonomous Institute Affiliated to VTU · Bengaluru</p>
      </footer>

    </div>
  );
};
