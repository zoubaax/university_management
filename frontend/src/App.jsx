import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Guard';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import DepartmentsPage from './pages/DepartmentsPage';
import SpecialitiesPage from './pages/SpecialitiesPage';
import StaffPage from './pages/StaffPage';
import StudentsPage from './pages/StudentsPage';

const App = () => {
  return (
    <AuthProvider>
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

            {/* Role-Protected Feature Routes */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="specialities"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT']}>
                  <SpecialitiesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'SECRETARY']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
