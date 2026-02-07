# Enterprise React Architecture: Smart UPF

## 🏛️ Core Principles
This architecture is designed for **Scalability**, **Maintainability**, and **Developer Velocity**.

### 1. Feature-Based Folder Structure
Instead of grouping by "type" (all components together), we group by **"domain"**. This prevents folders from becoming dumping grounds.

```text
src/
├── app/              # Global configuration, routes, and providers
├── components/       # Cross-feature UI components (Buttons, Inputs, Modals)
├── config/           # Environment variables, constants
├── features/         # Modular domain logic
│   ├── auth/         # Login, Auth store, Auth service
│   ├── departments/  # Dept management, Services
│   └── students/     # Student enrollment, Academic logic
├── hooks/            # Global reusable hooks
├── layouts/          # Page wrappers (Dashboard, Auth Layout)
├── lib/              # Third-party library configs (Axios, Query Client)
├── providers/        # Context Providers (Auth, Notification)
└── utils/            # Helper functions (Formatters, Validators)
```

### 2. Service Layer (API)
Components never call Axios directly. They interact with **Services** that return typed data. This allows for:
- Easy mocking for tests.
- Single point of change if an endpoint changes.
- Separation of data fetching from UI concerns.

### 3. State Management
- **Auth/UI State**: Managed via `Zustand` or `Context API` for simplicity and performance.
- **Server State**: Use `TanStack Query` (React Query) for caching, synchronization, and optimistic updates.

---

## 🔐 Security & Access Control

### Role-Based Routing
Implemented via a declarative `ProtectedRoute` and `RoleGate` system.

1. **ProtectedRoute**: High-level guard that redirects to `/login` if no session exists.
2. **RoleGate**: Granular component that shows/hides UI elements based on specific roles or permissions.

### Authentication Flow
1. **Access Token (Memory/LocalStorage)**: Short-lived, used for requests.
2. **Refresh Token (HttpOnly Cookie)**: Long-lived, used to rotationally exchange for access tokens via interceptors.

## 🚀 Key Scalability Features
- **Centralized Validation**: Sharing Zod schemas between frontend and backend.
- **Lazy Loading**: Splitting feature bundles so users only download what they use.
- **Standardized Response Utility**: A `cn` (class-name) utility for clean Tailwind class merging.
