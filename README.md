# 🎓 Smart UPF - AI-Powered Advanced University Management

### **A Hybrid Civil & Software Engineering Project: AI Integration meets Full-Stack Development**

Smart UPF is a state-of-the-art administrative and academic ecosystem. It represents a sophisticated blend of **Traditional Software Engineering (Full-Stack Dev)**, **Modern Artificial Intelligence (Generative AI & RAG)**, and **Cross-Platform Mobile Engineering**. The project is designed to bridge the gap between institutional management and intelligence-driven user experiences.

---

## 📱 The Mobile Experience (NEW)
The Smart UPF Mobile App brings the entire university ecosystem to the student's pocket with a premium, high-performance interface.

- **Premium Dark-Navy Aesthetic**: A modern UI built with **Expo & React Native**, featuring glassmorphism elements and smooth micro-animations.
- **Biometric-Ready Security**: Secure JWT-based authentication with persistence and instant role-based access.
- **Smart Dashboard**: Real-time visibility into GPA trends, absence alerts, pending tasks, and university club activities.
- **Interactive Drawer Navigation**: Seamless access to all campus services through a dynamic, high-fidelity sidebar.

---

## 🤖 The Intelligence Layer (AI Assistant)
Smart UPF isn't just a management tool; it's an intelligent partner that leverages **Large Language Models (LLMs)** to automate academic success.

- **RAG-Driven Assistant**: A "Retrieval-Augmented Generation" chatbot powered by **Google Gemini 2.5 Flash**. It analyzes real database records (Schedules, Grades, Finances) to provide human-like answers.
- **AI Cafeteria Ordering**: Order food and drinks directly through the chat. The AI parses your intent, checks the menu, and **automatically deducts from your digital wallet**.
- **AI Task Orchestrator**: The assistant can parse intent to perform actions, such as automatically creating database records (Tasks) based on chat conversations.

---

## ⚙️ Core Engineering Pillars

### 📊 System Intelligence Dashboard
The management experience transforms raw data into institutional insight through a high-performance analytics layer.
- **Dynamic Visualizations**: Real-time Recharts & Gifted Charts integration (Pie charts for student distribution, Bar charts for academic performance).
- **Live Institutional Metrics**: Instant visibility into total enrollment, staff counts, and real-time wallet balances.

### 📄 Document & Certificate Hub
Automated, secure document management system for official university paperwork.
- **Request Workflow**: Students can request Enrollment Certificates, Transcripts, and Student Cards with a single tap.
- **Status Tracking**: Real-time monitoring of administrative approval (**Pending** → **Approved** → **Ready**).
- **Digital Delivery**: Instant download of generated PDF certificates once prepared by the administration.

### 👥 University Clubs & Community
- **Interactive Club Hub**: Browse university clubs, view member counts, and send "Join" requests directly from the dashboard.
- **Presidential Suite**: Specialized management interface for authorized club leaders to manage members and events.

---

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Artificial Intelligence** | Google Gemini 2.5 Flash (LLM), RAG Architecture |
| **Mobile Engineering** | React Native, Expo, Lucide Icons, Gifted Charts |
| **Backend Development** | Node.js, Express.js, PostgreSQL (pg-promise/query) |
| **Frontend Engineering** | React 19, Vite, Tailwind CSS 4, Framer Motion |
| **Security & Auth** | JWT (Stateless Auth), BCrypt, RBAC Middleware |

---

## � Project Architecture

```bash
smart-upf/
├── mobile/               # Mobile Engineering: Expo & React Native
│   ├── app/              # Router: File-based navigation & Tab system
│   ├── src/              # Logic: Hook-driven state & API interop
│   └── assets/           # UI: Premium iconography & branding
├── frontend/             # Web Engineering: Component-Driven UI
│   ├── src/api/          # Dev: Service layer for API abstraction
│   └── src/pages/        # Intelligence: Data-rich web views
└── backend/              # Core Engineering: Scalable REST API
    ├── src/controllers/  # Logic: AI-integrations & Business rules
    ├── src/models/       # Data: Raw SQL schema & database interop
    └── src/routes/       # API: Layered endpoint definitions
```

---

## 🚦 Quick Start

1. **Backend**: `cd backend && npm install && npm run dev`
2. **Web**: `cd frontend && npm install && npm run dev`
3. **Mobile**: `cd mobile && npm install && npx expo start`

---

## ✨ Vision
Smart UPF represents the future of academic management—where **Human-Centric Development** meets **Machine Intelligence** to create a high-speed, transparent, and effortlessly efficient university environment.

---

Designed & Engineered with ❤️ by **Zoubaa Mohammed** for the **Modern University**.
