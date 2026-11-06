export type RoleType = 
  | 'faculty_mgmt'     // Set 1: Management
  | 'principal'        // Set 1: Principal
  | 'placement_dean'   // Set 1: Placement Dean / Head
  | 'hod'              // Set 1: HOD of 15 branches
  | 'pcc'              // Set 2: Placement Coordination Cell (PO & Coordinators)
  | 'fpc'              // Set 2: Faculty Placement Coordinator
  | 'spc'              // Set 2: Student Placement Coordinator
  | 'student'          // Set 3: Student
  | 'hr'               // Set 4: HR (External)
  | 'admin';           // Set 5: Admin / Super User

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  specialId: string;    // Unique Login ID / USN / Employee ID
  password?: string;    // Password for authentication
  department?: string;  // For HOD, FPC, SPC, Student
  designation?: string;
  usn?: string;         // For Student, SPC
  company?: string;     // For HR
  avatar?: string;
  branchName?: string;
  semester?: number;    // Semester 1 to 8
  collegeEmail?: string; // Official college email (e.g. usn@gat.ac.in)
  personalEmail?: string; // Personal email (e.g. gmail.com)
  placementEmail?: string; // Created in 5th sem (e.g. user.placement@gat.ac.in)
  isPlacementMailActivated?: boolean; // Set when 5th sem student sets up placement email
}

export interface StudentSkill {
  name: string;
  category: 'programming' | 'ai_tools' | 'web' | 'database' | 'cloud' | 'soft_skill';
  rating: number; // 1 to 5
}

export interface StudentInternship {
  id: string;
  companyName: string;
  domain: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  description: string;
  isVerified?: boolean;
}

export interface StudentProject {
  id: string;
  title: string;
  domain: string;
  techStack: string[];
  description: string;
  link?: string;
}

export interface StudentRnD {
  id: string;
  type: 'publication' | 'presentation' | 'patent';
  title: string;
  journalOrConference: string;
  year: number;
  status: 'published' | 'presented' | 'filed' | 'granted';
  doiOrPatentNo?: string;
}

export interface OfferDetails {
  id: string;
  companyId: string;
  companyName: string;
  packageLPA: number; // In Lakhs per annum
  roleTitle: string;
  offerLetterDate: string;
  tier: 'Tier 1 Super Dream (>15 LPA)' | 'Tier 2 Dream (8-15 LPA)' | 'Tier 3 Core (5-8 LPA)' | 'Tier 4 Mass (3-5 LPA)';
  status: 'offered' | 'accepted' | 'rejected';
}

export interface StudentProfile {
  // Primary Identifiers
  usn: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  pursuingDegree: string; // e.g. B.E / B.Tech / M.Tech / MCA
  department: string;     // Branch name, e.g., 'CSE', 'ECE', 'ISE', 'AIML'
  section: 'A' | 'B' | 'C';
  semester: number;       // Semester 1 to 8 (Key requirement: multi-semester diversity)
  batchYear: number;      // e.g. 2025, 2026, 2027, 2028
  password?: string;      // Password for authentication
  
  // Contact & Personal
  mobileNo: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  yearOfJoining: number;
  typeOfEntry: 'Regular' | 'Lateral Entry' | 'Management';
  collegeEmail: string;   // Existing college mail (e.g. usn@gat.ac.in)
  personalEmailId: string;// Personal mail (e.g. @gmail.com)
  placementEmailId: string; // Created when student enters 5th sem
  isPlacementMailActivated: boolean; // True when 5th sem student creates official placement ID
  panNumber: string;
  aadharNumber: string;
  bloodGroup: string;
  physicallyChallenged: 'Yes' | 'No';

  // Parents Information
  fatherName: string;
  fatherMobileNo: string;
  fatherOccupation: string;
  motherName: string;
  motherMobileNo: string;
  motherOccupation: string;

  // Address
  communicationAddress: string;
  permanentAddress: string;
  nativePlace: string;
  state: string;
  pincode: string;

  // Education Background
  interestedInHigherStudies: 'Yes' | 'No';
  tenthPercentage: number;
  tenthPassingYear: number;
  tenthSchoolName: string;
  tenthBoardName: string;

  twelfthOrDiplomaPercentage: number;
  twelfthOrDiplomaPassingYear: number;
  twelfthOrDiplomaCollegeName: string;
  twelfthOrDiplomaBoardName: string;

  // Engineering / Degree Performance
  cgpa: number;
  currentBacklogs: number;
  backlogHistory: number;
  yearBack: 'Yes' | 'No';
  gapBeforeDegreeYears: number;
  gapInDegreeYears: number;
  registeredForPlacementAssistance: 'Yes' | 'No';
  hasExternalCertifications: 'Yes' | 'No';

  // Professional & Skills
  skills: StudentSkill[];
  internships: StudentInternship[];
  projects: StudentProject[];
  rndWorks: StudentRnD[];
  achievementsAcademic: string[];
  achievementsNonAcademic: string[];
  hobbiesAndInterests: string[];

  // Placement Offer Records (Supports 1-7 offers with highest package highlighting)
  offers: OfferDetails[];
  isPlaced: boolean;

  // Profile Lock & HOD Permission System
  isLocked?: boolean;
  lockTimestamp?: string;
  editPermissionStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  editPermissionReason?: string;
  editPermissionRequestedAt?: string;
  editPermissionRemarks?: string;
}

export interface ProfileEditRequest {
  id: string;
  usn: string;
  studentName: string;
  department: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  hodRemarks?: string;
  reviewedAt?: string;
}

export function checkRoleAccess(
  currentRole: RoleType,
  targetRole: RoleType,
  currentDept?: string,
  targetDept?: string
): { allowed: boolean; reason?: string } {
  // If staying on same role
  if (currentRole === targetRole) {
    // If HOD, restricted to own department only
    if (currentRole === 'hod' && currentDept && targetDept && currentDept !== targetDept) {
      return { 
        allowed: false, 
        reason: `Access Denied: HOD of ${currentDept} is strictly restricted to their own department and cannot access ${targetDept}.` 
      };
    }
    return { allowed: true };
  }

  // 1. Admin to everyone
  if (currentRole === 'admin') {
    return { allowed: true };
  }

  // 2. Student cannot access any other role
  if (currentRole === 'student') {
    return { 
      allowed: false, 
      reason: '🔒 Access Locked: Students are strictly restricted to their own Student Portal and cannot access any other role or governance tier.' 
    };
  }

  // 3. HR cannot have access to any other role
  if (currentRole === 'hr') {
    return { 
      allowed: false, 
      reason: '🔒 Access Locked: External HR partners are restricted solely to the HR Candidate Evaluation portal and cannot access college roles.' 
    };
  }

  // 4. Management & Principal can access all roles
  if (currentRole === 'faculty_mgmt' || currentRole === 'principal') {
    return { allowed: true };
  }

  // 5. Dean and HOD cannot have access to Management or Principal
  if ((currentRole === 'placement_dean' || currentRole === 'hod') && 
      (targetRole === 'faculty_mgmt' || targetRole === 'principal')) {
    return { 
      allowed: false, 
      reason: `🔒 Access Locked: ${currentRole === 'placement_dean' ? 'Placement Dean' : 'HOD'} cannot access Management or Principal governance records.` 
    };
  }

  // 6. Dean can access all remaining roles (HOD of all 15 branches, PCC, FPC, SPC, Student)
  if (currentRole === 'placement_dean') {
    return { allowed: true };
  }

  // 7. HOD: Restricted to their own department only; cannot access other branches, Management, Principal, or Admin
  if (currentRole === 'hod') {
    if (targetRole === 'admin') {
      return { allowed: false, reason: '🔒 Access Locked: HOD cannot access System Admin settings.' };
    }
    // HOD can access Student, FPC, SPC of their own department
    if (targetRole === 'student' || targetRole === 'fpc' || targetRole === 'spc') {
      if (currentDept && targetDept && currentDept !== targetDept) {
        return { 
          allowed: false, 
          reason: `🔒 Access Locked: HOD of ${currentDept} cannot access records of ${targetDept} department.` 
        };
      }
      return { allowed: true };
    }
    if (targetRole === 'pcc') {
      return { allowed: true };
    }
    return { allowed: false, reason: '🔒 Access Locked: Unauthorized role transition for HOD.' };
  }

  // 8. PCC can access FPC, SPC, Student
  if (currentRole === 'pcc') {
    if (targetRole === 'fpc' || targetRole === 'spc' || targetRole === 'student') {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: '🔒 Access Locked: PCC cannot access higher faculty roles (Dean, HOD, Principal, Management).' 
    };
  }

  // 9. SPC, FPC can't access PCC
  if ((currentRole === 'fpc' || currentRole === 'spc') && targetRole === 'pcc') {
    return { 
      allowed: false, 
      reason: `🔒 Access Locked: ${currentRole === 'fpc' ? 'FPC' : 'SPC'} cannot access PCC (Placement Coordination Cell).` 
    };
  }

  // 10. SPC cannot access FPC
  if (currentRole === 'spc' && targetRole === 'fpc') {
    return { 
      allowed: false, 
      reason: '🔒 Access Locked: Student Placement Coordinator (SPC) cannot access Faculty Coordinator (FPC).' 
    };
  }

  // 11. FPC can access Student and SPC
  if (currentRole === 'fpc') {
    if (targetRole === 'student' || targetRole === 'spc') {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: '🔒 Access Locked: FPC cannot access higher administrative or governance tiers.' 
    };
  }

  // 12. SPC can access Student only
  if (currentRole === 'spc') {
    if (targetRole === 'student') {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: '🔒 Access Locked: SPC can only access Student profiles.' 
    };
  }

  return { allowed: false, reason: '🔒 Access Locked: Role transition not permitted under GAT PPODAI RBAC policy.' };
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  visitedYear: number;
  jobProfiles: string[];
}

export interface PlacementDrive {
  id: string;
  driveCode: string;
  companyId: string;
  companyName: string;
  roleTitle: string;
  ctcLPA: number;
  targetBranches: string[];
  minCGPA: number;
  maxBacklogsAllowed: number;
  driveDate: string;
  venue: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  eligibleStudentCount: number;
  enrolledCount?: number;
  shortlistedCount: number;
  // Teams-style Calendar, JD & Meeting fields
  companyInfo?: string;
  jobDescription?: string;
  requiredSkills?: string[];
  startTime?: string;
  endTime?: string;
  meetingType?: 'Pre-Placement Talk (PPT)' | 'Campus Placement Drive' | 'Online Assessment' | 'Technical Interviews' | 'Virtual Teams Meeting';
  teamsMeetingLink?: string;
  isPublished?: boolean;
  scheduledBy?: string;
  registrationDeadline?: string;
  enrolledStudentsList?: {
    usn: string;
    name: string;
    department: string;
    cgpa: number;
    registeredAt: string;
    status: 'Registered' | 'Shortlisted' | 'Attended' | 'Placed';
  }[];
  rounds: {
    roundNumber: number;
    roundName: string;
    date: string;
    venue: string;
    qualifiedStudents: string[]; // USNs
  }[];
}

export interface EmailNotification {
  id: string;
  driveId: string;
  companyName: string;
  roleTitle: string;
  ctcLPA: number;
  type: 'drive_approached' | 'countdown_reminder' | 'urgent_last_call' | 'registration_confirmed';
  subject: string;
  from: string;
  to: string;
  studentUsn: string;
  studentName: string;
  sentAt: string;
  hoursLeft: number;
  deadlineString: string;
  isRead: boolean;
  companyRequirements: {
    minCGPA: number;
    maxBacklogs: number;
    targetBranches: string[];
    requiredSkills: string[];
    venue: string;
    driveDate: string;
  };
  jobDescriptionSummary: string;
  formSubmitted?: boolean;
  submittedAt?: string;
}

export interface JobDescriptionMatch {
  student: StudentProfile;
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  cgpaEligible: boolean;
  backlogEligible: boolean;
  scoreBreakdown: {
    skillMatchScore: number;
    experienceScore: number;
    academicScore: number;
    ratingBonus: number;
  };
}
