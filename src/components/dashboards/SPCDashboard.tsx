import React, { useEffect, useState } from 'react';
import {
  UserAccount,
  StudentProfile,
  PlacementDrive,
  DriveLoadState,
  PortalNotice
} from '../../types';
import type { NoticeAudienceType } from '../../services/noticeAudience';
import { apiFetch } from '../../services/apiFetch';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { 
  Users, 
  Megaphone, 
  Calendar, 
  MapPin, 
  Send, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Search,
  Video,
  RefreshCw
} from 'lucide-react';

interface SPCDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  drives: PlacementDrive[];
  driveLoadState: DriveLoadState;
  driveLoadError: string;
  onRetryDrives: () => void;
}

export const SPCDashboard: React.FC<SPCDashboardProps> = ({
  user,
  students,
  drives,
  driveLoadState,
  driveLoadError,
  onRetryDrives
}) => {
  const [activeTab, setActiveTab] = useState<'liaison' | 'calendar'>('liaison');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetDrive, setTargetDrive] = useState('');
  const [audienceType, setAudienceType] = useState<NoticeAudienceType>('all');
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([]);
  const [selectedStudentUsns, setSelectedStudentUsns] = useState<string[]>([]);
  const [notices, setNotices] = useState<PortalNotice[]>([]);
  const [noticeLoadState, setNoticeLoadState] = useState<DriveLoadState>('loading');
  const [noticeLoadError, setNoticeLoadError] = useState('');
  const [noticeRefreshVersion, setNoticeRefreshVersion] = useState(0);
  const [isSendingNotice, setIsSendingNotice] = useState(false);
  const [noticeSendError, setNoticeSendError] = useState('');
  const [noticeSendSuccess, setNoticeSendSuccess] = useState('');

  useEffect(() => {
    let active = true;

    const loadNotices = async () => {
      setNoticeLoadState('loading');
      setNoticeLoadError('');

      try {
        const response = await apiFetch('/api/spc/notices', {
          method: 'GET',
          credentials: 'same-origin'
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load saved notices.');
        }
        if (!Array.isArray(data.notices)) {
          throw new Error('The server returned an invalid notice history.');
        }
        if (!active) return;

        setNotices(data.notices as PortalNotice[]);
        setNoticeLoadState('success');
      } catch (error) {
        if (!active) return;
        setNoticeLoadError(
          error instanceof Error ? error.message : 'Unable to load saved notices.'
        );
        setNoticeLoadState('error');
      }
    };

    void loadNotices();
    return () => {
      active = false;
    };
  }, [user.id, noticeRefreshVersion]);

  useEffect(() => {
    if (targetDrive && !drives.some(drive => drive.id === targetDrive)) {
      setTargetDrive('');
    }
  }, [drives, targetDrive]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeSendError('');
    setNoticeSendSuccess('');

    if (!broadcastMessage.trim()) {
      setNoticeSendError('Enter a notice before sending.');
      return;
    }

    const audience = {
      type: audienceType,
      ...(audienceType === 'branches' ? { branches: [user.department || ''] } : {}),
      ...(audienceType === 'semesters' ? { semesters: selectedSemesters } : {}),
      ...(audienceType === 'students' ? { studentUsns: selectedStudentUsns } : {})
    };

    setIsSendingNotice(true);
    try {
      const response = await apiFetch('/api/spc/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          driveId: targetDrive || undefined,
          audience
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save the notice.');
      }
      if (!data.notice) {
        throw new Error('The server did not confirm that the notice was saved.');
      }

      setNotices(previous => [
        data.notice as PortalNotice,
        ...previous.filter(notice => notice.id !== data.notice.id)
      ]);
      setBroadcastMessage('');
      setNoticeSendSuccess('Notice saved for the selected students.');
    } catch (error) {
      setNoticeSendError(
        error instanceof Error ? error.message : 'Unable to save the notice.'
      );
    } finally {
      setIsSendingNotice(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Student Coordinator</span>
            <span>-</span>
            <span>SPC</span>
          </div>
          <h1 className="break-words text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Student Liaison & Broadcast
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1 max-w-2xl">
            Drive attendance coordination, venue intimations, and cohort updates.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#E4F2EA]/20 border border-[#97D3CD]/30 px-3.5 py-1.5 rounded-xl text-xs text-[#E4F2EA]">
          <ShieldAlert className="w-4 h-4 text-[#E2A54D] shrink-0" />
          <span>Restricted to drive coordination</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('liaison')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'liaison'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Broadcasts</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Calendar</span>
        </button>
      </div>

      {/* TAB 2: TEAMS PLACEMENT CALENDAR */}
      {activeTab === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={user}
          drives={drives}
          driveLoadState={driveLoadState}
          driveLoadError={driveLoadError}
          onRetryDrives={onRetryDrives}
        />
      )}

      {/* TAB 1: Broadcast Announcements & Drive Coordination Grid */}
      {activeTab === 'liaison' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Post notice */}
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#0C2C47] flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#2D5652]" />
            <span>Broadcast Notice</span>
          </h3>
          <p className="text-xs text-[#2D5652]/70 mt-0.5">Send alerts to student batches</p>

          <form onSubmit={handlePostAnnouncement} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#0C2C47] block mb-1">Target Drive</label>
              <select
                value={targetDrive}
                onChange={(e) => setTargetDrive(e.target.value)}
                className="w-full text-xs p-2 border border-[#97D3CD]/60 rounded-lg bg-[#F8FAF9] text-[#0C2C47]"
              >
                <option value="">No drive selected</option>
                {drives.map(d => (
                  <option key={d.id} value={d.id}>{d.companyName} ({d.roleTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="spc-notice-audience" className="text-xs font-semibold text-[#0C2C47] block mb-1">
                Send to
              </label>
              <select
                id="spc-notice-audience"
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as NoticeAudienceType)}
                className="w-full min-h-11 text-xs p-2 border border-[#97D3CD]/60 rounded-lg bg-[#F8FAF9] text-[#0C2C47]"
              >
                <option value="all">All students in {user.department || 'my department'}</option>
                <option value="branches">My department branch</option>
                <option value="semesters">Selected semesters in my department</option>
                <option value="students">Selected students in my department</option>
              </select>
            </div>

            {audienceType === 'branches' && (
              <p className="rounded-lg bg-[#E4F2EA] p-2 text-xs text-[#2D5652]">
                This notice will be limited to {user.department || 'your assigned department'}.
              </p>
            )}

            {audienceType === 'semesters' && (
              <fieldset className="rounded-lg border border-[#97D3CD]/50 p-2">
                <legend className="px-1 text-xs font-semibold text-[#0C2C47]">Semesters</legend>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }, (_, index) => index + 1).map(semester => (
                    <label key={semester} className="flex min-h-11 items-center gap-1.5 text-xs text-[#0C2C47]">
                      <input
                        type="checkbox"
                        checked={selectedSemesters.includes(semester)}
                        onChange={(event) => {
                          setSelectedSemesters(previous => event.target.checked
                            ? [...new Set([...previous, semester])]
                            : previous.filter(value => value !== semester)
                          );
                        }}
                      />
                      Sem {semester}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {audienceType === 'students' && (
              <div>
                <label htmlFor="spc-notice-students" className="text-xs font-semibold text-[#0C2C47] block mb-1">
                  Students in {user.department || 'my department'}
                </label>
                <select
                  id="spc-notice-students"
                  multiple
                  size={Math.min(5, Math.max(2, students.length))}
                  value={selectedStudentUsns}
                  onChange={(event) => setSelectedStudentUsns(
                    Array.from(event.currentTarget.selectedOptions, option => option.value)
                  )}
                  className="min-h-24 w-full text-xs p-2 border border-[#97D3CD]/60 rounded-lg bg-[#F8FAF9] text-[#0C2C47]"
                >
                  {students.map(student => (
                    <option key={student.usn} value={student.usn}>
                      {student.fullName} - {student.usn}
                    </option>
                  ))}
                </select>
                {students.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">No department students are available.</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="spc-notice-message" className="text-xs font-semibold text-[#0C2C47] block mb-1">Notice</label>
              <textarea
                id="spc-notice-message"
                rows={3}
                maxLength={5000}
                placeholder="Assemble at venue with college ID..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#97D3CD]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2C47] text-[#0C2C47]"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingNotice || !broadcastMessage.trim()}
              className="w-full min-h-11 flex items-center justify-center gap-1.5 py-2 px-4 bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5 text-[#E2A54D]" />
              <span>{isSendingNotice ? 'Saving Notice...' : 'Send Notice'}</span>
            </button>
            {noticeSendError && <p role="alert" className="text-xs text-rose-700">{noticeSendError}</p>}
            {noticeSendSuccess && <p role="status" className="text-xs text-emerald-700">{noticeSendSuccess}</p>}
          </form>

          {/* Recent notices */}
          <div className="mt-5 pt-4 border-t border-[#97D3CD]/30">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#0C2C47] uppercase tracking-wider">Recent Notices</span>
              <button
                type="button"
                onClick={() => setNoticeRefreshVersion(version => version + 1)}
                disabled={noticeLoadState === 'loading'}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#0C2C47] hover:bg-[#E4F2EA] disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
            {noticeLoadState === 'loading' && (
              <p className="rounded-lg bg-[#F8FAF9] p-3 text-xs text-slate-600">Loading saved notices...</p>
            )}
            {noticeLoadState === 'error' && (
              <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{noticeLoadError}</p>
            )}
            {noticeLoadState === 'success' && notices.length === 0 && (
              <p className="rounded-lg bg-[#F8FAF9] p-3 text-xs text-slate-600">No notices have been sent yet.</p>
            )}
            {noticeLoadState === 'success' && notices.length > 0 && (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {notices.map(notice => (
                  <div key={notice.id} className="break-words rounded-lg border border-[#97D3CD]/40 bg-[#F8FAF9] p-2.5 text-xs text-[#2D5652]">
                    {notice.driveName && <p className="mb-1 font-semibold text-[#0C2C47]">{notice.driveName}</p>}
                    <p className="whitespace-pre-wrap">{notice.message}</p>
                    <span className="mt-1 block text-[10px] text-[#2D5652]/70">
                      {new Date(notice.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Kolkata'
                      })}
                      {' - '}
                      {notice.audienceType === 'all' ? 'Department students' :
                        notice.audienceType === 'branches' ? 'Department branch' :
                          notice.audienceType === 'semesters'
                            ? `Semester(s) ${notice.targetSemesters.join(', ')}`
                            : `${notice.targetUsns.length} selected student(s)`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Drive Venues & Schedule Overview */}
        <div className="lg:col-span-2 bg-white border border-[#97D3CD]/50 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#0C2C47] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0C2C47]" />
            <span>Active Drive Schedule</span>
          </h3>
          <p className="text-xs text-[#2D5652]/70 mt-0.5">Schedules and venues</p>

          <div className="mt-4 space-y-3">
            {drives.map(drive => (
              <div key={drive.id} className="p-3.5 rounded-xl border border-[#97D3CD]/40 hover:border-[#0C2C47] transition-colors">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-[#2D5652] bg-[#E4F2EA] px-2 py-0.5 rounded">
                      {drive.driveCode}
                    </span>
                    <h4 className="text-sm font-bold text-[#0C2C47] mt-1">{drive.companyName} · {drive.roleTitle}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0C2C47]">₹{drive.ctcLPA} LPA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{drive.driveDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{drive.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{drive.targetBranches.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      )}

    </div>
  );
};
