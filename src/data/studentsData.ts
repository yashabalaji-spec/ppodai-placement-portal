
import { StudentProfile, OfferDetails } from '../types';

// Current 11 branches at Global Academy of Technology
export const ALL_BRANCH_CODES = [
  'CSE', 'ISE', 'AIML', 'AIDS', 'ECE', 'EEE',
  'ME', 'CV', 'CSE(AIML)', 'AE', 'MBA'
] as const;

export type BranchCode = typeof ALL_BRANCH_CODES[number];

// Each branch has six mock student profiles
const STUDENT_NAMES_BY_BRANCH: Record<
  BranchCode,
  { first: string; last: string; gender: 'Male' | 'Female' }[]
> = {
  CSE: [
    { first: 'Rohan', last: 'Sharma', gender: 'Male' },
    { first: 'Ananya', last: 'Hegde', gender: 'Female' },
    { first: 'Kiran', last: 'Deshmukh', gender: 'Male' },
    { first: 'Sanjana', last: 'Rao', gender: 'Female' },
    { first: 'Nikhil', last: 'Kulkarni', gender: 'Male' },
    { first: 'Pooja', last: 'Srinivasan', gender: 'Female' }
  ],
  ISE: [
    { first: 'Varun', last: 'Kashyap', gender: 'Male' },
    { first: 'Meghana', last: 'Bhat', gender: 'Female' },
    { first: 'Aditya', last: 'Prasad', gender: 'Male' },
    { first: 'Sneha', last: 'Narayanan', gender: 'Female' },
    { first: 'Gautam', last: 'Shetty', gender: 'Male' },
    { first: 'Priyanka', last: 'Gowda', gender: 'Female' }
  ],
  AIML: [
    { first: 'Tanvi', last: 'Maheshwari', gender: 'Female' },
    { first: 'Aayush', last: 'Verma', gender: 'Male' },
    { first: 'Divya', last: 'Chandrashekar', gender: 'Female' },
    { first: 'Rishabh', last: 'Jain', gender: 'Male' },
    { first: 'Ishita', last: 'Reddy', gender: 'Female' },
    { first: 'Siddharth', last: 'Menon', gender: 'Male' }
  ],
  AIDS: [
    { first: 'Shashank', last: 'Kumar', gender: 'Male' },
    { first: 'Bhavana', last: 'Swamy', gender: 'Female' },
    { first: 'Manish', last: 'Pandey', gender: 'Male' },
    { first: 'Keerthana', last: 'M', gender: 'Female' },
    { first: 'Tejas', last: 'Shenoy', gender: 'Male' },
    { first: 'Lavanya', last: 'Venkatesh', gender: 'Female' }
  ],
  ECE: [
    { first: 'Deepika', last: 'Nair', gender: 'Female' },
    { first: 'Karthik', last: 'Bharadwaj', gender: 'Male' },
    { first: 'Swathi', last: 'Murthy', gender: 'Female' },
    { first: 'Arun', last: 'Pai', gender: 'Male' },
    { first: 'Harshitha', last: 'Gowda', gender: 'Female' },
    { first: 'Vikas', last: 'R', gender: 'Male' }
  ],
  EEE: [
    { first: 'Praveen', last: 'Gowda', gender: 'Male' },
    { first: 'Anusha', last: 'Kamat', gender: 'Female' },
    { first: 'Chetan', last: 'Kumar', gender: 'Male' },
    { first: 'Rakshitha', last: 'S', gender: 'Female' },
    { first: 'Abhishek', last: 'Patil', gender: 'Male' },
    { first: 'Sahana', last: 'B', gender: 'Female' }
  ],
  ME: [
    { first: 'Darshan', last: 'Patel', gender: 'Male' },
    { first: 'Girish', last: 'K', gender: 'Male' },
    { first: 'Archana', last: 'Reddy', gender: 'Female' },
    { first: 'Pradeep', last: 'Naik', gender: 'Male' },
    { first: 'Sumanth', last: 'Babu', gender: 'Male' },
    { first: 'Kavya', last: 'Shankar', gender: 'Female' }
  ],
  CV: [
    { first: 'Sanjay', last: 'Gowda', gender: 'Male' },
    { first: 'Bindu', last: 'Madhava', gender: 'Female' },
    { first: 'Manjunath', last: 'Rao', gender: 'Male' },
    { first: 'Chaitra', last: 'H', gender: 'Female' },
    { first: 'Santhosh', last: 'Kumar', gender: 'Male' },
    { first: 'Spoorthi', last: 'P', gender: 'Female' }
  ],
  'CSE(AIML)': [
    { first: 'Akash', last: 'Reddy', gender: 'Male' },
    { first: 'Meera', last: 'Nair', gender: 'Female' },
    { first: 'Tarun', last: 'Kumar', gender: 'Male' },
    { first: 'Disha', last: 'Kulkarni', gender: 'Female' },
    { first: 'Yash', last: 'Balaji', gender: 'Male' },
    { first: 'Monika', last: 'Shetty', gender: 'Female' }
  ],
  AE: [
    { first: 'Raghavendra', last: 'P', gender: 'Male' },
    { first: 'Sowmya', last: 'Hegde', gender: 'Female' },
    { first: 'Manoj', last: 'B', gender: 'Male' },
    { first: 'Rashmi', last: 'G', gender: 'Female' },
    { first: 'Suraj', last: 'Patil', gender: 'Male' },
    { first: 'Vidya', last: 'K', gender: 'Female' }
  ],
  MBA: [
    { first: 'Kunal', last: 'Singhal', gender: 'Male' },
    { first: 'Deepa', last: 'Sharma', gender: 'Female' },
    { first: 'Gaurav', last: 'Joshi', gender: 'Male' },
    { first: 'Pallavi', last: 'Reddy', gender: 'Female' },
    { first: 'Rohit', last: 'Nayak', gender: 'Male' },
    { first: 'Sindhu', last: 'B', gender: 'Female' }
  ]
};

// Official USN branch abbreviations
const USN_BRANCH_CODES: Record<BranchCode, string> = {
  CSE: 'CS',
  ISE: 'IS',
  AIML: 'AI',
  AIDS: 'AD',
  ECE: 'EC',
  EEE: 'EE',
  ME: 'ME',
  CV: 'CV',
  'CSE(AIML)': 'CI',
  AE: 'AE',
  MBA: 'MB'
};

export function generateAllBranchStudents(): StudentProfile[] {
  const students: StudentProfile[] = [];

  ALL_BRANCH_CODES.forEach((branchCode) => {
    const names = STUDENT_NAMES_BY_BRANCH[branchCode];
    const usnPrefix = USN_BRANCH_CODES[branchCode];

    names.forEach((person, idx) => {
      let semester = 1;
      let batchYear = 2028;
      let yearOfJoining = 2024;
      let admissionYearTwoDigits = '24';

      if (idx === 1) {
        semester = 3;
        batchYear = 2027;
        yearOfJoining = 2023;
        admissionYearTwoDigits = '23';
      } else if (idx === 2 || idx === 3) {
        semester = 5;
        batchYear = 2026;
        yearOfJoining = 2022;
        admissionYearTwoDigits = '22';
      } else if (idx === 4 || idx === 5) {
        semester = idx === 4 ? 7 : 8;
        batchYear = 2025;
        yearOfJoining = 2021;
        admissionYearTwoDigits = '21';
      }

      // MBA is a 2-year programme (maximum 4 semesters)
if (branchCode === 'MBA') {
  if (idx === 0) semester = 1;
  else if (idx === 1) semester = 2;
  else if (idx === 2 || idx === 3) semester = 3;
  else semester = 4;
}
      const rollNumber = String(idx + 1).padStart(3, '0');

      // Preserve the existing CSE demo login
      const usn = branchCode === 'CSE' && idx === 0
        ? '1GA21CS042'
        : `1GA${admissionYearTwoDigits}${usnPrefix}${rollNumber}`;

      const fullName = branchCode === 'CSE' && idx === 0
        ? 'Rohan Sharma'
        : `${person.first} ${person.last}`;

      const cleanFirst = person.first.toLowerCase();
      const cleanLast = person.last.toLowerCase();

      const collegeEmail = `${usn.toLowerCase()}@gat.ac.in`;
      const personalEmailId = `${cleanFirst}.${cleanLast}@gmail.com`;

      const isPlacementMailActivated = idx >= 3;
      const placementEmailId = isPlacementMailActivated
        ? `${cleanFirst}.${cleanLast}.${usnPrefix.toLowerCase()}@gat.ac.in`
        : '';

      const degreeTitle = branchCode === 'MBA'
        ? 'MBA (Master of Business Administration)'
        : `B.E (${branchCode} Engineering)`;

      const cgpa = Number(
        (7.4 + idx * 0.42 + (idx % 3) * 0.15).toFixed(2)
      );

      const section: 'A' | 'B' | 'C' =
        idx % 3 === 0 ? 'A' : idx % 3 === 1 ? 'B' : 'C';

      const offers: OfferDetails[] = [];

      if (idx === 5) {
        if (['CSE', 'ISE', 'AIML', 'AIDS', 'CSE(AIML)'].includes(branchCode)) {
          offers.push({
            id: `off_${usn}_1`,
            companyId: 'c2',
            companyName: 'Amazon AWS',
            roleTitle: 'Software Development Engineer - I',
            packageLPA: 28.5,
            offerLetterDate: '2026-09-18',
            tier: 'Tier 1 Super Dream (>15 LPA)',
            status: 'accepted'
          });
        } else if (['ECE', 'EEE', 'AE'].includes(branchCode)) {
          offers.push({
            id: `off_${usn}_1`,
            companyId: 'c4',
            companyName: 'Texas Instruments',
            roleTitle: 'Embedded Systems Engineer',
            packageLPA: 22.0,
            offerLetterDate: '2026-09-20',
            tier: 'Tier 1 Super Dream (>15 LPA)',
            status: 'accepted'
          });
        } else if (branchCode === 'ME' || branchCode === 'CV') {
          offers.push({
            id: `off_${usn}_1`,
            companyId: 'c8',
            companyName: 'Larsen & Toubro (L&T)',
            roleTitle: 'Graduate Engineer Trainee',
            packageLPA: 7.2,
            offerLetterDate: '2026-09-22',
            tier: 'Tier 3 Core (5-8 LPA)',
            status: 'accepted'
          });
        } else {
          offers.push({
            id: `off_${usn}_1`,
            companyId: 'c6',
            companyName: 'Bosch Global Software',
            roleTitle: 'Associate Software Engineer',
            packageLPA: 12.0,
            offerLetterDate: '2026-09-25',
            tier: 'Tier 2 Dream (8-15 LPA)',
            status: 'accepted'
          });
        }
      }

      students.push({
        usn,
        fullName,
        firstName: person.first,
        lastName: person.last,
        pursuingDegree: degreeTitle,
        department: branchCode,
        section,
        semester,
        batchYear,
        password: 'student@2026',
        mobileNo: `9845${String(100000 + idx * 7234 + usnPrefix.charCodeAt(0) * 11).substring(0, 6)}`,
        gender: person.gender,
        dateOfBirth: `200${4 - Math.floor(semester / 2)}-0${(idx % 9) + 1}-1${idx + 2}`,
        yearOfJoining,
        typeOfEntry: idx === 3 ? 'Lateral Entry' : 'Regular',
        collegeEmail,
        personalEmailId,
        placementEmailId,
        isPlacementMailActivated,
        panNumber: `ABC${usnPrefix}${1000 + idx}F`,
        aadharNumber: `4532 9871 ${1000 + idx * 10}`,
        bloodGroup: idx % 2 === 0 ? 'O+ve' : 'B+ve',
        physicallyChallenged: 'No',
        fatherName: `Sri. ${person.last} Narayan`,
        fatherMobileNo: '9845099901',
        fatherOccupation: 'Executive Engineer / Senior Manager',
        motherName: `Smt. Lakshmi ${person.last}`,
        motherMobileNo: '9845099902',
        motherOccupation: 'Educator / Professional',
        communicationAddress: `#${120 + idx}, Rajarajeshwari Nagar, Bengaluru`,
        permanentAddress: `#${120 + idx}, Rajarajeshwari Nagar, Bengaluru`,
        nativePlace: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560098',
        interestedInHigherStudies: 'No',
        tenthPercentage: 92.5 + (idx % 5),
        tenthPassingYear: batchYear - 7,
        tenthSchoolName: 'National Public School',
        tenthBoardName: 'CBSE',
        twelfthOrDiplomaPercentage: 94.0 + (idx % 5),
        twelfthOrDiplomaPassingYear: batchYear - 5,
        twelfthOrDiplomaCollegeName: 'GAT Pre-University College',
        twelfthOrDiplomaBoardName: 'Karnataka PUE',
        cgpa,
        currentBacklogs: 0,
        backlogHistory: 0,
        yearBack: 'No',
        gapBeforeDegreeYears: 0,
        gapInDegreeYears: 0,
        registeredForPlacementAssistance: 'Yes',
        hasExternalCertifications: 'Yes',
        skills: [
          { name: 'Data Structures & Algorithms', category: 'programming', rating: 4 },
          { name: 'Python / Java', category: 'programming', rating: 5 },
          { name: 'Full-Stack Web Development', category: 'web', rating: 4 },
          { name: 'Relational Databases (SQL)', category: 'database', rating: 4 },
          { name: 'Cloud & DevOps Fundamentals', category: 'cloud', rating: 3 }
        ],
        internships: semester >= 5 ? [{
          id: `int_${usn}_1`,
          companyName: 'Infosys Springboard',
          domain: 'Cloud Architecture & Web Services',
          durationMonths: 3,
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          description: 'Implemented microservices and RESTful API endpoints.'
        }] : [],
        projects: [{
          id: `proj_${usn}_1`,
          title: `Smart ${branchCode} Operational System`,
          domain: 'Engineering & Automation',
          techStack: ['Python', 'PostgreSQL', 'React', 'TailwindCSS'],
          description: 'Automated data processing and analysis tool developed at GAT.'
        }],
        rndWorks: [],
        achievementsAcademic: [
          `Dean's Merit List Student (Semester ${semester})`,
          'Inter-Collegiate Hackathon Finalist'
        ],
        achievementsNonAcademic: [
          'Member of GAT Technical & Cultural Society'
        ],
        hobbiesAndInterests: [
          'Competitive Coding',
          'Open Source Systems',
          'Robotics & AI Club',
          'Badminton'
        ],
        offers,
        isPlaced: offers.length > 0
      });
    });
  });

  return students;
}
