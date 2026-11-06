import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  X,
  KeyRound,
  UserCheck
} from 'lucide-react';

interface Semester5MailActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onActivationSuccess: (updatedStudent: StudentProfile) => void;
}

export const Semester5MailActivationModal: React.FC<Semester5MailActivationModalProps> = ({
  isOpen,
  onClose,
  student,
  onActivationSuccess
}) => {
  const defaultPrefix = `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}.${student.department.toLowerCase()}`;
  
  const [placementPrefix, setPlacementPrefix] = useState<string>(
    student.placementEmailId ? student.placementEmailId.replace('@gat.ac.in', '') : defaultPrefix
  );
  const [personalEmail, setPersonalEmail] = useState<string>(student.personalEmailId || `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@gmail.com`);
  const [password, setPassword] = useState<string>('student@2026');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fullPlacementEmail = `${placementPrefix.trim().toLowerCase()}@gat.ac.in`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementPrefix.trim()) {
      setErrorMsg('Please enter a valid placement mail ID prefix.');
      return;
    }
    if (!personalEmail.trim() || !personalEmail.includes('@')) {
      setErrorMsg('Please provide a valid personal email ID for backup recovery.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const updatedStudent: StudentProfile = {
        ...student,
        placementEmailId: fullPlacementEmail,
        personalEmailId: personalEmail.trim(),
        isPlacementMailActivated: true,
        password: password
      };

      setIsSubmitting(false);
      setSuccessNotice(true);

      setTimeout(() => {
        onActivationSuccess(updatedStudent);
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 block">
                5th Semester Onboarding · Mandatory Requirement
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                Create Official Placement Mail ID
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Explanation Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Campus Recruitment Identity & Login Upgrade</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              As a <strong>5th Semester Student</strong> ({student.department} · {student.usn}), your campus recruitment eligibility window is now opening. GAT PPODAI requires you to create your official placement email, linking your existing college and personal accounts.
            </p>
          </div>

          {successNotice ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-emerald-950">
                Placement Mail ID Activated Successfully!
              </h4>
              <p className="text-xs text-emerald-800 font-mono font-bold">
                {fullPlacementEmail}
              </p>
              <p className="text-[11px] text-emerald-700 max-w-sm mx-auto">
                Your login pattern is now updated. You can now log in using this Placement Mail ID or your USN.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Field 1: Existing College Mail (Verified) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  1. Existing College Mail ID (Issued by GAT)
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    readOnly
                    value={student.collegeEmail || `${student.usn.toLowerCase()}@gat.ac.in`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono text-xs cursor-not-allowed"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified College Mail
                  </span>
                </div>
              </div>

              {/* Field 2: Personal Mail ID (Linked Backup) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  2. Personal Email ID (For Recovery & Emergency Intimations) *
                </label>
                <input 
                  type="email"
                  required
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                />
              </div>

              {/* Field 3: Create Placement Mail ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-800">
                    3. Create New Official Placement Mail ID *
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold font-mono">
                    @gat.ac.in domain
                  </span>
                </div>
                <div className="flex items-center rounded-lg border border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-600 overflow-hidden bg-white shadow-2xs">
                  <input 
                    type="text"
                    required
                    value={placementPrefix}
                    onChange={(e) => setPlacementPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    placeholder="e.g. rohan.sharma.cs"
                    className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-indigo-50 border-l border-indigo-200 text-indigo-900 font-mono text-xs font-bold shrink-0">
                    @gat.ac.in
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Live Preview: <strong className="text-indigo-700 font-mono">{fullPlacementEmail}</strong>
                </p>
              </div>

              {/* Field 4: Password Confirmation */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  4. Placement Portal Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                </div>
              </div>

              {/* Login Pattern Shift Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>New Login Pattern Activated:</span>
                </div>
                <p>
                  From 5th Semester onward, you can use your new Placement Mail ID (<code className="text-indigo-700 font-mono">{fullPlacementEmail}</code>) or your USN (<code className="text-indigo-700 font-mono">{student.usn}</code>) to sign in to the GAT Placement Portal.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Skip for Now
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Activating...</span>
                  ) : (
                    <>
                      <span>Activate & Upgrade Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
