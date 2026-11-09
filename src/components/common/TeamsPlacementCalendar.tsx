import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserAccount, PlacementDrive, RoleType, Company, DriveLoadState } from '../../types';
import { BRANCHES } from '../../data/mockData';
import {
  createPlacementDrive,
  formatDriveDate,
  formatMeetingTimeIST,
  getTodayDateInIST,
  isPastMeetingInIST
} from '../../services/placementDriveService';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  Users,
  Video,
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  X,
  ExternalLink,
  Sparkles,
  Info,
  ShieldAlert,
  Send,
  Lock,
  Search
} from 'lucide-react';

interface TeamsPlacementCalendarProps {
  currentUser: UserAccount;
  drives: PlacementDrive[];
  companies?: Company[];
  onAddDrive?: (newDrive: PlacementDrive) => void;
  onUpdateDrive?: (updatedDrive: PlacementDrive) => void;
  driveLoadState?: DriveLoadState;
  driveLoadError?: string;
  onRetryDrives?: () => void;
  // If student is logged in, pass student details for eligibility checking
  studentCgpa?: number;
  studentBacklogs?: number;
  studentDepartment?: string;
}

export const TeamsPlacementCalendar: React.FC<TeamsPlacementCalendarProps> = ({
  currentUser,
  drives,
  companies = [],
  onAddDrive,
  onUpdateDrive,
  driveLoadState = 'success',
  driveLoadError = '',
  onRetryDrives,
  studentCgpa,
  studentBacklogs,
  studentDepartment
}) => {
  const [currentYear, setCurrentYear] = useState<number>(() => Number(getTodayDateInIST().slice(0, 4)));
  const [currentMonth, setCurrentMonth] = useState<number>(() => Number(getTodayDateInIST().slice(5, 7)) - 1);
  const [viewMode, setViewMode] = useState<'month' | 'agenda' | 'week'>('month');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [selectedDriveModal, setSelectedDriveModal] = useState<PlacementDrive | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State for PCC New Meeting / Drive Scheduling
  const [companyName, setCompanyName] = useState('Google India');
  const [roleTitle, setRoleTitle] = useState('Software Engineer - University Graduate');
  const [ctcLPA, setCtcLPA] = useState<number>(32.0);
  const [driveDate, setDriveDate] = useState(getTodayDateInIST);
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('16:30');
  const [meetingType, setMeetingType] = useState<PlacementDrive['meetingType']>('Campus Placement Drive');
  const [venue, setVenue] = useState('Central Computing Center Lab 1 & 2');
  const [teamsMeetingLink, setTeamsMeetingLink] = useState('https://teams.microsoft.com/l/meetup-join/gat-campus-placement-2026');
  const [minCGPA, setMinCGPA] = useState<number>(7.5);
  const [maxBacklogsAllowed, setMaxBacklogsAllowed] = useState<number>(0);
  const [targetBranches, setTargetBranches] = useState<string[]>(['CSE', 'ISE', 'AIML', 'AIDS', 'ECE']);
  const [companyInfo, setCompanyInfo] = useState('Global technology leader in cloud computing, search engine architecture, and artificial intelligence models.');
  const [jobDescription, setJobDescription] = useState('Build high-scale distributed backend systems, design responsive interfaces, and optimize algorithmic runtime performance.');
  const [skillsText, setSkillsText] = useState('Data Structures, Algorithms, Python, Java, Cloud Computing');
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);
  const [meetingSaveError, setMeetingSaveError] = useState('');
  const [meetingSaveSuccess, setMeetingSaveSuccess] = useState('');
  const idempotencyRequest = useRef<{ fingerprint: string; key: string } | null>(null);
  const isSavingRef = useRef(false);

  const canSchedule = currentUser.role === 'pcc' ||
    currentUser.role === 'placement_dean' ||
    currentUser.role === 'admin';

  // Determine user's effective department
  const effectiveDept = studentDepartment || currentUser.department || (currentUser.role === 'student' ? 'CSE' : undefined);

  useEffect(() => {
    if (companies.length > 0 && !companies.some(company => company.name === companyName)) {
      setCompanyName(companies[0].name);
    }
  }, [companies, companyName]);

  // Month Names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday, 1 is Monday
  const todayDateInIST = getTodayDateInIST();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const today = getTodayDateInIST();
    setCurrentYear(Number(today.slice(0, 4)));
    setCurrentMonth(Number(today.slice(5, 7)) - 1);
  };

  // =========================================================================
  // ACCESS CONTROL & ELIGIBILITY FILTERING ENGINE:
  // Rule:
  // - Students: ONLY eligible to drives targeting their department (e.g. if company wants CS, IS, AIML, only those students see it)
  // - HOD of related: restricted to their own department (e.g. HOD CSE only sees drives targeting CSE)
  // - FPC / SPC: restricted to their department
  // - Dean, Principal, Faculty Management, Admin, PCC: view all or filter by branch
  // =========================================================================
  const visibleDrives = useMemo(() => {
    return drives.filter(drive => {
      // 1. Search term filter
      if (searchTerm) {
        const matchesTerm =
          drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drive.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drive.venue.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesTerm) return false;
      }

      // 2. Student Role Access Filter: STRICT BRANCH ELIGIBILITY
      if (currentUser.role === 'student') {
        const studentBranch = effectiveDept || 'CSE';
        // If targetBranches is defined and non-empty, student's branch MUST be in targetBranches
        if (drive.targetBranches.length > 0) {
          const isTargetedToStudentBranch = drive.targetBranches.includes(studentBranch);
          if (!isTargetedToStudentBranch) {
            return false; // Student CANNOT see company if their branch is not targeted!
          }
        }
        return true;
      }

      // 3. HOD Role Access Filter: STRICT OWN DEPARTMENT ISOLATION
      if (currentUser.role === 'hod') {
        const hodBranch = currentUser.department || 'CSE';
        if (drive.targetBranches.length > 0) {
          const isTargetedToHodDept = drive.targetBranches.includes(hodBranch);
          if (!isTargetedToHodDept) {
            return false; // HOD cannot see drives not recruiting from their department
          }
        }
        return true;
      }

      // 4. FPC & SPC Role Access Filter: OWN DEPARTMENT
      if (currentUser.role === 'fpc' || currentUser.role === 'spc') {
        const coordBranch = currentUser.department || 'CSE';
        if (drive.targetBranches.length > 0) {
          return drive.targetBranches.includes(coordBranch);
        }
        return true;
      }

      // 5. Higher Leadership (Dean, Principal, Management, PCC, Admin)
      // Can view everything, with optional selectedBranchFilter
      if (selectedBranchFilter !== 'ALL') {
        return drive.targetBranches.length === 0 || drive.targetBranches.includes(selectedBranchFilter);
      }

      return true;
    });
  }, [drives, currentUser.role, effectiveDept, currentUser.department, selectedBranchFilter, searchTerm]);

  // Map drives to days in the active month
  const drivesByDate = useMemo(() => {
    const map: Record<string, PlacementDrive[]> = {};
    visibleDrives.forEach(drive => {
      const dateKey = drive.driveDate.slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(drive);
    });
    return map;
  }, [visibleDrives]);

  const sortedVisibleDrives = useMemo(
    () => [...visibleDrives].sort((a, b) =>
      `${a.driveDate.slice(0, 10)} ${a.startTime || ''}`
        .localeCompare(`${b.driveDate.slice(0, 10)} ${b.startTime || ''}`)
    ),
    [visibleDrives]
  );

  const monthHasDrives = sortedVisibleDrives.some(drive =>
    drive.driveDate.slice(0, 7) === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
  );

  // Handle scheduling form submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSchedule || isSavingRef.current) return;
    setMeetingSaveError('');
    setMeetingSaveSuccess('');
    if (driveLoadState !== 'success') {
      setMeetingSaveError('Load the current placement schedule before creating a meeting. Retry the calendar request, then try again.');
      return;
    }

    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const selectedCompany = companies.find(company => company.name === companyName);
    if (!selectedCompany) {
      setMeetingSaveError('Choose a company registered in the portal before scheduling.');
      return;
    }
    if (!onAddDrive) {
      setMeetingSaveError('The calendar could not connect to the saved meeting list. Refresh and try again.');
      return;
    }

    const payload = {
      companyId: selectedCompany.id,
      roleTitle: roleTitle.trim(),
      ctcLPA: Number(ctcLPA),
      minCGPA: Number(minCGPA),
      maxBacklogsAllowed: Number(maxBacklogsAllowed),
      driveDate,
      startTime,
      endTime,
      meetingType: meetingType || 'Campus Placement Drive',
      teamsMeetingLink: teamsMeetingLink.trim(),
      venue: venue.trim(),
      targetBranches,
      requiredSkills: skillsArray,
      jobDescription,
      status: 'Upcoming' as const,
      isPublished: true,
      rounds: [{
        roundNumber: 1,
        roundName: meetingType || 'Campus Placement Drive',
        date: driveDate,
        venue: venue.trim()
      }]
    };
    const fingerprint = JSON.stringify(payload);
    if (idempotencyRequest.current?.fingerprint !== fingerprint) {
      idempotencyRequest.current = {
        fingerprint,
        key: crypto.randomUUID()
      };
    }

    isSavingRef.current = true;
    setIsSavingMeeting(true);
    try {
      const savedDrive = await createPlacementDrive(payload, idempotencyRequest.current.key);
      idempotencyRequest.current = null;
      onAddDrive(savedDrive);
      setMeetingSaveSuccess('Meeting saved to PostgreSQL and added to the calendar.');
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Meeting schedule save failed:', error);
      setMeetingSaveError(
        error instanceof Error ? error.message : 'Unable to save the scheduled meeting.'
      );
    } finally {
      isSavingRef.current = false;
      setIsSavingMeeting(false);
    }
  };

  const toggleBranchSelection = (code: string) => {
    setTargetBranches(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Header & Action Bar */}
      <div className="bg-[#0C2C47] text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#97D3CD]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4F2EA]/20 border border-[#97D3CD]/30 flex items-center justify-center text-white shadow-xs">
              <Video className="w-5 h-5 text-[#97D3CD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E2A54D] text-[#0C2C47] px-2 py-0.5 rounded">
                  Calendar
                </span>
                <span className="text-[11px] text-[#E4F2EA]">
                  Campus Placement Schedule
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Company Visits & Interview Rounds
              </h2>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canSchedule ? (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-3.5 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Meeting</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-white/10 rounded-xl text-[11px] text-[#E4F2EA] flex items-center gap-1.5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-[#E2A54D]" />
                <span>Scheduling: PCC, Placement Dean, and Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Role-Based Access Notification Banner */}
        <div className="mt-3.5 pt-3 border-t border-[#97D3CD]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#97D3CD] shrink-0" />
            {currentUser.role === 'student' ? (
              <span>
                Filtered for <strong className="text-[#E2A54D] font-bold">{effectiveDept}</strong>: Showing {visibleDrives.length} drives targeting your department.
              </span>
            ) : currentUser.role === 'hod' ? (
              <span>
                Dept filter: <strong className="text-[#E2A54D] font-bold">{currentUser.department || 'CSE'}</strong> ({visibleDrives.length} active drives).
              </span>
            ) : (
              <span>
                Viewing institutional schedule across all 15 departments ({visibleDrives.length} drives).
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#E4F2EA]">
            <span>{visibleDrives.length} Visible</span>
            <span>·</span>
            <span>Dates and times: IST</span>
          </div>
        </div>
      </div>

      {/* Calendar Controls & Navigation Bar */}
      {meetingSaveSuccess && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          {meetingSaveSuccess}
        </p>
      )}
      {driveLoadState === 'loading' && (
        <p role="status" className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-800">
          Loading placement meetings…
        </p>
      )}
      {driveLoadState === 'success' && visibleDrives.length > 0 && (
        <p role="status" className="text-[11px] text-emerald-800">
          Loaded {visibleDrives.length} meeting{visibleDrives.length === 1 ? '' : 's'} available to your role and filters.
        </p>
      )}
      {driveLoadState === 'error' && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          <span>{driveLoadError || 'Unable to load placement meetings.'}</span>
          {onRetryDrives && (
            <button type="button" onClick={onRetryDrives} className="shrink-0 font-bold underline">
              Retry
            </button>
          )}
        </div>
      )}
      {driveLoadState === 'success' && visibleDrives.length === 0 && (
        <p role="status" className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
          No meetings are available for your role, department, and current filters.
        </p>
      )}
      {meetingSaveError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {meetingSaveError}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm sm:text-base font-bold text-slate-900 ml-1">
            {monthNames[currentMonth]} {currentYear}
          </div>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search drive */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search company or JD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
            />
          </div>

          {/* Department Filter for authorized leadership roles */}
          {(currentUser.role === 'admin' || currentUser.role === 'pcc' || currentUser.role === 'placement_dean' || currentUser.role === 'principal' || currentUser.role === 'faculty_mgmt') && (
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Departments</option>
                {BRANCHES.map(b => (
                  <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* View Toggles */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda / Schedule
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: MONTH GRID (TEAMS STYLE) */}
      {/* ========================================================================= */}
      {viewMode === 'month' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {driveLoadState === 'success' && visibleDrives.length > 0 && !monthHasDrives && (
            <p className="px-4 py-3 text-center text-xs text-slate-500">
              No meetings scheduled in {monthNames[currentMonth]} {currentYear}. Use the arrows or Today to change months.
            </p>
          )}

          {/* Month day cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200">
            {/* Blank offset days from previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[110px] p-1.5 bg-slate-50/50 text-slate-300 text-xs font-mono">
                {/* empty */}
              </div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayDrives = drivesByDate[dateString] || [];
              const isToday = dateString === todayDateInIST;

              return (
                <div
                  key={dateString}
                  className={`min-h-[115px] p-1.5 transition-colors relative flex flex-col justify-between ${
                    dayDrives.length > 0 ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Date badge */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>
                    {dayDrives.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-full">
                        {dayDrives.length} Event{dayDrives.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Events list on this date */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-24">
                    {dayDrives.map(drive => (
                      <div
                        key={drive.id}
                        onClick={() => setSelectedDriveModal(drive)}
                        className="p-1.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group text-left border-l-4 border-l-indigo-600"
                        title="Click to view company JD & meeting details"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-mono font-semibold text-indigo-700 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatMeetingTimeIST(drive.startTime)}
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            ₹{drive.ctcLPA} LPA
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-900 truncate mt-0.5 group-hover:text-indigo-700">
                          {drive.companyName}
                        </div>

                        <div className="text-[10px] text-slate-500 truncate">
                          {drive.roleTitle}
                        </div>

                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {drive.targetBranches.slice(0, 3).map(b => (
                            <span key={b} className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-semibold">
                              {b}
                            </span>
                          ))}
                          {drive.targetBranches.length > 3 && (
                            <span className="text-[9px] text-slate-400">+{drive.targetBranches.length - 3}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add meeting shortcut for PCC */}
                  {canSchedule && (
                    <button
                      onClick={() => {
                        setDriveDate(dateString);
                        setShowScheduleModal(true);
                      }}
                      className="opacity-0 hover:opacity-100 focus:opacity-100 w-full text-center text-[10px] text-indigo-600 hover:text-indigo-800 font-bold py-0.5 mt-1 rounded bg-indigo-50 transition-opacity"
                    >
                      + Schedule
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: AGENDA / SCHEDULE VIEW (LIST) */}
      {/* ========================================================================= */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {visibleDrives.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              No placement meetings or company visits scheduled for your criteria.
            </div>
          ) : (
            sortedVisibleDrives.map(drive => (
              <div
                key={drive.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-indigo-600"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {drive.driveCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {formatDriveDate(drive.driveDate.slice(0, 10))} ({formatMeetingTimeIST(drive.startTime)} - {formatMeetingTimeIST(drive.endTime)})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isPastMeetingInIST(drive.driveDate, drive.endTime) ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {isPastMeetingInIST(drive.driveDate, drive.endTime) ? 'Past' : 'Upcoming'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      drive.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      drive.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {drive.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{drive.companyName}</span>
                      <span className="text-slate-400 font-normal">·</span>
                      <span className="text-slate-700 text-sm font-semibold">{drive.roleTitle}</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {drive.jobDescription || drive.companyInfo}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      CTC: ₹{drive.ctcLPA} LPA
                    </span>
                    <span>
                      Min CGPA: <strong className="text-slate-900">{drive.minCGPA}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {drive.venue}
                    </span>
                    {drive.teamsMeetingLink && (
                      <span className="text-indigo-600 flex items-center gap-1 font-semibold">
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                        Teams Enabled
                      </span>
                    )}
                  </div>

                  {/* Target branches */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Eligible Branches:</span>
                    {drive.targetBranches.map(b => (
                      <span
                        key={b}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          b === effectiveDept
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b} {b === effectiveDept ? '★ (Your Branch)' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right hidden md:block">
                    <span className="text-xs text-slate-500 font-mono">
                      Enrolled: <strong className="text-purple-700">{drive.enrolledCount || 0}</strong> / {drive.eligibleStudentCount}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedDriveModal(drive)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View JD & Meeting Details</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW COMPANY DETAILS, JD & TEAMS MEETING MODAL */}
      {/* ========================================================================= */}
      {selectedDriveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#3b3a6e] to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-200">
                  <span>{selectedDriveModal.driveCode}</span>
                  <span>·</span>
                  <span className="uppercase tracking-wider">{selectedDriveModal.meetingType || 'Campus Placement Drive'}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedDriveModal.companyName}
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  {selectedDriveModal.roleTitle} · Offering ₹{selectedDriveModal.ctcLPA} LPA Package
                </p>
              </div>

              <button
                onClick={() => setSelectedDriveModal(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              
              {/* Meeting Schedule & Teams Join Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <CalendarIcon className="w-4 h-4 text-indigo-600" />
                    <span>Scheduled for: {formatDriveDate(selectedDriveModal.driveDate.slice(0, 10))}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatMeetingTimeIST(selectedDriveModal.startTime)} - {formatMeetingTimeIST(selectedDriveModal.endTime)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedDriveModal.venue}
                    </span>
                  </div>
                  {selectedDriveModal.scheduledBy && (
                    <div className="text-[11px] text-slate-500">
                      Organized by: <strong className="text-slate-800">{selectedDriveModal.scheduledBy}</strong>
                    </div>
                  )}
                </div>

                {selectedDriveModal.teamsMeetingLink && (
                  <a
                    href={selectedDriveModal.teamsMeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#4b4986] hover:bg-[#3b3a6e] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 self-start sm:self-auto"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Microsoft Teams Meeting</span>
                    <ExternalLink className="w-3 h-3 text-indigo-300" />
                  </a>
                )}
              </div>

              {/* Company Basic Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Company Profile & Overview</span>
                </h4>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white leading-relaxed text-slate-700">
                  {selectedDriveModal.companyInfo || 'Tier 1 Enterprise Technology Recruiter participating in GAT Campus Placements.'}
                </div>
              </div>

              {/* Job Description (JD) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Job Description & Role Requirements (JD)</span>
                </h4>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white leading-relaxed text-slate-700 whitespace-pre-line">
                  {selectedDriveModal.jobDescription || 'Full-time engineering role building next-generation products, scalable services, and core architectural components.'}
                </div>
              </div>

              {/* Required Technical Skills */}
              {selectedDriveModal.requiredSkills && selectedDriveModal.requiredSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Required Core Competencies & Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDriveModal.requiredSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg border border-indigo-200 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Criteria & Target Branches */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Eligibility Criteria & Target Branches
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Minimum CGPA Required</span>
                    <strong className="text-slate-900 text-sm font-mono">{selectedDriveModal.minCGPA}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Maximum Backlogs Allowed</span>
                    <strong className="text-slate-900 text-sm font-mono">{selectedDriveModal.maxBacklogsAllowed} Backlogs</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Package Offered</span>
                    <strong className="text-emerald-700 text-sm font-mono">₹{selectedDriveModal.ctcLPA} LPA</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Eligible Departments:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDriveModal.targetBranches.map(b => (
                      <span
                        key={b}
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                          b === effectiveDept
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {b} {b === effectiveDept ? '★ (Your Department)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drive Rounds */}
              {selectedDriveModal.rounds.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Drive Selection Stages & Rounds
                  </h4>
                  <div className="space-y-2">
                    {selectedDriveModal.rounds.map(round => (
                      <div key={round.roundNumber} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">Round {round.roundNumber}: {round.roundName}</span>
                          <span className="text-slate-500 text-[11px]">{round.date} · {round.venue}</span>
                        </div>
                        <span className="font-mono text-emerald-700 font-semibold">
                          {round.qualifiedStudents.length} Shortlisted
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Placement Cell Code: <code className="font-mono text-indigo-700 font-bold">{selectedDriveModal.driveCode}</code>
              </span>
              <button
                onClick={() => setSelectedDriveModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close Meeting Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PCC SCHEDULE MEETING & PUBLISH JD MODAL */}
      {/* ========================================================================= */}
      {showScheduleModal && canSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#3b3a6e] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-200">
                  Placement Coordination Cell (PCC) · PO Scheduler
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Schedule Company Placement Drive & Publish JD
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleScheduleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                  <select
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                    disabled={companies.length === 0 || isSavingMeeting}
                  >
                    {companies.length === 0 && <option value="">No companies available</option>}
                    {companies.map(company => (
                      <option key={company.id} value={company.name}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="e.g. Software Engineer - Cloud"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package CTC (LPA) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={ctcLPA}
                    onChange={(e) => setCtcLPA(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Drive Date *</label>
                  <input
                    type="date"
                    required
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meeting Type</label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Campus Placement Drive">Campus Placement Drive</option>
                    <option value="Pre-Placement Talk (PPT)">Pre-Placement Talk (PPT)</option>
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Technical Interviews">Technical Interviews</option>
                    <option value="Virtual Teams Meeting">Virtual Teams Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time (IST)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time (IST)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue / Physical Location *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  placeholder="e.g. GAT Auditorium & CCC Lab 1 & 2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Microsoft Teams Meeting Link</label>
                <input
                  type="url"
                  value={teamsMeetingLink}
                  onChange={(e) => setTeamsMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-indigo-700"
                  placeholder="https://teams.microsoft.com/l/meetup-join/..."
                />
              </div>

              {/* TARGET BRANCHES CHECKBOXES: THE CRITICAL ACCESS BOUNDARY */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Eligible Branches * (Only students in these branches will see this drive!)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select which branches are eligible to view this meeting on their calendar and apply:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {BRANCHES.map(branch => {
                    const isChecked = targetBranches.includes(branch.code);
                    return (
                      <label
                        key={branch.code}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBranchSelection(branch.code)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{branch.code}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minCGPA}
                    onChange={(e) => setMinCGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Backlogs Permitted</label>
                  <input
                    type="number"
                    value={maxBacklogsAllowed}
                    onChange={(e) => setMaxBacklogsAllowed(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Overview / Basic Info</label>
                <textarea
                  rows={2}
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Brief description about the recruiting company..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Job Description (JD) *</label>
                <textarea
                  rows={4}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Full job description, duties, expectations..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Core Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  placeholder="e.g. Python, React, Cloud, SQL, Data Structures"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Publishing will immediately broadcast this drive onto the Teams placement calendars of all eligible students and department HODs.
                </span>
              </div>

              {meetingSaveError && (
                <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                  {meetingSaveError}
                </p>
              )}

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMeetingSaveError('');
                    setShowScheduleModal(false);
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeeting || companies.length === 0 || targetBranches.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSavingMeeting ? 'Saving Meeting…' : 'Publish Drive Meeting to Calendar'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
