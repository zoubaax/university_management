# 🎓 Smart UPF - Advanced University Management System

**Intelligence-Driven Administrative & Academic Ecosystem**

Smart UPF is a modern, high-performance university management platform designed to streamline administrative workflows, enhance academic transparency, and provide real-time institutional intelligence. Built for scale, it handles everything from dynamic role-based permissions to real-time student performance analytics.

---

## 🚀 Key Systems

### 🛡️ Dynamic RBAC (Role-Based Access Control)
Beyond simple roles, Smart UPF features a granular permission engine.
- **Dynamic Sidebar**: Navigation links appear/disappear instantly based on database permissions.
- **Security Middleware**: Backend protection verifies dynamic permissions for every API request.
- **Role Management**: A dedicated UI for Super Admins to toggle capabilities for staff and students.

### 📊 System Intelligence Dashboard
The Super Admin dashboard transforms raw data into institutional insight.
- **Interactive Charts**: Real-time Pie charts for student distribution and Bar charts for attendance trends.
- **Live Metrics**: Instant visibility into total enrollment, staff counts, and system activity.
- **Role-Specific Views**: Tailored experiences for Professors (Course Planning), Students (Academic Records), and HR (Staff Management).

### 📚 Academic Engine
- **Attendance Tracking**: Real-time classroom presence recording with automated trend analysis.
- **Grade Management**: Multi-component grading (CC1, CC2, Exams) with automated GPA calculation.
- **Document Hub**: Automated certificate requests and course material distribution.
- **Smart Scheduling**: Conflict-aware room and session management.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion, Recharts, Lucide React |
| **Backend** | Node.js, Express.js, PostgreSQL |
| **Security** | JWT (JSON Web Tokens), BCrypt, Dynamic RBAC Middleware |
| **State** | React Context API, Zustand |

---

## 📂 Project Structure

```bash
smart-upf/
├── frontend/             # React application (Vite-powered)
│   ├── src/
│   │   ├── api/          # Centralized service layer
│   │   ├── features/     # Logic-grouped components (Roles, Auth)
│   │   ├── layouts/      # Dashboard & Auth layouts
│   │   └── pages/        # Views (Dashboard, Students, Roles)
└── backend/              # Express API (MVC Architecture)
    ├── src/
    │   ├── controllers/  # Business logic
    │   ├── models/       # Database schemas & queries
    │   ├── routes/       # API endpoint definitions
    │   └── middlewares/  # Security, RBAC & File Uploads
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env with DATABASE_URL and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Role-Based Access Guide
- **Super Admin**: System-wide control, permissions engine, and intelligence dashboard.
- **Responsable Department**: Academic oversight, scheduling, and student management.
- **RH (Human Resources)**: Specialized staff management and department logistics.
- **Professor**: Presence recording, grade input, and material uploads.
- **Student**: Grade tracking, material downloads, and certificate requests.

---

## 🌟 Vision
Smart UPF aims to replace legacy administrative systems with a "Speed of Thought" interface that empowers university leaders with data and students with transparency.

---

Designed with ❤️ for the **University Management** sector.
