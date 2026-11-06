import React, { useState } from 'react';
import { UserAccount, StudentProfile, PlacementDrive } from '../../types';
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
  Video
} from 'lucide-react';

interface SPCDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  drives: PlacementDrive[];
}

export const SPCDashboard: React.FC<SPCDashboardProps> = ({
  user,
  students,
  drives
}) => {
  const [activeTab, setActiveTab] = useState<'liaison' | 'calendar'>('liaison');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetDrive, setTargetDrive] = useState(drives[0]?.id || '');
  const [announcements, setAnnouncements] = useState<string[]>([
    'Amazon AWS: Round 2 Technical Interviews commencing tomorrow 10:00 AM sharp at Central Computing Center Lab 1. Carry 2 printed copies of GAT PPODAI resume.',
    'Texas Instruments: Hardware test shortlists announced for ECE/EEE students. Venue: ECE CAD Lab.'
  ]);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setAnnouncements([broadcastMessage, ...announcements]);
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Student Coordinator</span>
            <span>·</span>
            <span>SPC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
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
                {drives.map(d => (
                  <option key={d.id} value={d.id}>{d.companyName} ({d.roleTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0C2C47] block mb-1">Notice</label>
              <textarea
                rows={3}
                placeholder="Assemble at venue with college ID..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#97D3CD]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2C47] text-[#0C2C47]"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#E2A54D]" />
              <span>Send Notice</span>
            </button>
          </form>

          {/* Recent notices */}
          <div className="mt-5 pt-4 border-t border-[#97D3CD]/30">
            <span className="text-[11px] font-bold text-[#0C2C47] uppercase tracking-wider block mb-2">Recent Notices:</span>
            <div className="space-y-2">
              {announcements.map((msg, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#97D3CD]/40 text-xs text-[#2D5652]">
                  <p>{msg}</p>
                  <span className="text-[10px] text-[#2D5652]/60 mt-1 block">Sent by SPC</span>
                </div>
              ))}
            </div>
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
