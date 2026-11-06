import { StudentProfile, Company, PlacementDrive, UserAccount, RoleType } from '../types';
import { generateAllBranchStudents } from './studentsData';

export const BRANCHES = [
  { code: 'CSE', name: 'Computer Science & Engineering', totalStrength: 180, hod: 'Dr. Suresh Kumar' },
  { code: 'ISE', name: 'Information Science & Engineering', totalStrength: 120, hod: 'Dr. Meenakshi Sundaram' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', totalStrength: 120, hod: 'Dr. Radhika Pai' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', totalStrength: 60, hod: 'Dr. Vinayaka Rao' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', totalStrength: 180, hod: 'Dr. Anand K. V.' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', totalStrength: 60, hod: 'Dr. Shobha Rani' },
  { code: 'ME', name: 'Mechanical Engineering', totalStrength: 60, hod: 'Dr. Manjunath Swamy' },
  { code: 'CV', name: 'Civil Engineering', totalStrength: 60, hod: 'Dr. Girish H. N.' },
  { code: 'BT', name: 'Biotechnology', totalStrength: 45, hod: 'Dr. Kavitha S.' },
  { code: 'CS-CY', name: 'CS (Cyber Security)', totalStrength: 60, hod: 'Dr. Pradeep N.' },
  { code: 'CS-IOT', name: 'CS (Internet of Things)', totalStrength: 60, hod: 'Dr. Lokesh B.' },
  { code: 'AE', name: 'Aeronautical Engineering', totalStrength: 45, hod: 'Dr. Ramesh Chandra' },
  { code: 'MCA', name: 'Master of Computer Applications', totalStrength: 60, hod: 'Dr. Roopa M.' },
  { code: 'MBA', name: 'Master of Business Administration', totalStrength: 60, hod: 'Dr. Vijaylakshmi' },
  { code: 'RA', name: 'Robotics & Automation', totalStrength: 45, hod: 'Dr. Chandrashekar' },
];

export const INITIAL_STUDENTS: StudentProfile[] = generateAllBranchStudents();

// Baseline Institutional Users (Faculty, Leadership, Coordinators, HR, Admin)
const ALL_15_HODS: UserAccount[] = BRANCHES.map(b => ({
  id: `u_hod_${b.code}`,
  name: `${b.hod} (HOD ${b.code})`,
  email: `hod.${b.code.toLowerCase()}@gat.ac.in`,
  specialId: `HOD-${b.code}-01`,
  password: `hod${b.code.toLowerCase()}@gat2026`,
  role: 'hod' as RoleType,
  department: b.code,
  branchName: b.name,
  designation: `Professor & Head of Department - ${b.name}`
}));

const BASE_USERS: UserAccount[] = [
  // Set 1: Faculty Leadership
  { id: 'u1', name: 'Sri. D. K. Shivakumar', email: 'mgmt@gat.ac.in', specialId: 'GAT-MGMT-01', password: 'mgmt@gat2026', role: 'faculty_mgmt', designation: 'Trust Management & Trustee' },
  { id: 'u2', name: 'Dr. N. Ranapratap Reddy', email: 'principal@gat.ac.in', specialId: 'GAT-PRIN-01', password: 'principal@gat2026', role: 'principal', designation: 'Principal, GAT' },
  { id: 'u3', name: 'Dr. Muralidhara S.', email: 'placementdean@gat.ac.in', specialId: 'GAT-DEAN-01', password: 'dean@gat2026', role: 'placement_dean', designation: 'Dean - Corporate Relations & Placements' },
  
  // Set 1b: HODs for all 15 Branches
  ...ALL_15_HODS,
  
  // Set 2: Placement Co-ordinators
  { id: 'u5', name: 'Prof. Harish B. G.', email: 'pcc@gat.ac.in', specialId: 'PCC-OFFICER-01', password: 'pcc@gat2026', role: 'pcc', designation: 'Head - Placement Coordination Cell (PCC / PO)' },
  { id: 'u6', name: 'Prof. Divya Sharma', email: 'fpc.cse@gat.ac.in', specialId: 'FPC-CSE-01', password: 'fpccse@gat2026', role: 'fpc', department: 'CSE', designation: 'Faculty Placement Coordinator (FPC)' },
  { id: 'u7', name: 'Aditya Deshmukh', email: 'spc.aditya@gat.ac.in', specialId: 'SPC-1GA21CS005', password: 'spc@gat2026', role: 'spc', usn: '1GA21CS005', department: 'CSE', designation: 'Student Placement Coordinator (SPC)' },

  // Set 4: HR External
  { id: 'u9', name: 'Pooja Hegde', email: 'pooja.h@amazon.com', specialId: 'HR-AMAZON-01', password: 'amazon@hr2026', role: 'hr', company: 'Amazon AWS Cloud', designation: 'University Talent Acquisition Lead' },

  // Set 5: Admin / Super User
  { id: 'u10', name: 'GAT IT Systems Administrator', email: 'admin.placement@gat.ac.in', specialId: 'ADMIN-GAT-ROOT', password: 'admin@root2026', role: 'admin', designation: 'Chief System Administrator & Superuser' },
];

export const INITIAL_USERS: UserAccount[] = [
  ...BASE_USERS,
  ...INITIAL_STUDENTS.map(s => ({
    id: `u_${s.usn}`,
    name: s.fullName,
    email: s.placementEmailId || s.collegeEmail,
    specialId: s.usn,
    password: s.password || 'student@2026',
    role: 'student' as RoleType,
    usn: s.usn,
    department: s.department,
    semester: s.semester,
    collegeEmail: s.collegeEmail,
    personalEmail: s.personalEmailId,
    placementEmail: s.placementEmailId,
    isPlacementMailActivated: s.isPlacementMailActivated,
    designation: `Semester ${s.semester} Student (${s.department})`
  }))
];

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c1', name: 'Google India', industry: 'Cloud & AI / Internet', website: 'https://careers.google.com', contactPerson: 'Priya Narayanan', contactEmail: 'campus-in@google.com', contactPhone: '+91 80 6721 8000', tier: 'Tier 1', visitedYear: 2026, jobProfiles: ['Software Development Engineer', 'Cloud Solutions Architect'] },
  { id: 'c2', name: 'Amazon AWS', industry: 'Cloud Computing & Distributed Systems', website: 'https://amazon.jobs', contactPerson: 'Pooja Hegde', contactEmail: 'campus-aws@amazon.com', contactPhone: '+91 80 4333 1111', tier: 'Tier 1', visitedYear: 2026, jobProfiles: ['SDE-1', 'Support Engineer', 'Data Engineer'] },
  { id: 'c3', name: 'Microsoft IDC', industry: 'Enterprise Software & Azure', website: 'https://careers.microsoft.com', contactPerson: 'Arun Bhatia', contactEmail: 'university-recruitment@microsoft.com', contactPhone: '+91 40 6696 0000', tier: 'Tier 1', visitedYear: 2026, jobProfiles: ['Software Engineer', 'Core Firmware Engineer'] },
  { id: 'c4', name: 'Texas Instruments', industry: 'Semiconductors & Embedded Systems', website: 'https://ti.com/careers', contactPerson: 'Rajesh G.', contactEmail: 'ti_campus@ti.com', contactPhone: '+91 80 2509 9000', tier: 'Tier 1', visitedYear: 2026, jobProfiles: ['Analog Design Engineer', 'Embedded Software Specialist'] },
  { id: 'c5', name: 'PhonePe', industry: 'FinTech / Payments', website: 'https://phonepe.com/careers', contactPerson: 'Neha Kapoor', contactEmail: 'careers@phonepe.com', contactPhone: '+91 80 6872 7000', tier: 'Tier 1', visitedYear: 2026, jobProfiles: ['Backend Engineer (Go/Java)', 'Product Analyst'] },
  { id: 'c6', name: 'Bosch Global Software', industry: 'Mobility & Embedded IoT', website: 'https://bosch.in', contactPerson: 'Kishore Kumar', contactEmail: 'campus@bosch.com', contactPhone: '+91 80 6755 1000', tier: 'Tier 2', visitedYear: 2026, jobProfiles: ['Autonomous Systems Engineer', 'Software Developer'] },
  { id: 'c7', name: 'Cisco Systems', industry: 'Networking & Cyber Security', website: 'https://cisco.com', contactPerson: 'Deepa Menon', contactEmail: 'cisco_grad@cisco.com', contactPhone: '+91 80 4426 0000', tier: 'Tier 1', visitedYear: 2026, jobProfiles: ['Network Security Engineer', 'Cloud Developer'] },
  { id: 'c8', name: 'Infosys Limited', industry: 'IT & Digital Transformation', website: 'https://infosys.com', contactPerson: 'Venkatesh Rao', contactEmail: 'freshers@infosys.com', contactPhone: '+91 80 2852 0261', tier: 'Tier 3', visitedYear: 2026, jobProfiles: ['Specialist Programmer (Digital)', 'Systems Engineer'] },
];

export const INITIAL_DRIVES: PlacementDrive[] = [
  {
    id: 'd1',
    driveCode: 'DRV-2026-AMZ-01',
    companyId: 'c2',
    companyName: 'Amazon AWS',
    roleTitle: 'Software Development Engineer - I (Cloud Services)',
    ctcLPA: 28.5,
    targetBranches: ['CSE', 'ISE', 'AIML', 'AIDS', 'ECE'],
    minCGPA: 7.75,
    maxBacklogsAllowed: 0,
    driveDate: '2026-10-12',
    startTime: '09:30 AM',
    endTime: '05:30 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-placement-amz-sde1-2026',
    venue: 'GAT Auditorium & Central Computing Center 1 & 2',
    status: 'In Progress',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.',
    jobDescription: 'Seeking high-potential Software Development Engineers to build scalable, fault-tolerant distributed cloud services. Responsibilities include designing RESTful microservices, optimizing database performance, and deploying zero-downtime infrastructure.',
    requiredSkills: ['Data Structures & Algorithms', 'Python / Java', 'Distributed Systems', 'AWS / Cloud Fundamentals', 'Object Oriented Design'],
    eligibleStudentCount: 240,
    enrolledCount: 218,
    shortlistedCount: 42,
    enrolledStudentsList: [
      { usn: '1GA21CS042', name: 'Rohan Sharma', department: 'CSE', cgpa: 9.38, registeredAt: '2026-09-28 10:14 AM', status: 'Shortlisted' },
      { usn: '1GA21CS005', name: 'Aditya Deshmukh', department: 'CSE', cgpa: 8.85, registeredAt: '2026-09-28 10:20 AM', status: 'Shortlisted' },
      { usn: '1GA21IS019', name: 'Ananya Rao', department: 'ISE', cgpa: 9.12, registeredAt: '2026-09-28 11:05 AM', status: 'Shortlisted' },
      { usn: '1GA21AI014', name: 'Tanvi Maheshwari', department: 'AIML', cgpa: 9.45, registeredAt: '2026-09-28 11:32 AM', status: 'Shortlisted' },
      { usn: '1GA21EC088', name: 'Deepika S. Nair', department: 'ECE', cgpa: 8.62, registeredAt: '2026-09-28 12:15 PM', status: 'Shortlisted' },
      { usn: '1GA21CS099', name: 'Varun Kashyap', department: 'CSE', cgpa: 8.42, registeredAt: '2026-09-29 09:40 AM', status: 'Registered' },
      { usn: '1GA21IS044', name: 'Meghana Bhat', department: 'ISE', cgpa: 8.30, registeredAt: '2026-09-29 10:10 AM', status: 'Registered' },
      { usn: '1GA21AD022', name: 'Shashank K.', department: 'AIDS', cgpa: 8.15, registeredAt: '2026-09-29 11:00 AM', status: 'Registered' }
    ],
    rounds: [
      { roundNumber: 1, roundName: 'Online Coding Assessment (DSA & Debugging)', date: '2026-10-12 09:30 AM', venue: 'CCC Labs 1, 2 & 3', qualifiedStudents: ['1GA21CS042', '1GA21CS005', '1GA21IS019', '1GA21EC088', '1GA21AI014'] },
      { roundNumber: 2, roundName: 'Technical Interview 1 (Algorithms & System Design)', date: '2026-10-13 10:00 AM', venue: 'Placement Cell Interview Cabin 1-6', qualifiedStudents: ['1GA21CS042', '1GA21CS005', '1GA21IS019'] },
      { roundNumber: 3, roundName: 'Bar Raiser & Leadership Principles HR Round', date: '2026-10-14 02:00 PM', venue: 'Executive Conference Room', qualifiedStudents: ['1GA21CS042'] },
    ]
  },
  {
    id: 'd2',
    driveCode: 'DRV-2026-TI-02',
    companyId: 'c4',
    companyName: 'Texas Instruments',
    roleTitle: 'Embedded Systems & Firmware Engineer',
    ctcLPA: 22.0,
    targetBranches: ['ECE', 'EEE', 'CSE', 'RA'],
    minCGPA: 7.5,
    maxBacklogsAllowed: 0,
    driveDate: '2026-10-18',
    startTime: '10:00 AM',
    endTime: '04:30 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-ti-firmware-2026',
    venue: 'Seminar Hall 2 & Embedded IoT Lab',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Texas Instruments is a global semiconductor design and manufacturing company that develops analog ICs and embedded processors for industrial, automotive, and personal electronics.',
    jobDescription: 'Firmware design for ultra-low power ARM Cortex microcontrollers, peripheral device drivers (SPI, I2C, UART), and RTOS task scheduling. Candidates will work with digital oscilloscope hardware debuggers and logic analyzers.',
    requiredSkills: ['Embedded C', 'ARM Cortex Architecture', 'RTOS (FreeRTOS)', 'Microcontroller Peripherals', 'Circuit Debugging'],
    eligibleStudentCount: 165,
    enrolledCount: 152,
    shortlistedCount: 31,
    enrolledStudentsList: [
      { usn: '1GA21EC019', name: 'Karthik Bharadwaj', department: 'ECE', cgpa: 8.94, registeredAt: '2026-09-29 02:15 PM', status: 'Shortlisted' },
      { usn: '1GA21EC088', name: 'Deepika S. Nair', department: 'ECE', cgpa: 8.62, registeredAt: '2026-09-29 02:30 PM', status: 'Shortlisted' },
      { usn: '1GA21EE008', name: 'Praveen Gowda', department: 'EEE', cgpa: 8.21, registeredAt: '2026-09-29 03:00 PM', status: 'Shortlisted' },
      { usn: '1GA21CS042', name: 'Rohan Sharma', department: 'CSE', cgpa: 9.38, registeredAt: '2026-09-29 03:20 PM', status: 'Registered' },
      { usn: '1GA21RA012', name: 'Nikhil Shenoy', department: 'RA', cgpa: 8.05, registeredAt: '2026-09-29 04:10 PM', status: 'Registered' }
    ],
    rounds: [
      { roundNumber: 1, roundName: 'Hardware Architecture & C Coding Test', date: '2026-10-18 10:00 AM', venue: 'ECE CAD Lab', qualifiedStudents: ['1GA21EC019', '1GA21EC088', '1GA21EE008'] }
    ]
  },
  {
    id: 'd3',
    driveCode: 'DRV-2026-BOSCH-03',
    companyId: 'c6',
    companyName: 'Bosch Global Software',
    roleTitle: 'Autonomous Mobility Software Engineer',
    ctcLPA: 12.5,
    targetBranches: ['CSE', 'ISE', 'AIML', 'ECE', 'ME', 'RA'],
    minCGPA: 7.0,
    maxBacklogsAllowed: 1,
    driveDate: '2026-10-24',
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-bosch-mobility-2026',
    venue: 'Mechanical Block Seminar Hall & CCC Lab 4',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Bosch Global Software Technologies is a world-class technology powerhouse leading the future of autonomous vehicles, connectivity, IoT, and industrial AI.',
    jobDescription: 'Development of autonomous driving assistance systems (ADAS), sensor fusion pipelines (radar/lidar/camera), and automotive Ethernet communication standards adhering to ISO 26262 functional safety.',
    requiredSkills: ['C++', 'Python', 'ROS / Robotics Middleware', 'Computer Vision', 'Automotive CAN/Ethernet'],
    eligibleStudentCount: 380,
    enrolledCount: 345,
    shortlistedCount: 0,
    enrolledStudentsList: [
      { usn: '1GA21ME034', name: 'Darshan Patel', department: 'ME', cgpa: 7.65, registeredAt: '2026-09-30 09:10 AM', status: 'Registered' },
      { usn: '1GA21EC019', name: 'Karthik Bharadwaj', department: 'ECE', cgpa: 8.94, registeredAt: '2026-09-30 09:40 AM', status: 'Registered' },
      { usn: '1GA21RA012', name: 'Nikhil Shenoy', department: 'RA', cgpa: 8.05, registeredAt: '2026-09-30 10:15 AM', status: 'Registered' },
      { usn: '1GA21CS099', name: 'Varun Kashyap', department: 'CSE', cgpa: 8.42, registeredAt: '2026-09-30 11:20 AM', status: 'Registered' }
    ],
    rounds: []
  },
  {
    id: 'd4',
    driveCode: 'DRV-2026-PHON-04',
    companyId: 'c5',
    companyName: 'PhonePe',
    roleTitle: 'Backend Engineer (Fintech & Distributed Cache)',
    ctcLPA: 26.0,
    targetBranches: ['CSE', 'ISE', 'AIML', 'AIDS', 'CS-CY'],
    minCGPA: 8.0,
    maxBacklogsAllowed: 0,
    driveDate: '2026-09-20',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-phonepe-fintech-2026',
    venue: 'Main Auditorium',
    status: 'Completed',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'PhonePe is India’s leading digital payments and financial technology platform processing over 45% of all UPI transactions nationally.',
    jobDescription: 'Architecting high-concurrency payment switches capable of handling 50k transactions/sec with millisecond response latencies, atomic debit-credit ledgers, and zero data loss guarantee.',
    requiredSkills: ['Java / Go', 'Distributed Caching (Redis)', 'Kafka / Event Streaming', 'SQL Optimization', 'Concurrency & Locks'],
    eligibleStudentCount: 190,
    enrolledCount: 184,
    shortlistedCount: 18,
    enrolledStudentsList: [
      { usn: '1GA21CS042', name: 'Rohan Sharma', department: 'CSE', cgpa: 9.38, registeredAt: '2026-09-10 10:00 AM', status: 'Placed' },
      { usn: '1GA21CS005', name: 'Aditya Deshmukh', department: 'CSE', cgpa: 8.85, registeredAt: '2026-09-10 10:15 AM', status: 'Placed' },
      { usn: '1GA21IS019', name: 'Ananya Rao', department: 'ISE', cgpa: 9.12, registeredAt: '2026-09-10 10:30 AM', status: 'Placed' }
    ],
    rounds: [
      { roundNumber: 1, roundName: 'CodeNation Hackathon Round', date: '2026-09-20', venue: 'Online Labs', qualifiedStudents: ['1GA21CS042', '1GA21CS005', '1GA21CS099'] }
    ]
  },
  {
    id: 'd5',
    driveCode: 'DRV-2026-MSFT-05',
    companyId: 'c1',
    companyName: 'Microsoft IDC',
    roleTitle: 'Software Engineer - Azure & Systems',
    ctcLPA: 44.0,
    targetBranches: ['CSE', 'ISE', 'AIML', 'AIDS', 'ECE'],
    minCGPA: 8.0,
    maxBacklogsAllowed: 0,
    driveDate: '2026-10-28',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-microsoft-azure-2026',
    venue: 'GAT Main Auditorium & High Performance Computing Lab',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Microsoft India Development Center (IDC) drives innovation in Azure Hyper-scale Cloud, Windows Kernel, Microsoft 365, and Copilot AI systems.',
    jobDescription: 'Software Engineer in the Azure Core Compute and Networking group. Designing hyper-virtualization software, distributed consensus protocols, and kernel-level performance optimization.',
    requiredSkills: ['C++ / C#', 'Algorithms & Advanced Data Structures', 'Operating Systems & Concurrency', 'Distributed Systems', 'Cloud Networking'],
    eligibleStudentCount: 142,
    enrolledCount: 139,
    shortlistedCount: 0,
    enrolledStudentsList: [
      { usn: '1GA21CS042', name: 'Rohan Sharma', department: 'CSE', cgpa: 9.38, registeredAt: '2026-09-30 08:30 AM', status: 'Registered' },
      { usn: '1GA21AI014', name: 'Tanvi Maheshwari', department: 'AIML', cgpa: 9.45, registeredAt: '2026-09-30 08:45 AM', status: 'Registered' },
      { usn: '1GA21IS019', name: 'Ananya Rao', department: 'ISE', cgpa: 9.12, registeredAt: '2026-09-30 09:00 AM', status: 'Registered' },
      { usn: '1GA21CS005', name: 'Aditya Deshmukh', department: 'CSE', cgpa: 8.85, registeredAt: '2026-09-30 09:15 AM', status: 'Registered' }
    ],
    rounds: [
      { roundNumber: 1, roundName: 'Online Technical Assessment (Data Structures & Algorithmic Problem Solving)', date: '2026-10-28 09:30 AM', venue: 'CCC Labs 1 & 2', qualifiedStudents: [] },
      { roundNumber: 2, roundName: 'Technical Interview 1 (Algorithms & Concurrency)', date: '2026-10-29 10:00 AM', venue: 'Placement Cell Suite A', qualifiedStudents: [] },
      { roundNumber: 3, roundName: 'System Architecture & Engineering Manager Round', date: '2026-10-29 02:30 PM', venue: 'Placement Cell Suite B', qualifiedStudents: [] },
      { roundNumber: 4, roundName: 'Director AA & Culture Fit Discussion', date: '2026-10-30 11:00 AM', venue: 'Board Room', qualifiedStudents: [] }
    ]
  },
  {
    id: 'd6',
    driveCode: 'DRV-2026-ORCL-06',
    companyId: 'c7',
    companyName: 'Oracle Cloud Infrastructure (OCI)',
    roleTitle: 'Cloud Infrastructure & Database Core Developer',
    ctcLPA: 21.5,
    targetBranches: ['CSE', 'ISE', 'AIML', 'AIDS', 'ECE', 'EEE'],
    minCGPA: 7.5,
    maxBacklogsAllowed: 0,
    driveDate: '2026-11-04',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-oracle-oci-2026',
    venue: 'Civil Seminar Hall & Central Computing Center 3',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Oracle Cloud Infrastructure offers next-generation autonomous databases, high-performance bare metal cloud servers, and enterprise cloud applications worldwide.',
    jobDescription: 'Work on Oracle Autonomous Database engine, storage engine clustering, query execution plans, and virtualized software-defined storage networks.',
    requiredSkills: ['C / C++', 'Database Internals & B+ Trees', 'Linux System Calls', 'Computer Architecture', 'Distributed Storage'],
    eligibleStudentCount: 220,
    enrolledCount: 204,
    shortlistedCount: 0,
    enrolledStudentsList: [
      { usn: '1GA21CS042', name: 'Rohan Sharma', department: 'CSE', cgpa: 9.38, registeredAt: '2026-09-30 10:10 AM', status: 'Registered' },
      { usn: '1GA21IS019', name: 'Ananya Rao', department: 'ISE', cgpa: 9.12, registeredAt: '2026-09-30 10:30 AM', status: 'Registered' },
      { usn: '1GA21EC088', name: 'Deepika S. Nair', department: 'ECE', cgpa: 8.62, registeredAt: '2026-09-30 11:00 AM', status: 'Registered' },
      { usn: '1GA21EE008', name: 'Praveen Gowda', department: 'EEE', cgpa: 8.21, registeredAt: '2026-09-30 11:45 AM', status: 'Registered' }
    ],
    rounds: [
      { roundNumber: 1, roundName: 'Aptitude & Systems Coding Exam', date: '2026-11-04 10:00 AM', venue: 'Online Labs', qualifiedStudents: [] },
      { roundNumber: 2, roundName: 'Distributed Systems & Database Internals Round', date: '2026-11-05 10:00 AM', venue: 'CCC Lab 3', qualifiedStudents: [] }
    ]
  },
  {
    id: 'd7',
    driveCode: 'DRV-2026-MBRDI-07',
    companyId: 'c6',
    companyName: 'Mercedes-Benz R&D India (MBRDI)',
    roleTitle: 'Autonomous Driving & Embedded Infotainment Specialist',
    ctcLPA: 14.5,
    targetBranches: ['CSE', 'AIML', 'ECE', 'EEE', 'ME', 'RA'],
    minCGPA: 7.0,
    maxBacklogsAllowed: 1,
    driveDate: '2026-11-12',
    startTime: '10:30 AM',
    endTime: '04:30 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-mbrdi-luxury-mobility-2026',
    venue: 'Mechanical Block Seminar Hall & Robotics Simulation Suite',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Mercedes-Benz R&D India is the largest R&D facility of Mercedes-Benz Group AG outside Germany, pioneering digital vehicle software, MBUX infotainment, and connected luxury experiences.',
    jobDescription: 'Software engineering for Mercedes-Benz User Experience (MBUX), in-vehicle speech AI models, Android Automotive OS integration, and battery management telemetry.',
    requiredSkills: ['C++', 'Python', 'Android Automotive / Linux', 'Embedded Systems', 'Automotive Networks'],
    eligibleStudentCount: 310,
    enrolledCount: 284,
    shortlistedCount: 0,
    enrolledStudentsList: [
      { usn: '1GA21EC019', name: 'Karthik Bharadwaj', department: 'ECE', cgpa: 8.94, registeredAt: '2026-09-30 01:10 PM', status: 'Registered' },
      { usn: '1GA21ME034', name: 'Darshan Patel', department: 'ME', cgpa: 7.65, registeredAt: '2026-09-30 01:45 PM', status: 'Registered' },
      { usn: '1GA21RA012', name: 'Nikhil Shenoy', department: 'RA', cgpa: 8.05, registeredAt: '2026-09-30 02:10 PM', status: 'Registered' }
    ],
    rounds: [
      { roundNumber: 1, roundName: 'Domain Specific Technical MCQ & C++ Coding', date: '2026-11-12 10:30 AM', venue: 'CAD/CAM Lab', qualifiedStudents: [] },
      { roundNumber: 2, roundName: 'Technical & Simulation Assessment', date: '2026-11-13 10:00 AM', venue: 'Robotics Center', qualifiedStudents: [] }
    ]
  },
  {
    id: 'd8',
    driveCode: 'DRV-2026-LT-08',
    companyId: 'c8',
    companyName: 'Larsen & Toubro (L&T)',
    roleTitle: 'Graduate Engineer Trainee - Infrastructure & Structural Engineering',
    ctcLPA: 7.2,
    targetBranches: ['CV', 'ME'],
    minCGPA: 6.75,
    maxBacklogsAllowed: 0,
    driveDate: '2026-11-18',
    startTime: '09:30 AM',
    endTime: '04:00 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-lt-infra-2026',
    venue: 'Civil Seminar Hall & Drawing Studio 1',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Larsen & Toubro is a $27 billion Indian multinational engaged in EPC projects, hi-tech manufacturing, metro infrastructure, and heavy engineering.',
    jobDescription: 'Supervising smart infrastructure projects, structural design analysis using STAAD.Pro / ETABS, geotechnical analysis, and mega project planning management.',
    requiredSkills: ['Structural Analysis', 'STAAD.Pro / AutoCAD', 'Concrete Technology', 'Project Management', 'Geotechnical Fundamentals'],
    eligibleStudentCount: 110,
    enrolledCount: 98,
    shortlistedCount: 0,
    enrolledStudentsList: [],
    rounds: [
      { roundNumber: 1, roundName: 'Aptitude & Technical Core Exam', date: '2026-11-18 10:00 AM', venue: 'Civil Drawing Studio', qualifiedStudents: [] }
    ]
  },
  {
    id: 'd9',
    driveCode: 'DRV-2026-BIOCON-09',
    companyId: 'c8',
    companyName: 'Biocon Biologics',
    roleTitle: 'Bioinformatics & Biosimilar Process Research Associate',
    ctcLPA: 8.5,
    targetBranches: ['BT'],
    minCGPA: 7.0,
    maxBacklogsAllowed: 0,
    driveDate: '2026-11-22',
    startTime: '10:00 AM',
    endTime: '03:30 PM',
    meetingType: 'Campus Placement Drive',
    teamsMeetingLink: 'https://teams.microsoft.com/l/meetup-join/gat-biocon-biologics-2026',
    venue: 'Biotechnology Department Conference Room & Virtual Teams',
    status: 'Upcoming',
    isPublished: true,
    scheduledBy: 'Prof. Harish B. G. (Placement Officer / PCC)',
    companyInfo: 'Biocon Biologics is a global biopharmaceutical leader manufacturing biosimilars, recombinant insulins, and monoclonal antibodies for patients across 120+ countries.',
    jobDescription: 'Conduct computational sequence alignment, molecular docking, fermentation upstream optimization, and downstream protein purification chromatography protocols.',
    requiredSkills: ['Bioinformatics & BLAST', 'Bioprocess Engineering', 'Molecular Docking', 'Chromatography (HPLC)', 'Python / R in Biology'],
    eligibleStudentCount: 45,
    enrolledCount: 41,
    shortlistedCount: 0,
    enrolledStudentsList: [],
    rounds: [
      { roundNumber: 1, roundName: 'Core Bioscience & Computational Test', date: '2026-11-22 10:30 AM', venue: 'Biotech Seminar Hall', qualifiedStudents: [] }
    ]
  }
];


// Historical batch comparison data for Management & Principal dashboard
export const HISTORICAL_BATCH_METRICS = [
  {
    year: 2024,
    totalStrength: 1050,
    placedStudents: 872,
    placementPercentage: 83.0,
    companiesVisited: 142,
    totalOffers: 1240,
    highestCtcLPA: 26.5,
    averageCtcLPA: 6.8,
    departmentStats: [
      { department: 'CSE', strength: 180, placed: 168, percentage: 93.3, avgCtc: 8.9, highestCtc: 26.5 },
      { department: 'ISE', strength: 120, placed: 108, percentage: 90.0, avgCtc: 8.2, highestCtc: 24.0 },
      { department: 'AIML', strength: 60, placed: 55, percentage: 91.6, avgCtc: 8.5, highestCtc: 25.0 },
      { department: 'ECE', strength: 180, placed: 151, percentage: 83.8, avgCtc: 7.1, highestCtc: 21.0 },
      { department: 'EEE', strength: 60, placed: 44, percentage: 73.3, avgCtc: 5.6, highestCtc: 12.0 },
      { department: 'ME', strength: 60, placed: 41, percentage: 68.3, avgCtc: 5.2, highestCtc: 9.5 },
      { department: 'CV', strength: 60, placed: 38, percentage: 63.3, avgCtc: 4.8, highestCtc: 8.0 },
      { department: 'BT', strength: 45, placed: 36, percentage: 80.0, avgCtc: 5.8, highestCtc: 11.5 }
    ]
  },
  {
    year: 2025,
    totalStrength: 1150,
    placedStudents: 994,
    placementPercentage: 86.4,
    companiesVisited: 168,
    totalOffers: 1485,
    highestCtcLPA: 31.0,
    averageCtcLPA: 7.4,
    departmentStats: [
      { department: 'CSE', strength: 180, placed: 174, percentage: 96.6, avgCtc: 9.8, highestCtc: 31.0 },
      { department: 'ISE', strength: 120, placed: 112, percentage: 93.3, avgCtc: 9.1, highestCtc: 28.0 },
      { department: 'AIML', strength: 120, placed: 113, percentage: 94.1, avgCtc: 9.4, highestCtc: 30.0 },
      { department: 'AIDS', strength: 60, placed: 54, percentage: 90.0, avgCtc: 8.8, highestCtc: 26.0 },
      { department: 'ECE', strength: 180, placed: 160, percentage: 88.8, avgCtc: 7.8, highestCtc: 24.0 },
      { department: 'EEE', strength: 60, placed: 47, percentage: 78.3, avgCtc: 6.0, highestCtc: 14.0 },
      { department: 'ME', strength: 60, placed: 44, percentage: 73.3, avgCtc: 5.6, highestCtc: 11.0 },
      { department: 'CV', strength: 60, placed: 41, percentage: 68.3, avgCtc: 5.1, highestCtc: 9.0 },
      { department: 'BT', strength: 45, placed: 38, percentage: 84.4, avgCtc: 6.4, highestCtc: 13.0 }
    ]
  },
  {
    year: 2026, // Current ongoing placement season
    totalStrength: 1245,
    placedStudents: 1088,
    placementPercentage: 87.3,
    companiesVisited: 185,
    totalOffers: 1642,
    highestCtcLPA: 34.0,
    averageCtcLPA: 8.2,
    departmentStats: [
      { department: 'CSE', strength: 180, placed: 176, percentage: 97.7, avgCtc: 11.4, highestCtc: 34.0 },
      { department: 'ISE', strength: 120, placed: 115, percentage: 95.8, avgCtc: 10.2, highestCtc: 30.0 },
      { department: 'AIML', strength: 120, placed: 116, percentage: 96.6, avgCtc: 10.8, highestCtc: 34.0 },
      { department: 'AIDS', strength: 60, placed: 56, percentage: 93.3, avgCtc: 9.9, highestCtc: 28.0 },
      { department: 'ECE', strength: 180, placed: 164, percentage: 91.1, avgCtc: 8.6, highestCtc: 24.0 },
      { department: 'CS-CY', strength: 60, placed: 55, percentage: 91.6, avgCtc: 9.2, highestCtc: 22.0 },
      { department: 'CS-IOT', strength: 60, placed: 53, percentage: 88.3, avgCtc: 8.4, highestCtc: 20.0 },
      { department: 'EEE', strength: 60, placed: 49, percentage: 81.6, avgCtc: 6.6, highestCtc: 16.0 },
      { department: 'ME', strength: 60, placed: 46, percentage: 76.6, avgCtc: 6.1, highestCtc: 12.5 },
      { department: 'CV', strength: 60, placed: 44, percentage: 73.3, avgCtc: 5.5, highestCtc: 10.0 },
      { department: 'BT', strength: 45, placed: 40, percentage: 88.8, avgCtc: 7.2, highestCtc: 14.5 },
      { department: 'RA', strength: 45, placed: 39, percentage: 86.6, avgCtc: 7.5, highestCtc: 15.0 },
      { department: 'AE', strength: 45, placed: 36, percentage: 80.0, avgCtc: 6.8, highestCtc: 13.0 },
      { department: 'MCA', strength: 60, placed: 52, percentage: 86.6, avgCtc: 7.4, highestCtc: 14.0 },
      { department: 'MBA', strength: 60, placed: 53, percentage: 88.3, avgCtc: 7.1, highestCtc: 13.5 }
    ]
  }
];

// Section-wise statistics for HODs (e.g. CSE, ECE, ISE)
export const SECTION_WISE_STATS: Record<string, { section: string; totalStudents: number; placedStudents: number; percentage: number; avgPackage: number; highestPackage: number }[]> = {
  CSE: [
    { section: 'Section A', totalStudents: 60, placedStudents: 59, percentage: 98.3, avgPackage: 12.2, highestPackage: 34.0 },
    { section: 'Section B', totalStudents: 60, placedStudents: 58, percentage: 96.6, avgPackage: 11.4, highestPackage: 28.5 },
    { section: 'Section C', totalStudents: 60, placedStudents: 59, percentage: 98.3, avgPackage: 10.6, highestPackage: 26.0 },
  ],
  ECE: [
    { section: 'Section A', totalStudents: 60, placedStudents: 56, percentage: 93.3, avgPackage: 9.1, highestPackage: 22.0 },
    { section: 'Section B', totalStudents: 60, placedStudents: 55, percentage: 91.6, avgPackage: 8.5, highestPackage: 20.0 },
    { section: 'Section C', totalStudents: 60, placedStudents: 53, percentage: 88.3, avgPackage: 8.2, highestPackage: 18.0 },
  ],
  ISE: [
    { section: 'Section A', totalStudents: 60, placedStudents: 58, percentage: 96.6, avgPackage: 10.5, highestPackage: 30.0 },
    { section: 'Section B', totalStudents: 60, placedStudents: 57, percentage: 95.0, avgPackage: 9.9, highestPackage: 26.0 },
  ],
  AIML: [
    { section: 'Section A', totalStudents: 60, placedStudents: 59, percentage: 98.3, avgPackage: 11.2, highestPackage: 34.0 },
    { section: 'Section B', totalStudents: 60, placedStudents: 57, percentage: 95.0, avgPackage: 10.4, highestPackage: 28.0 },
  ],
  ME: [
    { section: 'Section A', totalStudents: 60, placedStudents: 46, percentage: 76.6, avgPackage: 6.1, highestPackage: 12.5 },
  ],
  CV: [
    { section: 'Section A', totalStudents: 60, placedStudents: 44, percentage: 73.3, avgPackage: 5.5, highestPackage: 10.0 },
  ]
};
