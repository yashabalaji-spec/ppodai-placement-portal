
import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

import {
  BRANCHES,
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_COMPANIES,
  INITIAL_DRIVES
} from '../src/data/mockData';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required in the application environment.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

const CURRENT_BRANCH_CODES = new Set(BRANCHES.map(b => b.code));

async function insertRow(table: string, row: Record<string, any>) {
  const columns = Object.keys(row);
  const values = Object.values(row);
  const placeholders = columns.map((_, i) => `$${i + 1}`);

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT DO NOTHING
  `;

  await pool.query(sql, values);
}

function dateOnly(value?: string): string | null {
  if (!value) return null;
  return value.substring(0, 10);
}

function timeOnly(value?: string): string | null {
  if (!value) return null;

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return value;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

function timestamp(value?: string): string | null {
  if (!value) return null;

  const match = value.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!match) return value;

  const [, date, hourText, minute, periodText] = match;
  let hour = Number(hourText);
  const period = periodText.toUpperCase();

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${date} ${String(hour).padStart(2, '0')}:${minute}:00`;
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Refuse to seed a database that already contains data.
    const check = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM branches) +
        (SELECT COUNT(*) FROM users) +
        (SELECT COUNT(*) FROM students) +
        (SELECT COUNT(*) FROM companies) +
        (SELECT COUNT(*) FROM placement_drives) AS total
    `);

    if (Number(check.rows[0].total) > 0) {
      throw new Error(
        'Database already contains records. Seed stopped to protect existing data.'
      );
    }

    console.log('Starting PPODAI mock-data seed...');

    // 1. BRANCHES
    for (const branch of BRANCHES) {
      await client.query(
        `INSERT INTO branches
         (branch_code, branch_name, total_strength, hod_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [branch.code, branch.name, branch.totalStrength, branch.hod]
      );
    }
    console.log(`Inserted ${BRANCHES.length} branches`);

    // 2. USERS - hash passwords before inserting
    for (const user of INITIAL_USERS) {
      const passwordHash = await bcrypt.hash(user.password || 'student@2026', 10);

      // SPC and student Nikhil share a USN.
      // Keep SPC's login ID in special_id; leave its users.usn NULL.
      const userUsn =
        user.role === 'student' ? (user.usn || null) : null;

      await client.query(
        `INSERT INTO users
         (id, name, email, password_hash, role, special_id,
          department, designation, usn, company, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)
         ON CONFLICT DO NOTHING`,
        [
          user.id,
          user.name,
          user.email,
          passwordHash,
          user.role,
          user.specialId,
          user.department || null,
          user.designation || null,
          userUsn,
          user.company || null
        ]
      );
    }
    console.log(`Processed ${INITIAL_USERS.length} user accounts`);

    // 3. STUDENTS
    for (const s of INITIAL_STUDENTS) {
      const userId = `u_${s.usn}`;

      await client.query(
        `INSERT INTO students (
          usn, user_id, full_name, first_name, middle_name, last_name,
          pursuing_degree, department, branch_code, section, semester,
          batch_year, mobile_no, gender, date_of_birth, year_of_joining,
          type_of_entry, college_email, personal_email, placement_email,
          is_placement_mail_activated, pan_number, aadhar_number,
          blood_group, physically_challenged, father_name, father_mobile,
          father_occupation, mother_name, mother_mobile, mother_occupation,
          communication_address, permanent_address, native_place, state,
          pincode, interested_in_higher_studies, tenth_percentage, tenth_year,
          tenth_school, tenth_board, twelfth_percentage, twelfth_year,
          twelfth_college, twelfth_board, cgpa, current_backlogs,
          backlog_history, year_back, gap_before_degree_years,
          gap_in_degree_years, registered_for_placement_assistance,
          has_external_certifications, is_placed, is_locked
        )
        VALUES (
          ${Array.from({ length: 55 }, (_, i) => `$${i + 1}`).join(', ')}
        )
        ON CONFLICT DO NOTHING`,
        [
          s.usn, userId, s.fullName, s.firstName, s.middleName || null,
          s.lastName, s.pursuingDegree, s.department, s.department,
          s.section, s.semester, s.batchYear, s.mobileNo, s.gender,
          dateOnly(s.dateOfBirth), s.yearOfJoining, s.typeOfEntry,
          s.collegeEmail, s.personalEmailId, s.placementEmailId || null,
          s.isPlacementMailActivated, s.panNumber, s.aadharNumber,
          s.bloodGroup, s.physicallyChallenged, s.fatherName,
          s.fatherMobileNo, s.fatherOccupation, s.motherName,
          s.motherMobileNo, s.motherOccupation, s.communicationAddress,
          s.permanentAddress, s.nativePlace, s.state, s.pincode,
          s.interestedInHigherStudies, s.tenthPercentage,
          s.tenthPassingYear, s.tenthSchoolName, s.tenthBoardName,
          s.twelfthOrDiplomaPercentage, s.twelfthOrDiplomaPassingYear,
          s.twelfthOrDiplomaCollegeName, s.twelfthOrDiplomaBoardName,
          s.cgpa, s.currentBacklogs, s.backlogHistory, s.yearBack,
          s.gapBeforeDegreeYears, s.gapInDegreeYears,
          s.registeredForPlacementAssistance, s.hasExternalCertifications,
          s.isPlaced, s.isLocked || false
        ]
      );

      // Student skills
      for (const skill of s.skills) {
        await client.query(
          `INSERT INTO student_skills
           (student_usn, skill_name, category, rating)
           VALUES ($1,$2,$3,$4)`,
          [s.usn, skill.name, skill.category, skill.rating]
        );
      }

      // Student internships
      for (const internship of s.internships) {
        await client.query(
          `INSERT INTO student_internships
           (id, student_usn, company_name, domain, duration_months,
            start_date, end_date, description, is_verified)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            internship.id, s.usn, internship.companyName,
            internship.domain, internship.durationMonths,
            dateOnly(internship.startDate), dateOnly(internship.endDate),
            internship.description, internship.isVerified || false
          ]
        );
      }

      // Student projects
      for (const project of s.projects) {
        await client.query(
          `INSERT INTO student_projects
           (id, student_usn, title, domain, tech_stack, description, project_link)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            project.id, s.usn, project.title, project.domain,
            project.techStack, project.description, project.link || null
          ]
        );
      }

      // Student research and development
      for (const rnd of s.rndWorks) {
        await client.query(
          `INSERT INTO student_rnd
           (id, student_usn, type, title, journal_or_conference,
            year, status, doi_or_patent_no)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            rnd.id, s.usn, rnd.type, rnd.title,
            rnd.journalOrConference, rnd.year, rnd.status,
            rnd.doiOrPatentNo || null
          ]
        );
      }

      // Achievements
      for (const achievement of s.achievementsAcademic) {
        await client.query(
          `INSERT INTO student_achievements
           (student_usn, achievement_type, description)
           VALUES ($1,'academic',$2)`,
          [s.usn, achievement]
        );
      }

      for (const achievement of s.achievementsNonAcademic) {
        await client.query(
          `INSERT INTO student_achievements
           (student_usn, achievement_type, description)
           VALUES ($1,'non_academic',$2)`,
          [s.usn, achievement]
        );
      }

      // Hobbies
      for (const hobby of s.hobbiesAndInterests) {
        await client.query(
          `INSERT INTO student_hobbies (student_usn, hobby)
           VALUES ($1,$2)`,
          [s.usn, hobby]
        );
      }
    }
    console.log(`Inserted ${INITIAL_STUDENTS.length} students and their profiles`);

    // 4. COMPANIES AND JOB PROFILES
    for (const company of INITIAL_COMPANIES) {
      await client.query(
        `INSERT INTO companies
         (id, name, industry, website, contact_person, contact_email,
          contact_phone, tier, visited_year)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT DO NOTHING`,
        [
          company.id, company.name, company.industry, company.website,
          company.contactPerson, company.contactEmail, company.contactPhone,
          company.tier, company.visitedYear
        ]
      );

      for (const job of company.jobProfiles) {
        await client.query(
          `INSERT INTO company_job_profiles (company_id, job_title)
           VALUES ($1,$2)`,
          [company.id, job]
        );
      }
    }
    console.log(`Inserted ${INITIAL_COMPANIES.length} companies`);

    // 5. PLACEMENT DRIVES
    for (const drive of INITIAL_DRIVES) {
      await client.query(
        `INSERT INTO placement_drives (
          id, drive_code, company_id, role_title, ctc_lpa, min_cgpa,
          max_backlogs_allowed, drive_date, venue, status, job_description,
          meeting_type, teams_meeting_link, is_published, scheduled_by,
          registration_deadline, start_time, end_time
        )
        VALUES (
          ${Array.from({ length: 18 }, (_, i) => `$${i + 1}`).join(', ')}
        )
        ON CONFLICT DO NOTHING`,
        [
          drive.id, drive.driveCode, drive.companyId, drive.roleTitle,
          drive.ctcLPA, drive.minCGPA, drive.maxBacklogsAllowed,
          dateOnly(drive.driveDate), drive.venue, drive.status,
          drive.jobDescription || null, drive.meetingType || null,
          drive.teamsMeetingLink || null, drive.isPublished || false,
          drive.scheduledBy || null, timestamp(drive.registrationDeadline),
          timeOnly(drive.startTime), timeOnly(drive.endTime)
        ]
      );

      // Target branches - only current GAT branches
      for (const branchCode of drive.targetBranches) {
        if (CURRENT_BRANCH_CODES.has(branchCode)) {
          await client.query(
            `INSERT INTO drive_target_branches (drive_id, branch_code)
             VALUES ($1,$2)
             ON CONFLICT DO NOTHING`,
            [drive.id, branchCode]
          );
        }
      }

      // Required skills
      for (const skill of drive.requiredSkills || []) {
        await client.query(
          `INSERT INTO drive_required_skills (drive_id, skill_name)
           VALUES ($1,$2)`,
          [drive.id, skill]
        );
      }

      // Drive rounds
      for (const round of drive.rounds) {
        const roundDate = dateOnly(round.date);

        const result = await client.query(
          `INSERT INTO drive_rounds
           (drive_id, round_number, round_name, round_date, venue)
           VALUES ($1,$2,$3,$4,$5)
           RETURNING id`,
          [
            drive.id, round.roundNumber, round.roundName,
            roundDate, round.venue
          ]
        );

        const roundId = result.rows[0]?.id;

        // Only insert results for students in the current directory.
        for (const usn of round.qualifiedStudents) {
          if (INITIAL_STUDENTS.some(s => s.usn === usn)) {
            await client.query(
              `INSERT INTO round_results
               (round_id, student_usn, result)
               VALUES ($1,$2,'Qualified')
               ON CONFLICT DO NOTHING`,
              [roundId, usn]
            );
          }
        }
      }

      // Applications - preserve original frontend scenarios.
      // Insert only applications whose USNs exist in the current directory.
      for (const enrolled of drive.enrolledStudentsList || []) {
        if (INITIAL_STUDENTS.some(s => s.usn === enrolled.usn)) {
          await client.query(
            `INSERT INTO drive_applications
             (drive_id, student_usn, registered_at, application_status)
             VALUES ($1,$2,$3,$4)
             ON CONFLICT DO NOTHING`,
            [
              drive.id, enrolled.usn,
              timestamp(enrolled.registeredAt),
              enrolled.status
            ]
          );
        }
      }
    }
    console.log(`Inserted ${INITIAL_DRIVES.length} placement drives and related records`);

    // 6. STUDENT OFFERS
    const driveForCompany: Record<string, string> = {
      c2: 'd1',
      c4: 'd2',
      c6: 'd3',
      c11: 'd8'
    };

    for (const s of INITIAL_STUDENTS) {
      for (const offer of s.offers) {
        // L&T was previously labelled c8 in the mock offer.
        // Its correct company ID is c11.
        const companyId =
          offer.companyName.toLowerCase().includes('larsen')
            ? 'c11'
            : offer.companyId;

        await client.query(
          `INSERT INTO student_offers
           (id, student_usn, company_id, drive_id, package_lpa,
            role_title, offer_letter_date, tier, offer_status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT DO NOTHING`,
          [
            offer.id, s.usn, companyId,
            driveForCompany[companyId] || null,
            offer.packageLPA, offer.roleTitle,
            dateOnly(offer.offerLetterDate),
            offer.tier, offer.status
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('--------------------------------------');
    console.log('PPODAI SEED COMPLETED SUCCESSFULLY');
    console.log(`Branches: ${BRANCHES.length}`);
    console.log(`Users: ${INITIAL_USERS.length}`);
    console.log(`Students: ${INITIAL_STUDENTS.length}`);
    console.log(`Companies: ${INITIAL_COMPANIES.length}`);
    console.log(`Placement drives: ${INITIAL_DRIVES.length}`);
    console.log('--------------------------------------');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed. Changes were rolled back.');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
