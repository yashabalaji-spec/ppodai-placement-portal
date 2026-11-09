import React, { useEffect, useState } from 'react';
import { UserAccount, StudentProfile, PlacementDrive, DriveLoadState, ProfileEditRequest } from '../../types';
import { SectionWiseHODChart } from '../common/Charts';
import { BRANCHES } from '../../data/mockData';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Building, 
  UserCheck,
  CheckCircle,
  ExternalLink,
  Users,
  ShieldAlert,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Video,
  Calendar
} from 'lucide-react';

interface HODDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  drives?: PlacementDrive[];
  driveLoadState: DriveLoadState;
  driveLoadError: string;
  onRetryDrives: () => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({
  user,
  students,
  drives = [],
  driveLoadState,
  driveLoadError,
  onRetryDrives
}) => {
  // STRICT REQUIREMENT: HODs are restricted to their own department and cannot access any other department info
  const currentBranchCode = user.department || '';
  const branchMeta = BRANCHES.find(b => b.code === currentBranchCode) || BRANCHES[0];

  const [activeTab, setActiveTab] = useState<'roster' | 'requests' | 'analytics' | 'calendar'>('roster');
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentUsn, setExpandedStudentUsn] = useState<string | null>(null);
  const [rejectRemarksInput, setRejectRemarksInput] = useState<{ [usn: string]: string }>({});
  const [pendingRequests, setPendingRequests] = useState<ProfileEditRequest[]>([]);
  const [requestLoadState, setRequestLoadState] = useState<'loading' | 'success' | 'error'>('loading');
  const [requestLoadError, setRequestLoadError] = useState('');
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState('');
  const [requestRefreshVersion, setRequestRefreshVersion] = useState(0);

  useEffect(() => {
    if (activeTab !== 'requests') return;

    let active = true;
    const loadRequests = async () => {
      try {
        const response = await fetch('/api/hod/profile-edit-requests', {
          credentials: 'same-origin'
        });
        const data = await response.json() as {
          message?: string;
          requests?: ProfileEditRequest[];
        };
        if (!response.ok || !Array.isArray(data.requests)) {
          throw new Error(data.message || 'Unable to load profile edit requests.');
        }
        if (!active) return;
        setPendingRequests(data.requests);
        setRequestLoadState('success');
        setRequestLoadError('');
      } catch (error) {
        if (!active) return;
        setRequestLoadState('error');
        setRequestLoadError(
          error instanceof Error ? error.message : 'Unable to load profile edit requests.'
        );
      }
    };

    void loadRequests();
    const refreshTimer = window.setInterval(() => void loadRequests(), 30000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [activeTab, user.department, requestRefreshVersion]);

  // Filter students belonging ONLY to this HOD's branch
  const branchStudents = students.filter(s =>
    s.branchCode
      ? s.branchCode === currentBranchCode
      : s.department === currentBranchCode
  );
  
  const filteredStudents = branchStudents.filter(s => {
    const matchesSection = selectedSection === 'ALL' || s.section === selectedSection;
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.usn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Students in this branch requesting profile edit permission
  const handleReviewRequest = async (
    request: ProfileEditRequest,
    status: 'approved' | 'rejected'
  ) => {
    setReviewingRequestId(request.id);
    setReviewError('');
    try {
      const response = await fetch(`/api/hod/profile-edit-requests/${encodeURIComponent(request.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          status,
          remarks: rejectRemarksInput[request.id] || (
            status === 'approved'
              ? 'Approved by HOD for profile update.'
              : 'Request rejected. Contact HOD office.'
          )
        })
      });
      const data = await response.json() as { message?: string; success?: boolean };
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to review this request.');
      }
      setPendingRequests(current => current.filter(item => item.id !== request.id));
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : 'Unable to review this request.'
      );
    } finally {
      setReviewingRequestId(null);
    }
  };

  const totalPlaced = branchStudents.filter(s => s.isPlaced).length;
  const placementPercent = branchStudents.length > 0 ? ((totalPlaced / branchStudents.length) * 100).toFixed(1) : '95.5';

  return (
    <div className="space-y-6">
      
      {/* HOD Header Banner */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Head of Department</span>
            <span>·</span>
            <span>{currentBranchCode}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Department of {branchMeta.name}
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1">
            HOD: <span className="font-semibold text-white">{branchMeta.hod}</span> · Student roster, offers, and department analytics
          </p>
        </div>

        <div className="text-right flex items-center gap-3 self-start md:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-[#E4F2EA] text-[#0C2C47] text-xs">
            <span className="text-[#2D5652] block text-[10px] uppercase font-bold">Placement Rate</span>
            <span className="text-base font-bold font-mono text-[#0C2C47]">{placementPercent}%</span>
          </div>
        </div>
      </div>

      {/* Department Notice */}
      <div className="p-3 bg-[#EFEAE6] border border-[#97D3CD]/60 rounded-xl flex items-center justify-between text-xs text-[#0C2C47]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#2D5652] shrink-0" />
          <span>
            Department scope: Restricted to <strong>{branchMeta.name} ({currentBranchCode})</strong>.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E4F2EA] text-[#2D5652] font-bold shrink-0">
          {currentBranchCode}
        </span>
      </div>

      {/* HOD Console Navigation Tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'roster'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Roster ({filteredStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Unlock className="w-3.5 h-3.5 text-[#E2A54D]" />
          <span>Unlock Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E2A54D] text-[#0C2C47] font-bold ml-1">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Sections</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Calendar</span>
        </button>
      </div>

      {/* TAB: TEAMS PLACEMENT CALENDAR (STRICTLY ISOLATED TO HOD'S OWN DEPARTMENT) */}
      {activeTab === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={user}
          drives={drives}
          driveLoadState={driveLoadState}
          driveLoadError={driveLoadError}
          onRetryDrives={onRetryDrives}
        />
      )}

      {/* TAB 1: SECTION-WISE GRAPH (Always available or in analytics tab) */}
      {(activeTab === 'roster' || activeTab === 'analytics') && (
        <SectionWiseHODChart department={currentBranchCode} />
      )}

      {/* TAB 2: PROFILE UNLOCK REQUESTS MANAGEMENT */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Unlock className="w-4 h-4 text-amber-600" />
                <span>Student Profile Edit Permission Requests</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students in {currentBranchCode} must seek HOD approval before modifying locked placement records.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900">
              {pendingRequests.length} Awaiting Your Review
            </span>
          </div>

          {reviewError && (
            <div role="alert" className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
              {reviewError}
            </div>
          )}

          {requestLoadState === 'loading' ? (
            <div role="status" className="p-8 text-center text-sm text-slate-600">
              Loading profile edit requests...
            </div>
          ) : requestLoadState === 'error' ? (
            <div role="alert" className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
              <p>{requestLoadError}</p>
              <button
                type="button"
                onClick={() => setRequestRefreshVersion(version => version + 1)}
                className="mt-2 px-3 py-1 rounded bg-red-800 text-white font-semibold"
              >
                Retry
              </button>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Pending Unlock Requests</h4>
              <p className="text-xs text-slate-500 mt-1">
                All student profiles in Department of {branchMeta.name} are currently locked and in verified state.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(reqStudent => (
                <div 
                  key={reqStudent.id}
                  className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {reqStudent.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{reqStudent.studentName}</span>
                          <span className="font-mono text-xs font-semibold text-slate-600">({reqStudent.usn})</span>
                          <span className="text-[10px] font-semibold bg-white border border-amber-200 px-2 py-0.5 rounded text-amber-800">
                          Sec {reqStudent.section || '—'} · CGPA {(reqStudent.cgpa || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Requested at: {new Date(reqStudent.requestedAt).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleReviewRequest(reqStudent, 'approved')}
                        disabled={reviewingRequestId === reqStudent.id}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Unlock Profile</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => void handleReviewRequest(reqStudent, 'rejected')}
                        disabled={reviewingRequestId === reqStudent.id}
                        className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Reason */}
                  <div className="p-3 bg-white border border-amber-200 rounded-lg text-xs">
                    <span className="font-semibold text-slate-800 block mb-1">Student's Stated Reason:</span>
                    <p className="text-slate-600 italic">
                      "{reqStudent.reason}"
                    </p>
                  </div>

                  {/* Optional Remarks input */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 shrink-0">HOD Remarks (optional):</span>
                    <input
                      type="text"
                      placeholder="Add remarks for student..."
                      value={rejectRemarksInput[reqStudent.id] || ''}
                      onChange={(e) => setRejectRemarksInput({ ...rejectRemarksInput, [reqStudent.id]: e.target.value })}
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT DETAILS TABLE */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          
          {/* Table Filters & Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Student Placement Roster</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredStudents.length} Students in {currentBranchCode})
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highlighting total offers received and highest package for each student (e.g. 5–7 offers evaluated)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search USN or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-44"
                />
              </div>

              {/* Section Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                {(['ALL', 'A', 'B', 'C'] as const).map(sec => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedSection === sec
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sec === 'ALL' ? 'All Sections' : `Sec ${sec}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student USN & Name</th>
                  <th className="py-3 px-3">Section</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Total Offers</th>
                  <th className="py-3 px-4">Highest Package (LPA)</th>
                  <th className="py-3 px-4">Top Recruiting Company</th>
                  <th className="py-3 px-4">Profile Status</th>
                  <th className="py-3 px-4 text-right">Offer Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No student records found in {currentBranchCode} matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const sortedOffers = [...student.offers].sort((a, b) => b.packageLPA - a.packageLPA);
                    const highestOffer = sortedOffers[0];
                    const isExpanded = expandedStudentUsn === student.usn;

                    return (
                      <React.Fragment key={student.usn}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-xs">{student.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{student.usn}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[11px]">
                              Sec {student.section}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                            {student.cgpa.toFixed(2)}
                          </td>

                          <td className="py-3 px-3">
                            {student.offers.length > 0 ? (
                              <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                {student.offers.length} Offer{student.offers.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">No offers yet</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {highestOffer ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold font-mono">
                                <span>₹{highestOffer.packageLPA.toFixed(1)} LPA</span>
                                {sortedOffers.length > 1 && (
                                  <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-1 rounded">
                                    Peak
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-800">
                            {highestOffer ? (
                              <div>
                                <span className="font-semibold">{highestOffer.companyName}</span>
                                <span className="text-[11px] text-slate-400 block">{highestOffer.roleTitle}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {student.editPermissionStatus === 'pending' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-max">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Unlock Pending
                              </span>
                            ) : student.isLocked !== false ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 w-max">
                                <Lock className="w-3 h-3 text-slate-500" />
                                Locked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                                <Unlock className="w-3 h-3 text-emerald-600" />
                                Unlocked (Editing)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {student.offers.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setExpandedStudentUsn(isExpanded ? null : student.usn)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <span>{isExpanded ? 'Hide' : 'View All'} ({student.offers.length})</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>

                        {/* Collapsible View for Multi-Offer Details */}
                        {isExpanded && sortedOffers.length > 0 && (
                          <tr className="bg-sky-50/30">
                            <td colSpan={8} className="py-3 px-6 border-y border-sky-100">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-900">
                                    Complete Offer Portfolio for {student.fullName} ({student.usn})
                                  </span>
                                  <span className="text-xs font-semibold text-emerald-700">
                                    Highest Package: ₹{highestOffer.packageLPA.toFixed(1)} LPA from {highestOffer.companyName}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                                  {sortedOffers.map((off, oIdx) => (
                                    <div 
                                      key={off.id} 
                                      className={`p-2.5 rounded-lg border text-xs ${
                                        oIdx === 0 
                                          ? 'border-indigo-300 bg-indigo-50/70 ring-1 ring-indigo-400' 
                                          : 'border-slate-200 bg-slate-50/50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900 truncate">{off.companyName}</span>
                                        {oIdx === 0 && (
                                          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                                            Highest
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-600 mt-0.5 truncate">{off.roleTitle}</div>
                                      <div className="text-xs font-mono font-bold text-indigo-700 mt-1">
                                        ₹{off.packageLPA.toFixed(1)} LPA
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-1">
                                        {off.tier}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
