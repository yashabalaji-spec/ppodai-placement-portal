import React, { useState } from 'react';
import { StudentProfile, UserAccount } from '../../types';
import { BRANCHES } from '../../data/mockData';
import { activateFifthSemPlacementMail } from '../../services/authService';
import { GatLogo } from '../common/GatLogo';
import { 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  User, 
  Lock, 
  X, 
  Building,
  GraduationCap,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PlacementMailActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onActivationSuccess: (user: UserAccount, student: StudentProfile) => void;
  initialUsn?: string;
}

export const PlacementMailActivationModal: React.FC<PlacementMailActivationModalProps> = ({
  isOpen,
  onClose,
  students,
  onActivationSuccess,
  initialUsn = ''
}) => {
  const [usnInput, setUsnInput] = useState(initialUsn);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(() => {
    if (initialUsn) {
      return students.find(s => s.usn.toUpperCase() === initialUsn.toUpperCase()) || null;
    }
    // Default to the 5th sem unactivated CSE student if available
    return students.find(s => s.semester === 5 && !s.isPlacementMailActivated) || null;
  });

  const [collegeEmail, setCollegeEmail] = useState(() => selectedStudent ? selectedStudent.collegeEmail : '');
  const [personalEmail, setPersonalEmail] = useState(() => selectedStudent ? selectedStudent.personalEmailId : '');
  const [placementEmail, setPlacementEmail] = useState(() => {
    if (selectedStudent) {
      const cleanFirst = selectedStudent.firstName.toLowerCase();
      const cleanLast = selectedStudent.lastName.toLowerCase();
      const dept = selectedStudent.department.toLowerCase();
      return `${cleanFirst}.${cleanLast}.${dept}@gat.ac.in`;
    }
    return '';
  });
  const [password, setPassword] = useState('student@2026');
  const [confirmPassword, setConfirmPassword] = useState('student@2026');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle USN search / selection
  const handleSelectStudentByUsn = (usnToLookup: string) => {
    setUsnInput(usnToLookup);
    setStatusMessage(null);
    const found = students.find(s => s.usn.toUpperCase() === usnToLookup.trim().toUpperCase());
    if (found) {
      setSelectedStudent(found);
      setCollegeEmail(found.collegeEmail || `${found.usn.toLowerCase()}@gat.ac.in`);
      setPersonalEmail(found.personalEmailId || `${found.firstName.toLowerCase()}.${found.lastName.toLowerCase()}@gmail.com`);
      
      const cleanFirst = found.firstName.toLowerCase().replace(/[^a-z]/g, '');
      const cleanLast = found.lastName.toLowerCase().replace(/[^a-z]/g, '');
      const dept = found.department.toLowerCase().replace(/[^a-z]/g, '');
      setPlacementEmail(`${cleanFirst}.${cleanLast}.${dept}@gat.ac.in`);
      setPassword(found.password || 'student@2026');
      setConfirmPassword(found.password || 'student@2026');
    } else {
      setSelectedStudent(null);
    }
  };

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!selectedStudent) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid student USN or select an eligible candidate.' });
      return;
    }

    if (!collegeEmail.endsWith('@gat.ac.in')) {
      setStatusMessage({ type: 'error', text: 'Existing College Email must be a valid @gat.ac.in address.' });
      return;
    }

    if (!personalEmail.includes('@') || !personalEmail.includes('.')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid personal email ID (e.g. Gmail / Outlook).' });
      return;
    }

    if (!placementEmail.endsWith('@gat.ac.in')) {
      setStatusMessage({ type: 'error', text: 'Official Placement Email ID must end with @gat.ac.in domain.' });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = activateFifthSemPlacementMail({
        usn: selectedStudent.usn,
        collegeEmail,
        personalEmail,
        placementEmail,
        password
      });

      setIsSubmitting(false);

      if (result.success && result.user && result.student) {
        setStatusMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          onActivationSuccess(result.user!, result.student!);
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Activation failed.' });
      }
    }, 600);
  };

  // 5th sem candidates helper list
  const pending5thSemStudents = students.filter(s => s.semester === 5 && !s.isPlacementMailActivated);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                5th Semester Placement Mail ID Setup
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  Sem 5 Requirement
                </span>
              </h2>
              <p className="text-xs text-indigo-200">
                Link College Mail + Personal Mail & Create Official Placement Mail ID
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          {/* Information Notice */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>GAT Campus Placement Policy · 5th Semester Milestone</span>
            </div>
            <p className="text-indigo-800 leading-relaxed text-[11px]">
              When students advance into <strong>5th Semester</strong> (Pre-final year), campus placement drives and automated company intimations commence. The student must configure their <strong>3-tier email profile</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-indigo-100 font-medium">
                <span className="text-slate-500 block text-[10px]">1. Existing College Mail</span>
                <span className="font-mono text-indigo-950 font-bold">usn@gat.ac.in</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-100 font-medium">
                <span className="text-slate-500 block text-[10px]">2. Personal Mail</span>
                <span className="font-mono text-indigo-950 font-bold">name@gmail.com</span>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 font-medium">
                <span className="text-amber-800 block text-[10px]">3. Placement Mail ID</span>
                <span className="font-mono text-amber-900 font-bold">name.dept@gat.ac.in</span>
              </div>
            </div>
          </div>

          {/* Quick Select for 5th Sem Candidates pending setup */}
          {pending5thSemStudents.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select 5th Semester Candidate (or type your USN below):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {pending5thSemStudents.slice(0, 8).map(s => (
                  <button
                    key={s.usn}
                    type="button"
                    onClick={() => handleSelectStudentByUsn(s.usn)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1 ${
                      selectedStudent?.usn === s.usn
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span>{s.fullName}</span>
                    <span className="text-[10px] font-mono opacity-80">({s.department})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleActivationSubmit} className="space-y-4">
            
            {/* Student USN Lookup */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Student USN *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1GA22CS003"
                  value={usnInput}
                  onChange={(e) => handleSelectStudentByUsn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900 uppercase"
                />
              </div>
              {selectedStudent && (
                <div className="mt-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold">{selectedStudent.fullName}</span> · Dept: <strong>{selectedStudent.department}</strong> · Sem: <strong>{selectedStudent.semester}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Eligible for Placement Mail
                  </span>
                </div>
              )}
            </div>

            {/* Email 1: Existing College Mail */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                1. Existing College Email ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. 1ga22cs003@gat.ac.in"
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Official institutional email assigned at admission.</span>
            </div>

            {/* Email 2: Personal Mail */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                2. Personal Email ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. rohan.sharma@gmail.com"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Used for secondary alerts and password recovery.</span>
            </div>

            {/* Email 3: New Placement Mail ID */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. New Official Placement Mail ID to Create *</span>
                </label>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Format: name.dept@gat.ac.in
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. rohan.sharma.cse@gat.ac.in"
                  value={placementEmail}
                  onChange={(e) => setPlacementEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 font-semibold"
                />
              </div>
              <span className="text-[10px] text-amber-800">
                This email ID will be registered with recruiting companies (Amazon, Google, TI, etc.) for drive registrations.
              </span>
            </div>

            {/* Password configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Portal Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <span>ACTIVATE PLACEMENT MAIL & LOG IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
