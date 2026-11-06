import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Key, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  CheckCircle, 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface DatabaseArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseArchitectureModal: React.FC<DatabaseArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'schema' | 'auth_rbac' | 'sql_ddl'>('roadmap');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copySql = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#0C2C47] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#97D3CD]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">Architecture & Database</h2>
              <p className="text-xs text-[#E4F2EA]">Schema Design & RBAC Roadmap</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-2 border-b border-[#97D3CD]/30 flex gap-2 overflow-x-auto no-scrollbar bg-[#F8FAF9] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'roadmap' ? 'border-[#0C2C47] text-[#0C2C47]' : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'schema' ? 'border-[#0C2C47] text-[#0C2C47]' : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
            }`}
          >
            Schema
          </button>
          <button
            onClick={() => setActiveTab('auth_rbac')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'auth_rbac' ? 'border-[#0C2C47] text-[#0C2C47]' : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
            }`}
          >
            Auth & RBAC
          </button>
          <button
            onClick={() => setActiveTab('sql_ddl')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'sql_ddl' ? 'border-[#0C2C47] text-[#0C2C47]' : 'border-transparent text-[#2D5652] hover:text-[#0C2C47]'
            }`}
          >
            SQL Script
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          
          {/* TAB 1: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  How to Proceed in this Project & Where to Start
                </h3>
                <p className="text-slate-500 mt-1">
                  Step-by-step phased engineering guide for the GAT PPODAI placement portal.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                    <h4>Phase 1: Database Setup & Schema Provisioning (PostgreSQL)</h4>
                  </div>
                  <p className="text-slate-600 mt-2">
                    Start by setting up PostgreSQL database (<code className="font-mono text-indigo-800">placement_portal</code>). Run migrations to create the core relational tables: <code className="font-mono text-indigo-800">users</code>, <code className="font-mono text-indigo-800">students</code> (holding all 43+ fields), <code className="font-mono text-indigo-800">student_skills</code> (with 1-5 ratings), <code className="font-mono text-indigo-800">companies</code>, <code className="font-mono text-indigo-800">placement_drives</code>, and <code className="font-mono text-indigo-800">role_permissions</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                    <h4>Phase 2: User Authentication & 2-Tier RBAC Gating</h4>
                  </div>
                  <p className="text-slate-600 mt-2">
                    Build <code className="font-mono text-indigo-800">POST /api/auth/login</code> with bcrypt passwords and JSON Web Tokens. Implement the two crucial middlewares:
                    <br />
                    • <code className="font-mono text-slate-800">requirePermission(feature)</code>: Checks if role has access in <code className="font-mono">role_permissions</code> table.
                    <br />
                    • <code className="font-mono text-slate-800">deptScope()</code>: Injects SQL filters (<code className="font-mono text-indigo-800">own_dept</code> for HOD/FPC, <code className="font-mono text-indigo-800">limited</code> for SPC, <code className="font-mono text-indigo-800">own</code> for Student).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
                    <h4>Phase 3: Student Profile & Automated Resume PDF Engine</h4>
                  </div>
                  <p className="text-slate-600 mt-2">
                    Implement student CRUD. Verify authorization so students can only edit their own profile. Connect the client-side/server-side PDF generator to instantly output official GAT-formatted resumes.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">4</span>
                    <h4>Phase 4: HR Job Description (JD) Matcher & Shortlist PDF</h4>
                  </div>
                  <p className="text-slate-600 mt-2">
                    Build the HR JD parser that extracts required skills, CGPA cutoff, and backlogs. Rank students using the skill match scoring formula and generate branded downloadable candidate shortlist reports.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">5</span>
                    <h4>Phase 5: Faculty, HOD & Coordination Dashboards</h4>
                  </div>
                  <p className="text-slate-600 mt-2">
                    Deploy role-specific visualization dashboards: Multi-year department comparisons for Management & Principal, section-wise graphs for 15 branch HODs, drive scheduling and offer tracking for PCC/FPC/SPC.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA DETAILS */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">PostgreSQL Relational Schema Architecture</h3>
                <p className="text-slate-500 mt-0.5">Normalized Entity Relationship model designed for the placement platform</p>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-indigo-700 text-xs font-bold block mb-1">1. students (Primary Student Records)</strong>
                  <span className="text-slate-600">
                    usn (PK), full_name, first_name, middle_name, last_name, pursuing_degree, department (15 branches), section (A/B/C), batch_year, mobile_no, gender, dob, year_of_joining, type_of_entry, placement_email, personal_email, pan_number, aadhar_number, father_name, father_mobile, father_occupation, mother_name, mother_mobile, mother_occupation, communication_address, permanent_address, native_place, state, pincode, interested_in_higher_studies, tenth_percentage, tenth_passing_year, tenth_school_name, tenth_board_name, twelfth_percentage, twelfth_passing_year, twelfth_college_name, twelfth_board_name, cgpa, current_backlogs, backlog_history, year_back, gap_before_degree, gap_in_degree, registered_for_placement, has_external_certifications, is_placed
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-indigo-700 text-xs font-bold block mb-1">2. student_skills (Ratings 1 to 5)</strong>
                  <span className="text-slate-600">
                    id (PK), usn (FK), skill_name, category (programming, ai_tools, web, cloud, database), rating (INT 1-5)
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-indigo-700 text-xs font-bold block mb-1">3. student_internships & projects</strong>
                  <span className="text-slate-600">
                    id (PK), usn (FK), company_name, domain, duration_months, start_date, end_date, description, is_verified
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-indigo-700 text-xs font-bold block mb-1">4. student_rnd (Publications & Patents)</strong>
                  <span className="text-slate-600">
                    id (PK), usn (FK), type (publication, presentation, patent), title, journal_conference, year, status, doi_patent_no
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-indigo-700 text-xs font-bold block mb-1">5. placement_drives & placements (Offer Records)</strong>
                  <span className="text-slate-600">
                    drives: id (PK), drive_code, company_id (FK), role_title, ctc_lpa, min_cgpa, max_backlogs, drive_date, venue, status
                    <br />
                    placements: id (PK), usn (FK), company_id (FK), package_lpa, tier, offer_date, status
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-indigo-700 text-xs font-bold block mb-1">6. users & role_permissions (RBAC)</strong>
                  <span className="text-slate-600">
                    users: id (PK), email, password_hash, role, department, usn, designation, is_active
                    <br />
                    role_permissions: id (PK), role, feature, scope (full, own_dept, relevant, limited, own)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTH & RBAC */}
          {activeTab === 'auth_rbac' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authentication & Scoping Middleware Design</h3>
                <p className="text-slate-500 mt-0.5">JWT token issuance and query scoping logic</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 font-mono text-[11px]">
                <div>
                  <span className="text-indigo-700 font-bold block mb-1">// Middleware: requirePermission</span>
                  <pre className="text-slate-700 bg-white p-3 rounded border border-slate-200 overflow-x-auto">
{`const requirePermission = (feature) => async (req, res, next) => {
  const role = req.user.role;
  const perm = await RolePermission.findOne({ where: { role, feature } });
  if (!perm) return res.status(403).json({ error: 'Permission denied for this role' });
  req.permissionScope = perm.scope; // 'full' | 'own_dept' | 'relevant' | 'limited' | 'own'
  next();
};`}
                  </pre>
                </div>

                <div>
                  <span className="text-indigo-700 font-bold block mb-1">// Middleware: deptScope</span>
                  <pre className="text-slate-700 bg-white p-3 rounded border border-slate-200 overflow-x-auto">
{`const applyDeptScope = (req, whereClause) => {
  if (req.permissionScope === 'own_dept') {
    whereClause.department = req.user.department; // HOD & FPC
  } else if (req.permissionScope === 'own') {
    whereClause.usn = req.user.usn; // Student only sees own data
  }
  return whereClause;
};`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SQL DDL */}
          {activeTab === 'sql_ddl' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">PostgreSQL DDL Migration Script</h3>
                  <p className="text-slate-500 mt-0.5">Executable in pgAdmin, psql CLI, or Sequelize migration</p>
                </div>
                <button
                  onClick={copySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[50vh] leading-relaxed">
                {POSTGRESQL_DDL_SCRIPT}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>GAT PPODAI: Engineering Database Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

const POSTGRESQL_DDL_SCRIPT = `-- ========================================================
-- Placement portal / GAT PPODAI - PostgreSQL Schema DDL
-- Compatible with PostgreSQL 13+ and Sequelize ORM
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- faculty_mgmt, principal, placement_dean, hod, pcc, fpc, spc, student, hr, admin
    department VARCHAR(50),     -- e.g. CSE, ECE, ISE (for HOD, FPC, SPC)
    usn VARCHAR(20) UNIQUE,     -- linked to student record
    designation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Role Permissions (RBAC-as-data)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    feature VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL, -- 'full', 'own_dept', 'relevant', 'limited', 'own'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, feature)
);

-- 3. Students Table (43+ Fields mapped strictly from prompt & GAT portal)
CREATE TABLE students (
    usn VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    pursuing_degree VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    section CHAR(1) NOT NULL DEFAULT 'A',
    batch_year INT NOT NULL DEFAULT 2026,
    mobile_no VARCHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    year_of_joining INT NOT NULL,
    type_of_entry VARCHAR(50) NOT NULL,
    placement_email_id VARCHAR(150) UNIQUE NOT NULL,
    personal_email_id VARCHAR(150) NOT NULL,
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(30),
    father_name VARCHAR(150),
    father_mobile_no VARCHAR(20),
    father_occupation VARCHAR(100),
    mother_name VARCHAR(150),
    mother_mobile_no VARCHAR(20),
    mother_occupation VARCHAR(100),
    communication_address TEXT,
    permanent_address TEXT,
    native_place VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    interested_in_higher_studies VARCHAR(10) DEFAULT 'No',
    tenth_percentage DECIMAL(5,2) NOT NULL,
    tenth_passing_year INT NOT NULL,
    tenth_school_name VARCHAR(200),
    tenth_board_name VARCHAR(100),
    twelfth_or_diploma_percentage DECIMAL(5,2) NOT NULL,
    twelfth_or_diploma_passing_year INT NOT NULL,
    twelfth_or_diploma_college_name VARCHAR(200),
    twelfth_or_diploma_board_name VARCHAR(100),
    cgpa DECIMAL(4,2) NOT NULL,
    current_backlogs INT DEFAULT 0,
    backlog_history INT DEFAULT 0,
    year_back VARCHAR(10) DEFAULT 'No',
    gap_before_degree_years INT DEFAULT 0,
    gap_in_degree_years INT DEFAULT 0,
    registered_for_placement VARCHAR(10) DEFAULT 'Yes',
    has_external_certifications VARCHAR(10) DEFAULT 'No',
    is_placed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Student Skills (Rating 1 to 5)
CREATE TABLE student_skills (
    id SERIAL PRIMARY KEY,
    usn VARCHAR(20) REFERENCES students(usn) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- programming, ai_tools, web, cloud, database
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Student Internships
CREATE TABLE student_internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usn VARCHAR(20) REFERENCES students(usn) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE
);

-- 6. Student R&D Works (Publications & Patents)
CREATE TABLE student_rnd (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usn VARCHAR(20) REFERENCES students(usn) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- publication, presentation, patent
    title VARCHAR(255) NOT NULL,
    journal_conference VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    doi_patent_no VARCHAR(100)
);

-- 7. Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(200),
    contact_person VARCHAR(100),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(30),
    tier VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Placement Drives
CREATE TABLE placement_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_code VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id),
    role_title VARCHAR(150) NOT NULL,
    ctc_lpa DECIMAL(5,2) NOT NULL,
    min_cgpa DECIMAL(4,2) DEFAULT 7.0,
    max_backlogs_allowed INT DEFAULT 0,
    drive_date DATE NOT NULL,
    venue VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'Upcoming',
    target_branches JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Placements / Offers (Supports Multiple Offers with Highest Package Highlighting)
CREATE TABLE placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usn VARCHAR(20) REFERENCES students(usn) ON DELETE CASCADE,
    drive_id UUID REFERENCES placement_drives(id),
    company_name VARCHAR(150) NOT NULL,
    package_lpa DECIMAL(5,2) NOT NULL,
    role_title VARCHAR(150) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    offer_letter_date DATE,
    status VARCHAR(50) DEFAULT 'offered', -- offered, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Fast Scoping & Searching
CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_skills_usn ON student_skills(usn);
CREATE INDEX idx_placements_usn ON placements(usn);
`;
