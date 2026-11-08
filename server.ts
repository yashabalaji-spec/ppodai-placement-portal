import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { pool } from './db';
import { connectMongoDB } from './mong';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Convert a database account into the safe user object expected by the frontend.
const toSafeUser = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  specialId: row.special_id || '',
  department: row.department || '',
  designation: row.designation || '',
  usn: row.usn || '',
  company: row.company || ''
});

// 1. Login using an account stored in PostgreSQL.
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (
      typeof identifier !== 'string' ||
      !identifier.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({ message: 'Enter your ID and password.' });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ message: 'Authentication is not configured.' });
    }

    const inputId = identifier.trim().toUpperCase();

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role,
              special_id, department, designation, usn, company, is_active
       FROM users
       WHERE UPPER(COALESCE(special_id, '')) = $1
          OR UPPER(COALESCE(usn, '')) = $1
          OR UPPER(email) = $1
       LIMIT 1`,
      [inputId]
    );

    const account = result.rows[0];

    if (
      !account ||
      account.is_active !== true ||
      (role && account.role !== role)
    ) {
      return res.status(401).json({
        message: 'Invalid ID or password, or account is inactive.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      account.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid ID or password, or account is inactive.'
      });
    }

    const user = toSafeUser(account);

    const token = jwt.sign(
      { sub: account.id, role: account.role },
      secret,
      { expiresIn: '8h' }
    );

    res.cookie('ppodai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.json({ success: true, user });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});
// Request a password-reset OTP.
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        message: 'Enter your registered ID or email.'
      });
    }

    const secret = process.env.JWT_SECRET;
    const demoEnabled =
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_DEMO_OTP === 'true';

    if (!secret) {
      return res.status(500).json({
        message: 'Password recovery is not configured.'
      });
    }

    const input = identifier.trim();

    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE is_active IS TRUE
         AND (
           UPPER(COALESCE(special_id, '')) = UPPER($1)
           OR UPPER(COALESCE(usn, '')) = UPPER($1)
           OR LOWER(email) = LOWER($1)
         )
       LIMIT 1`,
      [input]
    );

    const account = result.rows[0];

    if (!account) {
      return res.json({
        success: true,
        message: 'If the account exists, an OTP has been generated.'
      });
    }

    const recentRequests = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM password_reset_otps
       WHERE user_id = $1
         AND created_at > NOW() - INTERVAL '15 minutes'`,
      [account.id]
    );

    if (recentRequests.rows[0].count >= 3) {
      return res.status(429).json({
        message: 'Too many OTP requests. Try again after 15 minutes.'
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto
      .createHmac('sha256', secret)
      .update(`${account.id}:${otp}`)
      .digest('hex');

    await pool.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [account.id]
    );

    await pool.query(
      `INSERT INTO password_reset_otps
       (user_id, otp_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes')`,
      [account.id, otpHash]
    );

    return res.json({
      success: true,
      message: 'If the account exists, an OTP has been generated.',
      ...(demoEnabled ? { demoOtp: otp } : {})
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      message: 'Could not process the request. Please try again.'
    });
  }
});

// Verify OTP and reset the account password.
app.post('/api/auth/reset-password', async (req, res) => {
  const { identifier, otp, newPassword } = req.body;

  if (
    typeof identifier !== 'string' ||
    !identifier.trim() ||
    typeof otp !== 'string' ||
    !/^\d{6}$/.test(otp) ||
    typeof newPassword !== 'string' ||
    newPassword.length < 12
  ) {
    return res.status(400).json({
      message: 'Enter a valid ID, six-digit OTP and password of at least 12 characters.'
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: 'Password recovery is not configured.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const accountResult = await client.query(
      `SELECT id
       FROM users
       WHERE is_active IS TRUE
         AND (
           UPPER(COALESCE(special_id, '')) = UPPER($1)
           OR UPPER(COALESCE(usn, '')) = UPPER($1)
           OR LOWER(email) = LOWER($1)
         )
       LIMIT 1`,
      [identifier.trim()]
    );

    const account = accountResult.rows[0];

    if (!account) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Invalid or expired OTP.'
      });
    }

    const otpResult = await client.query(
      `SELECT id, otp_hash, expires_at, attempts
       FROM password_reset_otps
       WHERE user_id = $1
         AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [account.id]
    );

    const otpRecord = otpResult.rows[0];

    if (
      !otpRecord ||
      otpRecord.attempts >= 5 ||
      new Date(otpRecord.expires_at).getTime() <= Date.now()
    ) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Invalid or expired OTP.'
      });
    }

    const submittedHash = crypto
      .createHmac('sha256', secret)
      .update(`${account.id}:${otp}`)
      .digest();

    const storedHash = Buffer.from(otpRecord.otp_hash, 'hex');

    const otpMatches =
      storedHash.length === submittedHash.length &&
      crypto.timingSafeEqual(storedHash, submittedHash);

    if (!otpMatches) {
      const nextAttempts = otpRecord.attempts + 1;

      await client.query(
        `UPDATE password_reset_otps
         SET attempts = $1,
             used_at = CASE WHEN $1 >= 5 THEN NOW() ELSE used_at END
         WHERE id = $2`,
        [nextAttempts, otpRecord.id]
      );

      await client.query('COMMIT');

      return res.status(400).json({
        message: nextAttempts >= 5
          ? 'Too many incorrect attempts. Request a new OTP.'
          : 'Incorrect OTP. Please try again.'
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await client.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [passwordHash, account.id]
    );

    await client.query(
      `UPDATE password_reset_otps
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [account.id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Password reset error:', error);

    return res.status(500).json({
      message: 'Could not reset password. Please try again.'
    });
  } finally {
    client.release();
  }
});

// 2. Restore and verify the current login session.
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies?.ppodai_token;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      role: string;
    };

    const result = await pool.query(
      `SELECT id, name, email, role, special_id,
              department, designation, usn, company, is_active
       FROM users
       WHERE id = $1 AND is_active IS TRUE
       LIMIT 1`,
      [decoded.sub]
    );

    const account = result.rows[0];

    if (!account || account.role !== decoded.role) {
      res.clearCookie('ppodai_token', { path: '/' });
      return res.status(401).json({ message: 'Session is no longer valid.' });
    }

    return res.json({ success: true, user: toSafeUser(account) });

  } catch {
    res.clearCookie('ppodai_token', { path: '/' });
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
});

// 3. Get the authenticated student's complete profile from PostgreSQL.
app.get('/api/student/profile', async (req, res) => {
  try {
    const token = req.cookies?.ppodai_token;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      role: string;
    };

    const accountResult = await pool.query(
      `SELECT id, role, usn, is_active
       FROM users
       WHERE id = $1 AND is_active IS TRUE
       LIMIT 1`,
      [decoded.sub]
    );

    const account = accountResult.rows[0];

    if (!account || account.role !== decoded.role) {
      return res.status(401).json({ message: 'Invalid session.' });
    }

    if (account.role !== 'student' || !account.usn) {
      return res.status(403).json({ message: 'Student access only.' });
    }

    // Retrieve the student's main profile.
    const profileResult = await pool.query(
      'SELECT * FROM students WHERE usn = $1 LIMIT 1',
      [account.usn]
    );

    const s = profileResult.rows[0];

    if (!s) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    // Retrieve all related student records.
    const [
      skillsResult,
      internshipsResult,
      projectsResult,
      rndResult,
      achievementsResult,
      hobbiesResult,
      offersResult
    ] = await Promise.all([
      pool.query(
        'SELECT * FROM student_skills WHERE student_usn = $1',
        [account.usn]
      ),
      pool.query(
        'SELECT * FROM student_internships WHERE student_usn = $1',
        [account.usn]
      ),
      pool.query(
        'SELECT * FROM student_projects WHERE student_usn = $1',
        [account.usn]
      ),
      pool.query(
        'SELECT * FROM student_rnd WHERE student_usn = $1',
        [account.usn]
      ),
      pool.query(
        'SELECT * FROM student_achievements WHERE student_usn = $1',
        [account.usn]
      ),
      pool.query(
        'SELECT * FROM student_hobbies WHERE student_usn = $1',
        [account.usn]
      ),
      pool.query(
        `SELECT o.*, c.name AS company_name
         FROM student_offers o
         LEFT JOIN companies c ON c.id = o.company_id
         WHERE o.student_usn = $1`,
        [account.usn]
      )
    ]);

    const dateValue = (value: any) =>
      value ? new Date(value).toISOString().slice(0, 10) : '';

    const numberValue = (value: any) =>
      value === null || value === undefined ? 0 : Number(value);

    // Convert database column names to frontend property names.
    const student = {
      usn: s.usn,
      fullName: s.full_name,
      firstName: s.first_name,
      middleName: s.middle_name || '',
      lastName: s.last_name || '',
      pursuingDegree: s.pursuing_degree || '',
      department: s.department || '',
      section: s.section || 'A',
      semester: numberValue(s.semester),
      batchYear: numberValue(s.batch_year),

      mobileNo: s.mobile_no || '',
      gender: s.gender || 'Other',
      dateOfBirth: dateValue(s.date_of_birth),
      yearOfJoining: numberValue(s.year_of_joining),
      typeOfEntry: s.type_of_entry || 'Regular',
      collegeEmail: s.college_email || '',
      personalEmailId: s.personal_email || '',
      placementEmailId: s.placement_email || '',
      isPlacementMailActivated: Boolean(s.is_placement_mail_activated),
      panNumber: s.pan_number || '',
      aadharNumber: s.aadhar_number || '',
      bloodGroup: s.blood_group || '',
      physicallyChallenged: s.physically_challenged || 'No',

      fatherName: s.father_name || '',
      fatherMobileNo: s.father_mobile || '',
      fatherOccupation: s.father_occupation || '',
      motherName: s.mother_name || '',
      motherMobileNo: s.mother_mobile || '',
      motherOccupation: s.mother_occupation || '',

      communicationAddress: s.communication_address || '',
      permanentAddress: s.permanent_address || '',
      nativePlace: s.native_place || '',
      state: s.state || '',
      pincode: s.pincode || '',

      interestedInHigherStudies: s.interested_in_higher_studies || 'No',
      tenthPercentage: numberValue(s.tenth_percentage),
      tenthPassingYear: numberValue(s.tenth_year),
      tenthSchoolName: s.tenth_school || '',
      tenthBoardName: s.tenth_board || '',

      twelfthOrDiplomaPercentage: numberValue(s.twelfth_percentage),
      twelfthOrDiplomaPassingYear: numberValue(s.twelfth_year),
      twelfthOrDiplomaCollegeName: s.twelfth_college || '',
      twelfthOrDiplomaBoardName: s.twelfth_board || '',

      cgpa: numberValue(s.cgpa),
      currentBacklogs: numberValue(s.current_backlogs),
      backlogHistory: numberValue(s.backlog_history),
      yearBack: s.year_back || 'No',
      gapBeforeDegreeYears: numberValue(s.gap_before_degree_years),
      gapInDegreeYears: numberValue(s.gap_in_degree_years),
      registeredForPlacementAssistance: s.registered_for_placement_assistance || 'No',
      hasExternalCertifications: s.has_external_certifications || 'No',

      skills: skillsResult.rows.map((r: any) => ({
        name: r.skill_name,
        category: r.category || 'programming',
        rating: numberValue(r.rating)
      })),

      internships: internshipsResult.rows.map((r: any) => ({
        id: r.id,
        companyName: r.company_name,
        domain: r.domain || '',
        durationMonths: numberValue(r.duration_months),
        startDate: dateValue(r.start_date),
        endDate: dateValue(r.end_date),
        description: r.description || '',
        isVerified: Boolean(r.is_verified)
      })),

      projects: projectsResult.rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        domain: r.domain || '',
        techStack: r.tech_stack || [],
        description: r.description || '',
        link: r.project_link || ''
      })),

      rndWorks: rndResult.rows.map((r: any) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        journalOrConference: r.journal_or_conference || '',
        year: numberValue(r.year),
        status: r.status || '',
        doiOrPatentNo: r.doi_or_patent_no || ''
      })),

      achievementsAcademic: achievementsResult.rows
        .filter((r: any) => r.achievement_type === 'academic')
        .map((r: any) => r.description),

      achievementsNonAcademic: achievementsResult.rows
        .filter((r: any) => r.achievement_type !== 'academic')
        .map((r: any) => r.description),

      hobbiesAndInterests: hobbiesResult.rows.map((r: any) => r.hobby),

      offers: offersResult.rows.map((r: any) => ({
        id: r.id,
        companyId: r.company_id,
        companyName: r.company_name || '',
        packageLPA: numberValue(r.package_lpa),
        roleTitle: r.role_title || '',
        offerLetterDate: dateValue(r.offer_letter_date),
        tier: r.tier,
        status: r.offer_status
      })),

      isPlaced: Boolean(s.is_placed),
      isLocked: Boolean(s.is_locked)
    };

    return res.json({ success: true, student });

  } catch (error) {
    console.error('Student profile retrieval error:', error);
    return res.status(500).json({
      message: 'Unable to retrieve student profile.'
    });
  }
});

// Save the logged-in student's profile to PostgreSQL.
app.put('/api/student/profile', async (req, res) => {
  const client = await pool.connect();

  try {
    const token = req.cookies?.ppodai_token;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      role: string;
    };

    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Student access only.' });
    }

    const accountResult = await client.query(
      `SELECT id, role, usn, is_active
       FROM users
       WHERE id = $1 AND is_active IS TRUE
       LIMIT 1`,
      [decoded.sub]
    );

    const account = accountResult.rows[0];

    if (!account || account.role !== 'student' || !account.usn) {
      return res.status(401).json({ message: 'Invalid student session.' });
    }

    const p = req.body;

    if (!p || typeof p !== 'object' || Array.isArray(p)) {
      return res.status(400).json({ message: 'Invalid profile data.' });
    }

    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT is_locked FROM students WHERE usn = $1 FOR UPDATE',
      [account.usn]
    );

    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    if (existing.rows[0].is_locked) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        message: 'Your profile is locked. Request permission from your HOD to edit it.'
      });
    }

    await client.query(
      `UPDATE students SET
        full_name = $1,
        first_name = $2,
        middle_name = $3,
        last_name = $4,
        pursuing_degree = $5,
        mobile_no = $6,
        gender = $7,
        date_of_birth = $8,
        year_of_joining = $9,
        type_of_entry = $10,
        personal_email = $11,
        pan_number = $12,
        aadhar_number = $13,
        blood_group = $14,
        physically_challenged = $15,
        father_name = $16,
        father_mobile = $17,
        father_occupation = $18,
        mother_name = $19,
        mother_mobile = $20,
        mother_occupation = $21,
        communication_address = $22,
        permanent_address = $23,
        native_place = $24,
        state = $25,
        pincode = $26,
        interested_in_higher_studies = $27,
        tenth_percentage = $28,
        tenth_year = $29,
        tenth_school = $30,
        tenth_board = $31,
        twelfth_percentage = $32,
        twelfth_year = $33,
        twelfth_college = $34,
        twelfth_board = $35,
        cgpa = $36,
        current_backlogs = $37,
        backlog_history = $38,
        year_back = $39,
        gap_before_degree_years = $40,
        gap_in_degree_years = $41,
        registered_for_placement_assistance = $42,
        has_external_certifications = $43,
        is_locked = TRUE,
        updated_at = CURRENT_TIMESTAMP
       WHERE usn = $44`,
      [
        p.fullName ?? '',
        p.firstName ?? '',
        p.middleName ?? '',
        p.lastName ?? '',
        p.pursuingDegree ?? '',
        p.mobileNo ?? '',
        p.gender ?? 'Other',
        p.dateOfBirth || null,
        p.yearOfJoining || null,
        p.typeOfEntry ?? 'Regular',
        p.personalEmailId ?? '',
        p.panNumber ?? '',
        p.aadharNumber ?? '',
        p.bloodGroup ?? '',
        p.physicallyChallenged ?? 'No',
        p.fatherName ?? '',
        p.fatherMobileNo ?? '',
        p.fatherOccupation ?? '',
        p.motherName ?? '',
        p.motherMobileNo ?? '',
        p.motherOccupation ?? '',
        p.communicationAddress ?? '',
        p.permanentAddress ?? '',
        p.nativePlace ?? '',
        p.state ?? '',
        p.pincode ?? '',
        p.interestedInHigherStudies ?? 'No',
        p.tenthPercentage || 0,
        p.tenthPassingYear || null,
        p.tenthSchoolName ?? '',
        p.tenthBoardName ?? '',
        p.twelfthOrDiplomaPercentage || 0,
        p.twelfthOrDiplomaPassingYear || null,
        p.twelfthOrDiplomaCollegeName ?? '',
        p.twelfthOrDiplomaBoardName ?? '',
        p.cgpa || 0,
        p.currentBacklogs || 0,
        p.backlogHistory || 0,
        p.yearBack ?? 'No',
        p.gapBeforeDegreeYears || 0,
        p.gapInDegreeYears || 0,
        p.registeredForPlacementAssistance ?? 'No',
        p.hasExternalCertifications ?? 'No',
        account.usn
      ]
    );

    // Save student skills.
    await client.query(
      'DELETE FROM student_skills WHERE student_usn = $1',
      [account.usn]
    );

    for (const skill of (Array.isArray(p.skills) ? p.skills : [])) {
      await client.query(
        `INSERT INTO student_skills
         (student_usn, skill_name, category, rating)
         VALUES ($1, $2, $3, $4)`,
        [account.usn, skill.name, skill.category || 'programming', skill.rating || 1]
      );
    }

    // Save internships while preserving existing verification status.
    const internships = Array.isArray(p.internships) ? p.internships : [];
    const internshipIds = internships.map((item: any) => item.id).filter(Boolean);

    await client.query(
      `DELETE FROM student_internships
       WHERE student_usn = $1
       AND is_verified IS FALSE
       AND NOT (id = ANY($2::varchar[]))`,
      [account.usn, internshipIds]
    );

    for (const item of internships) {
      if (!item.id || !item.companyName) continue;

      await client.query(
        `INSERT INTO student_internships
         (id, student_usn, company_name, domain, duration_months,
          start_date, end_date, description, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
         ON CONFLICT (id) DO UPDATE SET
          company_name = EXCLUDED.company_name,
          domain = EXCLUDED.domain,
          duration_months = EXCLUDED.duration_months,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          description = EXCLUDED.description
         WHERE student_internships.student_usn = EXCLUDED.student_usn`,
        [
          item.id, account.usn, item.companyName, item.domain || '',
          item.durationMonths || 0, item.startDate || null,
          item.endDate || null, item.description || ''
        ]
      );
    }

    // Save projects.
    await client.query(
      'DELETE FROM student_projects WHERE student_usn = $1',
      [account.usn]
    );

    for (const project of (Array.isArray(p.projects) ? p.projects : [])) {
      if (!project.id || !project.title) continue;

      await client.query(
        `INSERT INTO student_projects
         (id, student_usn, title, domain, tech_stack, description, project_link)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          project.id, account.usn, project.title, project.domain || '',
          project.techStack || [], project.description || '', project.link || ''
        ]
      );
    }

    // Save research and development records.
    await client.query(
      'DELETE FROM student_rnd WHERE student_usn = $1',
      [account.usn]
    );

    for (const item of (Array.isArray(p.rndWorks) ? p.rndWorks : [])) {
      if (!item.id || !item.title) continue;

      await client.query(
        `INSERT INTO student_rnd
         (id, student_usn, type, title, journal_or_conference,
          year, status, doi_or_patent_no)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.id, account.usn, item.type, item.title,
          item.journalOrConference || '', item.year || null,
          item.status || '', item.doiOrPatentNo || ''
        ]
      );
    }

    // Save academic and non-academic achievements.
    await client.query(
      'DELETE FROM student_achievements WHERE student_usn = $1',
      [account.usn]
    );

    for (const description of (Array.isArray(p.achievementsAcademic) ? p.achievementsAcademic : [])) {
      if (!description?.trim()) continue;

      await client.query(
        `INSERT INTO student_achievements
         (student_usn, achievement_type, description)
         VALUES ($1, 'academic', $2)`,
        [account.usn, description]
      );
    }

    for (const description of (Array.isArray(p.achievementsNonAcademic) ? p.achievementsNonAcademic : [])) {
      if (!description?.trim()) continue;

      await client.query(
        `INSERT INTO student_achievements
         (student_usn, achievement_type, description)
         VALUES ($1, 'non_academic', $2)`,
        [account.usn, description]
      );
    }

    // Save hobbies and interests.
    await client.query(
      'DELETE FROM student_hobbies WHERE student_usn = $1',
      [account.usn]
    );

    for (const hobby of (Array.isArray(p.hobbiesAndInterests) ? p.hobbiesAndInterests : [])) {
      if (!hobby?.trim()) continue;

      await client.query(
        'INSERT INTO student_hobbies (student_usn, hobby) VALUES ($1, $2)',
        [account.usn, hobby]
      );
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Profile saved successfully.',
      isLocked: true
    });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Student profile save error:', error);

    return res.status(500).json({
      message: 'Unable to save student profile.'
    });

  } finally {
    client.release();
  }
});

// 4. Logout.
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('ppodai_token', { path: '/' });
  return res.json({ success: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Placement Portal / GAT PPODAI',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// PostgreSQL database connection test
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database, NOW() AS server_time'
    );

    res.json({
      status: 'connected',
      database: result.rows[0].database,
      serverTime: result.rows[0].server_time
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      status: 'error',
      message: 'PostgreSQL connection failed'
    });
  }
});

// MongoDB database connection test
app.get('/api/mongo-health', async (req, res) => {
  try {
    const db = await connectMongoDB();
    await db.command({ ping: 1 });

    res.json({
      status: 'connected',
      database: db.databaseName
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);

    res.status(500).json({
      status: 'error',
      message: 'MongoDB connection failed'
    });
  }
});

// Gemini LLM JD Match & Resume Evaluation Endpoint
app.post('/api/evaluate-jd', async (req, res) => {
  try {
    const { jdText, jobTitle, companyName, candidates } = req.body;

    if (!jdText || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'Missing jdText or candidates array' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallback: true
      });
    }

    // Initialize GoogleGenAI SDK with modern pattern
    const ai = new GoogleGenAI();

    // Prepare concise profiles of candidates for the prompt
    const candidateSummaries = candidates.slice(0, 15).map((c: any) => ({
      usn: c.usn,
      name: c.fullName,
      branch: c.department,
      cgpa: c.cgpa,
      activeBacklogs: c.currentBacklogs,
      skills: c.skills?.map((s: any) => `${s.skillName} (Level ${s.rating}/5)`).join(', ') || 'N/A',
      internships: c.internships?.map((i: any) => `${i.company} (${i.role}, ${i.domain})`).join('; ') || 'None',
      projects: c.projects?.map((p: any) => `${p.title} [${p.techStack.join(', ')}]`).join('; ') || 'None',
      certifications: c.externalCertifications?.join(', ') || 'None'
    }));

    const prompt = `You are the chief AI Technical Recruiter for Global Academy of Technology (GAT) Placement Cell.
Evaluate the following Job Description (JD) from ${companyName || 'the employer'} for the role of "${jobTitle || 'Engineer'}" against the listed student candidates.

JOB DESCRIPTION:
"""
${jdText}
"""

CANDIDATES DATA:
${JSON.stringify(candidateSummaries, null, 2)}

TASK:
1. Carefully extract the core technical competencies, required experience, academic cutoff (CGPA), and prerequisites from the JD.
2. Evaluate each candidate's profile against this JD using deep semantic reasoning. Rate them on a scale of 0 to 100 based on:
   - Skill overlap & rating proficiency (40%)
   - Relevant hands-on projects & internships (30%)
   - Academic suitability (CGPA, backlogs, branch relevance) (20%)
   - Technical certifications & R&D work (10%)
3. Return a strictly valid JSON response without any markdown fences or preamble.
The JSON must follow this exact schema:
{
  "extractedRequirements": {
    "roleTitle": string,
    "keySkills": string[],
    "minCGPA": number,
    "eligibilitySummary": string
  },
  "evaluations": [
    {
      "usn": string,
      "name": string,
      "score": number, // integer 0 to 100
      "verdict": "STRONG_MATCH" | "GOOD_FIT" | "POTENTIAL" | "LOW_MATCH",
      "matchedSkills": string[],
      "missingSkills": string[],
      "qualitativeSummary": string,
      "recommendationForInterview": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      // In case text had codeblock fences
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      data: parsedData
    });
  } catch (error: any) {
    console.error('Error in /api/evaluate-jd:', error);
    return res.status(500).json({
      error: error.message || 'LLM evaluation failed',
      fallback: true
    });
  }
});


// Retry MongoDB connection in the background.
async function connectMongoDBInBackground() {
  while (true) {
    try {
      await connectMongoDB();
      console.log('MongoDB connected successfully!');
      break;
    } catch (error) {
      console.error(
        'MongoDB is temporarily unavailable. Retrying in 15 seconds...'
      );

      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
}

// Configure Vite middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GAT PPODAI Server running at http://localhost:${PORT}`);
  });

  // MongoDB must not block website startup.
  void connectMongoDBInBackground();
}

startServer();
