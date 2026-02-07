# School Management System - Database Design

Designed by: Senior Database Architect
Target: PostgreSQL

## 1. Entity Relationship Diagram (ERD) Description

The architecture follows a modular approach to ensure scalability and strict Role-Based Access Control (RBAC).

### Core Entities:
- **Roles**: Defines the access levels (SUPER_ADMIN, RH, etc.).
- **Departments**: The primary organizational unit (e.g., Science, Arts).
- **Specialities**: Sub-units within departments (e.g., Computer Science, Biology).
- **Users**: Central authentication table. Includes a nullable `department_id` to link staff to their respective departments.
- **Employees**: Personal information for all staff members. 
    - *Constraint*: Only employees with management/academic roles have a linked `user_id`. Cleaners and Security staff exist here but have `user_id = NULL`.
- **Students**: Academic information. Linked to a `Speciality` and a `User` account.

### Key Relationships:
- **Department 1:N Speciality**: One department can house multiple specialities.
- **Speciality 1:N Student**: One student belongs to exactly one speciality.
- **Department 1:N User**: Directors, Professors, and Secretaries are assigned to a specific department.
- **User 1:1 Profile (Employee/Student)**: Every login account maps to a physical person.

---

## 2. Normalized Tables (3NF)

### Tables Schema

#### `roles`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| id | SERIAL | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |

#### `departments`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| id | SERIAL | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| description | TEXT | |

#### `specialities`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| id | SERIAL | PK |
| department_id | INT | FK -> departments(id) |
| name | VARCHAR(100) | NOT NULL |

#### `users`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| role_id | INT | FK -> roles(id) |
| department_id | INT | FK -> departments(id), NULLABLE |
| is_active | BOOLEAN | DEFAULT TRUE |

#### `employees`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| id | SERIAL | PK |
| user_id | UUID | FK -> users(id), NULLABLE |
| department_id | INT | FK -> departments(id) |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| employee_type | VARCHAR(50) | (e.g., 'CLEANER', 'SECURITY', 'PROFESSOR') |

#### `students`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| id | SERIAL | PK |
| user_id | UUID | FK -> users(id), NOT NULL |
| speciality_id | INT | FK -> specialities(id) |
| registration_num | VARCHAR(20) | UNIQUE, NOT NULL |

---

## 3. SQL Implementation (PostgreSQL)

```sql
-- CREATE EXTENSION FOR UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES 
('SUPER_ADMIN'), ('RH'), ('RESPONSABLE_DEPARTMENT'), 
('DIRECTOR_DEPARTMENT'), ('SECRETARY'), ('PROFESSOR'), ('STUDENT');

-- DEPARTMENTS
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- SPECIALITIES
CREATE TABLE specialities (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

-- USERS (Central Login)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(id),
    department_id INT REFERENCES departments(id), -- For staff belonging to a dept
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPLOYEES (Inclusive of staff without login)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for Cleaners/Security
    department_id INT REFERENCES departments(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    employee_type VARCHAR(50) NOT NULL, -- 'PROFESSOR', 'CLEANER', etc.
    hired_at DATE DEFAULT CURRENT_DATE
);

-- STUDENTS
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    speciality_id INT REFERENCES specialities(id),
    registration_num VARCHAR(20) UNIQUE NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE
);
```

---

## 4. Role Enforcement (Application Level)

To enforce security at the application level (e.g., Node.js/Express), we implement a multi-layered approach:

### A. Authentication Middleware (JWT)
The JWT contains the `user_id`, `role`, and `department_id`.

### B. Authorization Middleware (RBAC)
```javascript
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied" });
        }
        next();
    };
};
```

### C. Data Scoping (Department-Level Security)
For roles like `DIRECTOR_DEPARTMENT` or `SECRETARY`, the query must always include a filter for their department:

```javascript
// Example: Fetching students in a department
const getStudents = async (req, res) => {
    let query = "SELECT * FROM students s JOIN specialities sp ON s.speciality_id = sp.id";
    
    // Scoping for Departmental Roles
    if (['DIRECTOR_DEPARTMENT', 'SECRETARY'].includes(req.user.role)) {
        query += " WHERE sp.department_id = $1";
        const results = await db.query(query, [req.user.department_id]);
    }
    // ... rest of logic
}
```

### D. Special Rules Enforcement
- **Cleaners/Security**: The registration API for employees will exclude `user_id` generation if `employee_type` belongs to these categories, effectively preventing login.
- **RH**: Can access all `employees` records but might be restricted from `student` academic grades.
- **SUPER_ADMIN**: Bypasses all `department_id` filters in SQL queries.
