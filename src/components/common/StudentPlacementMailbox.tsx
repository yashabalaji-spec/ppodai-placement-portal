import React, { useState, useEffect } from 'react';
import { StudentProfile, PlacementDrive, EmailNotification } from '../../types';
import {
  getStoredEmails,
  markEmailRead,
  submitPlacementRegistration,
  dispatchCompanyApproachedEmail,
  dispatchCountdownReminderEmail
} from '../../services/emailService';
import {
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  ChevronRight,
  Send,
  Sparkles,
  Award,
  FileText,
  X,
  Bell,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';

interface StudentPlacementMailboxProps {
  student: StudentProfile;
  drives: PlacementDrive[];
  targetEmailId?: string | null;
  onRegistrationComplete?: () => void;
}

export const StudentPlacementMailbox: React.FC<StudentPlacementMailboxProps> = ({
  student,
  drives,
  targetEmailId,
  onRegistrationComplete
}) => {
  const [emails, setEmails] = useState<EmailNotification[]>(() => {
    return getStoredEmails().filter(e => e.studentUsn === student.usn || !e.studentUsn);
  });
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(() => {
    const list = getStoredEmails().filter(e => e.studentUsn === student.usn || !e.studentUsn);
    if (targetEmailId) {
      const match = list.find(e => e.id === targetEmailId);
      if (match) return match;
    }
    return list[0] || null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmUnderstood, setConfirmUnderstood] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Sync emails
  const reloadEmails = () => {
    const list = getStoredEmails().filter(e => e.studentUsn === student.usn || !e.studentUsn);
    setEmails(list);
    if (selectedEmail) {
      const updatedSelected = list.find(e => e.id === selectedEmail.id);
      if (updatedSelected) setSelectedEmail(updatedSelected);
    }
  };

  useEffect(() => {
    reloadEmails();
  }, [student.usn]);

  // When targetEmailId changes from external redirect (e.g., banner click)
  useEffect(() => {
    if (targetEmailId) {
      const match = emails.find(e => e.id === targetEmailId);
      if (match) {
        setSelectedEmail(match);
        setTimeout(() => {
          const el = document.getElementById('placement-registration-form');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [targetEmailId, emails]);

  const handleSelectEmail = (em: EmailNotification, scrollToForm = false) => {
    setSelectedEmail(em);
    setSubmissionSuccess(null);
    if (!em.isRead) {
      markEmailRead(em.id);
      reloadEmails();
    }
    setTimeout(() => {
      if (scrollToForm) {
        const formEl = document.getElementById('placement-registration-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      const letterEl = document.getElementById('email-letter-view');
      if (letterEl) {
        letterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleFillRegistration = (email: EmailNotification) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitPlacementRegistration(email.id, student.usn);
      setIsSubmitting(false);
      setSubmissionSuccess(res.message);
      reloadEmails();
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    }, 600);
  };

  // Quick Demo Simulators for the user to test the countdown reminder triggers:
  const handleSimulateNewApproach = () => {
    const activeDrive = drives[0] || {
      id: 'd_demo',
      driveCode: 'DRV-2026-APL-01',
      companyId: 'c_demo',
      companyName: 'Apple India',
      roleTitle: 'Silicon & iOS Software Engineer',
      ctcLPA: 36.0,
      targetBranches: [student.department],
      minCGPA: 7.5,
      maxBacklogsAllowed: 0,
      driveDate: '2026-11-05',
      venue: 'GAT Auditorium',
      status: 'Upcoming' as const,
      eligibleStudentCount: 180,
      shortlistedCount: 0,
      rounds: []
    };
    dispatchCompanyApproachedEmail(activeDrive, [student]);
    reloadEmails();
  };

  const handleSimulateCountdownReminder = (hoursLeft: number) => {
    const activeDrive = drives[0] || drives[1];
    if (activeDrive) {
      dispatchCountdownReminderEmail(activeDrive, hoursLeft, [student]);
      reloadEmails();
    }
  };

  const unreadCount = emails.filter(e => !e.isRead).length;
  const urgentEmails = emails.filter(e => e.hoursLeft > 0 && e.hoursLeft <= 24 && !e.formSubmitted);

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Mailbox Header */}
      <div className="bg-[#0C2C47] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#97D3CD]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E4F2EA]/20 border border-[#97D3CD]/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Mail className="w-4 h-4 text-[#97D3CD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E2A54D] text-[#0C2C47] px-2 py-0.5 rounded">
                  Mailbox
                </span>
                <span className="text-[11px] text-[#E4F2EA] font-mono">
                  {student.placementEmailId}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Placement Alerts & Registration Notices
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#E2A54D] text-[#0C2C47] rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>{unreadCount} Unread</span>
              </span>
            )}
            <button
              onClick={reloadEmails}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-xs flex items-center cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Urgent Countdown Alert */}
        {urgentEmails.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/15">
            <div className="p-2.5 bg-[#E2A54D]/20 border border-[#E2A54D]/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-white font-medium">
                <Clock className="w-4 h-4 text-[#E2A54D] shrink-0" />
                <span>
                  <strong>Closing Soon:</strong> Only{' '}
                  <strong className="text-[#E2A54D] font-mono">
                    {urgentEmails[0].hoursLeft}h remaining
                  </strong>{' '}
                  to register for <strong>{urgentEmails[0].companyName}</strong>.
                </span>
              </div>

              <button
                onClick={() => handleSelectEmail(urgentEmails[0], true)}
                className="px-3 py-1 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer self-start md:self-auto"
              >
                Register Now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Tools */}
      <div className="bg-[#E4F2EA]/40 border border-[#97D3CD]/50 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#2D5652] font-semibold text-[11px]">
          Demo Triggers:
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleSimulateNewApproach}
            className="px-2.5 py-1 bg-white hover:bg-[#E4F2EA] text-[#0C2C47] border border-[#97D3CD]/60 rounded-md text-xs font-medium cursor-pointer"
          >
            + New Company
          </button>
          <button
            onClick={() => handleSimulateCountdownReminder(24)}
            className="px-2.5 py-1 bg-[#EFEAE6] hover:bg-[#E2A54D]/20 text-[#0C2C47] border border-[#E2A54D]/40 rounded-md text-xs font-medium cursor-pointer"
          >
            24h Alert
          </button>
          <button
            onClick={() => handleSimulateCountdownReminder(6)}
            className="px-2.5 py-1 bg-[#E4F2EA] hover:bg-[#2D5652]/20 text-[#2D5652] border border-[#2D5652]/40 rounded-md text-xs font-medium cursor-pointer"
          >
            6h Alert
          </button>
        </div>
      </div>

      {/* Mailbox Split Pane: Email List (Left) & Full Email Letter / Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT PANE: EMAIL LIST (5 columns) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-3 font-semibold text-xs text-[#0C2C47] flex items-center justify-between">
            <span>Incoming Letters ({emails.length})</span>
            <span className="text-[11px] text-[#2D5652]/70 font-normal">Click to read & apply</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[580px] pr-0.5">
            {emails.map(em => {
              const isSelected = selectedEmail?.id === em.id;
              const isUrgent = em.hoursLeft > 0 && em.hoursLeft <= 12 && !em.formSubmitted;

              return (
                <div
                  key={em.id}
                  onClick={() => handleSelectEmail(em)}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'border-[#0C2C47] bg-[#E4F2EA]/60 shadow-xs ring-1 ring-[#0C2C47]/20'
                      : em.isRead
                      ? 'border-[#97D3CD]/40 bg-white hover:border-[#97D3CD]'
                      : 'border-[#E2A54D]/50 bg-[#EFEAE6]/60 hover:bg-[#EFEAE6] font-medium'
                  }`}
                >
                  {/* Top row: From & Sent Time */}
                  <div className="flex items-center justify-between text-[11px] text-[#2D5652]/80 mb-1">
                    <span className="font-semibold text-[#0C2C47] truncate pr-2">
                      GAT Placement Cell
                    </span>
                    <span className="shrink-0 font-mono text-[10px]">{em.sentAt}</span>
                  </div>

                  {/* Subject line */}
                  <h4 className={`text-xs font-bold truncate leading-snug ${
                    isSelected ? 'text-[#0C2C47]' : 'text-[#0C2C47]'
                  }`}>
                    {em.subject}
                  </h4>

                  {/* Summary row */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#97D3CD]/20 text-[11px]">
                    <span className="font-mono font-bold text-[#0C2C47]">
                      ₹{em.ctcLPA} LPA · {em.companyName}
                    </span>

                    {em.formSubmitted ? (
                      <span className="text-[10px] font-bold text-[#2D5652] bg-[#E4F2EA] px-2 py-0.5 rounded border border-[#2D5652]/30 flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-[#2D5652]" />
                        Registered
                      </span>
                    ) : em.hoursLeft > 0 ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isUrgent
                          ? 'bg-[#E2A54D] text-[#0C2C47] border border-[#E2A54D] animate-pulse font-extrabold'
                          : 'bg-[#EFEAE6] text-[#0C2C47] border border-[#E2A54D]/50'
                      }`}>
                        <Clock className="w-3 h-3 text-[#0C2C47]" />
                        {em.hoursLeft}h left
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Closed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: FORMAL INSTITUTIONAL EMAIL & REGISTRATION FORM (7 columns) */}
        <div id="email-letter-view" className="lg:col-span-7 scroll-mt-20">
          {selectedEmail ? (
            <div className="bg-white border border-[#97D3CD]/50 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              
              {/* Formal GAT Email Header */}
              <div className="p-4 sm:p-5 border-b border-[#97D3CD]/30 bg-[#E4F2EA]/30 space-y-3">
                <div className="flex items-center justify-between border-b border-[#97D3CD]/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#0C2C47] text-white font-bold text-xs flex items-center justify-center">
                      G
                    </span>
                    <span className="text-xs font-bold text-[#0C2C47] uppercase tracking-wider">
                      Global Academy of Technology · PCC
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2D5652]/70">{selectedEmail.sentAt}</span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0C2C47] leading-tight">
                    {selectedEmail.subject}
                  </h3>
                  <div className="mt-2 text-xs text-[#2D5652] space-y-0.5">
                    <div>
                      <strong className="text-[#0C2C47]">From:</strong> {selectedEmail.from}
                    </div>
                    <div>
                      <strong className="text-[#0C2C47]">To:</strong> {student.fullName} ({selectedEmail.to}) · USN: <code className="font-mono text-[#0C2C47] font-bold">{student.usn}</code>
                    </div>
                  </div>
                </div>

                {/* Real-time Countdown Banner inside Email */}
                {selectedEmail.hoursLeft > 0 && !selectedEmail.formSubmitted && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    selectedEmail.hoursLeft <= 12
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Registration Timer Active:</strong> Only <strong className="font-mono font-bold text-sm underline">{selectedEmail.hoursLeft} Hours Left</strong> for registrations to end!
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/80 border shrink-0">
                      {selectedEmail.deadlineString}
                    </span>
                  </div>
                )}

                {selectedEmail.formSubmitted && (
                  <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Registration Form Confirmed · Hall Ticket Issued for {student.usn}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700">Submitted at {selectedEmail.submittedAt}</span>
                  </div>
                )}
              </div>

              {/* Email Content Body */}
              <div className="p-6 space-y-5 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[460px]">
                
                <p>
                  Dear <strong>{student.fullName}</strong>,
                </p>

                <p>
                  We are pleased to inform you that <strong>{selectedEmail.companyName}</strong> has approached Global Academy of Technology to conduct an on-campus placement drive for final-year students.
                </p>

                {/* Company & Offer Snapshot Table */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">{selectedEmail.companyName}</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">₹{selectedEmail.ctcLPA} LPA Package</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Role / Profile</span>
                      <strong className="text-slate-900">{selectedEmail.roleTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Drive Date & Venue</span>
                      <strong className="text-slate-900">
                        {selectedEmail.companyRequirements.driveDate} · {selectedEmail.companyRequirements.venue}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* COMPANY REQUIREMENTS MANDATORY RECAP */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Company Eligibility Requirements (Mandatory Checklist)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[11px] text-slate-500 block">Minimum CGPA Required</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <strong className="text-sm font-mono text-slate-900">
                          {selectedEmail.companyRequirements.minCGPA}
                        </strong>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          student.cgpa >= selectedEmail.companyRequirements.minCGPA
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}>
                          {student.cgpa >= selectedEmail.companyRequirements.minCGPA ? '✓ You Meet' : '✕ Below'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[11px] text-slate-500 block">Max Active Backlogs</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <strong className="text-sm font-mono text-slate-900">
                          {selectedEmail.companyRequirements.maxBacklogs} Backlogs
                        </strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded text-emerald-700 bg-emerald-50">
                          ✓ You have {student.currentBacklogs}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[11px] text-slate-500 block">Target Degree / Year</span>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        B.E / B.Tech (2026 Batch)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Target Eligible Branches:</strong>{' '}
                      <span className="font-mono text-indigo-700 font-semibold">
                        {selectedEmail.companyRequirements.targetBranches.join(', ')}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800">Required Technical Skills:</strong>{' '}
                      <span>{selectedEmail.companyRequirements.requiredSkills.join(' · ')}</span>
                    </div>
                  </div>
                </div>

                {/* Job Description Summary */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Job Description & Role Summary
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                    {selectedEmail.jobDescriptionSummary}
                  </p>
                </div>

                {/* Mandatory Warning Note */}
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Important Note:</strong> Registrations close strictly when the timer hits zero ({selectedEmail.deadlineString}). Candidates who fail to register in time will not receive a Hall Ticket and will not be permitted into the interview or coding assessment.
                  </span>
                </div>

                {/* Direct Registration Form Fill Box */}
                {!selectedEmail.formSubmitted ? (
                  <div id="placement-registration-form" className="mt-4 p-4 rounded-xl border border-[#97D3CD] bg-[#E4F2EA]/40 space-y-3 scroll-mt-6">
                    <h4 className="text-xs font-bold text-[#0C2C47] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#2D5652]" />
                      <span>Registration Form</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 bg-white rounded-lg border border-[#97D3CD]/50">
                      <div>
                        <span className="text-[#2D5652]/70 block">USN</span>
                        <strong className="font-mono text-[#0C2C47]">{student.usn}</strong>
                      </div>
                      <div>
                        <span className="text-[#2D5652]/70 block">Name</span>
                        <strong className="text-[#0C2C47] truncate block">{student.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[#2D5652]/70 block">Branch & Sec</span>
                        <strong className="text-[#0C2C47]">{student.department} - {student.section}</strong>
                      </div>
                      <div>
                        <span className="text-[#2D5652]/70 block">CGPA</span>
                        <strong className="font-mono text-[#0C2C47]">{student.cgpa}</strong>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 text-[11px] text-[#0C2C47] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={confirmUnderstood}
                        onChange={(e) => setConfirmUnderstood(e.target.checked)}
                        className="rounded accent-[#0C2C47] mt-0.5"
                      />
                      <span>
                        I confirm my profile details are accurate and agree to attend all recruitment rounds for <strong>{selectedEmail.companyName}</strong>.
                      </span>
                    </label>

                    {submissionSuccess && (
                      <div className="p-2.5 bg-[#E4F2EA] text-[#2D5652] font-bold rounded-lg text-xs flex items-center gap-1.5 border border-[#2D5652]/30">
                        <CheckCircle2 className="w-4 h-4 text-[#2D5652]" />
                        <span>{submissionSuccess}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#2D5652]">
                        {selectedEmail.hoursLeft}h remaining to register
                      </span>

                      <button
                        onClick={() => handleFillRegistration(selectedEmail)}
                        disabled={isSubmitting || !confirmUnderstood}
                        className="px-4 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 disabled:bg-slate-200 disabled:text-slate-400 text-[#0C2C47] font-bold rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Registration</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-[#97D3CD] bg-[#E4F2EA] text-[#0C2C47] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2D5652]" />
                        <span>Registered for {selectedEmail.companyName}</span>
                      </div>
                      <p className="text-[11px] text-[#2D5652] mt-0.5">
                        Hall Ticket generated. Report to {selectedEmail.companyRequirements.venue} on {selectedEmail.companyRequirements.driveDate}.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0C2C47] bg-white px-2.5 py-1 rounded-md border border-[#97D3CD] self-start sm:self-auto">
                      HALL TICKET: GAT-{student.usn}-HT
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  Placement Coordination Cell (PCC), Global Academy of Technology, Rajarajeshwarinagar, Bengaluru-560098.
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
              Select an email from the inbox to read requirements and fill the registration form.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
