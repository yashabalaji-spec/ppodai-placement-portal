
-- ==========================================
-- PPODAI PLACEMENT PORTAL
-- STEP 1: CORE DATABASE TABLES
-- ==========================================

-- 1. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS branches (
    branch_code VARCHAR(20) PRIMARY KEY,
    branch_name VARCHAR(150) NOT NULL,
    total_strength INTEGER DEFAULT 0,
    hod_name VARCHAR(150)
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL,
    special_id VARCHAR(100) UNIQUE,
    department VARCHAR(150),
    designation VARCHAR(150),
    usn VARCHAR(50) UNIQUE,
    company VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_user_role CHECK (
        role IN (
            'faculty_mgmt',
            'principal',
            'placement_dean',
            'hod',
            'pcc',
            'fpc',
            'spc',
            'student',
            'hr',
            'admin'
        )
    )
);

-- 2a. AUTHENTICATION TOKEN REVOCATIONS
CREATE TABLE IF NOT EXISTS auth_token_revocations (
    token_id VARCHAR(100) PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_token_revocations_expires_at
    ON auth_token_revocations (expires_at);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    usn VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE,

    full_name VARCHAR(150) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),

    pursuing_degree VARCHAR(100),
    department VARCHAR(150) NOT NULL,
    branch_code VARCHAR(20),
    section VARCHAR(5),
    semester INTEGER,
    batch_year INTEGER,

    mobile_no VARCHAR(20),
    gender VARCHAR(20),
    date_of_birth DATE,

    year_of_joining INTEGER,
    type_of_entry VARCHAR(30),

    college_email VARCHAR(255),
    personal_email VARCHAR(255),
    placement_email VARCHAR(255),
    is_placement_mail_activated BOOLEAN DEFAULT FALSE,

    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    blood_group VARCHAR(10),
    physically_challenged VARCHAR(5),

    father_name VARCHAR(150),
    father_mobile VARCHAR(20),
    father_occupation VARCHAR(100),

    mother_name VARCHAR(150),
    mother_mobile VARCHAR(20),
    mother_occupation VARCHAR(100),

    communication_address TEXT,
    permanent_address TEXT,
    native_place VARCHAR(150),
    state VARCHAR(100),
    pincode VARCHAR(10),

    interested_in_higher_studies VARCHAR(5),

    tenth_percentage NUMERIC(5,2),
    tenth_year INTEGER,
    tenth_school VARCHAR(200),
    tenth_board VARCHAR(100),

    twelfth_percentage NUMERIC(5,2),
    twelfth_year INTEGER,
    twelfth_college VARCHAR(200),
    twelfth_board VARCHAR(100),

    cgpa NUMERIC(4,2),
    current_backlogs INTEGER DEFAULT 0,
    backlog_history INTEGER DEFAULT 0,
    year_back VARCHAR(5),
    gap_before_degree_years NUMERIC(4,1) DEFAULT 0,
    gap_in_degree_years NUMERIC(4,1) DEFAULT 0,

    registered_for_placement_assistance VARCHAR(5),
    has_external_certifications VARCHAR(5),

    is_placed BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_student_branch
        FOREIGN KEY (branch_code) REFERENCES branches(branch_code),

    CONSTRAINT valid_section
        CHECK (section IS NULL OR section IN ('A', 'B', 'C'))
);

-- ==========================================
-- STEP 2: STUDENT RELATED TABLES
-- ==========================================

-- 4. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
    id SERIAL PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(30),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE
);

-- 5. STUDENT INTERNSHIPS
CREATE TABLE IF NOT EXISTS student_internships (
    id VARCHAR(100) PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    domain VARCHAR(100),
    duration_months INTEGER,
    start_date DATE,
    end_date DATE,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE
);

-- 6. STUDENT PROJECTS
CREATE TABLE IF NOT EXISTS student_projects (
    id VARCHAR(100) PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    domain VARCHAR(100),
    tech_stack TEXT[],
    description TEXT,
    project_link TEXT,

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE
);

-- 7. STUDENT RESEARCH AND DEVELOPMENT
CREATE TABLE IF NOT EXISTS student_rnd (
    id VARCHAR(100) PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    type VARCHAR(30),
    title VARCHAR(200) NOT NULL,
    journal_or_conference VARCHAR(200),
    year INTEGER,
    status VARCHAR(30),
    doi_or_patent_no VARCHAR(150),

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE
);

-- 8. STUDENT ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS student_achievements (
    id SERIAL PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    achievement_type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE
);

-- 9. STUDENT HOBBIES
CREATE TABLE IF NOT EXISTS student_hobbies (
    id SERIAL PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    hobby VARCHAR(150) NOT NULL,

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE
);

-- ==========================================
-- STEP 3: COMPANY AND PLACEMENT TABLES
-- ==========================================

-- 10. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(150),
    website TEXT,
    contact_person VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),
    tier VARCHAR(20),
    visited_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. COMPANY JOB PROFILES
CREATE TABLE IF NOT EXISTS company_job_profiles (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(100) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    description TEXT,

    FOREIGN KEY (company_id)
        REFERENCES companies(id) ON DELETE CASCADE
);

-- 12. PLACEMENT DRIVES
CREATE TABLE IF NOT EXISTS placement_drives (
    id VARCHAR(100) PRIMARY KEY,
    drive_code VARCHAR(100),
    company_id VARCHAR(100) NOT NULL,
    role_title VARCHAR(200) NOT NULL,
    ctc_lpa NUMERIC(8,2),
    min_cgpa NUMERIC(4,2),
    max_backlogs_allowed INTEGER DEFAULT 0,
    drive_date DATE,
    venue TEXT,
    status VARCHAR(30) DEFAULT 'Upcoming',
    job_description TEXT,
    meeting_type VARCHAR(50),
    teams_meeting_link TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    scheduled_by VARCHAR(100),
    registration_deadline TIMESTAMP,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id)
        REFERENCES companies(id)
);

-- 13. DRIVE TARGET BRANCHES
CREATE TABLE IF NOT EXISTS drive_target_branches (
    id SERIAL PRIMARY KEY,
    drive_id VARCHAR(100) NOT NULL,
    branch_code VARCHAR(20) NOT NULL,

    FOREIGN KEY (drive_id)
        REFERENCES placement_drives(id) ON DELETE CASCADE,

    FOREIGN KEY (branch_code)
        REFERENCES branches(branch_code),

    UNIQUE (drive_id, branch_code)
);

-- 14. DRIVE REQUIRED SKILLS
CREATE TABLE IF NOT EXISTS drive_required_skills (
    id SERIAL PRIMARY KEY,
    drive_id VARCHAR(100) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (drive_id)
        REFERENCES placement_drives(id) ON DELETE CASCADE
);

-- ==========================================
-- STEP 4: DRIVE REGISTRATION AND SELECTION
-- ==========================================

-- 15. DRIVE APPLICATIONS
CREATE TABLE IF NOT EXISTS drive_applications (
    id SERIAL PRIMARY KEY,
    drive_id VARCHAR(100) NOT NULL,
    student_usn VARCHAR(50) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_status VARCHAR(30) DEFAULT 'Registered',

    FOREIGN KEY (drive_id)
        REFERENCES placement_drives(id) ON DELETE CASCADE,

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE,

    UNIQUE (drive_id, student_usn)
);

-- 16. PLACEMENT DRIVE ROUNDS
CREATE TABLE IF NOT EXISTS drive_rounds (
    id SERIAL PRIMARY KEY,
    drive_id VARCHAR(100) NOT NULL,
    round_number INTEGER NOT NULL,
    round_name VARCHAR(150),
    round_date DATE,
    venue TEXT,

    FOREIGN KEY (drive_id)
        REFERENCES placement_drives(id) ON DELETE CASCADE,

    UNIQUE (drive_id, round_number)
);

-- 17. ROUND RESULTS
CREATE TABLE IF NOT EXISTS round_results (
    id SERIAL PRIMARY KEY,
    round_id INTEGER NOT NULL,
    student_usn VARCHAR(50) NOT NULL,
    result VARCHAR(30) NOT NULL,
    remarks TEXT,

    FOREIGN KEY (round_id)
        REFERENCES drive_rounds(id) ON DELETE CASCADE,

    FOREIGN KEY (student_usn)
        REFERENCES students(usn) ON DELETE CASCADE,

    UNIQUE (round_id, student_usn)
);

-- 18. STUDENT OFFERS
CREATE TABLE IF NOT EXISTS student_offers (
    id VARCHAR(100) PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    company_id VARCHAR(100) NOT NULL,
    drive_id VARCHAR(100),
    package_lpa NUMERIC(8,2),
    role_title VARCHAR(200),
    offer_letter_date DATE,
    tier VARCHAR(20),
    offer_status VARCHAR(30) DEFAULT 'offered',

    FOREIGN KEY (student_usn)
        REFERENCES students(usn),

    FOREIGN KEY (company_id)
        REFERENCES companies(id),

    FOREIGN KEY (drive_id)
        REFERENCES placement_drives(id)
);
-- 19. PROFILE EDIT REQUESTS
CREATE TABLE IF NOT EXISTS profile_edit_requests (
    id VARCHAR(100) PRIMARY KEY,
    usn VARCHAR(50) REFERENCES students(usn) ON DELETE CASCADE,
    student_name VARCHAR(150),
    department VARCHAR(100),
    reason TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    hod_remarks TEXT,
    reviewed_at TIMESTAMP
);

-- 20. SPC NOTICES
CREATE TABLE IF NOT EXISTS spc_notices (
    id BIGSERIAL PRIMARY KEY,
    sender_user_id VARCHAR(100) NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    drive_id VARCHAR(100)
        REFERENCES placement_drives(id) ON DELETE SET NULL,
    message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
    audience_type VARCHAR(20) NOT NULL
        CHECK (audience_type IN ('all', 'branches', 'semesters', 'students')),
    target_branches VARCHAR(20)[] NOT NULL DEFAULT '{}',
    target_semesters INTEGER[] NOT NULL DEFAULT '{}',
    target_usns VARCHAR(50)[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spc_notices_sender_created
    ON spc_notices (sender_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spc_notices_branches
    ON spc_notices USING GIN (target_branches);

CREATE INDEX IF NOT EXISTS idx_spc_notices_usns
    ON spc_notices USING GIN (target_usns);