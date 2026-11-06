import { StudentProfile, JobDescriptionMatch } from '../types';

export interface JDRequirement {
  title: string;
  targetBranches: string[];
  minCGPA: number;
  maxBacklogs: number;
  requiredSkills: string[];
  preferredSkills?: string[];
  minInternshipMonths?: number;
  rawText?: string;
}

// Common tech keywords dictionary for auto-extracting from raw JD text
export const KNOWN_SKILLS = [
  'Python', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript', 'React', 'Node.js', 
  'Next.js', 'Express', 'Angular', 'Vue', 'HTML', 'CSS', 'TailwindCSS',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Git',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'LangChain', 'GenAI', 'LLM', 'FastAPI', 'Spring Boot', 'Microservices', 'GraphQL',
  'Verilog', 'VLSI', 'Embedded C', 'RTOS', 'ARM Cortex', 'MATLAB', 'Simulink',
  'AutoCAD', 'SolidWorks', 'Ansys', 'FEA', 'CFD', 'Bioinformatics', 'ETABS', 'Revit'
];

export function extractSkillsFromJD(text: string): { skills: string[]; minCGPA?: number; maxBacklogs?: number } {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  KNOWN_SKILLS.forEach(skill => {
    // Escaped word boundary regex match
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      matched.add(skill);
    }
  });

  // Extract CGPA if mentioned e.g., "7.5 CGPA", "CGPA: 8.0", "min 7.0"
  let cgpaMatch = text.match(/(?:cgpa|pointer|gpa)\s*(?:>=|:|of|min|above)?\s*([6789](\.\d{1,2})?)/i);
  let minCGPA = cgpaMatch ? parseFloat(cgpaMatch[1]) : 7.0;

  // Extract backlogs if mentioned e.g., "0 backlogs", "no active backlogs", "max 1 backlog"
  let maxBacklogs = 0;
  if (/no\s*(active)?\s*backlog/i.test(text) || /zero\s*backlog/i.test(text) || /0\s*backlog/i.test(text)) {
    maxBacklogs = 0;
  } else if (/1\s*backlog/i.test(text)) {
    maxBacklogs = 1;
  }

  return {
    skills: Array.from(matched),
    minCGPA: isNaN(minCGPA) ? 7.0 : minCGPA,
    maxBacklogs
  };
}

export function evaluateStudentJDMatch(student: StudentProfile, jd: JDRequirement): JobDescriptionMatch {
  const studentSkillMap = new Map<string, number>();
  student.skills.forEach(s => {
    studentSkillMap.set(s.name.toLowerCase().trim(), s.rating);
  });

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let skillScoreSum = 0;
  let totalRatingBonus = 0;

  // Check required skills
  const reqSkills = jd.requiredSkills.length > 0 ? jd.requiredSkills : ['Python', 'Problem Solving'];
  
  reqSkills.forEach(reqSkill => {
    const reqClean = reqSkill.toLowerCase().trim();
    // Check direct or partial match
    let found = false;
    let rating = 0;

    for (const [sName, sRating] of studentSkillMap.entries()) {
      if (sName === reqClean || sName.includes(reqClean) || reqClean.includes(sName)) {
        found = true;
        rating = sRating;
        break;
      }
    }

    if (found) {
      matchedSkills.push(reqSkill);
      // Rating 1-5 maps to percentage weight
      const ratingWeight = rating / 5; // e.g. 5/5 = 1.0, 4/5 = 0.8
      skillScoreSum += 1.0;
      totalRatingBonus += ratingWeight * 10; // up to 10 points bonus per high rating
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Base skill match ratio (up to 50 points)
  const skillRatio = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) : 1;
  const skillMatchScore = Math.round(skillRatio * 50);

  // Academic score (up to 25 points based on CGPA)
  const cgpaEligible = student.cgpa >= jd.minCGPA;
  const backlogEligible = student.currentBacklogs <= jd.maxBacklogs;
  
  // Normalized CGPA from 6.0 to 10.0
  const normalizedCgpa = Math.max(0, Math.min(10, student.cgpa));
  const academicScore = Math.round((normalizedCgpa / 10) * 25);

  // Experience / Internship score (up to 15 points)
  const totalInternshipMonths = student.internships.reduce((acc, curr) => acc + curr.durationMonths, 0);
  const experienceScore = Math.min(15, Math.round(totalInternshipMonths * 2.5) + (student.projects.length * 2));

  // Rating and R&D bonus (up to 10 points)
  const rndBonus = student.rndWorks.length > 0 ? 5 : 0;
  const ratingBonus = Math.min(10, Math.round((totalRatingBonus / Math.max(1, reqSkills.length))) + rndBonus);

  // Overall match score
  let finalScore = skillMatchScore + academicScore + experienceScore + ratingBonus;
  
  // Penalize if not meeting hard cutoff
  if (!cgpaEligible) {
    finalScore = Math.max(25, Math.round(finalScore * 0.7));
  }
  if (!backlogEligible) {
    finalScore = Math.max(15, Math.round(finalScore * 0.6));
  }

  // Branch filter check
  if (jd.targetBranches.length > 0 && !jd.targetBranches.includes(student.department)) {
    finalScore = Math.round(finalScore * 0.85); // slight penalty if not primary targeted branch
  }

  finalScore = Math.min(99, Math.max(10, finalScore));

  return {
    student,
    matchScore: finalScore,
    matchedSkills,
    missingSkills,
    cgpaEligible,
    backlogEligible,
    scoreBreakdown: {
      skillMatchScore,
      experienceScore,
      academicScore,
      ratingBonus
    }
  };
}

export function rankStudentsForJD(students: StudentProfile[], jd: JDRequirement): JobDescriptionMatch[] {
  const matches = students.map(student => evaluateStudentJDMatch(student, jd));
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
