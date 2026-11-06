import { PlacementDrive, StudentProfile, EmailNotification } from '../types';

const STORAGE_KEY = 'gat_placement_emails_store';

// Default initial emails to seed the inbox with realistic countdown reminders
export const INITIAL_EMAILS: EmailNotification[] = [
  {
    id: 'em_amz_rem_01',
    driveId: 'd1',
    companyName: 'Amazon AWS',
    roleTitle: 'Software Development Engineer - I (Cloud Services)',
    ctcLPA: 28.5,
    type: 'countdown_reminder',
    subject: '⏰ [URGENT REMINDER] Only 18 Hours Left: Complete Registration for Amazon AWS (₹28.5 LPA)',
    from: 'GAT Placement Coordination Cell <placements@gat.ac.in>',
    to: 'rohan.sharma.cs21@gat.ac.in',
    studentUsn: '1GA21CS042',
    studentName: 'Rohan Sharma',
    sentAt: '2026-10-01 09:30 AM',
    hoursLeft: 18,
    deadlineString: '2026-10-02 03:30 AM IST (18 Hours Remaining)',
    isRead: false,
    companyRequirements: {
      minCGPA: 7.75,
      maxBacklogs: 0,
      targetBranches: ['CSE', 'ISE', 'AIML', 'AIDS', 'ECE'],
      requiredSkills: ['Data Structures & Algorithms', 'Python / Java', 'AWS / Distributed Systems'],
      venue: 'GAT Auditorium & Central Computing Center 1 & 2',
      driveDate: '2026-10-12 09:30 AM'
    },
    jobDescriptionSummary: 'Build scalable, fault-tolerant distributed cloud services. Designing RESTful microservices, optimizing database performance, and deploying zero-downtime infrastructure.',
    formSubmitted: false
  },
  {
    id: 'em_msft_init_02',
    driveId: 'd5',
    companyName: 'Microsoft IDC',
    roleTitle: 'Software Engineer - Azure & Systems',
    ctcLPA: 44.0,
    type: 'drive_approached',
    subject: '🏢 [NEW COMPANY APPROACHED] Microsoft IDC Campus Drive Initiated: ₹44.0 LPA - Fill Registration Form',
    from: 'GAT Placement Coordination Cell <placements@gat.ac.in>',
    to: 'rohan.sharma.cs21@gat.ac.in',
    studentUsn: '1GA21CS042',
    studentName: 'Rohan Sharma',
    sentAt: '2026-09-30 02:00 PM',
    hoursLeft: 42,
    deadlineString: '2026-10-03 08:00 AM IST (42 Hours Remaining)',
    isRead: true,
    companyRequirements: {
      minCGPA: 8.0,
      maxBacklogs: 0,
      targetBranches: ['CSE', 'ISE', 'AIML', 'AIDS', 'ECE'],
      requiredSkills: ['C++ / C#', 'Operating Systems & Concurrency', 'Algorithms', 'Distributed Consensus'],
      venue: 'GAT Main Auditorium & High Performance Computing Lab',
      driveDate: '2026-10-28 09:00 AM'
    },
    jobDescriptionSummary: 'Core Azure compute hyper-virtualization software, distributed consensus protocols, and kernel-level performance optimization.',
    formSubmitted: false
  },
  {
    id: 'em_ti_last_03',
    driveId: 'd2',
    companyName: 'Texas Instruments',
    roleTitle: 'Embedded Systems & Firmware Engineer',
    ctcLPA: 22.0,
    type: 'urgent_last_call',
    subject: '🚨 [FINAL CALL - 6 HRS LEFT] Texas Instruments Registration Closing Soon: Review Requirements & Apply',
    from: 'GAT Placement Coordination Cell <placements@gat.ac.in>',
    to: 'rohan.sharma.cs21@gat.ac.in',
    studentUsn: '1GA21CS042',
    studentName: 'Rohan Sharma',
    sentAt: '2026-10-01 06:00 AM',
    hoursLeft: 6,
    deadlineString: '2026-10-01 12:00 PM IST (6 Hours Remaining)',
    isRead: false,
    companyRequirements: {
      minCGPA: 7.5,
      maxBacklogs: 0,
      targetBranches: ['ECE', 'EEE', 'CSE', 'RA'],
      requiredSkills: ['Embedded C', 'ARM Cortex Architecture', 'FreeRTOS', 'SPI / I2C / UART'],
      venue: 'Seminar Hall 2 & Embedded IoT Lab',
      driveDate: '2026-10-18 10:00 AM'
    },
    jobDescriptionSummary: 'Firmware design for ultra-low power ARM Cortex microcontrollers, peripheral device drivers, and RTOS task scheduling.',
    formSubmitted: false
  }
];

// Helper to get all stored emails
export function getStoredEmails(): EmailNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMAILS));
      return INITIAL_EMAILS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_EMAILS;
  }
}

// Save emails to store
export function saveEmails(emails: EmailNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  } catch (e) {
    console.error('Failed to save emails to localStorage', e);
  }
}

// Get emails for a specific student USN
export function getEmailsForStudent(studentUsn: string): EmailNotification[] {
  const all = getStoredEmails();
  return all.filter(e => e.studentUsn === studentUsn || !e.studentUsn);
}

// Mark an email as read
export function markEmailRead(emailId: string): void {
  const all = getStoredEmails();
  const updated = all.map(e => e.id === emailId ? { ...e, isRead: true } : e);
  saveEmails(updated);
}

// Submit placement registration form via email
export function submitPlacementRegistration(emailId: string, usn: string): { success: boolean; message: string } {
  const all = getStoredEmails();
  const email = all.find(e => e.id === emailId);
  if (!email) return { success: false, message: 'Notification not found' };

  const nowString = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updated = all.map(e => e.id === emailId ? {
    ...e,
    formSubmitted: true,
    submittedAt: nowString,
    isRead: true
  } : e);

  // Also add confirmation email
  const confirmationEmail: EmailNotification = {
    id: `em_conf_${Date.now()}`,
    driveId: email.driveId,
    companyName: email.companyName,
    roleTitle: email.roleTitle,
    ctcLPA: email.ctcLPA,
    type: 'registration_confirmed',
    subject: `✓ [REGISTRATION CONFIRMED] ${email.companyName} (${email.roleTitle}) - Hall Ticket Issued`,
    from: 'GAT Placement Coordination Cell <placements@gat.ac.in>',
    to: email.to,
    studentUsn: email.studentUsn,
    studentName: email.studentName,
    sentAt: nowString,
    hoursLeft: 0,
    deadlineString: 'Registration Completed',
    isRead: false,
    companyRequirements: email.companyRequirements,
    jobDescriptionSummary: email.jobDescriptionSummary,
    formSubmitted: true,
    submittedAt: nowString
  };

  saveEmails([confirmationEmail, ...updated]);

  // Also update registered drive in student localStorage
  try {
    const regKey = `gat_student_reg_${usn}`;
    const raw = localStorage.getItem(regKey);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    if (!existing.includes(email.driveId)) {
      localStorage.setItem(regKey, JSON.stringify([...existing, email.driveId]));
    }
  } catch (err) {
    console.error(err);
  }

  return { success: true, message: `Successfully registered for ${email.companyName}!` };
}

// Dispatch automated email when a new company approaches
export function dispatchCompanyApproachedEmail(
  drive: PlacementDrive,
  eligibleStudents: StudentProfile[]
): { count: number; timestamp: string } {
  const all = getStoredEmails();
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const newEmails: EmailNotification[] = eligibleStudents.map(student => ({
    id: `em_approach_${drive.id}_${student.usn}_${Date.now()}`,
    driveId: drive.id,
    companyName: drive.companyName,
    roleTitle: drive.roleTitle,
    ctcLPA: drive.ctcLPA,
    type: 'drive_approached',
    subject: `🏢 [NEW COMPANY APPROACHED] ${drive.companyName} Campus Recruitment (₹${drive.ctcLPA} LPA) - Fill Registration Form`,
    from: 'GAT Placement Coordination Cell <placements@gat.ac.in>',
    to: student.placementEmailId,
    studentUsn: student.usn,
    studentName: student.fullName,
    sentAt: timestamp,
    hoursLeft: 48,
    deadlineString: `${drive.driveDate} 08:00 AM IST (48 Hours Remaining)`,
    isRead: false,
    companyRequirements: {
      minCGPA: drive.minCGPA,
      maxBacklogs: drive.maxBacklogsAllowed,
      targetBranches: drive.targetBranches,
      requiredSkills: drive.requiredSkills || ['Core Engineering Competency'],
      venue: drive.venue,
      driveDate: `${drive.driveDate} ${drive.startTime || '09:30 AM'}`
    },
    jobDescriptionSummary: drive.jobDescription || drive.companyInfo || 'Software engineering and enterprise technology role.',
    formSubmitted: false
  }));

  saveEmails([...newEmails, ...all]);
  return { count: newEmails.length, timestamp };
}

// Dispatch automated timer reminder email ("X number of hours left")
export function dispatchCountdownReminderEmail(
  drive: PlacementDrive,
  hoursLeft: number,
  targetStudents: StudentProfile[]
): { count: number; hoursLeft: number } {
  const all = getStoredEmails();
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isUrgent = hoursLeft <= 6;
  const newEmails: EmailNotification[] = targetStudents.map(student => ({
    id: `em_reminder_${drive.id}_${student.usn}_${hoursLeft}h_${Date.now()}`,
    driveId: drive.id,
    companyName: drive.companyName,
    roleTitle: drive.roleTitle,
    ctcLPA: drive.ctcLPA,
    type: isUrgent ? 'urgent_last_call' : 'countdown_reminder',
    subject: isUrgent
      ? `🚨 [FINAL CALL - ${hoursLeft} HRS LEFT] Registration Closing: ${drive.companyName} Requirements & Direct Form Link`
      : `⏰ [URGENT REMINDER] Only ${hoursLeft} Hours Left: Complete Registration for ${drive.companyName} (${drive.roleTitle})`,
    from: 'GAT Placement Coordination Cell <placements@gat.ac.in>',
    to: student.placementEmailId,
    studentUsn: student.usn,
    studentName: student.fullName,
    sentAt: timestamp,
    hoursLeft: hoursLeft,
    deadlineString: `${hoursLeft} Hours Remaining before form locks`,
    isRead: false,
    companyRequirements: {
      minCGPA: drive.minCGPA,
      maxBacklogs: drive.maxBacklogsAllowed,
      targetBranches: drive.targetBranches,
      requiredSkills: drive.requiredSkills || ['Core Engineering Competency'],
      venue: drive.venue,
      driveDate: `${drive.driveDate} ${drive.startTime || '09:30 AM'}`
    },
    jobDescriptionSummary: drive.jobDescription || drive.companyInfo || 'Software engineering role.',
    formSubmitted: false
  }));

  saveEmails([...newEmails, ...all]);
  return { count: newEmails.length, hoursLeft };
}
