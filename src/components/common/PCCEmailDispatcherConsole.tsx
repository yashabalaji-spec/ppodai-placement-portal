import React, { useState } from 'react';
import { PlacementDrive, StudentProfile, UserAccount } from '../../types';
import {
  getStoredEmails,
  dispatchCompanyApproachedEmail,
  dispatchCountdownReminderEmail
} from '../../services/emailService';
import {
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Bell,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';

interface PCCEmailDispatcherConsoleProps {
  user: UserAccount;
  drives: PlacementDrive[];
  students: StudentProfile[];
}

export const PCCEmailDispatcherConsole: React.FC<PCCEmailDispatcherConsoleProps> = ({
  user,
  drives,
  students
}) => {
  const [emails, setEmails] = useState(getStoredEmails);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[0]?.id || '');
  const [selectedReminderHours, setSelectedReminderHours] = useState<number>(24);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const reload = () => {
    setEmails(getStoredEmails());
  };

  const selectedDrive = drives.find(d => d.id === selectedDriveId) || drives[0];

  // Eligible students for the selected drive
  const eligibleStudents = students.filter(s => {
    const meetsBranch = selectedDrive.targetBranches.length === 0 || selectedDrive.targetBranches.includes(s.department);
    const meetsCgpa = s.cgpa >= selectedDrive.minCGPA;
    const meetsBacklogs = s.currentBacklogs <= selectedDrive.maxBacklogsAllowed;
    return meetsBranch && meetsCgpa && meetsBacklogs;
  });

  // Handle Dispatching New Company Approached Email
  const handleDispatchApproachedEmail = () => {
    const res = dispatchCompanyApproachedEmail(selectedDrive, eligibleStudents);
    reload();
    setDispatchStatus(`✓ Successfully dispatched "New Company Approached" email with requirements to ${res.count} eligible students!`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // Handle Dispatching Automated Countdown Reminder Email
  const handleDispatchReminderEmail = () => {
    const res = dispatchCountdownReminderEmail(selectedDrive, selectedReminderHours, eligibleStudents);
    reload();
    setDispatchStatus(`✓ Dispatched automated "${selectedReminderHours} Hours Left" reminder email with company requirements to ${res.count} students!`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* PCC Dispatcher Console Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
              PCC · Automated Notification & Email Dispatcher
            </span>
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
              Registration Countdown System
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Automated Student Company Intimation & Registration Timers
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Ensuring no student misses placement registrations: automated email alerts when a company approaches, paired with countdown reminders intimating X hours left along with complete requirements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/10 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Dispatched Alerts</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{emails.length} Emails</span>
          </div>
        </div>
      </div>

      {/* Dispatch Controls & Trigger Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ACTION 1: When Company Approaches GAT */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Company Approached Notification
                </h3>
                <span className="text-[11px] text-slate-500">Sent immediately when employer confirms campus drive</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
              Dispatches an institutional broadcast to all students matching the company’s branch & CGPA criteria, containing full company profile, compensation package, and the registration form link.
            </p>

            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Select Approaching Company:</label>
                <select
                  value={selectedDriveId}
                  onChange={(e) => setSelectedDriveId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  {drives.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} ({d.roleTitle}) · ₹{d.ctcLPA} LPA
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <span>Eligible Candidates:</span>
                <strong className="text-teal-700 font-mono font-bold">{eligibleStudents.length} Students</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Target Branches:</span>
                <span className="font-mono text-slate-800">{selectedDrive.targetBranches.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>CGPA / Backlog Cutoff:</span>
                <span className="font-mono text-slate-800">Min {selectedDrive.minCGPA} / Max {selectedDrive.maxBacklogsAllowed}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Default registration window: 48 Hours</span>
            <button
              onClick={handleDispatchApproachedEmail}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Company Approached Email</span>
            </button>
          </div>
        </div>

        {/* ACTION 2: Automated Registration Countdown Reminders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Automated Countdown Timer Reminder
                </h3>
                <span className="text-[11px] text-slate-500">Intimates students of X hours left with company requirements</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
              Triggers an urgent countdown notice intimating eligible students that they have only <strong>X hours left</strong> before registration closes, recapping the company's mandatory requirements.
            </p>

            <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Select Hours Remaining Timer:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[24, 18, 6, 2].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setSelectedReminderHours(hours)}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        selectedReminderHours === hours
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {hours} Hours Left
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-amber-200/60 text-[11px] text-slate-700">
                <strong>Subject Preview:</strong>{' '}
                <span className="font-mono text-amber-900">
                  {selectedReminderHours <= 6 ? '🚨 [FINAL CALL - ' : '⏰ [URGENT REMINDER] Only '}
                  {selectedReminderHours} Hours Left: Complete Registration for {selectedDrive.companyName}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>Included in Email:</span>
                <span className="font-semibold text-slate-800">Recap of CGPA, Backlogs, Skills, JD & Direct Form Link</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Timer: {selectedReminderHours}h countdown</span>
            <button
              onClick={handleDispatchReminderEmail}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Send {selectedReminderHours}h Countdown Reminder</span>
            </button>
          </div>
        </div>

      </div>

      {/* Status banner */}
      {dispatchStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{dispatchStatus}</span>
          </div>
          <button onClick={() => setDispatchStatus(null)} className="text-emerald-700 hover:text-emerald-950 font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* Dispatched Emails Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dispatched Registration Notifications & Automated Timers Log
            </h3>
            <p className="text-xs text-slate-500">History of company approached broadcasts and countdown reminders delivered to student inboxes</p>
          </div>
          <button
            onClick={reload}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            title="Refresh Log"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Company & Package</th>
                <th className="py-2.5 px-4 text-center">Timer</th>
                <th className="py-2.5 px-4 text-center">Form Status</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emails.map(em => (
                <tr key={em.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      em.type === 'drive_approached' ? 'bg-teal-100 text-teal-800' :
                      em.type === 'urgent_last_call' ? 'bg-rose-100 text-rose-800' :
                      em.type === 'registration_confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {em.type === 'drive_approached' ? 'Approached' :
                       em.type === 'urgent_last_call' ? 'Last Call' :
                       em.type === 'registration_confirmed' ? 'Confirmed' : 'Reminder'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 max-w-xs truncate" title={em.subject}>
                    {em.subject}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">
                    {em.studentUsn ? `${em.studentName} (${em.studentUsn})` : em.to}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-slate-800">{em.companyName}</span> · <span className="font-mono text-indigo-700">₹{em.ctcLPA} LPA</span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">
                    {em.hoursLeft > 0 ? (
                      <span className={`font-bold ${em.hoursLeft <= 12 ? 'text-rose-600' : 'text-amber-600'}`}>
                        {em.hoursLeft}h left
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {em.formSubmitted ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ Registered
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                    {em.sentAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
