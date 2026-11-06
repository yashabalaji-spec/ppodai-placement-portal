import React, { useState } from 'react';
import { UserAccount, StudentProfile, Company, PlacementDrive } from '../../types';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { PCCEmailDispatcherConsole } from '../common/PCCEmailDispatcherConsole';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Building2, 
  Plus, 
  CheckCircle2, 
  FileText, 
  Search, 
  Award,
  Layers,
  Video,
  Mail,
  Bell,
  Sparkles
} from 'lucide-react';

interface PCCDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  companies: Company[];
  drives: PlacementDrive[];
  onAddDrive: (newDrive: PlacementDrive) => void;
  onUpdateDrive: (updatedDrive: PlacementDrive) => void;
}

export const PCCDashboard: React.FC<PCCDashboardProps> = ({
  user,
  students,
  companies,
  drives,
  onAddDrive,
  onUpdateDrive
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'scheduling' | 'email_dispatcher' | 'shortlists' | 'offer_letters'>('calendar');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New drive form state
  const [newCompany, setNewCompany] = useState('Google India');
  const [newRole, setNewRole] = useState('Cloud Solutions Engineer');
  const [newCtc, setNewCtc] = useState(18.0);
  const [newDate, setNewDate] = useState('2026-10-30');
  const [newVenue, setNewVenue] = useState('CCC Lab 2 & Placement Cell');
  const [newBranches, setNewBranches] = useState<string[]>(['CSE', 'ISE', 'AIML', 'ECE']);

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const driveObj: PlacementDrive = {
      id: `d_${Date.now()}`,
      driveCode: `DRV-2026-${newCompany.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      companyId: 'c_custom',
      companyName: newCompany,
      roleTitle: newRole,
      ctcLPA: Number(newCtc),
      targetBranches: newBranches,
      minCGPA: 7.0,
      maxBacklogsAllowed: 0,
      driveDate: newDate,
      venue: newVenue,
      status: 'Upcoming',
      eligibleStudentCount: 210,
      shortlistedCount: 0,
      rounds: [
        { roundNumber: 1, roundName: 'Online Coding / Technical Assessment', date: `${newDate} 10:00 AM`, venue: newVenue, qualifiedStudents: [] }
      ]
    };
    onAddDrive(driveObj);
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* PCC Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Placement Coordinators</span>
            <span>·</span>
            <span>PCC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Drive Scheduling & Alerts
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1 max-w-2xl">
            Company drive calendars, venue schedules, and student registration intimations.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Drive</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('scheduling')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'scheduling'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Drives ({drives.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('email_dispatcher')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'email_dispatcher'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-[#E2A54D]" />
          <span>Alerts & Timers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E2A54D] text-[#0C2C47] font-bold">
            Live
          </span>
        </button>
        <button
          onClick={() => setActiveTab('shortlists')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'shortlists'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Shortlists</span>
        </button>
        <button
          onClick={() => setActiveTab('offer_letters')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'offer_letters'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Offer Letters</span>
        </button>
      </div>

      {/* TAB 1: TEAMS PLACEMENT CALENDAR & SCHEDULER */}
      {activeTab === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={user}
          drives={drives}
          onAddDrive={onAddDrive}
          onUpdateDrive={onUpdateDrive}
        />
      )}

      {/* TAB: AUTOMATED EMAIL DISPATCHER & REGISTRATION TIMERS */}
      {activeTab === 'email_dispatcher' && (
        <PCCEmailDispatcherConsole
          user={user}
          drives={drives}
          students={students}
        />
      )}

      {/* TAB 2: SCHEDULING (PO & PCC) */}
      {activeTab === 'scheduling' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drives.map(drive => (
              <div key={drive.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {drive.driveCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      drive.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                      drive.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-teal-50 text-teal-800'
                    }`}>
                      {drive.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{drive.companyName}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{drive.roleTitle}</p>
                  
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono font-bold text-emerald-700">₹{drive.ctcLPA} LPA Package</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{drive.driveDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{drive.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{drive.targetBranches.join(', ')} (CGPA ≥ {drive.minCGPA})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">
                    Shortlisted: <strong className="text-slate-900">{drive.shortlistedCount}</strong>
                  </span>
                  <span className="text-teal-700 font-medium text-[11px]">
                    {drive.rounds.length} Evaluation Round(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SHORTLISTED FOR VARIOUS ROUNDS */}
      {activeTab === 'shortlists' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Coordinators: Shortlisted Candidates by Round, Schedule & Venue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking round qualifications across registered batches</p>
          </div>

          <div className="divide-y divide-slate-100">
            {drives.map(drive => (
              <div key={drive.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-teal-700 font-bold">{drive.driveCode}</span>
                    <h4 className="text-sm font-bold text-slate-900">{drive.companyName} · {drive.roleTitle}</h4>
                    <span className="text-xs text-slate-500">Scheduled Date: {drive.driveDate} · Venue: {drive.venue}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    ₹{drive.ctcLPA} LPA
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {drive.rounds.length === 0 ? (
                    <div className="col-span-3 text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">
                      Rounds scheduling pending for this drive.
                    </div>
                  ) : (
                    drive.rounds.map(round => (
                      <div key={round.roundNumber} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                          <span>Round {round.roundNumber}</span>
                          <span className="text-teal-700 font-mono">{round.qualifiedStudents.length} Shortlisted</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 font-medium">{round.roundName}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {round.date} · {round.venue}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200/80">
                          <span className="text-[10px] text-slate-400 block mb-1">Qualified USNs:</span>
                          <div className="flex flex-wrap gap-1">
                            {round.qualifiedStudents.map(usn => (
                              <span key={usn} className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                                {usn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OFFER LETTERS */}
      {activeTab === 'offer_letters' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Verified Offer Letters Issued (PCC Central Registry)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Formal company intent letters and acceptance confirmations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Student USN</th>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Hiring Company</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4 text-right">Package (LPA)</th>
                  <th className="py-3 px-4">Tier Status</th>
                  <th className="py-3 px-4 text-center">Offer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.flatMap(s => s.offers.map(off => ({ student: s, offer: off }))).map(({ student, offer }) => (
                  <tr key={offer.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{student.usn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">{student.department}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{offer.companyName}</td>
                    <td className="py-3 px-4 text-slate-600">{offer.roleTitle}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">₹{offer.packageLPA.toFixed(1)} LPA</td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">{offer.tier}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {offer.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Schedule New Placement Drive */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">PCC: Schedule Campus Recruitment Drive</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-teal-200 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreateDrive} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={newCompany} 
                  onChange={(e) => setNewCompany(e.target.value)} 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Role Title</label>
                <input 
                  type="text" 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)} 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CTC Package (LPA)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={newCtc} 
                    onChange={(e) => setNewCtc(Number(e.target.value))} 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Drive Date</label>
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)} 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Campus Venue</label>
                <input 
                  type="text" 
                  value={newVenue} 
                  onChange={(e) => setNewVenue(e.target.value)} 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold"
                >
                  Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
