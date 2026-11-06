import React, { useState } from 'react';
import { HISTORICAL_BATCH_METRICS, SECTION_WISE_STATS } from '../../data/mockData';

// 1. Management & Principal: % of placement and departments varying with years
export const DepartmentMultiYearChart: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const years = [2024, 2025, 2026];

  // Palette colors for years
  const yearColors: Record<number, string> = {
    2024: '#97D3CD', // Soft Aqua
    2025: '#2D5652', // Teal Forest
    2026: '#0C2C47', // Deep Navy
  };

  const currentBatch = HISTORICAL_BATCH_METRICS.find(b => b.year === 2026)!;
  const filteredDepts = selectedDept === 'ALL' 
    ? currentBatch.departmentStats 
    : currentBatch.departmentStats.filter(d => d.department === selectedDept);

  return (
    <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#0C2C47]">Placement Trends (2024 - 2026)</h3>
          <p className="text-xs text-[#2D5652]/70 mt-0.5">Comparative analytics across departments</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#2D5652]">Branch:</label>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-[#F8FAF9] border border-[#97D3CD]/60 rounded-lg px-2.5 py-1.5 font-medium text-[#0C2C47] focus:outline-none focus:ring-2 focus:ring-[#0C2C47]"
          >
            <option value="ALL">All Departments (15)</option>
            {currentBatch.departmentStats.map(d => (
              <option key={d.department} value={d.department}>{d.department}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 text-xs text-[#2D5652]">
        {years.map(y => (
          <div key={y} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: yearColors[y] }}></span>
            <span className="font-medium">{y} Batch {y === 2026 ? '(Current)' : ''}</span>
          </div>
        ))}
      </div>

      {/* Multi-Bar Chart */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[500px] space-y-3">
          {filteredDepts.map(deptItem => {
            const data2024 = HISTORICAL_BATCH_METRICS[0].departmentStats.find(d => d.department === deptItem.department)?.percentage || 0;
            const data2025 = HISTORICAL_BATCH_METRICS[1].departmentStats.find(d => d.department === deptItem.department)?.percentage || 0;
            const data2026 = deptItem.percentage;

            return (
              <div key={deptItem.department} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0C2C47] w-14">{deptItem.department}</span>
                  <span className="text-[#2D5652] font-mono text-[11px]">
                    2024: <span className="font-bold text-[#2D5652]">{data2024 ? `${data2024}%` : '—'}</span> · 
                    2025: <span className="font-bold text-[#2D5652]">{data2025 ? `${data2025}%` : '—'}</span> · 
                    2026: <span className="font-bold text-[#0C2C47]">{data2026}%</span>
                  </span>
                </div>
                
                <div className="space-y-1">
                  {/* 2024 Bar */}
                  {data2024 > 0 && (
                    <div className="w-full bg-[#F0F4F3] rounded-sm h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-sm transition-all duration-500" 
                        style={{ width: `${data2024}%`, backgroundColor: yearColors[2024] }}
                      ></div>
                    </div>
                  )}
                  {/* 2025 Bar */}
                  {data2025 > 0 && (
                    <div className="w-full bg-[#F0F4F3] rounded-sm h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-sm transition-all duration-500" 
                        style={{ width: `${data2025}%`, backgroundColor: yearColors[2025] }}
                      ></div>
                    </div>
                  )}
                  {/* 2026 Bar */}
                  <div className="w-full bg-[#F0F4F3] rounded-sm h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-sm transition-all duration-500 shadow-xs" 
                      style={{ width: `${data2026}%`, backgroundColor: yearColors[2026] }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 2. HOD Dashboard: Section-wise Placement Details in a Graph
export const SectionWiseHODChart: React.FC<{ department: string }> = ({ department }) => {
  const sections = SECTION_WISE_STATS[department] || [
    { section: 'Section A', totalStudents: 60, placedStudents: 52, percentage: 86.6, avgPackage: 8.2, highestPackage: 22.0 },
    { section: 'Section B', totalStudents: 60, placedStudents: 50, percentage: 83.3, avgPackage: 7.8, highestPackage: 18.0 }
  ];

  return (
    <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#0C2C47]">
            {department} Section Performance
          </h3>
          <p className="text-xs text-[#2D5652]/70 mt-0.5">Section-wise placement breakdown</p>
        </div>
        <div className="self-start sm:self-auto">
          <span className="text-xs font-semibold text-[#0C2C47] bg-[#E4F2EA] px-2.5 py-1 rounded-md">
            Department: 94.2%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {sections.map(sec => (
          <div key={sec.section} className="border border-[#97D3CD]/40 rounded-lg p-3.5 bg-[#F8FAF9] hover:bg-[#E4F2EA]/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs sm:text-sm text-[#0C2C47]">{sec.section}</span>
              <span className="font-bold text-xs sm:text-sm text-[#2D5652] font-mono">{sec.percentage}%</span>
            </div>

            <div className="w-full bg-[#E4F2EA] rounded-full h-2 mb-2.5 overflow-hidden">
              <div 
                className="bg-[#0C2C47] h-2 rounded-full transition-all duration-500" 
                style={{ width: `${sec.percentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#2D5652] pt-2 border-t border-[#97D3CD]/30">
              <div>
                <span className="text-[10px] text-[#2D5652]/60 block">Placed / Total</span>
                <span className="font-semibold text-[#0C2C47] font-mono">{sec.placedStudents} / {sec.totalStudents}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#2D5652]/60 block">Avg CTC</span>
                <span className="font-semibold text-[#0C2C47] font-mono">₹{sec.avgPackage} LPA</span>
              </div>
              <div className="col-span-2 pt-0.5">
                <span className="text-[10px] text-[#2D5652]/60 block">Highest CTC</span>
                <span className="font-bold text-[#E2A54D] font-mono">₹{sec.highestPackage} LPA</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Dean & PCC: Placement Offer Tier Distribution
export const OfferTierDistributionChart: React.FC = () => {
  const tiers = [
    { name: 'Tier 1 (>15 LPA)', count: 218, percentage: 13.2, color: '#0C2C47', companies: 'Google, AWS, PhonePe' },
    { name: 'Tier 2 (8-15 LPA)', count: 542, percentage: 33.0, color: '#2D5652', companies: 'Bosch, Cisco, Oracle' },
    { name: 'Tier 3 (5-8 LPA)', count: 610, percentage: 37.1, color: '#E2A54D', companies: 'Toyota, L&T, Biocon' },
    { name: 'Tier 4 (3-5 LPA)', count: 272, percentage: 16.7, color: '#97D3CD', companies: 'TCS, Wipro, Capgemini' },
  ];

  return (
    <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#0C2C47]">CTC Tier Breakdown (1,642 Offers)</h3>
          <p className="text-xs text-[#2D5652]/70 mt-0.5">Compensation bands</p>
        </div>
        <span className="text-xs font-mono font-semibold text-[#0C2C47] bg-[#E4F2EA] px-2.5 py-1 rounded-md self-start sm:self-auto">
          Highest: ₹34.0 LPA
        </span>
      </div>

      {/* Progress stack bar */}
      <div className="w-full flex h-3.5 rounded-lg overflow-hidden my-3 bg-[#F0F4F3]">
        {tiers.map(t => (
          <div 
            key={t.name}
            style={{ width: `${t.percentage}%`, backgroundColor: t.color }}
            title={`${t.name}: ${t.count} offers (${t.percentage}%)`}
            className="h-full transition-all duration-500 first:rounded-l-lg last:rounded-r-lg hover:opacity-90"
          ></div>
        ))}
      </div>

      {/* Breakdown List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
        {tiers.map(t => (
          <div key={t.name} className="flex items-start gap-2 p-2 rounded-lg border border-[#97D3CD]/30 bg-[#F8FAF9]">
            <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: t.color }}></span>
            <div className="text-xs flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0C2C47] truncate">{t.name}</span>
                <span className="font-mono font-bold text-[#0C2C47] ml-2">{t.count}</span>
              </div>
              <p className="text-[11px] text-[#2D5652]/70 truncate mt-0.5">{t.companies}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
