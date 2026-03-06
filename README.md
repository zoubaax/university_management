# 🎓 Smart UPF - AI-Powered Advanced University Management

### **A Hybrid Civil & Software Engineering Project: AI Integration meets Full-Stack Development**

Smart UPF is a state-of-the-art administrative and academic ecosystem. It represents a sophisticated blend of **Traditional Software Engineering (Full-Stack Dev)** and **Modern Artificial Intelligence (Generative AI & RAG)**. The project is designed to bridge the gap between institutional management and intelligence-driven user experiences.

---

## �️ Core Engineering Pillars

### 📊 System Intelligence Dashboard
The management experience transforms raw data into institutional insight through a high-performance analytics layer.
- **Dynamic Visualizations**: Real-time Recharts integration (Pie charts for student distribution, Bar charts for attendance & finance).
- **Live Institutional Metrics**: Instant visibility into total enrollment, staff counts, and real-time system activity.
- **Role-Centric Dashboard UI**: Tailored intelligence views for Professors (Course Planning), Students (Academic Pulse), and HR (Staff Management).

### ⚙️ Academic Engine
The core logic responsible for the heavy lifting of university operations.
- **Attendance Intelligence**: Real-time classroom presence recording with automated trend analysis and threshold warnings.
- **Grade Management**: High-precision grading system supporting multiple components (CC1, CC2, Exams) with automated GPA logic.
- **Document Hub**: Automated, secure generation of enrollment certificates and grade transcripts with digital verification readiness.
- **Smart Scheduling**: A conflict-aware session management engine for rooms and professors.

---

## 🤖 The Intelligence Layer (The "AI" Part)

Smart UPF isn't just a management tool; it's an intelligent partner that leverages **Large Language Models (LLMs)** to automate academic success.

### 🧠 Integrated AI Systems
- **RAG-Driven Assistant**: A "Retrieval-Augmented Generation" chatbot powered by **Google Gemini 2.5 Flash**. It analyzes real database records (Schedules, Grades, Finances) to provide human-like answers.
- **AI Task Orchestrator**: The assistant can parse intent to perform actions, such as automatically creating database records (Tasks) based on chat conversations.
- **Automated Knowledge Synthesis**: An AI-powered study engine that parses course PDFs (`pdf-parse`) and generates specialized quizzes to test student comprehension.

---

## 🛡️ The Engineering DNA (The "Dev" Core)

The project is built on a high-performance, scalable architecture designed to handle complex workflows with millisecond latency.

- **MVC Architecture**: A strictly organized Node.js/Express backend following the Model-View-Controller pattern.
- **Granular Permission Engine**: A custom-built, dynamic RBAC system where permissions are handled at the database level and reflected instantly in the UI.
- **Robust SQL Schema**: A normalized PostgreSQL database with complex relations between Users, Departments, Specialities, and Classes.
- **Premium UI/UX System**: A responsive React 19 frontend utilizing Tailwind CSS 4, Framer Motion for micro-interactions, and Glassmorphism design principles.

---

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Artificial Intelligence** | Google Gemini 2.5 Flash (LLM), RAG Architecture |
| **Backend Development** | Node.js, Express.js, PostgreSQL (pg-promise/query) |
| **Frontend Engineering** | React 19, Vite, Tailwind CSS 4, Framer Motion |
| **Data Visualization** | Recharts (Academic Performance & Presence Trends) |
| **Security & Auth** | JWT (Stateless Auth), BCrypt, Dynamic Permission Middleware |

---

## 🚀 Key Modules

### 👥 Student Life & Clubs Hub
- **Club Presidential Suite**: Specialized management interface for authorized club leaders.
- **Community Interaction**: Unified portal for campus organizations and student activities.

---

## 📂 Project Architecture

```bash
smart-upf/
├── frontend/             # Engineering: Component-Driven UI
│   ├── src/
│   │   ├── api/          # Dev: Service layer for API abstraction
│   │   ├── features/     # Dev: Logic-grouped modules (Roles, Finance, Clubs)
│   │   ├── layouts/      # UI: Premium Dashboard & Auth layouts
│   │   └── pages/        # Intelligence: Data-rich views
└── backend/              # Engineering: Scalable REST API
    ├── src/
    │   ├── controllers/  # Logic: AI-integrations & Business rules
    │   ├── models/       # Data: Raw SQL schema & database interop
    │   ├── routes/       # API: Layered endpoint definitions
    │   └── middlewares/  # Dev: Security, RBAC & AI-preprocessors
```

---

## 🚦 Getting Started (Dev Environment)

1. **Database**: Set up a PostgreSQL instance.
2. **AI Config**: Obtain a **Gemini API Key** from Google AI Studio.
3. **Backend Setup**:
   ```bash
   cd backend && npm install
   # Configure .env with DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY
   npm run dev
   ```
4. **Frontend Setup**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

---

## ✨ Vision
Smart UPF represents the future of academic management—where **Human-Centric Development** meets **Machine Intelligence** to create a high-speed, transparent, and effortlessly efficient university environment.

---

Designed & Engineered with ❤️ by **Zoubaa Mohammed** for the **Modern University**.
