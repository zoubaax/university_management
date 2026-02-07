# Smart UPF - School Management System Backend

Professional REST API for managing school departments, faculty, staff, and students. Built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **RBAC (Role-Based Access Control)**: Strict hierarchy (SUPER_ADMIN, RH, Responsable, etc.)
- **Security**: JWT Access/Refresh tokens, bcrypt hashing, Helmet, Rate limiting, XSS protection.
- **MVC Architecture**: Modular services, controllers, and models.
- **Database**: PostgreSQL with UUIDs and Soft Deletes.
- **Validation**: Strict input validation using Zod.
- **Logging**: Production-grade logging with Winston.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (pg)
- **Security**: JWT, BcryptJS, Helmet, CORS, HPP, XSS-Clean
- **Validation**: Zod
- **Logging**: Winston

## 📦 Installation

1. **Clone & Install**:
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**:
   Execute the `schema.sql` script in your PostgreSQL instance.

3. **Environment**:
   Copy `.env.example` to `.env` and fill in your credentials.

4. **Run**:
   ```bash
   npm run dev
   ```

## 🔐 API Documentation (V1)

### Authentication
- `POST /api/v1/auth/login` - Login & receive tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current profile (Protected)
- `GET /api/v1/auth/logout` - Clear session

### Departments (RH only)
- `GET /api/v1/departments` - List all
- `POST /api/v1/departments` - Create new
- `PUT /api/v1/departments/:id` - Update
- `DELETE /api/v1/departments/:id` - Soft delete

### Specialities (Responsable Dept only)
- `GET /api/v1/specialities` - List all
- `POST /api/v1/specialities` - Create (Isolated by department)

### Staff & Students
- `POST /api/v1/employees` - Manage staff/professors (RH only)
- `POST /api/v1/students` - Enroll students (Responsable Dept only)

## 📁 Project Structure

```text
src/
├── config/       # Database pool config
├── controllers/  # Request handlers
├── middlewares/  # Security, Auth, RBAC, Validation
├── models/       # DB Queries (PostgreSQL)
├── routes/       # Endpoint definitions
├── services/     # Business logic
├── utils/        # Helpers, Schemas, Logger
└── app.js        # Express app configuration
```

## 📜 Role Privileges

- **SUPER_ADMIN**: Can create RH accounts.
- **RH**: Manages Departments, Professors, and physical staff (Cleaners/Security).
- **RESPONSABLE_DEPARTMENT**: Manages Specialities and Students within their department.
- **STUDENT/PROFESSOR**: Can view their own data (to be expanded).
