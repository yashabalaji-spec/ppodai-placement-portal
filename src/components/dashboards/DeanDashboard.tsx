import React, { useState } from 'react';
import { UserAccount, StudentProfile, Company, PlacementDrive, DriveLoadState } from '../../types';
import { OfferTierDistributionChart } from '../common/Charts';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  Briefcase, 
  Plus, 
  Filter, 
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Video
} from 'lucide-react';

interface DeanDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  companies: Company[];
  drives: PlacementDrive[];
  driveLoadState: DriveLoadState;
  driveLoadError: string;
  onRetryDrives: () => void;
  onAddDrive: (newDrive: PlacementDrive) => void;
  onOpenDriveModal?: () => void;
}

export const DeanDashboard: React.FC<DeanDashboardProps> = ({
  user,
  students,
  companies,
  drives,
  driveLoadState,
  driveLoadError,
  onRetryDrives,
  onAddDrive
}) => {
  const [activeTab, setActiveTab] = useState<'drives' | 'companies' | 'tier_breakdown' | 'calendar'>('drives');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrives = drives.filter(d => 
    d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.driveCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Dean of Placements</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Central Placement Operations
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1 max-w-2xl">
            Recruitment drives, corporate visits, and institutional placement progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-[#E4F2EA] text-[#2D5652] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2D5652]" />
            Dean Console
          </span>
        </div>
      </div>

      {/* Top 4 Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-[#2D5652] font-medium">Scheduled Drives</span>
          <div className="text-xl sm:text-2xl font-bold text-[#0C2C47] font-mono mt-1">{drives.length} Drives</div>
          <span className="text-[11px] text-[#2D5652] font-medium mt-1 block">4 Live this week</span>
        </div>

        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-[#2D5652] font-medium">Eligible Students</span>
          <div className="text-xl sm:text-2xl font-bold text-[#0C2C47] font-mono mt-1">1,180</div>
          <span className="text-[11px] text-[#2D5652]/70 mt-1 block">Enrolled candidates</span>
        </div>

        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-[#2D5652] font-medium">Corporate Partners</span>
          <div className="text-xl sm:text-2xl font-bold text-[#0C2C47] font-mono mt-1">{companies.length} Companies</div>
          <span className="text-[11px] text-[#2D5652]/70 mt-1 block">Tier 1 & Core Tech</span>
        </div>

        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-[#2D5652] font-medium">Offers Verified</span>
          <div className="text-xl sm:text-2xl font-bold text-[#2D5652] font-mono mt-1">1,642 Offers</div>
          <span className="text-[11px] text-[#2D5652] font-medium mt-1 block">Avg: ₹8.2 LPA</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('drives')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'drives'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Drives ({drives.length})
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'companies'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Companies ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('tier_breakdown')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tier_breakdown'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          CTC Tiers
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Calendar</span>
        </button>
      </div>

      {/* TAB CONTENT: DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search drives by company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              Coordinated via Placement Coordination Cell (PCC)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrives.map(drive => (
              <div key={drive.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 transition-all shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase">{drive.driveCode}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{drive.companyName}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{drive.roleTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md block">
                      ₹{drive.ctcLPA} LPA
                    </span>
                    <span className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded ${
                      drive.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                      drive.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-indigo-50 text-indigo-700'
                    }`}>
                      {drive.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Eligible Branches</span>
                    <span className="font-semibold text-slate-800">{drive.targetBranches.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Eligibility Cutoff</span>
                    <span className="font-semibold text-slate-800">CGPA ≥ {drive.minCGPA} | Backlogs: {drive.maxBacklogsAllowed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Drive Date & Venue</span>
                    <span className="font-medium text-slate-800">{drive.driveDate} · {drive.venue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Shortlisted Pool</span>
                    <span className="font-bold text-indigo-700 font-mono">{drive.shortlistedCount} Students</span>
                  </div>
                </div>

                {drive.rounds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">Active Evaluation Rounds:</span>
                    <div className="space-y-1">
                      {drive.rounds.map(r => (
                        <div key={r.roundNumber} className="text-[11px] flex items-center justify-between text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          <span>Round {r.roundNumber}: {r.roundName}</span>
                          <span className="font-mono text-slate-700 font-semibold">{r.qualifiedStudents.length} Qualified</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Visiting Corporate Recruiters (Tier 1, 2 & Core)</h3>
            <span className="text-xs text-slate-500 font-mono">{companies.length} Registered Recruiters</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Industry Sector</th>
                  <th className="py-3 px-4">Recruitment Tier</th>
                  <th className="py-3 px-4">Primary Profiles</th>
                  <th className="py-3 px-4">Key Recruiter Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.industry}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        c.tier === 'Tier 1' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{c.jobProfiles.join(', ')}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {c.contactPerson} · {c.contactEmail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIER BREAKDOWN */}
      {activeTab === 'tier_breakdown' && (
        <OfferTierDistributionChart />
      )}

      {/* TAB CONTENT: TEAMS PLACEMENT CALENDAR */}
      {activeTab === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={user}
          drives={drives}
          companies={companies}
          onAddDrive={onAddDrive}
          driveLoadState={driveLoadState}
          driveLoadError={driveLoadError}
          onRetryDrives={onRetryDrives}
        />
      )}

    </div>
  );
};
