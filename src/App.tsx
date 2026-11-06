/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserAccount, StudentProfile, Company, PlacementDrive, RoleType, checkRoleAccess } from './types';
import { INITIAL_USERS, INITIAL_STUDENTS, INITIAL_COMPANIES, INITIAL_DRIVES } from './data/mockData';
import { Navbar, ROLE_LABELS } from './components/Navbar';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { DatabaseArchitectureModal } from './components/common/DatabaseArchitectureModal';
import { AccessDeniedModal } from './components/common/AccessDeniedModal';

import { ManagementDashboard } from './components/dashboards/ManagementDashboard';
import { DeanDashboard } from './components/dashboards/DeanDashboard';
import { HODDashboard } from './components/dashboards/HODDashboard';
import { PCCDashboard } from './components/dashboards/PCCDashboard';
import { FPCDashboard } from './components/dashboards/FPCDashboard';
import { SPCDashboard } from './components/dashboards/SPCDashboard';
import { StudentPortal } from './components/dashboards/StudentPortal';
import { HRPortal } from './components/dashboards/HRPortal';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { 
  Building2, 
  Layers, 
  Users, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  LogOut,
  Lock,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  // Authentication session state - always starts from the Login page on every visit
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('gat_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_USERS[7]; // Default to Student Rohan Sharma
  });

  // Students list with persistence
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('gat_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_STUDENTS;
  });

  // Companies & Drives
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [drives, setDrives] = useState<PlacementDrive[]>(INITIAL_DRIVES);

  // Modals
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [dbArchitectureOpen, setDbArchitectureOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Access Denied Modal State
  const [accessDeniedData, setAccessDeniedData] = useState<{
    isOpen: boolean;
    reason: string;
    targetRole?: RoleType;
  }>({
    isOpen: false,
    reason: ''
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gat_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gat_students', JSON.stringify(students));
  }, [students]);

  // Purge any legacy persistent login key on startup so the site always begins on the login page
  useEffect(() => {
    localStorage.removeItem('gat_authenticated');
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessDeniedData({ isOpen: false, reason: '' });
  };

  const handleUpdateStudentProfile = (updatedProfile: StudentProfile) => {
    setStudents(prev => prev.map(s => s.usn === updatedProfile.usn ? updatedProfile : s));
  };

  // HOD Edit Permission Handlers
  const handleApproveEditRequest = (usn: string, remarks?: string) => {
    setStudents(prev => prev.map(s => s.usn === usn ? {
      ...s,
      isLocked: false,
      editPermissionStatus: 'approved' as const,
      editPermissionRemarks: remarks || 'Approved by HOD for profile correction.'
    } : s));
  };

  const handleRejectEditRequest = (usn: string, remarks: string) => {
    setStudents(prev => prev.map(s => s.usn === usn ? {
      ...s,
      editPermissionStatus: 'rejected' as const,
      editPermissionRemarks: remarks || 'Edit request rejected. Consult HOD.'
    } : s));
  };

  const handleAddDrive = (newDrive: PlacementDrive) => {
    setDrives(prev => [newDrive, ...prev]);
  };

  const handleUpdateDrive = (updatedDrive: PlacementDrive) => {
    setDrives(prev => prev.map(d => d.id === updatedDrive.id ? updatedDrive : d));
  };

  const handleResetData = () => {
    if (window.confirm('Reset sample dataset to factory defaults?')) {
      setStudents(INITIAL_STUDENTS);
      setDrives(INITIAL_DRIVES);
      setCompanies(INITIAL_COMPANIES);
      setCurrentUser(INITIAL_USERS[7]); // Student
    }
  };

  // Quick switch role shortcut buttons
  const quickRoles: { role: RoleType; label: string; color: string }[] = [
    { role: 'faculty_mgmt', label: 'Management', color: 'border-[#97D3CD] text-[#0C2C47] bg-[#E4F2EA]/40' },
    { role: 'principal', label: 'Principal', color: 'border-[#97D3CD] text-[#0C2C47] bg-[#E4F2EA]/40' },
    { role: 'placement_dean', label: 'Dean', color: 'border-[#97D3CD] text-[#0C2C47] bg-[#E4F2EA]/40' },
    { role: 'hod', label: 'HOD', color: 'border-[#E2A54D]/60 text-[#0C2C47] bg-[#EFEAE6]' },
    { role: 'pcc', label: 'PCC', color: 'border-[#2D5652]/40 text-[#2D5652] bg-[#E4F2EA]' },
    { role: 'fpc', label: 'FPC', color: 'border-[#2D5652]/40 text-[#2D5652] bg-[#E4F2EA]' },
    { role: 'spc', label: 'SPC', color: 'border-[#2D5652]/40 text-[#2D5652] bg-[#E4F2EA]' },
    { role: 'student', label: 'Student', color: 'border-[#E2A54D]/60 text-[#0C2C47] bg-[#EFEAE6]' },
    { role: 'hr', label: 'HR', color: 'border-[#97D3CD] text-[#0C2C47] bg-[#E4F2EA]/50' },
    { role: 'admin', label: 'Admin', color: 'border-slate-300 text-[#0C2C47] bg-slate-100' },
  ];

  // RBAC Access-controlled Quick Switcher
  const handleQuickSwitch = (role: RoleType) => {
    const access = checkRoleAccess(currentUser.role, role, currentUser.department);
    if (!access.allowed) {
      setAccessDeniedData({
        isOpen: true,
        reason: access.reason || 'Access Locked under GAT Security Policy.',
        targetRole: role
      });
      return;
    }

    const user = INITIAL_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleRoleSelect = (targetUser: UserAccount) => {
    const access = checkRoleAccess(currentUser.role, targetUser.role, currentUser.department, targetUser.department);
    if (!access.allowed) {
      setAccessDeniedData({
        isOpen: true,
        reason: access.reason || 'Access Locked under GAT Security Policy.',
        targetRole: targetUser.role
      });
      return;
    }
    setCurrentUser(targetUser);
  };

  // Find active student object if student role is active
  const activeStudentProfile = students.find(s => s.usn === currentUser.usn) || students[0];

  // If not authenticated, show the special ID & password Login Page!
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenDbArchitecture={() => setDbArchitectureOpen(true)}
        />
        {/* Database Schema & Architecture Modal */}
        <DatabaseArchitectureModal
          isOpen={dbArchitectureOpen}
          onClose={() => setDbArchitectureOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#0C2C47] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenRoleSwitcher={() => {
          if (currentUser.role === 'student') {
            setAccessDeniedData({
              isOpen: true,
              reason: 'Locked: Student access is confined to Student Portal. Please log out to switch account.',
              targetRole: 'faculty_mgmt'
            });
          } else {
            setRoleSwitcherOpen(true);
          }
        }}
        onOpenDbArchitecture={() => setDbArchitectureOpen(true)}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* STUDENT SESSION BAR */}
      {currentUser.role === 'student' ? (
        <div className="bg-[#EFEAE6] border-b border-[#E2A54D]/40 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#0C2C47] font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#E2A54D] shrink-0" />
              <span>
                Student Session: <strong className="font-mono text-[#0C2C47]">{currentUser.usn}</strong> ({currentUser.name})
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Role Switcher Strip for Staff / Faculty */
        <div className="bg-white border-b border-[#97D3CD]/30 px-4 py-2 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-max text-xs">
            <div className="flex items-center gap-1.5 shrink-0 text-[#2D5652] font-semibold text-[11px] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#2D5652]" />
              <span>Switch Role:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickRoles.map(item => {
                const isActive = currentUser.role === item.role;
                const access = checkRoleAccess(currentUser.role, item.role, currentUser.department);
                const isLocked = !access.allowed;

                return (
                  <button
                    key={item.role}
                    onClick={() => handleQuickSwitch(item.role)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      isActive 
                        ? 'bg-[#0C2C47] text-white border-[#0C2C47] shadow-xs' 
                        : isLocked
                        ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 hover:opacity-100 cursor-not-allowed'
                        : `${item.color} hover:opacity-85`
                    }`}
                    title={isLocked ? `Locked: ${access.reason}` : `Switch to ${item.label}`}
                  >
                    <span>{item.label}</span>
                    {isLocked && <Lock className="w-2.5 h-2.5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-[#97D3CD]/30 shrink-0">
              <button
                onClick={handleResetData}
                className="p-1 text-[#2D5652]/70 hover:text-[#0C2C47] rounded transition-colors"
                title="Reset data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* SET 1: FACULTY - MANAGEMENT & PRINCIPAL */}
        {(currentUser.role === 'faculty_mgmt' || currentUser.role === 'principal') && (
          <ManagementDashboard
            user={currentUser}
            students={students}
            companies={companies}
            drives={drives}
          />
        )}

        {/* SET 1: FACULTY - PLACEMENT DEAN / HEAD */}
        {currentUser.role === 'placement_dean' && (
          <DeanDashboard
            user={currentUser}
            students={students}
            companies={companies}
            drives={drives}
          />
        )}

        {/* SET 1: FACULTY - HOD (15 Branches) - RESTRICTED TO OWN DEPT + UNLOCK REQUEST APPROVALS */}
        {currentUser.role === 'hod' && (
          <HODDashboard
            user={currentUser}
            students={students}
            drives={drives}
            onApproveEditRequest={handleApproveEditRequest}
            onRejectEditRequest={handleRejectEditRequest}
          />
        )}

        {/* SET 2: PLACEMENT CO-ORDINATORS - PCC (Placement Coordination Cell & PO) */}
        {currentUser.role === 'pcc' && (
          <PCCDashboard
            user={currentUser}
            students={students}
            companies={companies}
            drives={drives}
            onAddDrive={handleAddDrive}
            onUpdateDrive={handleUpdateDrive}
          />
        )}

        {/* SET 2: PLACEMENT CO-ORDINATORS - FPC (Faculty Placement Coordinator) */}
        {currentUser.role === 'fpc' && (
          <FPCDashboard
            user={currentUser}
            students={students}
            drives={drives}
          />
        )}

        {/* SET 2: PLACEMENT CO-ORDINATORS - SPC (Student Placement Coordinator) */}
        {currentUser.role === 'spc' && (
          <SPCDashboard
            user={currentUser}
            students={students}
            drives={drives}
          />
        )}

        {/* SET 3: STUDENT - FULL 43 FIELDS, LOCKED PROFILE & HOD PERMISSION WORKFLOW */}
        {currentUser.role === 'student' && (
          <StudentPortal
            student={activeStudentProfile}
            drives={drives}
            onUpdateProfile={handleUpdateStudentProfile}
          />
        )}

        {/* SET 4: HR (EXTERNAL) - JD Upload & Match Engine */}
        {currentUser.role === 'hr' && (
          <HRPortal
            user={currentUser}
            students={students}
          />
        )}

        {/* SET 5: ADMIN / SUPER USER */}
        {currentUser.role === 'admin' && (
          <AdminDashboard
            user={currentUser}
            students={students}
            companies={companies}
            drives={drives}
            onOpenDbArchitecture={() => setDbArchitectureOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#97D3CD]/30 bg-white py-4 mt-8 text-xs text-[#2D5652]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0C2C47]">Placement Portal</span>
            <span>·</span>
            <span>Global Academy of Technology, Bengaluru</span>
          </div>
          <div className="text-[11px] text-[#2D5652]/80">
            Autonomous Institute Affiliated to VTU
          </div>
        </div>
      </footer>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleRoleSelect}
        onAccessDenied={(reason, targetRole) => {
          setAccessDeniedData({ isOpen: true, reason, targetRole });
        }}
        onLogout={handleLogout}
      />

      {/* Database Schema & Architecture Modal */}
      <DatabaseArchitectureModal
        isOpen={dbArchitectureOpen}
        onClose={() => setDbArchitectureOpen(false)}
      />

      {/* Access Denied / Role Locked Modal */}
      <AccessDeniedModal
        isOpen={accessDeniedData.isOpen}
        onClose={() => setAccessDeniedData({ isOpen: false, reason: '' })}
        reason={accessDeniedData.reason}
        targetRole={accessDeniedData.targetRole}
        currentRole={currentUser.role}
        onLogout={handleLogout}
      />

    </div>
  );
}
