-- ########################################################
-- School Management System - Database Schema
-- Architecture: PostgreSQL + UUID PKs + RBAC
-- ########################################################

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ########################################################
-- 1. ENUM DEFINITIONS
-- ########################################################

CREATE TYPE employee_category AS ENUM (
    'ADMINISTRATIVE',
    'PROFESSOR',
    'CLEANER',
    'SECURITY',
    'MAINTENANCE'
);

-- ########################################################
-- 2. UTILITY FUNCTIONS (FOR TIMESTAMPS)
-- ########################################################

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ########################################################
-- 3. TABLES DEFINITION
-- ########################################################

-- ROLES (Lookup Table)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DEPARTMENTS
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

-- SPECIALITIES
CREATE TABLE specialities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

-- USERS (Central Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL, -- Scoping for staff
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

-- EMPLOYEES
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL, -- Null if no login (Cleaners/Security)
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    type employee_category NOT NULL,
    hired_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

-- STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    speciality_id UUID NOT NULL REFERENCES specialities(id),
    registration_num VARCHAR(50) UNIQUE NOT NULL,
    birth_date DATE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

-- ########################################################
-- 4. INDEXES (FOR PERFORMANCE & FKs)
-- ########################################################

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id);

CREATE INDEX idx_specialities_department_id ON specialities(department_id);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_speciality_id ON students(speciality_id);
CREATE INDEX idx_students_reg_num ON students(registration_num);

-- ########################################################
-- 5. TRIGGERS (AUTOMATIC TIMESTAMPS)
-- ########################################################

CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_specialities_modtime BEFORE UPDATE ON specialities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employees_modtime BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_absences_modtime BEFORE UPDATE ON absences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ########################################################
-- 6. ABSENCES MANAGEMENT
-- ########################################################

CREATE TYPE absence_type AS ENUM (
    'SICK',
    'VACATION',
    'UNEXCUSED',
    'PAID_LEAVE',
    'OTHER'
);

CREATE TYPE absence_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'JUSTIFIED'
);

CREATE TABLE absences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type absence_type NOT NULL DEFAULT 'UNEXCUSED',
    reason TEXT,
    status absence_status NOT NULL DEFAULT 'PENDING',
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft Delete
);

CREATE INDEX idx_absences_employee_id ON absences(employee_id);
CREATE INDEX idx_absences_dates ON absences(start_date, end_date);

-- ########################################################
-- 6. SEED DATA (ROLES & SUPER ADMIN)
-- ########################################################

-- Seed Roles
INSERT INTO roles (name, description) VALUES 
('SUPER_ADMIN', 'Global system administrator with unrestricted access.'),
('RH', 'Human Resources - Management of all employees.'),
('RESPONSABLE_DEPARTMENT', 'Responsible for department-level academic oversight.'),
('DIRECTOR_DEPARTMENT', 'Administrative head of a specific department.'),
('SECRETARY', 'Departmental administrative support.'),
('PROFESSOR', 'Academic staff with access to courses and grades.'),
('STUDENT', 'Enrolled student with limited personal view access.');

-- Seed INITIAL SUPER ADMIN
-- Password is: Admin@123 (bcrypt hash: $2a$10$PkVqpkP6cHz9k/D4mNInA.S7gE/d7Dk0A3X1oX6HqY19i3v/4s/Oq)
INSERT INTO users (email, password_hash, role_id)
VALUES (
    'admin@smartupf.com', 
    '$2a$10$PkVqpkP6cHz9k/D4mNInA.S7gE/d7Dk0A3X1oX6HqY19i3v/4s/Oq', 
    (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')
);
