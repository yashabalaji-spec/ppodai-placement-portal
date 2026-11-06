import React, { useState } from 'react';
import { UserAccount, StudentProfile, Company, PlacementDrive } from '../../types';
import { DepartmentMultiYearChart, OfferTierDistributionChart } from '../common/Charts';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import { HISTORICAL_BATCH_METRICS, BRANCHES } from '../../data/mockData';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Download,
  Calendar,
  Layers,
  Video,
  BarChart3
} from 'lucide-react';

interface ManagementDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  companies: Company[];
  drives: PlacementDrive[];
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  user,
  students,
  companies,
  drives
}) => {
  const currentBatch = HISTORICAL_BATCH_METRICS[2]; // 2026 season
  const isPrincipal = user.role === 'principal';
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview');

  return (
    <div className="space-y-6">
      
      {/* Executive Welcome & Context Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>{isPrincipal ? 'Principal Console' : 'Management Console'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            Institutional Placement Overview (2025–2026)
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1 max-w-2xl">
            Real-time analytics across 15 engineering and postgraduate departments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold bg-[#E4F2EA] text-[#2D5652] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2D5652] animate-pulse"></span>
            Active Season
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#0C2C47]" />
          <span>Placement Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Video className="w-4 h-4 text-[#2D5652]" />
          <span>Visiting Companies ({drives.length})</span>
        </button>
      </div>

      {/* TAB 2: TEAMS PLACEMENT CALENDAR */}
      {activeTab === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={user}
          drives={drives}
        />
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">

      {/* Mandatory Key Institutional Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Student Strength */}
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#2D5652] mb-1.5">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-[#2D5652]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0C2C47] font-mono tabular-nums">
            {currentBatch.totalStrength.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#2D5652]/70 mt-1 flex items-center gap-1">
            <span>15 Branches</span>
            <span>·</span>
            <span className="text-[#0C2C47] font-medium">2026 Batch</span>
          </div>
        </div>

        {/* No. of Students Placed */}
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#2D5652] mb-1.5">
            <span className="text-xs font-medium">Placed</span>
            <UserCheck className="w-4 h-4 text-[#2D5652]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2D5652] font-mono tabular-nums">
            {currentBatch.placedStudents.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#2D5652]/70 mt-1 flex items-center gap-1">
            <span className="font-semibold text-[#2D5652]">{currentBatch.placementPercentage}%</span>
            <span>·</span>
            <span>+4.3% YoY</span>
          </div>
        </div>

        {/* No. of Companies Visited */}
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#2D5652] mb-1.5">
            <span className="text-xs font-medium">Companies</span>
            <Building2 className="w-4 h-4 text-[#0C2C47]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0C2C47] font-mono tabular-nums">
            {currentBatch.companiesVisited}
          </div>
          <div className="text-[11px] text-[#2D5652]/70 mt-1 flex items-center gap-1">
            <span>42 Marquee</span>
            <span>·</span>
            <span>18 Active</span>
          </div>
        </div>

        {/* No. of Offers Made */}
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#2D5652] mb-1.5">
            <span className="text-xs font-medium">Total Offers</span>
            <Award className="w-4 h-4 text-[#E2A54D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0C2C47] font-mono tabular-nums">
            {currentBatch.totalOffers.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#2D5652]/70 mt-1 flex items-center gap-1">
            <span>Highest: <strong className="text-[#0C2C47]">₹{currentBatch.highestCtcLPA} LPA</strong></span>
          </div>
        </div>
      </div>

      {/* Core Requirement: Graph Depicting % of Placement & Departments Varying With Years */}
      <DepartmentMultiYearChart />

      {/* CTC Tier Distribution & Marquee Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <OfferTierDistributionChart />
        </div>

        {/* Top Package & Marquee Highlights */}
        <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#0C2C47]">Top Offers</h3>
            <p className="text-xs text-[#2D5652]/70 mt-0.5">Top packages secured</p>
            
            <div className="mt-4 space-y-2.5">
              <div className="p-2.5 rounded-lg bg-[#E4F2EA] border border-[#97D3CD] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0C2C47]">Google India</div>
                  <div className="text-[11px] text-[#2D5652]">SDE</div>
                </div>
                <div className="text-sm font-bold font-mono text-[#0C2C47]">₹34.0 LPA</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#97D3CD]/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0C2C47]">Amazon AWS</div>
                  <div className="text-[11px] text-[#2D5652]">Cloud SDE</div>
                </div>
                <div className="text-sm font-bold font-mono text-[#0C2C47]">₹28.5 LPA</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#97D3CD]/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0C2C47]">PhonePe</div>
                  <div className="text-[11px] text-[#2D5652]">Backend Systems</div>
                </div>
                <div className="text-sm font-bold font-mono text-[#0C2C47]">₹26.0 LPA</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#97D3CD]/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0C2C47]">Texas Instruments</div>
                  <div className="text-[11px] text-[#2D5652]">Embedded Systems</div>
                </div>
                <div className="text-sm font-bold font-mono text-[#0C2C47]">₹22.0 LPA</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#97D3CD]/30 text-[11px] text-[#2D5652] flex items-center justify-between">
            <span>Verified Data</span>
            <span className="font-semibold text-[#0C2C47]">VTU Affiliated</span>
          </div>
        </div>
      </div>

      {/* Complete Department-Wise Status Table (All 15 Branches) */}
      <div className="bg-white border border-[#97D3CD]/50 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-[#97D3CD]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-bold text-[#0C2C47]">Department Performance</h3>
            <p className="text-xs text-[#2D5652]/70">Enrollment, placed counts & compensation</p>
          </div>
          <span className="text-xs text-[#2D5652] font-mono">15 Branches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-[#E4F2EA]/40 text-[#2D5652] border-b border-[#97D3CD]/30 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-right">Strength</th>
                <th className="py-2.5 px-3 text-right">Placed</th>
                <th className="py-2.5 px-3 text-right">Placement %</th>
                <th className="py-2.5 px-3 text-right">Avg CTC</th>
                <th className="py-2.5 px-3 text-right">Top CTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#97D3CD]/20">
              {currentBatch.departmentStats.map((item, idx) => {
                const branchObj = BRANCHES.find(b => b.code === item.department);
                return (
                  <tr key={item.department} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAF9]'}>
                    <td className="py-2.5 px-3 font-bold text-[#0C2C47] font-mono">{item.department}</td>
                    <td className="py-2.5 px-3 text-[#2D5652] font-medium">{branchObj?.name || item.department}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#2D5652]">{item.strength}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#0C2C47]">{item.placed}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        item.percentage >= 90 ? 'bg-[#E4F2EA] text-[#2D5652]' :
                        item.percentage >= 80 ? 'bg-[#EFEAE6] text-[#0C2C47]' :
                        'bg-[#EFEAE6] text-[#E2A54D]'
                      }`}>
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#2D5652]">₹{item.avgCtc} LPA</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0C2C47]">₹{item.highestCtc} LPA</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

        </div>
      )}

    </div>
  );
};
