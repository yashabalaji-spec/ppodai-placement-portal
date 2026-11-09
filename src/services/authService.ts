import { UserAccount, StudentProfile } from '../types';
import { INITIAL_USERS, INITIAL_STUDENTS } from '../data/mockData';

const USERS_STORAGE_KEY = 'gat_users';
const STUDENTS_STORAGE_KEY = 'gat_students';

function withoutPassword<T extends { password?: string }>(record: T): Omit<T, 'password'> {
  const { password: _password, ...safeRecord } = record;
  return safeRecord;
}

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const safeUsers = (parsed as UserAccount[]).map(user => withoutPassword(user));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(safeUsers));
        return safeUsers;
      }
    }
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
  }
  return INITIAL_USERS;
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(users.map(user => withoutPassword(user)))
    );
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export function getStoredStudentsList(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const safeStudents = (parsed as StudentProfile[]).map(student => withoutPassword(student));
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(safeStudents));
        return safeStudents;
      }
    }
  } catch (e) {
    console.error('Failed to load students from localStorage', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudentsList(students: StudentProfile[]): void {
  try {
    localStorage.setItem(
      STUDENTS_STORAGE_KEY,
      JSON.stringify(students.map(student => withoutPassword(student)))
    );
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
}

export function removeStoredCredentials(): void {
  try {
    for (const key of [USERS_STORAGE_KEY, STUDENTS_STORAGE_KEY]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(key);
        continue;
      }

      localStorage.setItem(
        key,
        JSON.stringify(parsed.map(record => {
          if (!record || typeof record !== 'object' || Array.isArray(record)) {
            return record;
          }
          const safeRecord: Record<string, unknown> = { ...record };
          delete safeRecord.password;
          return safeRecord;
        }))
      );
    }
  } catch (error) {
    console.error('Unable to remove legacy credentials from local storage.', error);
  }
}

/**
 * Reset password using any linked email (Placement, College, or Personal Mail) or USN / Special ID
 */
export function resetPasswordByEmailOrId(
  searchQuery: string,
  newPass: string
): { success: boolean; user?: UserAccount; message: string } {
  const q = searchQuery.trim().toLowerCase();
  const currentUsers = getStoredUsers();
  const currentStudents = getStoredStudentsList();

  let targetUserIndex = currentUsers.findIndex(u => 
    u.email.toLowerCase() === q ||
    u.specialId.toLowerCase() === q ||
    (u.collegeEmail && u.collegeEmail.toLowerCase() === q) ||
    (u.personalEmail && u.personalEmail.toLowerCase() === q) ||
    (u.placementEmail && u.placementEmail.toLowerCase() === q) ||
    (u.usn && u.usn.toLowerCase() === q)
  );

  let targetStudentIndex = currentStudents.findIndex(s =>
    s.usn.toLowerCase() === q ||
    (s.collegeEmail && s.collegeEmail.toLowerCase() === q) ||
    (s.personalEmailId && s.personalEmailId.toLowerCase() === q) ||
    (s.placementEmailId && s.placementEmailId.toLowerCase() === q)
  );

  if (targetUserIndex === -1 && targetStudentIndex === -1) {
    return { 
      success: false, 
      message: `No account found with email or ID "${searchQuery}". Please verify your email ID or USN.` 
    };
  }

  // Update in users array
  if (targetUserIndex !== -1) {
    currentUsers[targetUserIndex] = {
      ...currentUsers[targetUserIndex],
      password: newPass
    };
    saveUsers(currentUsers);
  }

  // Update in students array
  if (targetStudentIndex !== -1) {
    currentStudents[targetStudentIndex] = {
      ...currentStudents[targetStudentIndex],
      password: newPass
    };
    saveStudentsList(currentStudents);
  }

  const updatedUser = targetUserIndex !== -1 ? currentUsers[targetUserIndex] : undefined;
  return { 
    success: true, 
    user: updatedUser, 
    message: 'Password successfully updated! You can now log in with your new password.' 
  };
}

/**
 * 5th Semester Placement Mail ID Activation & Registration
 * When students enter 5th semester, they link existing college mail, personal mail,
 * and create their official placement mail id.
 */
export function activateFifthSemPlacementMail(params: {
  usn: string;
  collegeEmail: string;
  personalEmail: string;
  placementEmail: string;
  password?: string;
}): { success: boolean; student?: StudentProfile; user?: UserAccount; message: string } {
  const currentStudents = getStoredStudentsList();
  const currentUsers = getStoredUsers();

  const stdIdx = currentStudents.findIndex(s => s.usn.toUpperCase() === params.usn.trim().toUpperCase());
  if (stdIdx === -1) {
    return { success: false, message: `Student with USN "${params.usn}" not found in institutional directory.` };
  }

  const targetStudent = currentStudents[stdIdx];

  // Update student profile
  const updatedStudent: StudentProfile = {
    ...targetStudent,
    collegeEmail: params.collegeEmail.trim().toLowerCase(),
    personalEmailId: params.personalEmail.trim().toLowerCase(),
    placementEmailId: params.placementEmail.trim().toLowerCase(),
    isPlacementMailActivated: true,
    password: params.password ? params.password.trim() : targetStudent.password
  };

  currentStudents[stdIdx] = updatedStudent;
  saveStudentsList(currentStudents);

  // Update or insert into users list
  const userIdx = currentUsers.findIndex(u => u.usn && u.usn.toUpperCase() === params.usn.trim().toUpperCase());
  let updatedUser: UserAccount;

  if (userIdx !== -1) {
    updatedUser = {
      ...currentUsers[userIdx],
      email: params.placementEmail.trim().toLowerCase(),
      placementEmail: params.placementEmail.trim().toLowerCase(),
      collegeEmail: params.collegeEmail.trim().toLowerCase(),
      personalEmail: params.personalEmail.trim().toLowerCase(),
      isPlacementMailActivated: true,
      password: params.password ? params.password.trim() : currentUsers[userIdx].password
    };
    currentUsers[userIdx] = updatedUser;
  } else {
    updatedUser = {
      id: `u_${updatedStudent.usn}`,
      name: updatedStudent.fullName,
      email: params.placementEmail.trim().toLowerCase(),
      specialId: updatedStudent.usn,
      password: params.password ? params.password.trim() : (updatedStudent.password || 'student@2026'),
      role: 'student',
      usn: updatedStudent.usn,
      department: updatedStudent.department,
      semester: updatedStudent.semester,
      collegeEmail: params.collegeEmail.trim().toLowerCase(),
      personalEmail: params.personalEmail.trim().toLowerCase(),
      placementEmail: params.placementEmail.trim().toLowerCase(),
      isPlacementMailActivated: true,
      designation: `Semester ${updatedStudent.semester} Student (${updatedStudent.department})`
    };
    currentUsers.push(updatedUser);
  }

  saveUsers(currentUsers);

  return {
    success: true,
    student: updatedStudent,
    user: updatedUser,
    message: 'Placement Mail ID activated successfully! Your account is now fully verified for campus placement drives.'
  };
}
