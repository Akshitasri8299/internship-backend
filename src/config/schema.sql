-- ============================================================
-- Internship & Recruitment Management Backend - Database Schema
-- PostgreSQL
-- ============================================================

CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE internship_status AS ENUM ('open', 'closed', 'draft');
CREATE TYPE application_status AS ENUM ('Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected');

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INTERNSHIPS TABLE
-- ============================================================
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    stipend INTEGER DEFAULT 0,
    location VARCHAR(150) NOT NULL,
    skills_required TEXT[] DEFAULT '{}',
    deadline DATE,
    status internship_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_internships_location ON internships(location);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_skills ON internships USING GIN(skills_required);

-- ============================================================
-- APPLICATIONS TABLE
-- ============================================================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    internship_id INTEGER NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url VARCHAR(500),
    status application_status NOT NULL DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(internship_id, candidate_id)
);

CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_internship ON applications(internship_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================================
-- TRIGGER: auto-update updated_at columns
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_internships
BEFORE UPDATE ON internships
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_applications
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
