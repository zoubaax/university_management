import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Guard';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import DepartmentsPage from './pages/DepartmentsPage';
import SpecialitiesPage from './pages/SpecialitiesPage';
import StaffPage from './pages/StaffPage';
import StudentsPage from './pages/StudentsPage';
import AbsencesPage from './pages/AbsencesPage';
import ClassesPage from './pages/ClassesPage';
import ModulesPage from './pages/ModulesPage';
import SchedulesPage from './pages/SchedulesPage';
import RoomsPage from './pages/RoomsPage';
import AttendanceReportPage from './pages/AttendanceReportPage';
import CourseResourcesPage from './pages/CourseResourcesPage';
import GradesPage from './pages/GradesPage';
import ProfilePage from './pages/ProfilePage';
import CertificatesPage from './pages/CertificatesPage';

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
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
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']}>
                  <SpecialitiesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="classes"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR']}>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="modules"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR']}>
                  <ModulesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="rooms"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']}>
                  <RoomsPage />
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
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'SECRETARY', 'DIRECTOR_DEPARTMENT']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="absences"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH']}>
                  <AbsencesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="attendance-report"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']}>
                  <AttendanceReportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="schedule"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT']}>
                  <SchedulesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="resources"
              element={
                <ProtectedRoute allowedRoles={['PROFESSOR', 'STUDENT']}>
                  <CourseResourcesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="grades"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT']}>
                  <GradesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="rh-management"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <StaffPage
                    pageTitle="RH Management"
                    pageDescription="Manage Human Resources administrators and their access."
                    filterRoleName="RH"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="certificates"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN']}>
                  <CertificatesPage />
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
