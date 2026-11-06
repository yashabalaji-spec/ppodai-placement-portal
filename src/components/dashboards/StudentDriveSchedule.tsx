import React, { useState } from 'react';
import { StudentProfile, PlacementDrive } from '../../types';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Award,
  Layers,
  Info,
  Download,
  Video,
  Grid
} from 'lucide-react';
import { generateStudentResumePDF } from '../../services/pdfService';

interface StudentDriveScheduleProps {
  student: StudentProfile;
  drives: PlacementDrive[];
}

export const StudentDriveSchedule: React.FC<StudentDriveScheduleProps> = ({
  student,
  drives
}) => {
  const [displayMode, setDisplayMode] = useState<'calendar' | 'cards'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'eligible' | 'registered'>('all');
  const [selectedDriveForDetails, setSelectedDriveForDetails] = useState<PlacementDrive | null>(null);

  // Local state for registered drives
  const [registeredDriveIds, setRegisteredDriveIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`gat_student_reg_${student.usn}`);
    return saved ? JSON.parse(saved) : ['d1']; // default registered to Amazon AWS
  });

  const toggleRegistration = (driveId: string) => {
    let next: string[];
    if (registeredDriveIds.includes(driveId)) {
      next = registeredDriveIds.filter(id => id !== driveId);
    } else {
      next = [...registeredDriveIds, driveId];
    }
    setRegisteredDriveIds(next);
    localStorage.setItem(`gat_student_reg_${student.usn}`, JSON.stringify(next));
  };

  // Eligibility check helper
  const checkEligibility = (drive: PlacementDrive) => {
    const meetsCgpa = student.cgpa >= drive.minCGPA;
    const meetsBacklogs = student.currentBacklogs <= drive.maxBacklogsAllowed;
    const meetsBranch = drive.targetBranches.length === 0 || drive.targetBranches.includes(student.department);

    const isEligible = meetsCgpa && meetsBacklogs && meetsBranch;
    const reasons: string[] = [];
    if (!meetsCgpa) reasons.push(`Requires min ${drive.minCGPA.toFixed(2)} CGPA (You have ${student.cgpa.toFixed(2)})`);
    if (!meetsBacklogs) reasons.push(`Requires max ${drive.maxBacklogsAllowed} backlogs (You have ${student.currentBacklogs})`);
    if (!meetsBranch) reasons.push(`Department ${student.department} is not in target list`);

    return { isEligible, reasons };
  };

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = 
      drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const { isEligible } = checkEligibility(drive);
    const isRegistered = registeredDriveIds.includes(drive.id);

    if (filterMode === 'eligible') return isEligible;
    if (filterMode === 'registered') return isRegistered;
    return true;
  });

  const eligibleCount = drives.filter(d => checkEligibility(d).isEligible).length;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-[#0C2C47] p-4 rounded-xl text-white border border-[#97D3CD]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E4F2EA]/20 border border-[#97D3CD]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#97D3CD]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E2A54D]">
                Campus Recruitment Schedule
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-[#E4F2EA]/20 text-[#E4F2EA] font-semibold">
                Live
              </span>
            </div>
            <p className="text-xs text-[#E4F2EA]/90 mt-0.5">
              Real-time schedule of visiting companies, eligibility, and assessment venues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <div className="flex rounded-lg border border-white/20 p-0.5 bg-black/20 text-xs">
            <button
              type="button"
              onClick={() => {
                setDisplayMode('calendar');
                setTimeout(() => {
                  const el = document.getElementById('schedule-view-content');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                displayMode === 'calendar'
                  ? 'bg-white text-[#0C2C47] shadow-xs'
                  : 'text-[#E4F2EA] hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-[#2D5652]" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDisplayMode('cards');
                setTimeout(() => {
                  const el = document.getElementById('schedule-view-content');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-white text-[#0C2C47] shadow-xs'
                  : 'text-[#E4F2EA] hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      <div id="schedule-view-content" className="scroll-mt-16">
      {/* VIEW 1: TEAMS PLACEMENT CALENDAR (PERSONALIZED BY STUDENT BRANCH ELIGIBILITY) */}
      {displayMode === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={{
            id: student.usn,
            name: student.fullName,
            email: student.placementEmailId,
            specialId: student.usn,
            password: '',
            role: 'student',
            department: student.department
          }}
          drives={drives}
          studentCgpa={student.cgpa}
          studentBacklogs={student.currentBacklogs}
          studentDepartment={student.department}
        />
      )}

      {/* VIEW 2: DETAILED DRIVES CARDS & ROADMAP */}
      {displayMode === 'cards' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#2D5652]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#97D3CD]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2C47] text-[#0C2C47]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#0C2C47] text-white'
                    : 'bg-[#E4F2EA] text-[#0C2C47] hover:bg-[#97D3CD]/40'
                }`}
              >
                All ({drives.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('eligible')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'eligible'
                    ? 'bg-[#2D5652] text-white'
                    : 'bg-[#E4F2EA] text-[#2D5652] hover:bg-[#97D3CD]/40'
                }`}
              >
                Eligible ({eligibleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('registered')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'registered'
                    ? 'bg-[#0C2C47] text-white'
                    : 'bg-[#EFEAE6] text-[#0C2C47] hover:bg-[#E2A54D]/30'
                }`}
              >
                Registered ({registeredDriveIds.length})
              </button>
            </div>
          </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDrives.map(drive => {
          const { isEligible, reasons } = checkEligibility(drive);
          const isRegistered = registeredDriveIds.includes(drive.id);
          const isSelected = selectedDriveForDetails?.id === drive.id;

          return (
            <div
              key={drive.id}
              className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between ${
                isRegistered 
                  ? 'border-[#0C2C47] ring-2 ring-[#97D3CD]/60 bg-[#E4F2EA]/20' 
                  : 'border-[#97D3CD]/40'
              }`}
            >
              <div>
                {/* Header row: Company & CTC */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0C2C47] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {drive.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[#0C2C47] tracking-tight">
                          {drive.companyName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E4F2EA] text-[#2D5652] uppercase font-mono">
                          {drive.driveCode}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#2D5652] mt-0.5">
                        {drive.roleTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black font-mono text-[#0C2C47]">
                      ₹{drive.ctcLPA.toFixed(1)} LPA
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 inline-block bg-[#EFEAE6] text-[#2D5652]">
                      {drive.ctcLPA >= 15 ? 'Tier 1' : drive.ctcLPA >= 8 ? 'Tier 2' : 'Tier 3'}
                    </span>
                  </div>
                </div>

                {/* Key Timing & Venue Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#97D3CD]/30 text-xs">
                  <div className="flex items-center gap-1.5 text-[#2D5652]">
                    <Calendar className="w-3.5 h-3.5 text-[#0C2C47] shrink-0" />
                    <span>Date: <strong className="text-[#0C2C47] font-semibold">{drive.driveDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2D5652]">
                    <Clock className="w-3.5 h-3.5 text-[#E2A54D] shrink-0" />
                    <span>Status: <strong className="text-[#0C2C47] font-semibold">{drive.status}</strong></span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5 text-[#2D5652]">
                    <MapPin className="w-3.5 h-3.5 text-[#2D5652] shrink-0" />
                    <span className="break-words">Venue: <strong className="text-[#0C2C47] font-semibold">{drive.venue}</strong></span>
                  </div>
                </div>

                {/* Eligibility Pill & Criteria */}
                <div className="mt-3 p-2.5 rounded-lg bg-[#F8FAF9] border border-[#97D3CD]/40 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      {isEligible ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5652] shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#E2A54D] shrink-0" />
                      )}
                      <span className={`font-semibold ${isEligible ? 'text-[#2D5652]' : 'text-[#0C2C47]'}`}>
                        {isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#2D5652] font-mono">
                      Min CGPA: {drive.minCGPA.toFixed(2)} | Backlogs: {drive.maxBacklogsAllowed}
                    </span>
                  </div>

                  {!isEligible && reasons.length > 0 && (
                    <div className="mt-1 text-[11px] text-[#0C2C47] list-disc list-inside bg-[#EFEAE6] p-1.5 rounded">
                      {reasons.map((r, i) => (
                        <div key={i}>• {r}</div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] font-bold text-[#2D5652] uppercase mr-1">Branches:</span>
                    {drive.targetBranches.map(branch => (
                      <span
                        key={branch}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          branch === student.department
                            ? 'bg-[#0C2C47] text-white'
                            : 'bg-[#E4F2EA] text-[#2D5652]'
                        }`}
                      >
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Drive Rounds Progression Summary */}
                {drive.rounds && drive.rounds.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-[#0C2C47] mb-1">
                      Rounds ({drive.rounds.length}):
                    </div>
                    <div className="space-y-1">
                      {drive.rounds.map(round => (
                        <div 
                          key={round.roundNumber} 
                          className="px-2.5 py-1 rounded bg-[#E4F2EA]/50 text-[11px] flex items-center justify-between text-[#2D5652]"
                        >
                          <span className="font-semibold text-[#0C2C47]">
                            R{round.roundNumber}: {round.roundName}
                          </span>
                          <span className="text-[#2D5652] font-mono text-[10px]">{round.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#97D3CD]/30 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDriveForDetails(isSelected ? null : drive)}
                  className="text-xs font-semibold text-[#0C2C47] hover:text-[#2D5652] flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-[#2D5652]" />
                  <span>{isSelected ? 'Hide Details' : 'Details'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {isEligible ? (
                    <button
                      type="button"
                      onClick={() => toggleRegistration(drive.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        isRegistered
                          ? 'bg-[#2D5652] text-white hover:bg-[#2D5652]/90'
                          : 'bg-[#0C2C47] text-white hover:bg-[#0C2C47]/90'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#97D3CD]" />
                          <span>Registered</span>
                        </>
                      ) : (
                        <>
                          <span>Register</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-[#2D5652]/70">
                      Ineligible
                    </span>
                  )}
                </div>
              </div>

              {/* Expandable Drive Guidelines */}
              {isSelected && (
                <div className="mt-4 p-4 rounded-xl bg-[#E4F2EA] border border-[#97D3CD] text-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-[#0C2C47] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#E2A54D]" />
                      Reporting Guidelines · {drive.companyName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#2D5652] text-[11px]">
                    <div>• <strong>Dress:</strong> Formals / Uniform.</div>
                    <div>• <strong>Documents:</strong> 2 Resume copies + 2 photos.</div>
                    <div>• <strong>Identity:</strong> College ID & VTU Card.</div>
                    <div>• <strong>Time:</strong> 30 mins before at {drive.venue}.</div>
                  </div>

                  <div className="pt-2 border-t border-[#97D3CD]/50 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-[#2D5652]">
                      Keep profile details up to date.
                    </span>
                    <button
                      type="button"
                      onClick={() => generateStudentResumePDF(student)}
                      className="px-2.5 py-1 bg-[#0C2C47] hover:bg-[#0C2C47]/90 text-white font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#E2A54D]" />
                      Resume PDF
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {filteredDrives.length === 0 && (
        <div className="p-10 text-center bg-white border border-[#97D3CD]/40 rounded-xl">
          <Calendar className="w-9 h-9 text-[#2D5652]/40 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#0C2C47]">No Placement Drives Found</h4>
          <p className="text-xs text-[#2D5652] mt-1">Try another search or filter.</p>
        </div>
      )}

      </div>
      )}
      </div>

    </div>
  );
};
