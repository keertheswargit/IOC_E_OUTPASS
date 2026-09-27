-- ============================================================================
-- SCRUM 6B: E-Outpass Management System
-- Normalized Scalable Relational Database Schema
-- Entities: Hostels, Wardens, Securities, Students, Users, Outpass Requests, Status History
-- Target Database: PostgreSQL 14+ (Tested on PostgreSQL 18 / Neon PostgreSQL)
-- ============================================================================

-- 1. Create Hostels Table (Master Entity for Hostels)
CREATE TABLE IF NOT EXISTS hostels (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'HOSTEL-MAR', 'HOSTEL-KUR', 'HOSTEL-BHA', 'HOSTEL-CAU', 'HOSTEL-PON', 'HOSTEL-VAI'
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL CHECK (UPPER(gender) IN ('BOYS', 'GIRLS')),
    capacity INT DEFAULT 500,
    warden_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create Wardens Table (Master Entity for Wardens)
CREATE TABLE IF NOT EXISTS wardens (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'WARDEN-MAR', 'WARDEN-KUR', 'WARDEN-BHA', 'WARDEN-CAU', 'WARDEN-PON', 'WARDEN-VAI'
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hostel_id VARCHAR(50) REFERENCES hostels(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Circular FK link from hostels to wardens (safe if table already created)
DO $$
BEGIN
    ALTER TABLE hostels DROP CONSTRAINT IF EXISTS fk_hostel_warden;
    ALTER TABLE hostels ADD CONSTRAINT fk_hostel_warden FOREIGN KEY (warden_id) REFERENCES wardens(id) ON DELETE SET NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Create Securities Table (Master Entity for Gate Security & Policy Enforcement)
CREATE TABLE IF NOT EXISTS securities (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'SEC-BOYS', 'SEC-GIRLS'
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gate_name VARCHAR(100) NOT NULL,
    allowed_gender VARCHAR(10) NOT NULL CHECK (UPPER(allowed_gender) IN ('BOYS', 'GIRLS')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Create Students Table (Normalized Student Profile linked to Hostels via Foreign Key)
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY, -- 10-Digit Roll No (e.g. '2024506057')
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (UPPER(gender) IN ('BOYS', 'GIRLS')),
    department VARCHAR(100),
    year VARCHAR(20),
    hostel_id VARCHAR(50) NOT NULL REFERENCES hostels(id) ON DELETE RESTRICT,
    room_number VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    warden_id VARCHAR(50) REFERENCES wardens(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Create Users Table (Central Authentication & RBAC Table)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY, -- Student Roll No (e.g. '2024506057'), Warden ID ('WARDEN-MAR'), Security ID ('SEC-BOYS')
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT 'student123',
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (UPPER(role) IN ('STUDENT', 'WARDEN', 'SECURITY', 'ADMIN', 'GATE')),
    hostel_block VARCHAR(50),
    hostel_id VARCHAR(50) REFERENCES hostels(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    warden_id VARCHAR(50),
    gender VARCHAR(10) CHECK (gender IS NULL OR UPPER(gender) IN ('BOYS', 'GIRLS')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Create Outpass Requests Table (Master Entity for Digital Permissions)
CREATE TABLE IF NOT EXISTS outpass_requests (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'OP-2026-001'
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    student_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    hostel_block VARCHAR(50) NOT NULL,
    hostel_id VARCHAR(50) REFERENCES hostels(id) ON DELETE SET NULL,
    room_number VARCHAR(20) NOT NULL,
    outpass_type VARCHAR(30) NOT NULL CHECK (outpass_type IN ('DAY_PASS', 'WEEKEND_PASS', 'EMERGENCY_PASS', 'VACATION_PASS')),
    destination VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    expected_return_time TIMESTAMPTZ NOT NULL,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20) NOT NULL,
    parent_consent VARCHAR(30) DEFAULT 'PENDING_CALL' CHECK (parent_consent IN ('VERIFIED', 'PENDING_CALL', 'CONFIRMED_VIA_SMS', 'NOT_REQUIRED')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (UPPER(status) IN ('PENDING', 'APPROVED', 'REJECTED', 'CHECKED-OUT', 'COMPLETED', 'EXPIRED')),
    rejection_reason TEXT,
    warden_remarks TEXT,
    approved_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    warden_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    student_gender VARCHAR(10) CHECK (student_gender IS NULL OR UPPER(student_gender) IN ('BOYS', 'GIRLS')),
    outbound_code VARCHAR(10),
    inbound_code VARCHAR(10),
    departure_verified_at TIMESTAMPTZ,
    return_verified_at TIMESTAMPTZ,
    out_time TIMESTAMPTZ,
    in_time TIMESTAMPTZ,
    departure_verified_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    return_verified_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_return_after_departure CHECK (expected_return_time > departure_time)
);

-- 7. [SCRUM06B-F002-DB-001] Outpass Status History Table
CREATE TABLE IF NOT EXISTS outpass_status_history (
    id SERIAL PRIMARY KEY,
    outpass_id VARCHAR(50) NOT NULL REFERENCES outpass_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL CHECK (UPPER(new_status) IN ('PENDING', 'APPROVED', 'REJECTED', 'CHECKED-OUT', 'COMPLETED', 'EXPIRED')),
    changed_by VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    changed_by_role VARCHAR(20) NOT NULL CHECK (UPPER(changed_by_role) IN ('STUDENT', 'WARDEN', 'SECURITY', 'ADMIN', 'GATE')),
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks TEXT,
    rejection_reason TEXT,
    out_time TIMESTAMPTZ,
    in_time TIMESTAMPTZ
);

-- ============================================================================
-- IDEMPOTENT MIGRATIONS FOR EXISTING SCHEMAS
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS warden_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hostel_id VARCHAR(50) REFERENCES hostels(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

DO $$
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (UPPER(role) IN ('STUDENT', 'WARDEN', 'SECURITY', 'ADMIN', 'GATE'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE outpass_requests 
ADD COLUMN IF NOT EXISTS outbound_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS inbound_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS departure_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS return_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS out_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS in_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warden_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS hostel_id VARCHAR(50) REFERENCES hostels(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS student_gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS departure_verified_by VARCHAR(50) REFERENCES users(id),
ADD COLUMN IF NOT EXISTS return_verified_by VARCHAR(50) REFERENCES users(id);

ALTER TABLE outpass_status_history
ADD COLUMN IF NOT EXISTS out_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS in_time TIMESTAMPTZ;

DO $$
BEGIN
    ALTER TABLE outpass_status_history DROP CONSTRAINT IF EXISTS outpass_status_history_changed_by_role_check;
    ALTER TABLE outpass_status_history ADD CONSTRAINT outpass_status_history_changed_by_role_check 
        CHECK (UPPER(changed_by_role) IN ('STUDENT', 'WARDEN', 'SECURITY', 'ADMIN', 'GATE'));

    ALTER TABLE outpass_status_history DROP CONSTRAINT IF EXISTS outpass_status_history_new_status_check;
    ALTER TABLE outpass_status_history ADD CONSTRAINT outpass_status_history_new_status_check 
        CHECK (UPPER(new_status) IN ('PENDING', 'APPROVED', 'REJECTED', 'CHECKED-OUT', 'COMPLETED', 'EXPIRED'));

    ALTER TABLE outpass_requests DROP CONSTRAINT IF EXISTS outpass_requests_status_check;
    ALTER TABLE outpass_requests ADD CONSTRAINT outpass_requests_status_check 
        CHECK (UPPER(status) IN ('PENDING', 'APPROVED', 'REJECTED', 'CHECKED-OUT', 'COMPLETED', 'EXPIRED'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- HIGH-PERFORMANCE INDEXES FOR PRODUCTION SCALE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_hostels_gender ON hostels(gender);
CREATE INDEX IF NOT EXISTS idx_securities_allowed_gender ON securities(allowed_gender);
CREATE INDEX IF NOT EXISTS idx_students_hostel_id ON students(hostel_id);
CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender);
CREATE INDEX IF NOT EXISTS idx_students_warden_id ON students(warden_id);

CREATE INDEX IF NOT EXISTS idx_outpass_hostel_id ON outpass_requests(hostel_id);
CREATE INDEX IF NOT EXISTS idx_outpass_student_id ON outpass_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_outpass_warden_id ON outpass_requests(warden_id);
CREATE INDEX IF NOT EXISTS idx_outpass_status ON outpass_requests(status);
CREATE INDEX IF NOT EXISTS idx_outpass_outbound_code ON outpass_requests(outbound_code);
CREATE INDEX IF NOT EXISTS idx_outpass_inbound_code ON outpass_requests(inbound_code);
CREATE INDEX IF NOT EXISTS idx_outpass_out_time ON outpass_requests(out_time);
CREATE INDEX IF NOT EXISTS idx_outpass_in_time ON outpass_requests(in_time);
CREATE INDEX IF NOT EXISTS idx_outpass_departure_time ON outpass_requests(departure_time);
CREATE INDEX IF NOT EXISTS idx_outpass_expected_return_time ON outpass_requests(expected_return_time);

CREATE INDEX IF NOT EXISTS idx_status_history_outpass_id ON outpass_status_history(outpass_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON outpass_status_history(changed_at ASC);
CREATE INDEX IF NOT EXISTS idx_status_history_chronological ON outpass_status_history(outpass_id, changed_at ASC);

-- Alias view for team compatibility
CREATE OR REPLACE VIEW outpasses AS SELECT * FROM outpass_requests;
