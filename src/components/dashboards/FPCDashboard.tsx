import React, { useState } from 'react';
import { UserAccount, StudentProfile, OfferDetails, PlacementDrive, DriveLoadState } from '../../types';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { 
  UserCheck, 
  Award, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  FileCheck2,
  Building,
  GraduationCap,
  Video,
  Users
} from 'lucide-react';

interface FPCDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  drives?: PlacementDrive[];
  driveLoadState: DriveLoadState;
  driveLoadError: string;
  onRetryDrives: () => void;
  onVerifyOffer?: (studentUsn: string, offerId: string) => void;
  onAddOffer?: (studentUsn: string, offer: OfferDetails) => void;
}

export const FPCDashboard: React.FC<FPCDashboardProps> = ({
  user,
  students,
  drives = [],
  driveLoadState,
  driveLoadError,
  onRetryDrives
}) => {
  const fpcDept = user.department || 'CSE';
  const deptStudents = students.filter(s => s.department === fpcDept);
  const [activeTab, setActiveTab] = useState<'roster' | 'calendar'>('roster');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = deptStudents.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.usn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placedCount = deptStudents.filter(s => s.isPlaced).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Faculty Coordinator</span>
            <span>·</span>
            <span>FPC ({fpcDept})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Department Offer Verification
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1 max-w-2xl">
            Verifying student placement eligibility and offer letters for {fpcDept}.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#E4F2EA]/20 border border-[#97D3CD]/30 px-3.5 py-2 rounded-xl">
          <GraduationCap className="w-5 h-5 text-[#97D3CD]" />
          <div>
            <div className="text-[10px] text-[#E4F2EA] uppercase font-semibold">Department Status</div>
            <div className="text-sm font-bold font-mono text-white">{placedCount} / {deptStudents.length} Placed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'roster'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Offers ({deptStudents.length})</span>
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

      {/* TAB 1: Main Validation Table */}
      {activeTab === 'roster' && (
      <div className="bg-white border border-[#97D3CD]/50 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#97D3CD]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0C2C47]">
              Placed Students ({fpcDept})
            </h3>
            <p className="text-xs text-[#2D5652]/70 mt-0.5">Campus recruitment verification</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#2D5652]/60 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by USN or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#97D3CD]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2C47] text-[#0C2C47]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-[#E4F2EA]/40 text-[#2D5652] font-semibold border-b border-[#97D3CD]/30 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">USN</th>
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3 text-center">Sec</th>
                <th className="py-2.5 px-3 text-center">CGPA</th>
                <th className="py-2.5 px-3">Companies</th>
                <th className="py-2.5 px-3 text-right">Top CTC</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#97D3CD]/20">
              {filtered.map(s => {
                const sorted = [...s.offers].sort((a,b) => b.packageLPA - a.packageLPA);
                const highest = sorted[0];

                return (
                  <tr key={s.usn} className="hover:bg-[#E4F2EA]/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0C2C47]">{s.usn}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#0C2C47]">{s.fullName}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-[#2D5652]">{s.section}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#2D5652]">{s.cgpa.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      {sorted.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sorted.map(o => (
                            <span key={o.id} className="text-[10px] bg-[#EFEAE6] px-1.5 py-0.5 rounded text-[#0C2C47]">
                              {o.companyName} (₹{o.packageLPA}L)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#2D5652]/50 italic">No offers</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0C2C47]">
                      {highest ? `₹${highest.packageLPA.toFixed(1)} LPA` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2D5652] bg-[#E4F2EA] px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3 text-[#2D5652]" />
                        Verified
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

    </div>
  );
};
