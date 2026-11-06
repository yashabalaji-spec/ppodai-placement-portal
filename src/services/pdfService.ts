import { jsPDF } from 'jspdf';
import { JobDescriptionMatch, StudentProfile } from '../types';
import { JDRequirement } from './jdMatcher';

export function generateCandidateShortlistPDF(
  companyName: string,
  jd: JDRequirement,
  matches: JobDescriptionMatch[]
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GLOBAL ACADEMY OF TECHNOLOGY — BENGALURU', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('GAT PPODAI: Department of Placement & Career Guidance | AI Candidate Skill-Match Report', 14, 18);

  currentY = 34;

  // JD Summary Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Job Profile: ${jd.title || 'Software Development Engineer'} (${companyName || 'Corporate Partner'})`, 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Required Skills Evaluated: ${jd.requiredSkills.join(', ') || 'Core CS, DSA, Web'}`, 18, currentY + 13);
  doc.text(`Eligibility Cutoff: Min CGPA: ${jd.minCGPA.toFixed(2)} | Max Backlogs: ${jd.maxBacklogs} | Target Branches: ${jd.targetBranches.length > 0 ? jd.targetBranches.join(', ') : 'All Engineering Branches'}`, 18, currentY + 19);
  doc.text(`Report Timestamp: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | Total Evaluated Pool: ${matches.length} Candidates`, 18, currentY + 25);

  currentY += 38;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY + 8, pageWidth - 14, currentY + 8);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Rank', 16, currentY + 5.5);
  doc.text('USN', 27, currentY + 5.5);
  doc.text('Candidate Name', 52, currentY + 5.5);
  doc.text('Dept', 95, currentY + 5.5);
  doc.text('CGPA', 108, currentY + 5.5);
  doc.text('Match %', 123, currentY + 5.5);
  doc.text('Skills Matched', 142, currentY + 5.5);
  doc.text('Status', 180, currentY + 5.5);

  currentY += 10;

  // Table Rows
  matches.forEach((item, index) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 20;

      // Repeat Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, currentY, pageWidth - 28, 8, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Rank', 16, currentY + 5.5);
      doc.text('USN', 27, currentY + 5.5);
      doc.text('Candidate Name', 52, currentY + 5.5);
      doc.text('Dept', 95, currentY + 5.5);
      doc.text('CGPA', 108, currentY + 5.5);
      doc.text('Match %', 123, currentY + 5.5);
      doc.text('Skills Matched', 142, currentY + 5.5);
      doc.text('Status', 180, currentY + 5.5);
      currentY += 10;
    }

    // Row alternating background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY - 3, pageWidth - 28, 9, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    // Rank
    doc.text(`#${index + 1}`, 16, currentY + 2.5);

    // USN
    doc.setFont('courier', 'normal');
    doc.text(item.student.usn, 27, currentY + 2.5);

    // Name
    doc.setFont('helvetica', 'bold');
    doc.text(item.student.fullName.substring(0, 24), 52, currentY + 2.5);

    // Dept
    doc.setFont('helvetica', 'normal');
    doc.text(item.student.department, 95, currentY + 2.5);

    // CGPA
    doc.text(item.student.cgpa.toFixed(2), 108, currentY + 2.5);

    // Match Score
    if (item.matchScore >= 85) {
      doc.setTextColor(22, 101, 52); // emerald-800
    } else if (item.matchScore >= 70) {
      doc.setTextColor(30, 64, 175); // blue-800
    } else {
      doc.setTextColor(146, 64, 14); // amber-800
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.matchScore}%`, 123, currentY + 2.5);

    // Matched skills summary
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const skillList = item.matchedSkills.slice(0, 3).join(', ') || 'Foundational';
    doc.text(skillList.substring(0, 26), 142, currentY + 2.5);

    // Eligibility status
    const isEligible = item.cgpaEligible && item.backlogEligible;
    if (isEligible) {
      doc.setTextColor(16, 149, 193);
      doc.text('Eligible', 180, currentY + 2.5);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text('Shortfall', 180, currentY + 2.5);
    }

    currentY += 9;
  });

  // Footer on last page
  currentY += 8;
  if (currentY < pageHeight - 20) {
    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized by: Head of Placement Coordination Cell (PCC) | Global Academy of Technology, Rajarajeshwarinagar, Bengaluru-560098', 14, currentY);
    doc.text('CONFIDENTIAL: Strictly for Campus Recruitment Drive Evaluation.', 14, currentY + 5);
  }

  const filename = `${companyName.replace(/\s+/g, '_')}_JD_Candidate_Shortlist_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
}

export function generateStudentResumePDF(student: StudentProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Name & Branch
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(student.fullName.toUpperCase(), 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`${student.pursuingDegree} · Dept. of ${student.department} · Batch ${student.batchYear}`, 14, y);

  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`USN: ${student.usn} | Email: ${student.placementEmailId} | Phone: +91 ${student.mobileNo} | Address: ${student.nativePlace}, ${student.state}`, 14, y);

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Section 1: Education Background
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. ACADEMIC CREDENTIALS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`• B.E Degree: ${student.pursuingDegree} | Current CGPA: ${student.cgpa.toFixed(2)} / 10.0 (Backlogs: ${student.currentBacklogs})`, 16, y);
  y += 5;
  doc.text(`• 12th / PUC / Diploma: ${student.twelfthOrDiplomaPercentage}% (${student.twelfthOrDiplomaPassingYear}) — ${student.twelfthOrDiplomaCollegeName} [${student.twelfthOrDiplomaBoardName}]`, 16, y);
  y += 5;
  doc.text(`• 10th / SSLC: ${student.tenthPercentage}% (${student.tenthPassingYear}) — ${student.tenthSchoolName} [${student.tenthBoardName}]`, 16, y);
  y += 7;

  // Section 2: Technical Skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. TECHNICAL EXPERTISE & SKILLS (RATED 1-5)', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const skillStrs = student.skills.map(s => `${s.name} (${s.rating}/5)`).join('  ·  ');
  const splitSkills = doc.splitTextToSize(skillStrs, pageWidth - 30);
  doc.text(splitSkills, 16, y);
  y += splitSkills.length * 4.5 + 4;

  // Section 3: Internships & Work Experience
  if (student.internships.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. INTERNSHIPS & WORK EXPERIENCE', 14, y);
    y += 5;

    student.internships.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`${item.companyName} — ${item.domain} (${item.durationMonths} Months)`, 16, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const splitDesc = doc.splitTextToSize(item.description, pageWidth - 32);
      doc.text(splitDesc, 18, y);
      y += splitDesc.length * 4.2 + 3;
    });
  }

  // Section 4: Projects
  if (student.projects.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. KEY ACADEMIC & TECHNICAL PROJECTS', 14, y);
    y += 5;

    student.projects.forEach(p => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`${p.title} | Stack: ${p.techStack.join(', ')}`, 16, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const splitPDesc = doc.splitTextToSize(p.description, pageWidth - 32);
      doc.text(splitPDesc, 18, y);
      y += splitPDesc.length * 4.2 + 3;
    });
  }

  // Section 5: R&D Works & Publications
  if (student.rndWorks.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('5. RESEARCH & DEVELOPMENT (PUBLICATIONS & PATENTS)', 14, y);
    y += 5;

    student.rndWorks.forEach(r => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`• [${r.type.toUpperCase()}] "${r.title}" — ${r.journalOrConference} (${r.year}) [${r.status}]`, 16, y);
      y += 4.5;
    });
    y += 2;
  }

  // Section 6: Achievements, Hobbies & Offers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('6. HONORS, CERTIFICATIONS & PLACEMENT RECORD', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  if (student.achievementsAcademic.length > 0) {
    doc.text(`• Academic Honors: ${student.achievementsAcademic.join('; ')}`, 16, y);
    y += 4.5;
  }
  if (student.hobbiesAndInterests.length > 0) {
    doc.text(`• Hobbies & Extracurricular: ${student.hobbiesAndInterests.join(', ')}`, 16, y);
    y += 4.5;
  }
  if (student.offers.length > 0) {
    const highestOffer = [...student.offers].sort((a,b) => b.packageLPA - a.packageLPA)[0];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text(`• Campus Placement Status: PLACED with ${student.offers.length} offer(s) | Highest CTC: Rs. ${highestOffer.packageLPA.toFixed(1)} LPA (${highestOffer.companyName})`, 16, y);
    y += 4.5;
  }

  const filename = `${student.usn}_${student.firstName}_Resume.pdf`;
  doc.save(filename);
}
