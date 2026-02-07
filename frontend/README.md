# Smart UPF - Frontend

Premium School Management Interface built with React, Vite, and Tailwind CSS v4.

## 🚀 Key Features

- **Modern UI/UX**: Glassmorphism effects, smooth Framer Motion animations, and a professional "Inter" typography.
- **RBAC-Driven Navigation**: Sidebar menus and action buttons react dynamically to the user's role (RH, Responsable, etc.).
- **Smart State Management**: Using **Zustand** for global auth state and **Axios interceptors** for automatic JWT refresh handling.
- **Form Validation**: Type-safe forms powered by **React Hook Form** and **Zod**.
- **Responsive Design**: Fully functional on mobile, tablet, and desktop.

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (with `@theme` and `@apply`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State**: Zustand

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

## 📁 Architecture

- `src/api`: Axios instance with token refresh logic.
- `src/layouts`: Persistent wrappers like the `DashboardLayout`.
- `src/store`: Global state (auth, user preferences).
- `src/pages`: Feature-specific views (Departments, Students, etc.).
- `src/utils`: Styling helpers (`cn` utility) and type definitions.

## 🔑 Authentication Flow

1. User logs in → Access Token stored in `localStorage`, Refresh Token stored in `HttpOnly` Cookie (Backend).
2. Axios interceptor attaches Bearer token to every request.
3. If 401 (Expired) → Interceptor calls `/refresh`, gets new access token, and retries the original request seamlessly.
