import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isNoticeVisibleToStudent,
  normalizeNoticeAudience,
  resolveStudentIdentity
} from '../src/services/noticeAudience.ts';

test('student identity requires the authenticated user-to-student link', () => {
  assert.deepEqual(resolveStudentIdentity(undefined, '1ABC23'), {
    ok: false,
    reason: 'missing-link'
  });
});

test('student identity rejects a linked record with a different USN', () => {
  assert.deepEqual(resolveStudentIdentity({ usn: '2XYZ23' }, '1ABC23'), {
    ok: false,
    reason: 'usn-mismatch'
  });
});

test('student identity accepts a matching linked record case-insensitively', () => {
  const linkedStudent = { usn: '1abc23', branch_code: 'CSE', semester: 5 };
  assert.deepEqual(resolveStudentIdentity(linkedStudent, '1ABC23'), {
    ok: true,
    student: linkedStudent
  });
});

test('all audience is restricted to the SPC department', () => {
  assert.deepEqual(normalizeNoticeAudience({ type: 'all' }, 'CSE'), {
    type: 'all',
    branches: ['CSE'],
    semesters: [],
    studentUsns: []
  });
});

test('a different department cannot be selected', () => {
  assert.throws(
    () => normalizeNoticeAudience({ type: 'branches', branches: ['ECE'] }, 'CSE'),
    /assigned department/
  );
});

test('all audience means all students in the SPC branch only', () => {
  const audience = normalizeNoticeAudience({ type: 'all' }, 'CSE');
  const notice = {
    audience_type: audience.type,
    target_branches: audience.branches,
    target_semesters: audience.semesters,
    target_usns: audience.studentUsns
  };

  assert.equal(isNoticeVisibleToStudent(notice, {
    usn: '1CSE23',
    branch_code: 'CSE',
    semester: 5
  }), true);
  assert.equal(isNoticeVisibleToStudent(notice, {
    usn: '1ECE23',
    branch_code: 'ECE',
    semester: 5
  }), false);
});

test('semester and individual audiences require the target branch', () => {
  const student = { usn: '1CSE23', branch_code: 'CSE', semester: 5 };
  assert.equal(isNoticeVisibleToStudent({
    audience_type: 'semesters',
    target_branches: ['CSE'],
    target_semesters: [5],
    target_usns: []
  }, student), true);
  assert.equal(isNoticeVisibleToStudent({
    audience_type: 'semesters',
    target_branches: ['CSE'],
    target_semesters: [3],
    target_usns: []
  }, student), false);
  assert.equal(isNoticeVisibleToStudent({
    audience_type: 'students',
    target_branches: ['ECE'],
    target_semesters: [],
    target_usns: ['1CSE23']
  }, student), false);
  assert.equal(isNoticeVisibleToStudent({
    audience_type: 'students',
    target_branches: ['CSE'],
    target_semesters: [],
    target_usns: ['1cse23']
  }, student), true);
});

test('semester and student audiences are validated and deduplicated', () => {
  assert.deepEqual(
    normalizeNoticeAudience({ type: 'semesters', semesters: [3, 5, 3] }, 'CSE').semesters,
    [3, 5]
  );
  assert.deepEqual(
    normalizeNoticeAudience({ type: 'students', studentUsns: ['1ABC', '1abc'] }, 'CSE').studentUsns,
    ['1ABC']
  );
});

test('invalid semesters and empty student audiences are rejected', () => {
  assert.throws(
    () => normalizeNoticeAudience({ type: 'semesters', semesters: [9] }, 'CSE'),
    /valid semesters/
  );
  assert.throws(
    () => normalizeNoticeAudience({ type: 'students', studentUsns: [] }, 'CSE'),
    /Select one or more students/
  );
});
