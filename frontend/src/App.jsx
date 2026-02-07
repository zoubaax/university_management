import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import DepartmentsPage from './pages/DepartmentsPage';
import SpecialitiesPage from './pages/SpecialitiesPage';
import StaffPage from './pages/StaffPage';
import StudentsPage from './pages/StudentsPage';
import useAuthStore from './store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, getMe } = useAuthStore();

  useEffect(() => {
    getMe();
  }, [getMe]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="specialities" element={<SpecialitiesPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="students" element={<StudentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
