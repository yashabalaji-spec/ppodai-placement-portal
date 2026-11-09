export type NoticeAudienceType = 'all' | 'branches' | 'semesters' | 'students';

export interface NoticeAudienceInput {
  type: NoticeAudienceType;
  branches?: string[];
  semesters?: number[];
  studentUsns?: string[];
}

export interface NormalizedNoticeAudience {
  type: NoticeAudienceType;
  branches: string[];
  semesters: number[];
  studentUsns: string[];
}

export interface LinkedStudentIdentity {
  usn: string | null | undefined;
}

export type StudentIdentityResolution<T extends LinkedStudentIdentity> =
  | { ok: true; student: T }
  | { ok: false; reason: 'missing-link' | 'usn-mismatch' };

export interface StudentNoticeIdentity {
  usn: string;
  branch_code: string;
  semester: number | null;
}

export interface NoticeAudienceRecord {
  audience_type: string;
  target_branches: string[];
  target_semesters: number[];
  target_usns: string[];
}

const normalizeIdentifier = (value: string | null | undefined) =>
  value?.trim().toUpperCase() || '';

export function resolveStudentIdentity<T extends LinkedStudentIdentity>(
  linkedStudent: T | null | undefined,
  authenticatedUsn: string | null | undefined
): StudentIdentityResolution<T> {
  if (!linkedStudent) return { ok: false, reason: 'missing-link' };

  const expectedUsn = normalizeIdentifier(authenticatedUsn);
  if (
    expectedUsn &&
    (!normalizeIdentifier(linkedStudent.usn) ||
      normalizeIdentifier(linkedStudent.usn) !== expectedUsn)
  ) {
    return { ok: false, reason: 'usn-mismatch' };
  }

  return { ok: true, student: linkedStudent };
}

export function isNoticeVisibleToStudent(
  notice: NoticeAudienceRecord,
  student: StudentNoticeIdentity
): boolean {
  const branch = normalizeIdentifier(student.branch_code);
  const branches = (notice.target_branches || []).map(normalizeIdentifier);

  if (!branch || !branches.includes(branch)) return false;

  if (notice.audience_type === 'all' || notice.audience_type === 'branches') {
    return true;
  }

  if (notice.audience_type === 'semesters') {
    return student.semester !== null &&
      (notice.target_semesters || []).includes(student.semester);
  }

  if (notice.audience_type === 'students') {
    const usn = normalizeIdentifier(student.usn);
    return Boolean(usn) &&
      (notice.target_usns || []).some(targetUsn => normalizeIdentifier(targetUsn) === usn);
  }

  return false;
}

export function normalizeNoticeAudience(
  input: NoticeAudienceInput,
  departmentBranchCode: string
): NormalizedNoticeAudience {
  if (!departmentBranchCode.trim()) {
    throw new Error('Your account has no assigned department.');
  }

  if (input.type === 'all') {
    return {
      type: input.type,
      branches: [departmentBranchCode],
      semesters: [],
      studentUsns: []
    };
  }

  if (input.type === 'branches') {
    const branches = [...new Set((input.branches || []).map(value => value.trim()).filter(Boolean))];
    if (
      branches.length !== 1 ||
      branches[0].toLowerCase() !== departmentBranchCode.toLowerCase()
    ) {
      throw new Error('SPCs can only send notices to their assigned department.');
    }

    return { type: input.type, branches: [departmentBranchCode], semesters: [], studentUsns: [] };
  }

  if (input.type === 'semesters') {
    const semesters = [...new Set(input.semesters || [])];
    if (
      semesters.length === 0 ||
      semesters.some(semester => !Number.isInteger(semester) || semester < 1 || semester > 8)
    ) {
      throw new Error('Select one or more valid semesters.');
    }

    return {
      type: input.type,
      branches: [departmentBranchCode],
      semesters,
      studentUsns: []
    };
  }

  if (input.type === 'students') {
    const studentUsns = [...new Set(
      (input.studentUsns || []).map(usn => usn.trim().toUpperCase()).filter(Boolean)
    )];
    if (studentUsns.length === 0) {
      throw new Error('Select one or more students.');
    }

    return {
      type: input.type,
      branches: [departmentBranchCode],
      semesters: [],
      studentUsns
    };
  }

  throw new Error('Choose a valid notice audience.');
}
