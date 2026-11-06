import React, { useState } from 'react';
import { UserAccount, StudentProfile } from '../../types';
import { resetPasswordByEmailOrId } from '../../services/authService';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  X, 
  ShieldCheck, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  students: StudentProfile[];
  onPasswordResetSuccess: (accountIdentifier: string, newPass: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  users,
  students,
  onPasswordResetSuccess
}) => {
  // Step 1: 'enter_email', Step 2: 'enter_code', Step 3: 'success'
  const [step, setStep] = useState<'enter_email' | 'enter_code' | 'success'>('enter_email');
  const [emailOrIdInput, setEmailOrIdInput] = useState('');
  const [matchedUser, setMatchedUser] = useState<{ name: string; email: string; id: string; role: string } | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  // Step 1: Find account by Email (Placement / College / Personal) or USN / SpecialID
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const search = emailOrIdInput.trim().toLowerCase();

    if (!search) {
      setErrorMsg('Please enter your Email ID or USN.');
      return;
    }

    // Search in users first
    const foundUser = users.find(u => 
      u.email.toLowerCase() === search ||
      u.specialId.toLowerCase() === search ||
      (u.collegeEmail && u.collegeEmail.toLowerCase() === search) ||
      (u.personalEmail && u.personalEmail.toLowerCase() === search) ||
      (u.placementEmail && u.placementEmail.toLowerCase() === search)
    );

    // Also search in students list
    const foundStudent = students.find(s => 
      s.usn.toLowerCase() === search ||
      (s.collegeEmail && s.collegeEmail.toLowerCase() === search) ||
      (s.personalEmailId && s.personalEmailId.toLowerCase() === search) ||
      (s.placementEmailId && s.placementEmailId.toLowerCase() === search)
    );

    if (foundUser || foundStudent) {
      const emailToUse = foundUser?.email || foundStudent?.placementEmailId || foundStudent?.collegeEmail || foundStudent?.personalEmailId || search;
      const name = foundUser?.name || foundStudent?.fullName || 'GAT User';
      const id = foundUser?.specialId || foundStudent?.usn || search;
      const role = foundUser?.role || 'student';

      setMatchedUser({ name, email: emailToUse, id, role });

      // Generate a random 6-digit code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setStep('enter_code');
    } else {
      setErrorMsg(`No GAT account found matching "${emailOrIdInput}". Please check the Email ID or USN entered.`);
    }
  };

  // Step 2: Validate OTP and Set New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpInput.trim() !== generatedOtp) {
      setErrorMsg('Invalid verification code entered. Please check the 6-digit code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');

      if (matchedUser) {
        resetPasswordByEmailOrId(matchedUser.id, newPassword);
        onPasswordResetSuccess(matchedUser.id, newPassword);
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset state
        setStep('enter_email');
        setEmailOrIdInput('');
        setOtpInput('');
        setNewPassword('');
        setConfirmPassword('');
        setMatchedUser(null);
      }, 2000);
    }, 700);
  };

  // Mask email for display: r***@gat.ac.in
  const getMaskedEmail = (emailStr: string) => {
    const parts = emailStr.split('@');
    if (parts.length !== 2) return emailStr;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300 block">
                Security & Account Recovery
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                Reset Password via Mail ID
              </h3>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs font-sans">
          
          {step === 'enter_email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-slate-600 leading-relaxed text-xs">
                Enter your registered <strong>Placement Mail ID</strong>, <strong>College Mail ID</strong>, <strong>Personal Mail</strong>, or <strong>USN Number</strong>. A verification security code will be dispatched to your email.
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-800 block mb-1">
                  Registered Mail ID or USN *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    required
                    autoFocus
                    value={emailOrIdInput}
                    onChange={(e) => setEmailOrIdInput(e.target.value)}
                    placeholder="e.g. rohan.sharma.cs21@gat.ac.in or 1GA21CS042"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === 'enter_code' && matchedUser && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* Account Match Header */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">
                    Account Identified
                  </span>
                  <strong className="text-slate-900">{matchedUser.name}</strong>
                  <span className="text-slate-500 font-mono text-[11px] block">
                    Recipient: {getMaskedEmail(matchedUser.email)}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setStep('enter_email')}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Change
                </button>
              </div>

              {/* Instant Verification Sandbox Code Strip */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Simulated Email Dispatch: <strong className="font-mono text-sm font-bold text-amber-900 underline">{generatedOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpInput(generatedOtp)}
                  className="px-2 py-0.5 bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-[10px] font-bold rounded"
                >
                  Auto-fill Code
                </button>
              </div>

              {/* Field 1: Enter 6-digit OTP */}
              <div>
                <label className="text-[11px] font-bold text-slate-800 block mb-1">
                  1. Enter 6-Digit Email Verification Code *
                </label>
                <input 
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 849201"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-mono font-bold text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Field 2: New Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-800 block mb-1">
                  2. Set New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 3: Confirm New Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-800 block mb-1">
                  3. Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setStep('enter_email')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <span>Save Password & Redirect</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && matchedUser && (
            <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-emerald-950">
                Password Reset Successfully!
              </h4>
              <p className="text-xs text-emerald-800">
                Account password for <strong>{matchedUser.name}</strong> (<code className="font-mono">{matchedUser.id}</code>) has been updated.
              </p>
              <div className="p-2.5 bg-white/80 rounded-xl text-[11px] text-slate-600 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>Redirecting back to login screen...</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
