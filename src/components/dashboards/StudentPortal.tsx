import React, { useState,useEffect } from 'react';
import { StudentProfile, StudentSkill, StudentInternship, StudentProject, StudentRnD, PlacementDrive, DriveLoadState } from '../../types';
import { generateStudentResumePDF } from '../../services/pdfService';
import { StudentDriveSchedule } from './StudentDriveSchedule';
import { ResumeManager } from './ResumeManager';
import { StudentPlacementMailbox } from '../common/StudentPlacementMailbox';
import { getStoredEmails } from '../../services/emailService';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Star, 
  Award, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Layers,
  HeartHandshake,
  Lock,
  Unlock,
  KeyRound,
  Clock,
  X,
  ShieldAlert,
  ArrowRight,
  Bell
} from 'lucide-react';

interface StudentPortalProps {
  student: StudentProfile;
  drives: PlacementDrive[];
  onUpdateProfile: (updatedProfile: StudentProfile) => void;
  driveLoadState: DriveLoadState;
  driveLoadError: string;
  onRetryDrives: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  drives,
  onUpdateProfile,
  driveLoadState,
  driveLoadError,
  onRetryDrives
}) => {
  const [profile, setProfile] = useState<StudentProfile>(student);
  // Keep the dashboard profile synchronized with updated App data
   useEffect(() => {
     setProfile(student);
   }, [student]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'emails' | 'personal' | 'academic' | 'skills' | 'rnd' | 'resumes' | 'offers'>('schedule');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Yes/No radio state from user's student_profile.html
  const [targetEmailId, setTargetEmailId] = useState<string | null>(null);
  const [hasAcademicProjects, setHasAcademicProjects] = useState<'yes' | 'no'>('yes');
  const [academicProjectsInput, setAcademicProjectsInput] = useState('PPODAI - Intelligent Placement & JD Matching Engine; UltraPay Distributed Ledger');
  
  const [hasNonAcademicProjects, setHasNonAcademicProjects] = useState<'yes' | 'no'>('yes');
  const [nonAcademicProjectsInput, setNonAcademicProjectsInput] = useState('College Fest Impulse Portal; Automated Campus Navigation App');

  const [hasInternships, setHasInternships] = useState<'yes' | 'no'>('yes');
  const [internshipsInput, setInternshipsInput] = useState('HackerRank India (Full Stack & AI, 6 Months); Samsung R&D (Computer Vision, 3 Months)');

  const [hasAiExperience, setHasAiExperience] = useState<'yes' | 'no'>('yes');
  const [aiExperienceInput, setAiExperienceInput] = useState('LangChain, PyTorch, LLaMA-3 fine-tuning, HuggingFace Transformers, RAG architecture');

  const [hasResearchPapers, setHasResearchPapers] = useState<'yes' | 'no'>('yes');
  const [researchPapersInput, setResearchPapersInput] = useState('Context-Aware Transformers for Multilingual Candidate Skill Extraction (IEEE IACC 2025)');

  const [hasPaperPresentations, setHasPaperPresentations] = useState<'yes' | 'no'>('yes');
  const [paperPresentationsInput, setPaperPresentationsInput] = useState('National Conference on Emerging Web Architectures (NCEWA 2025)');

  const [hasPatents, setHasPatents] = useState<'yes' | 'no'>('yes');
  const [patentsInput, setPatentsInput] = useState('System and Method for Real-Time Automated Semantic Resume Scoring (IN20254109887A)');

  // New skill addition state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<StudentSkill['category']>('ai_tools');
  const [newSkillRating, setNewSkillRating] = useState(5);

  // Profile Lock & HOD Permission Request State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');

  // Lock status calculation: locked if isLocked is true AND not currently approved
  const isProfileLocked = profile.isLocked !== false && profile.editPermissionStatus !== 'approved';

  
const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isProfileLocked) return;

  try {
    const updated: StudentProfile = {
      ...profile,
      isLocked: true,
      lockTimestamp: new Date().toISOString(),
      editPermissionStatus: 'none',
      editPermissionReason: undefined
    };

    const response = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(updated)
    });

    const data = await response.json();

    if (!response.ok) {
      window.alert(data.message || 'Unable to save profile.');
      return;
    }

    setProfile(updated);
    onUpdateProfile(updated);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 3000);

  } catch (error) {
    console.error('Profile save failed:', error);
    window.alert('Unable to connect to the server. Please try again.');
  }
};

  const handleSendHODRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) return;

    const updated: StudentProfile = {
      ...profile,
      editPermissionStatus: 'pending',
      editPermissionReason: requestReason.trim(),
      editPermissionRequestedAt: new Date().toLocaleString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setProfile(updated);
    onUpdateProfile(updated);
    setRequestModalOpen(false);
    setRequestReason('');
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const updatedSkills: StudentSkill[] = [
      ...profile.skills,
      { name: newSkillName.trim(), category: newSkillCategory, rating: newSkillRating }
    ];
    setProfile({ ...profile, skills: updatedSkills });
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx: number) => {
    const updated = profile.skills.filter((_, i) => i !== idx);
    setProfile({ ...profile, skills: updated });
  };

  const sortedOffers = [...profile.offers].sort((a,b) => b.packageLPA - a.packageLPA);
  const highestOffer = sortedOffers[0];

  // Emails & Real-Time Countdown intimations for this student
  const studentEmails = getStoredEmails().filter(e => e.studentUsn === profile.usn || !e.studentUsn);
  const unreadEmails = studentEmails.filter(e => !e.isRead).length;
  const urgentEmail = studentEmails.find(e => e.hoursLeft > 0 && e.hoursLeft <= 24 && !e.formSubmitted);

  // Smooth scroll tab transition helper
  const handleTabChange = (tab: typeof activeTab, targetElId?: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      const el = targetElId ? document.getElementById(targetElId) : document.getElementById('student-tab-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="space-y-5">
      
      {/* Student Welcome Banner */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>Student Portal</span>
            <span>·</span>
            <span>USN: {profile.usn}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            {profile.fullName}
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1">
            {profile.pursuingDegree} · Dept. of {profile.department} (Sec {profile.section}) · CGPA: <span className="font-bold text-[#E2A54D] font-mono">{profile.cgpa.toFixed(2)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTabChange('emails')}
            className={`flex items-center gap-2 px-3 py-2 font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer ${
              unreadEmails > 0 
                ? 'bg-[#E2A54D] text-[#0C2C47]' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Open placement alerts"
          >
            <Mail className="w-4 h-4" />
            <span>Alerts ({studentEmails.length})</span>
            {unreadEmails > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#0C2C47] text-white font-bold">
                {unreadEmails}
              </span>
            )}
          </button>

          <button
            onClick={() => generateStudentResumePDF(profile)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            title="Download formatted PDF resume"
          >
            <Download className="w-4 h-4" />
            <span>Download Resume</span>
          </button>
        </div>
      </div>

      {/* Real-Time Urgent Intimation */}
      {urgentEmail && !urgentEmail.formSubmitted && (
        <div className="p-4 bg-[#0C2C47] border border-[#E2A54D] text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E2A54D]/20 border border-[#E2A54D]/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#E2A54D]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E2A54D] text-[#0C2C47] px-2 py-0.5 rounded">
                  Closing Soon
                </span>
                <span className="text-xs font-mono font-bold text-[#E2A54D]">
                  {urgentEmail.hoursLeft}h Left
                </span>
                <span className="text-[11px] text-[#E4F2EA]">
                  Deadline: {urgentEmail.deadlineString}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">
                {urgentEmail.companyName} · {urgentEmail.roleTitle} (₹{urgentEmail.ctcLPA} LPA)
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setTargetEmailId(urgentEmail.id);
              setActiveTab('emails');
              setTimeout(() => {
                const el = document.getElementById('placement-registration-form');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 120);
            }}
            className="px-3.5 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] font-bold rounded-lg text-xs transition-all shadow-sm shrink-0 cursor-pointer self-start md:self-auto"
          >
            <span>Fill Registration Form →</span>
          </button>
        </div>
      )}

      {/* Offer status alert if placed */}
      {sortedOffers.length > 0 && (
        <div className="p-3.5 bg-[#E4F2EA] border border-[#97D3CD] rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2D5652] text-white flex items-center justify-center font-bold shrink-0">
              <Award className="w-4 h-4 text-[#E2A54D]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0C2C47]">
                Offer Received: {sortedOffers.length} campus placement offer{sortedOffers.length > 1 ? 's' : ''}!
              </div>
              <div className="text-xs text-[#2D5652] mt-0.5">
                Top Package: <strong className="font-mono text-[#0C2C47]">₹{highestOffer.packageLPA.toFixed(1)} LPA</strong> · {highestOffer.companyName} ({highestOffer.roleTitle})
              </div>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('offers', 'offers-section')}
            className="text-xs font-semibold text-[#0C2C47] underline hover:text-[#2D5652] shrink-0 cursor-pointer"
          >
            View Offers
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#97D3CD]/30 gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() => handleTabChange('schedule')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#0C2C47]" />
          <span>Schedule ({drives.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('emails')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'emails'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-[#2D5652]" />
          <span>Alerts</span>
          {unreadEmails > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E2A54D] text-[#0C2C47] font-bold ml-1">
              {unreadEmails}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('personal')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'personal'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Personal Info
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('academic')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'academic'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Academics
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('skills')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'skills'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Skills & Projects
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('rnd')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'rnd'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          R&D & Patents
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('resumes')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'resumes'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Resumes
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('offers', 'offers-section')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'offers'
              ? 'border-[#0C2C47] text-[#0C2C47] bg-[#E4F2EA] rounded-t-lg'
              : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
          }`}
        >
          Offers ({profile.offers.length})
        </button>
      </div>

      {/* TAB CONTENT CONTAINER WITH ANCHOR */}
      <div id="student-tab-content" className="scroll-mt-16">
        {/* SCHEDULE VIEW */}
        {activeTab === 'schedule' && (
          <StudentDriveSchedule
            student={profile}
            drives={drives}
            driveLoadState={driveLoadState}
            driveLoadError={driveLoadError}
            onRetryDrives={onRetryDrives}
          />
        )}

        {/* PLACEMENT MAILBOX & COUNTDOWN REMINDERS */}
        {activeTab === 'emails' && (
          <StudentPlacementMailbox student={profile} drives={drives} targetEmailId={targetEmailId} />
        )}

      {activeTab !== 'schedule' && activeTab !== 'emails' && (
        <div className="space-y-6">
          
          {/* PROFILE LOCK STATUS BANNER */}
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs ${
            profile.editPermissionStatus === 'pending'
              ? 'bg-[#EFEAE6] border-[#E2A54D] text-[#0C2C47]'
              : profile.editPermissionStatus === 'approved'
              ? 'bg-[#E4F2EA] border-[#2D5652] text-[#2D5652]'
              : profile.editPermissionStatus === 'rejected'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-white border-[#97D3CD]/50 text-[#0C2C47]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                profile.editPermissionStatus === 'approved' ? 'bg-[#2D5652] text-white' :
                profile.editPermissionStatus === 'pending' ? 'bg-[#E2A54D]/30 text-[#0C2C47]' :
                'bg-[#E4F2EA] text-[#0C2C47]'
              }`}>
                {profile.editPermissionStatus === 'approved' ? (
                  <Unlock className="w-4 h-4 text-white" />
                ) : (
                  <Lock className="w-4 h-4 text-[#0C2C47]" />
                )}
              </div>
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>
                    {profile.editPermissionStatus === 'approved' ? 'Profile Unlocked: Edit Permission Granted' :
                     profile.editPermissionStatus === 'pending' ? 'Edit Request Pending Approval' :
                     profile.editPermissionStatus === 'rejected' ? 'Edit Request Denied' :
                     'Profile Locked (Read-Only)'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E4F2EA] text-[#2D5652]">
                    {profile.department}
                  </span>
                </div>
                <p className="text-[11px] text-[#2D5652]/80 mt-0.5">
                  {profile.editPermissionStatus === 'approved'
                    ? `Approved by HOD. You can edit and save your profile.`
                    : profile.editPermissionStatus === 'pending'
                    ? `Request sent to HOD. Awaiting review.`
                    : profile.editPermissionStatus === 'rejected'
                    ? `Request rejected by HOD. Contact department office.`
                    : 'Profile details are locked for campus drives. Request HOD approval to update.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {isProfileLocked && profile.editPermissionStatus !== 'pending' && (
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0C2C47] hover:bg-[#2D5652] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#E2A54D]" />
                  <span>Request Edit</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <fieldset disabled={isProfileLocked} className="space-y-6 disabled:opacity-85">
        
        {/* TAB 1: PERSONAL & CONTACT FIELDS */}
        {activeTab === 'personal' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Identity & Contact Information</h3>
              <p className="text-xs text-slate-500">Official student registry data aligned with college records</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">USN Number</label>
                <input 
                  type="text" 
                  value={profile.usn} 
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.fullName} 
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">First Name</label>
                <input 
                  type="text" 
                  value={profile.firstName} 
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Middle Name</label>
                <input 
                  type="text" 
                  value={profile.middleName || ''} 
                  onChange={(e) => setProfile({ ...profile, middleName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={profile.lastName} 
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pursuing Degree</label>
                <input 
                  type="text" 
                  value={profile.pursuingDegree} 
                  onChange={(e) => setProfile({ ...profile, pursuingDegree: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <input 
                  type="text" 
                  value={profile.department} 
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile No</label>
                <input 
                  type="text" 
                  value={profile.mobileNo} 
                  onChange={(e) => setProfile({ ...profile, mobileNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select 
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={profile.dateOfBirth} 
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Year of Joining</label>
                <input 
                  type="number" 
                  value={profile.yearOfJoining} 
                  onChange={(e) => setProfile({ ...profile, yearOfJoining: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Type of Entry</label>
                <select 
                  value={profile.typeOfEntry}
                  onChange={(e) => setProfile({ ...profile, typeOfEntry: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Regular">Regular</option>
                  <option value="Lateral Entry">Lateral Entry</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Placement Email ID</label>
                <input 
                  type="email" 
                  value={profile.placementEmailId} 
                  onChange={(e) => setProfile({ ...profile, placementEmailId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Personal Email ID</label>
                <input 
                  type="email" 
                  value={profile.personalEmailId} 
                  onChange={(e) => setProfile({ ...profile, personalEmailId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PAN Number</label>
                <input 
                  type="text" 
                  value={profile.panNumber} 
                  onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Aadhar Number</label>
                <input 
                  type="text" 
                  value={profile.aadharNumber} 
                  onChange={(e) => setProfile({ ...profile, aadharNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                <input 
                  type="text" 
                  value={profile.bloodGroup} 
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Physically Challenged</label>
                <select 
                  value={profile.physicallyChallenged}
                  onChange={(e) => setProfile({ ...profile, physicallyChallenged: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Parents Details Sub-section */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Parents / Guardians Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Father name</label>
                  <input 
                    type="text" 
                    value={profile.fatherName} 
                    onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Father's Mobile No.</label>
                  <input 
                    type="text" 
                    value={profile.fatherMobileNo} 
                    onChange={(e) => setProfile({ ...profile, fatherMobileNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Father Occupation</label>
                  <input 
                    type="text" 
                    value={profile.fatherOccupation} 
                    onChange={(e) => setProfile({ ...profile, fatherOccupation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mother name</label>
                  <input 
                    type="text" 
                    value={profile.motherName} 
                    onChange={(e) => setProfile({ ...profile, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mother's Mobile No.</label>
                  <input 
                    type="text" 
                    value={profile.motherMobileNo} 
                    onChange={(e) => setProfile({ ...profile, motherMobileNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mother Occupation</label>
                  <input 
                    type="text" 
                    value={profile.motherOccupation} 
                    onChange={(e) => setProfile({ ...profile, motherOccupation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Address Details Sub-section */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Address & Domicile Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Communication Full Address</label>
                  <textarea 
                    rows={2}
                    value={profile.communicationAddress} 
                    onChange={(e) => setProfile({ ...profile, communicationAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Permanent Full Address</label>
                  <textarea 
                    rows={2}
                    value={profile.permanentAddress} 
                    onChange={(e) => setProfile({ ...profile, permanentAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Native Place</label>
                  <input 
                    type="text" 
                    value={profile.nativePlace} 
                    onChange={(e) => setProfile({ ...profile, nativePlace: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State</label>
                  <input 
                    type="text" 
                    value={profile.state} 
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pincode (Native Place)</label>
                  <input 
                    type="text" 
                    value={profile.pincode} 
                    onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ACADEMIC HISTORY */}
        {activeTab === 'academic' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Background & Performance Matrix</h3>
              <p className="text-xs text-slate-500">10th, 12th/Diploma, BE CGPA, and Academic gap records</p>
            </div>

            {/* 10th / SSLC */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">10th / SSLC Records</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">10th Percentage</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={profile.tenthPercentage} 
                    onChange={(e) => setProfile({ ...profile, tenthPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year of Passing 10th/SSLC</label>
                  <input 
                    type="number" 
                    value={profile.tenthPassingYear} 
                    onChange={(e) => setProfile({ ...profile, tenthPassingYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Name of the School in 10th/SSLC</label>
                  <input 
                    type="text" 
                    value={profile.tenthSchoolName} 
                    onChange={(e) => setProfile({ ...profile, tenthSchoolName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Name of the Board in 10th/SSLC</label>
                  <input 
                    type="text" 
                    value={profile.tenthBoardName} 
                    onChange={(e) => setProfile({ ...profile, tenthBoardName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 12th / PUC / Diploma */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">12th / PUC / Diploma Records</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">12th/Diploma Percentage</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={profile.twelfthOrDiplomaPercentage} 
                    onChange={(e) => setProfile({ ...profile, twelfthOrDiplomaPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year of Passing 12th/PUC/Diploma</label>
                  <input 
                    type="number" 
                    value={profile.twelfthOrDiplomaPassingYear} 
                    onChange={(e) => setProfile({ ...profile, twelfthOrDiplomaPassingYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Name of the college in 12th/PUC/Diploma</label>
                  <input 
                    type="text" 
                    value={profile.twelfthOrDiplomaCollegeName} 
                    onChange={(e) => setProfile({ ...profile, twelfthOrDiplomaCollegeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Name of the Board in 12th/PUC/Diploma</label>
                  <input 
                    type="text" 
                    value={profile.twelfthOrDiplomaBoardName} 
                    onChange={(e) => setProfile({ ...profile, twelfthOrDiplomaBoardName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Pursuing Degree (BE CGPA) & Backlogs */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Engineering / BE Degree Performance</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pursuing Degree (BE CGPA )</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={profile.cgpa} 
                    onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Backlogs</label>
                  <input 
                    type="number" 
                    value={profile.currentBacklogs} 
                    onChange={(e) => setProfile({ ...profile, currentBacklogs: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Backlog History</label>
                  <input 
                    type="number" 
                    value={profile.backlogHistory} 
                    onChange={(e) => setProfile({ ...profile, backlogHistory: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year Back</label>
                  <select 
                    value={profile.yearBack}
                    onChange={(e) => setProfile({ ...profile, yearBack: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gap and Career Intent Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Number of years you had gap in your Academic career before current degree
                </label>
                <input 
                  type="number" 
                  value={profile.gapBeforeDegreeYears} 
                  onChange={(e) => setProfile({ ...profile, gapBeforeDegreeYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Number of years you had gap in current degree
                </label>
                <input 
                  type="number" 
                  value={profile.gapInDegreeYears} 
                  onChange={(e) => setProfile({ ...profile, gapInDegreeYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Are you Interested in Higher Studies
                </label>
                <select 
                  value={profile.interestedInHigherStudies}
                  onChange={(e) => setProfile({ ...profile, interestedInHigherStudies: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="No">No (Prioritizing Campus Placement)</option>
                  <option value="Yes">Yes (Planning MS / M.Tech / MBA)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Would you like to register for placement assistance
                </label>
                <select 
                  value={profile.registeredForPlacementAssistance}
                  onChange={(e) => setProfile({ ...profile, registeredForPlacementAssistance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-indigo-700"
                >
                  <option value="Yes">Yes (Active Campus Recruitment)</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Have you obtained any External Couse certification
                </label>
                <select 
                  value={profile.hasExternalCertifications}
                  onChange={(e) => setProfile({ ...profile, hasExternalCertifications: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Yes">Yes (AWS, NPTEL, Coursera, HackerRank, etc.)</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PROFESSIONAL SKILLS (AI Tools, Languages with 1-5 rating) & INTERNSHIPS */}
        {activeTab === 'skills' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Professional Skills (AI Tools & Languages Rated 1-5) & Internships
              </h3>
              <p className="text-xs text-slate-500">
                Self-evaluation on a scale of 1 to 5 used by HR matching engine to compute candidate shortlist scores
              </p>
            </div>

            {/* Add new skill inline widget */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Skill or AI Tool (e.g. PyTorch, Docker, Python)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg flex-1 min-w-[180px]"
              />

              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="programming">Programming Language</option>
                <option value="ai_tools">AI Tools / ML Framework</option>
                <option value="web">Web & Full Stack</option>
                <option value="cloud">Cloud & DevOps</option>
                <option value="database">Database</option>
                <option value="soft_skill">Domain / Design</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <span className="font-semibold">Rating:</span>
                <select
                  value={newSkillRating}
                  onChange={(e) => setNewSkillRating(Number(e.target.value))}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold font-mono"
                >
                  <option value={5}>5 / 5 (Expert)</option>
                  <option value={4}>4 / 5 (Proficient)</option>
                  <option value={3}>3 / 5 (Intermediate)</option>
                  <option value={2}>2 / 5 (Beginner)</option>
                  <option value={1}>1 / 5 (Novice)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Skill
              </button>
            </div>

            {/* Current Skills Grid with 1-5 Star Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {profile.skills.map((skill, sIdx) => (
                <div key={sIdx} className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{skill.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{skill.category.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= skill.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sIdx)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-1"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Internships & Projects Questionnaire from GAT Prototype */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Projects, Internships & AI Experience Questionnaire
                </h4>
                <p className="text-[11px] text-slate-500">Self-attested experience questions matching GAT student profile records</p>
              </div>

              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-xs">
                {/* Academic projects */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Have you done any academic projects? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="acad_proj" checked={hasAcademicProjects === 'yes'} onChange={() => setHasAcademicProjects('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="acad_proj" checked={hasAcademicProjects === 'no'} onChange={() => setHasAcademicProjects('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasAcademicProjects === 'yes' && (
                    <input 
                      type="text" 
                      value={academicProjectsInput} 
                      onChange={(e) => setAcademicProjectsInput(e.target.value)} 
                      placeholder="If yes, mention the project(s)..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>

                {/* Non-academic projects */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Have you done any non-academic projects? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="non_acad_proj" checked={hasNonAcademicProjects === 'yes'} onChange={() => setHasNonAcademicProjects('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="non_acad_proj" checked={hasNonAcademicProjects === 'no'} onChange={() => setHasNonAcademicProjects('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasNonAcademicProjects === 'yes' && (
                    <input 
                      type="text" 
                      value={nonAcademicProjectsInput} 
                      onChange={(e) => setNonAcademicProjectsInput(e.target.value)} 
                      placeholder="If yes, mention the project(s)..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>

                {/* Internships */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Internships / other experiences? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="intern_q" checked={hasInternships === 'yes'} onChange={() => setHasInternships('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="intern_q" checked={hasInternships === 'no'} onChange={() => setHasInternships('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasInternships === 'yes' && (
                    <input 
                      type="text" 
                      value={internshipsInput} 
                      onChange={(e) => setInternshipsInput(e.target.value)} 
                      placeholder="If yes, mention the company name, role, duration..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>

                {/* AI Tools */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">AI tools / AI related experience? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="ai_q" checked={hasAiExperience === 'yes'} onChange={() => setHasAiExperience('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="ai_q" checked={hasAiExperience === 'no'} onChange={() => setHasAiExperience('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasAiExperience === 'yes' && (
                    <input 
                      type="text" 
                      value={aiExperienceInput} 
                      onChange={(e) => setAiExperienceInput(e.target.value)} 
                      placeholder="If yes, mention the AI tools or experience..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Internships List */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Verified Work Experience & Internships
                  </h4>
                  <p className="text-[11px] text-slate-500">Corporate internships recognized by Central Placement Cell</p>
                </div>
              </div>

              <div className="space-y-3">
                {profile.internships.map((intern, iIdx) => (
                  <div key={intern.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{intern.companyName}</span>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {intern.durationMonths} Months Experience
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-700 block mt-1">Domain: {intern.domain}</span>
                    <p className="text-xs text-slate-600 mt-2">{intern.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: R&D WORKS, PATENTS, HOBBIES */}
        {activeTab === 'rnd' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">R&D Works, Patents, Achievements & Hobbies</h3>
              <p className="text-xs text-slate-500">Research publications, presentations, intellectual property, and personal interests</p>
            </div>

            {/* RND Works List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Research & Development (Paper Publications, Presentations, Patents)
              </span>

              {profile.rndWorks.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 italic bg-slate-50 rounded-lg">
                  No R&D publications or patents added yet.
                </div>
              ) : (
                profile.rndWorks.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                        {r.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 font-mono">{r.year} · {r.status}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{r.title}</h4>
                    <span className="text-[11px] text-slate-600 block mt-0.5">{r.journalOrConference}</span>
                    {r.doiOrPatentNo && (
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">Ref: {r.doiOrPatentNo}</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* R&D Self-Attestation Questionnaire from GAT Prototype */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Research, Conferences & Patent Declarations
                </h4>
                <p className="text-[11px] text-slate-500">Official declarations matching student profile records</p>
              </div>

              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-xs">
                {/* Published papers */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Have you published any research papers? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="res_papers" checked={hasResearchPapers === 'yes'} onChange={() => setHasResearchPapers('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="res_papers" checked={hasResearchPapers === 'no'} onChange={() => setHasResearchPapers('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasResearchPapers === 'yes' && (
                    <input 
                      type="text" 
                      value={researchPapersInput} 
                      onChange={(e) => setResearchPapersInput(e.target.value)} 
                      placeholder="If yes, mention the paper(s)..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>

                {/* Presented papers */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Have you presented any papers? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="pres_papers" checked={hasPaperPresentations === 'yes'} onChange={() => setHasPaperPresentations('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="pres_papers" checked={hasPaperPresentations === 'no'} onChange={() => setHasPaperPresentations('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasPaperPresentations === 'yes' && (
                    <input 
                      type="text" 
                      value={paperPresentationsInput} 
                      onChange={(e) => setPaperPresentationsInput(e.target.value)} 
                      placeholder="If yes, mention the event / topic..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>

                {/* Patents */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">Have you filed any patents? *</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="patents_q" checked={hasPatents === 'yes'} onChange={() => setHasPatents('yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="patents_q" checked={hasPatents === 'no'} onChange={() => setHasPatents('no')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {hasPatents === 'yes' && (
                    <input 
                      type="text" 
                      value={patentsInput} 
                      onChange={(e) => setPatentsInput(e.target.value)} 
                      placeholder="If yes, mention the patent details..." 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Achievements & Hobbies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Academic & Technical Honors</label>
                <div className="space-y-1.5">
                  {profile.achievementsAcademic.map((a, i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                      • {a}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Hobbies & Personal Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {profile.hobbiesAndInterests.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: MY RESUMES (PDF Uploads & GAT Generator) */}
        {activeTab === 'resumes' && (
          <ResumeManager student={profile} />
        )}

        {/* TAB 6: MY OFFERS & ELIGIBLE DRIVES */}
        {activeTab === 'offers' && (
          <div id="offers-section" className="space-y-6 scroll-mt-20">
            {/* Offers received */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    My Placement Offers ({profile.offers.length} Received)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Highest offer: <strong className="text-indigo-700 font-mono">₹{highestOffer?.packageLPA.toFixed(1) || '0'} LPA</strong> ({highestOffer?.companyName || 'None'})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.offers.map((offer, oIdx) => (
                  <div 
                    key={offer.id} 
                    className={`p-4 rounded-xl border text-xs ${
                      oIdx === 0 
                        ? 'border-indigo-400 bg-indigo-50/70 ring-1 ring-indigo-400/40 shadow-xs' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{offer.companyName}</span>
                      {oIdx === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded">
                          Highest Package
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{offer.roleTitle}</div>
                    <div className="text-base font-bold font-mono text-indigo-700 mt-2">
                      ₹{offer.packageLPA.toFixed(1)} LPA
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {offer.tier}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{offer.offerLetterDate}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {offer.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Eligible Drives */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Upcoming Campus Recruitment Drives</h3>
              <div className="space-y-3">
                {drives.map(drive => (
                  <div key={drive.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{drive.companyName} · {drive.roleTitle}</span>
                      <span className="text-slate-500 text-[11px]">Drive Date: {drive.driveDate} · Venue: {drive.venue}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 block">₹{drive.ctcLPA} LPA</span>
                      <span className="text-[10px] text-slate-500">CGPA ≥ {drive.minCGPA}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

            </fieldset>

            {/* Form Actions Footer */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Profile details updated and locked successfully!
                  </span>
                )}
                {isProfileLocked && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile inputs are locked. Request HOD permission to make changes.</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isProfileLocked ? (
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Request Edit Permission from HOD</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Lock Profile</span>
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      )}
      </div>

      {/* REQUEST EDIT PERMISSION MODAL */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Edit Permission from HOD</h3>
                  <p className="text-[11px] text-slate-500">Department of {profile.department}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendHODRequest} className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p>
                  <strong>Institutional Verification Policy:</strong> Changes to academic marks, CGPA, backlogs, or verified identity details require written HOD approval to safeguard placement compliance.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Reason for Requesting Profile Edit <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify what details you need to modify (e.g., Updated 6th semester CGPA from 8.8 to 9.14; Added AWS Cloud Practitioner certificate; Corrected contact number)..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Submit Request to HOD
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
