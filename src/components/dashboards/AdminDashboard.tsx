import React, { useState, useMemo } from 'react';
import { UserAccount, StudentProfile, Company, PlacementDrive } from '../../types';
import { BRANCHES, HISTORICAL_BATCH_METRICS } from '../../data/mockData';
import { TeamsPlacementCalendar } from '../common/TeamsPlacementCalendar';
import {
  TrendingUp,
  Award,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  BarChart3,
  Layers,
  Clock,
  UserCheck,
  ShieldCheck,
  Eye,
  MapPin,
  ChevronDown,
  X,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Video
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserAccount;
  students: StudentProfile[];
  companies: Company[];
  drives: PlacementDrive[];
  onOpenDbArchitecture?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  students,
  companies,
  drives
}) => {
  const [activeTab, setActiveTab] = useState<'year_graphs' | 'branches' | 'drives' | 'student_packages' | 'calendar'>('year_graphs');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [driveFilterStatus, setDriveFilterStatus] = useState<string>('ALL');
  const [selectedDriveForRoster, setSelectedDriveForRoster] = useState<PlacementDrive | null>(null);

  // Current batch historical data
  const currentBatch = HISTORICAL_BATCH_METRICS.find(b => b.year === selectedYear) || HISTORICAL_BATCH_METRICS[2];

  // Aggregated totals across all initiated placement drives
  const totalDrivesInitiated = drives.length;
  const totalEligibleInDrives = drives.reduce((sum, d) => sum + d.eligibleStudentCount, 0);
  const totalEnrolledInDrives = drives.reduce((sum, d) => sum + (d.enrolledCount || Math.round(d.eligibleStudentCount * 0.88)), 0);
  const driveEnrollmentRate = totalEligibleInDrives > 0 
    ? ((totalEnrolledInDrives / totalEligibleInDrives) * 100).toFixed(1) 
    : '0';

  // Overall student placement metrics (Institution Level - 2026 Ongoing Season)
  const totalStudentsEnrolled = currentBatch.totalStrength;
  const totalStudentsPlaced = currentBatch.placedStudents;
  const overallPlacementPercent = currentBatch.placementPercentage;
  const totalOffersSecured = currentBatch.totalOffers;
  const highestPackageOffered = 44.0; // Microsoft IDC in active drives / Google 34.0
  const avgPackageOffered = currentBatch.averageCtcLPA;

  // Branch-wise calculation combined with BRANCHES metadata
  const branchAnalytics = useMemo(() => {
    return currentBatch.departmentStats.map(stat => {
      const branchMeta = BRANCHES.find(b => b.code === stat.department);
      const unplaced = stat.strength - stat.placed;
      return {
        code: stat.department,
        name: branchMeta?.name || `${stat.department} Engineering`,
        hod: branchMeta?.hod || 'Head of Department',
        totalStrength: stat.strength,
        placedCount: stat.placed,
        unplacedCount: unplaced,
        placementPercentage: stat.percentage,
        avgPackageLPA: stat.avgCtc,
        highestPackageLPA: stat.highestCtc
      };
    });
  }, [currentBatch]);

  // Filtered branch analytics
  const filteredBranchAnalytics = useMemo(() => {
    if (branchFilter === 'ALL') return branchAnalytics;
    return branchAnalytics.filter(b => b.code === branchFilter);
  }, [branchAnalytics, branchFilter]);

  // Filtered Drives
  const filteredDrives = useMemo(() => {
    return drives.filter(d => {
      if (driveFilterStatus !== 'ALL' && d.status !== driveFilterStatus) return false;
      return true;
    });
  }, [drives, driveFilterStatus]);

  // Filtered Students for student-by-student package directory
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.usn.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.department.toLowerCase().includes(searchStudent.toLowerCase());
      
      const matchesBranch = branchFilter === 'ALL' || s.department === branchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [students, searchStudent, branchFilter]);

  // Package Tier Breakdown constants
  const ctcTiers = [
    {
      tier: 'Tier 1 Super Dream (>15 LPA)',
      count: 218,
      percentage: 13.2,
      range: '₹15.0 - ₹44.0 LPA',
      color: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50 border-indigo-200',
      companies: 'Microsoft, Google, Amazon AWS, PhonePe, Texas Instruments, Cisco'
    },
    {
      tier: 'Tier 2 Dream (8-15 LPA)',
      count: 542,
      percentage: 33.0,
      range: '₹8.0 - ₹15.0 LPA',
      color: 'bg-sky-500',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50 border-sky-200',
      companies: 'Bosch, Oracle OCI, Mercedes-Benz, Infosys SP, LTIMindtree'
    },
    {
      tier: 'Tier 3 Core Engineering (5-8 LPA)',
      count: 610,
      percentage: 37.1,
      range: '₹5.0 - ₹8.0 LPA',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      companies: 'Toyota Kirloskar, L&T Technology, Biocon, Tech Mahindra'
    },
    {
      tier: 'Tier 4 Mass Recruitment (3-5 LPA)',
      count: 272,
      percentage: 16.7,
      range: '₹3.0 - ₹5.0 LPA',
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      companies: 'TCS Ninja, Wipro Elite, Capgemini Digital'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Super User Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-xs border border-[#97D3CD]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E4F2EA]/20 text-[#97D3CD] border border-[#97D3CD]/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#97D3CD]" />
                Admin Console
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E2A54D]/20 text-[#E2A54D] border border-[#E2A54D]/30">
                Full Access
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold mt-2 text-white tracking-tight flex items-center gap-2">
              <span>Placement Intelligence</span>
            </h1>
            <p className="text-xs text-[#E4F2EA]/90 mt-1 max-w-2xl leading-relaxed">
              Placement statistics, departmental analytics, company drives, and package records.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-[#97D3CD] block">Admin</span>
              <span className="text-xs font-semibold text-white">{user.name}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E2A54D] text-[#0C2C47] font-bold flex items-center justify-center shadow-xs">
              AD
            </div>
          </div>
        </div>

        {/* Quick Highlights Ribbon */}
        <div className="mt-5 pt-4 border-t border-[#97D3CD]/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-black/20 border border-[#97D3CD]/20 rounded-xl p-3">
            <span className="text-[11px] text-[#97D3CD] block font-medium">Placed</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
              {totalStudentsPlaced} <span className="text-xs font-normal text-[#E4F2EA]/70">/ {totalStudentsEnrolled}</span>
            </div>
            <span className="text-[10px] text-[#E4F2EA] font-semibold mt-0.5 block flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-[#E2A54D]" /> {overallPlacementPercent}% Placed
            </span>
          </div>

          <div className="bg-black/20 border border-[#97D3CD]/20 rounded-xl p-3">
            <span className="text-[11px] text-[#97D3CD] block font-medium">Highest CTC</span>
            <div className="text-lg sm:text-xl font-bold text-[#E2A54D] font-mono mt-0.5">
              ₹{highestPackageOffered} <span className="text-xs text-white/80 font-sans">LPA</span>
            </div>
            <span className="text-[10px] text-[#E4F2EA]/70 block mt-0.5">Microsoft / Google</span>
          </div>

          <div className="bg-black/20 border border-[#97D3CD]/20 rounded-xl p-3">
            <span className="text-[11px] text-[#97D3CD] block font-medium">Average CTC</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
              ₹{avgPackageOffered} <span className="text-xs text-white/80 font-sans">LPA</span>
            </div>
            <span className="text-[10px] text-[#97D3CD] block mt-0.5">+10.8% YoY</span>
          </div>

          <div className="bg-black/20 border border-[#97D3CD]/20 rounded-xl p-3">
            <span className="text-[11px] text-[#97D3CD] block font-medium">Total Offers</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
              {totalOffersSecured}
            </div>
            <span className="text-[10px] text-[#E4F2EA]/70 block mt-0.5">1.51 / Placed</span>
          </div>

          <div className="bg-black/20 border border-[#97D3CD]/20 rounded-xl p-3">
            <span className="text-[11px] text-[#97D3CD] block font-medium">Active Drives</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
              {totalDrivesInitiated}
            </div>
            <span className="text-[10px] text-[#E4F2EA]/70 block mt-0.5">185 Total</span>
          </div>

          <div className="bg-black/20 border border-[#97D3CD]/20 rounded-xl p-3">
            <span className="text-[11px] text-[#97D3CD] block font-medium">Enrolled</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
              {totalEnrolledInDrives}
            </div>
            <span className="text-[10px] text-[#E4F2EA]/70 block mt-0.5">{driveEnrollmentRate}% Enrolled</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('year_graphs')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'year_graphs'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Year Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'branches'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Branches ({branchAnalytics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'drives'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Drives ({drives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('student_packages')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'student_packages'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Students</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Calendar</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: YEAR-WISE PLACEMENT GRAPHS & TRENDS */}
      {/* ========================================================================= */}
      {activeTab === 'year_graphs' && (
        <div className="space-y-6">
          
          {/* Year selector & Comparative Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Year-Wise Placement Growth Analytics (2024 - 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Multi-year comparative evaluation of total placed student volume, institutional placement rate, and compensation package escalation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Active Focus Batch:</span>
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                {HISTORICAL_BATCH_METRICS.map(b => (
                  <button
                    key={b.year}
                    onClick={() => setSelectedYear(b.year)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      selectedYear === b.year
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b.year} Batch {b.year === 2026 ? '(Current)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Graphical Comparison Cards: Placed Count, Percentage & Packages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Graph 1: Placed Students Count Year-Wise */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">1. Number of Students Placed</h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    +24.7% 3-Yr Growth
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Total placed candidate volume across graduating classes
                </p>

                {/* Vertical Bar Chart Simulation */}
                <div className="flex items-end justify-around h-48 pt-6 pb-2 border-b border-slate-200 px-2">
                  {HISTORICAL_BATCH_METRICS.map(b => {
                    const heightPercent = Math.round((b.placedStudents / 1200) * 100);
                    const isSelected = selectedYear === b.year;
                    return (
                      <div key={b.year} className="flex flex-col items-center gap-2 w-20">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {b.placedStudents}
                        </span>
                        <div className="w-12 bg-slate-100 rounded-t-lg h-36 flex items-end justify-center p-1">
                          <div
                            className={`w-full rounded-t-md transition-all duration-700 ${
                              isSelected
                                ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm'
                                : 'bg-slate-400 hover:bg-slate-500'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                          {b.year}
                        </span>
                        <span className="text-[10px] text-slate-400">({b.placementPercentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Total Batch Strength</span>
                <span className="font-mono font-semibold text-slate-700">
                  {currentBatch.placedStudents} of {currentBatch.totalStrength} Students
                </span>
              </div>
            </div>

            {/* Graph 2: Year-Wise Placement Percentage */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">2. Placement Rate (%) Progress</h4>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Institutional Rate
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Percentage of registered students successfully placed
                </p>

                <div className="space-y-4 pt-2">
                  {HISTORICAL_BATCH_METRICS.map(b => {
                    const isSelected = selectedYear === b.year;
                    return (
                      <div key={b.year} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
                            {b.year} Batch {b.year === 2026 ? '(Current Season)' : ''}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {b.placementPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${b.placementPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{b.placedStudents} Placed</span>
                          <span>{b.companiesVisited} Companies Visited</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Top Performing Department</span>
                <span className="font-semibold text-emerald-700">CSE (97.7%) & AIML (96.6%)</span>
              </div>
            </div>

            {/* Graph 3: Package CTC Progression Year-Wise */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">3. Average & Highest Package CTC</h4>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    In Lakhs Per Annum
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Highest vs average compensation trajectory across seasons
                </p>

                <div className="space-y-4 pt-1">
                  {HISTORICAL_BATCH_METRICS.map(b => {
                    const isSelected = selectedYear === b.year;
                    return (
                      <div key={b.year} className={`p-3 rounded-lg border transition-all ${isSelected ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50/60 border-slate-200'}`}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-slate-900">{b.year} Placement Season</span>
                          <span className="text-[11px] text-slate-500 font-mono">{b.totalOffers} Total Offers</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Average CTC</span>
                            <span className="text-sm font-bold text-indigo-700 font-mono">₹{b.averageCtcLPA} LPA</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Highest Package</span>
                            <span className="text-sm font-bold text-amber-600 font-mono">
                              ₹{b.year === 2026 ? 44.0 : b.highestCtcLPA} LPA
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Package Record Holder</span>
                <span className="font-semibold text-slate-800">Microsoft IDC (₹44.0 LPA)</span>
              </div>
            </div>

          </div>

          {/* Department-Wise Comparative Breakdown for the Selected Year */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Department-Wise Placement Performance ({selectedYear} Season)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Placed student count, placement percentage, and package CTC across all {currentBatch.departmentStats.length} departments
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                Batch Size: {currentBatch.totalStrength} Students
              </span>
            </div>

            <div className="space-y-3.5">
              {currentBatch.departmentStats.map(stat => {
                const isSelectedDept = branchFilter === stat.department;
                return (
                  <div 
                    key={stat.department} 
                    className={`p-3 rounded-lg border transition-all ${
                      isSelectedDept ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                          {stat.department}
                        </span>
                        <span className="text-xs text-slate-700 font-medium">
                          {BRANCHES.find(b => b.code === stat.department)?.name || stat.department}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-600">
                          Placed: <strong className="text-slate-900 font-bold">{stat.placed}</strong> / {stat.strength}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {stat.percentage}%
                        </span>
                        <span className="text-indigo-700">
                          Avg: <strong className="font-bold">₹{stat.avgCtc} LPA</strong>
                        </span>
                        <span className="text-amber-700 font-bold">
                          Max: ₹{stat.highestCtc} LPA
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.percentage >= 95 ? 'bg-emerald-600' :
                          stat.percentage >= 85 ? 'bg-teal-600' :
                          stat.percentage >= 75 ? 'bg-sky-600' : 'bg-amber-600'
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BRANCH-WISE STUDENTS & PACKAGES */}
      {/* ========================================================================= */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          
          {/* Header & Department Filter */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Branch-Wise Strength, Placed Count & Compensation Packages
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Detailed branch-by-branch census of student enrollments, placed numbers, and compensation packages across all 15 branches.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Filter Branch:</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Branches ({branchAnalytics.length})</option>
                {branchAnalytics.map(b => (
                  <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CTC Tier Classification Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ctcTiers.map(tier => (
              <div key={tier.tier} className={`border rounded-xl p-4 shadow-2xs ${tier.bgColor}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${tier.textColor}`}>{tier.range}</span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded shadow-2xs">
                    {tier.count} Offers
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5">{tier.tier}</h4>
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 my-2.5 overflow-hidden">
                  <div className={`h-full rounded-full ${tier.color}`} style={{ width: `${tier.percentage * 2.5}%` }}></div>
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-1" title={tier.companies}>
                  {tier.companies}
                </div>
              </div>
            ))}
          </div>

          {/* Master Branch-Wise Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Comprehensive Branch Placement & Package Registry
                </h4>
                <span className="text-xs text-slate-500">
                  Showing {filteredBranchAnalytics.length} of {branchAnalytics.length} branches · 2026 Graduating Batch
                </span>
              </div>

              {branchFilter !== 'ALL' && (
                <button
                  onClick={() => setBranchFilter('ALL')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Branch Filter</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Branch Code & Name</th>
                    <th className="py-3 px-4 text-center">Total Students</th>
                    <th className="py-3 px-4 text-center">Placed</th>
                    <th className="py-3 px-4 text-center">Unplaced / Ongoing</th>
                    <th className="py-3 px-4">Placement Rate (%)</th>
                    <th className="py-3 px-4 text-right">Average Package</th>
                    <th className="py-3 px-4 text-right">Highest Package</th>
                    <th className="py-3 px-4">Head of Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBranchAnalytics.map(b => (
                    <tr key={b.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                            {b.code}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">{b.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {b.totalStrength}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                        {b.placedCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                        {b.unplacedCount}
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 w-11 text-right">
                            {b.placementPercentage}%
                          </span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${b.placementPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">
                        ₹{b.avgPackageLPA} LPA
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600">
                        ₹{b.highestPackageLPA} LPA
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.hod}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td className="py-3 px-4 text-slate-900 uppercase">Institutional Total (15 Branches)</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-900">{totalStudentsEnrolled}</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-800">{totalStudentsPlaced}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{totalStudentsEnrolled - totalStudentsPlaced}</td>
                    <td className="py-3 px-4 font-mono text-emerald-800">{overallPlacementPercent}% Overall</td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-800">₹{avgPackageOffered} LPA Avg</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">₹{highestPackageOffered} LPA Max</td>
                    <td className="py-3 px-4 text-slate-500 font-normal">All Heads of Department</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INITIATED PLACEMENT DRIVES & ENROLLMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          
          {/* Header & Status Filter */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                Initiated Placement Drives & Student Enrollments
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Overview of on-campus company drives, qualification benchmarks, compensation packages, and enrolled candidate counts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filter Status:</span>
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                {['ALL', 'Upcoming', 'In Progress', 'Completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setDriveFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      driveFilterStatus === status
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Initiated Placement Drives</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {drives.length} Drives
              </div>
              <span className="text-[11px] text-sky-700 font-medium mt-1 block">
                Tier 1 & Tier 2 Campus Recruiters
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Student Drive Enrollments</span>
              <div className="text-2xl font-bold text-purple-700 font-mono mt-1">
                {totalEnrolledInDrives} Enrollments
              </div>
              <span className="text-[11px] text-purple-700 font-medium mt-1 block">
                Across {totalEligibleInDrives} eligible candidate pool
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Average Drive Enrollment Rate</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
                {driveEnrollmentRate}%
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                High student engagement & hall tickets issued
              </span>
            </div>
          </div>

          {/* Drives Table & Cards */}
          <div className="space-y-4">
            {filteredDrives.map(drive => {
              const enrolled = drive.enrolledCount || Math.round(drive.eligibleStudentCount * 0.9);
              const enrollRate = ((enrolled / drive.eligibleStudentCount) * 100).toFixed(0);

              return (
                <div
                  key={drive.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Drive Main Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {drive.driveCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          drive.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          drive.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          'bg-sky-100 text-sky-800 border border-sky-300'
                        }`}>
                          {drive.status}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {drive.driveDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{drive.companyName}</h4>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-700">{drive.roleTitle}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                          CTC: ₹{drive.ctcLPA} LPA
                        </span>
                        <span>
                          Min CGPA: <strong className="text-slate-800 font-semibold">{drive.minCGPA}</strong>
                        </span>
                        <span>
                          Max Backlogs: <strong className="text-slate-800 font-semibold">{drive.maxBacklogsAllowed}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {drive.venue}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Target Branches:</span>
                        {drive.targetBranches.map(branch => (
                          <span key={branch} className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {branch}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Enrollment Stats & Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="flex items-center lg:justify-end gap-2">
                          <span className="text-xs text-slate-500">Enrolled Students:</span>
                          <span className="font-mono font-bold text-base text-purple-700">
                            {enrolled} <span className="text-xs font-normal text-slate-500">/ {drive.eligibleStudentCount} eligible</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {enrollRate}% Student Enrollment Rate
                        </div>
                        {drive.shortlistedCount > 0 && (
                          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                            {drive.shortlistedCount} Candidates Shortlisted in Rounds
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedDriveForRoster(drive)}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Enrolled Student Roster ({enrolled})</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrolled Students Roster Modal */}
          {selectedDriveForRoster && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300">
                      Drive Candidate Enrollment Roster · {selectedDriveForRoster.driveCode}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {selectedDriveForRoster.companyName} - {selectedDriveForRoster.roleTitle}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedDriveForRoster(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Drive Overview */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Package: </span>
                    <strong className="text-indigo-700 font-mono font-bold">₹{selectedDriveForRoster.ctcLPA} LPA</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Enrolled: </span>
                    <strong className="text-purple-700 font-mono font-bold">{selectedDriveForRoster.enrolledCount} Students</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Drive Status: </span>
                    <strong className="text-emerald-700 font-semibold">{selectedDriveForRoster.status}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Date: </span>
                    <strong className="text-slate-800">{selectedDriveForRoster.driveDate}</strong>
                  </div>
                </div>

                {/* Enrolled Students Table */}
                <div className="flex-1 overflow-y-auto p-5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Registered & Attending Candidate Roster
                  </h4>

                  {selectedDriveForRoster.enrolledStudentsList && selectedDriveForRoster.enrolledStudentsList.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">USN</th>
                            <th className="py-2.5 px-3">Candidate Name</th>
                            <th className="py-2.5 px-3 text-center">Branch</th>
                            <th className="py-2.5 px-3 text-center">CGPA</th>
                            <th className="py-2.5 px-3">Enrolled At</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedDriveForRoster.enrolledStudentsList.map(cand => (
                            <tr key={cand.usn} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{cand.usn}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{cand.name}</td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">{cand.department}</td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">{cand.cgpa}</td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px]">{cand.registeredAt}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  cand.status === 'Placed' ? 'bg-emerald-100 text-emerald-800' :
                                  cand.status === 'Shortlisted' ? 'bg-amber-100 text-amber-800' :
                                  'bg-sky-100 text-sky-800'
                                }`}>
                                  {cand.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No candidate records enrolled yet for this drive.
                    </div>
                  )}

                  {/* Drive Rounds Progression */}
                  {selectedDriveForRoster.rounds.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Drive Selection Rounds & Qualified Shortlists
                      </h4>
                      <div className="space-y-3">
                        {selectedDriveForRoster.rounds.map(round => (
                          <div key={round.roundNumber} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">
                                Round {round.roundNumber}: {round.roundName}
                              </span>
                              <span className="font-mono text-emerald-700 font-semibold">
                                {round.qualifiedStudents.length} Shortlisted Candidates
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>Date: {round.date}</span>
                              <span>·</span>
                              <span>Venue: {round.venue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedDriveForRoster(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Close Roster
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT DIRECTORY & PACKAGE BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === 'student_packages' && (
        <div className="space-y-6">
          
          {/* Header & Search */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Student Placement & Package Compensation Records
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Student-by-student records: USN, branch, CGPA, placement offers received, and highest individual package.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or USN..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                />
              </div>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Branches</option>
                {branchAnalytics.map(b => (
                  <option key={b.code} value={b.code}>{b.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Records List */}
          <div className="space-y-4">
            {filteredStudents.map(student => {
              const highestOffer = student.offers.length > 0 
                ? [...student.offers].sort((a, b) => b.packageLPA - a.packageLPA)[0] 
                : null;

              return (
                <div
                  key={student.usn}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Student Profile Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {student.usn}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{student.fullName}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {student.department} (Sec {student.section})
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          student.isPlaced ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.isPlaced ? '✓ Placed' : 'In Process'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span>
                          CGPA: <strong className="font-mono text-slate-900 font-bold">{student.cgpa}</strong>
                        </span>
                        <span>
                          Current Backlogs: <strong className="font-mono text-slate-900 font-bold">{student.currentBacklogs}</strong>
                        </span>
                        <span>
                          Mobile: <span className="font-mono text-slate-700">{student.mobileNo}</span>
                        </span>
                        <span>
                          Email: <span className="text-slate-700">{student.placementEmailId}</span>
                        </span>
                      </div>

                      {/* Top Skills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-400">Key Skills:</span>
                        {student.skills.slice(0, 5).map(skill => (
                          <span key={skill.name} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Offers & Packages Summary */}
                    <div className="lg:text-right shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {highestOffer ? (
                        <div>
                          <span className="text-[11px] text-slate-500 block">Highest Package Received</span>
                          <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">
                            ₹{highestOffer.packageLPA} <span className="text-xs text-slate-600 font-sans">LPA</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                            {highestOffer.companyName} · {highestOffer.roleTitle}
                          </span>
                          <span className="text-[10px] text-indigo-700 font-bold mt-1 block">
                            {student.offers.length} Placement Offer{student.offers.length > 1 ? 's' : ''} Received
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs py-2">
                          No placement offers locked yet
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Multi-Offer Cards if student has offers */}
                  {student.offers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        All Received Offers ({student.offers.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {student.offers.map(offer => (
                          <div
                            key={offer.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              offer.id === highestOffer?.id
                                ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
                                : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block truncate">{offer.companyName}</span>
                              <span className="text-[11px] text-slate-500 block truncate">{offer.roleTitle}</span>
                              <span className="text-[10px] text-slate-400 block">{offer.offerLetterDate}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-sm text-indigo-700 block">
                                ₹{offer.packageLPA} LPA
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                                offer.status === 'accepted' ? 'text-emerald-700 bg-emerald-100' : 'text-slate-600 bg-slate-200'
                              }`}>
                                {offer.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TEAMS PLACEMENT CALENDAR & SCHEDULER (ADMIN SUPERUSER ACCESS) */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <TeamsPlacementCalendar
          currentUser={user}
          drives={drives}
        />
      )}

    </div>
  );
};
