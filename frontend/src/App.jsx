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
import StudentAbsencesPage from './pages/StudentAbsencesPage';
import ClassesPage from './pages/ClassesPage';
import ModulesPage from './pages/ModulesPage';
import SchedulesPage from './pages/SchedulesPage';
import RoomsPage from './pages/RoomsPage';
import AttendanceReportPage from './pages/AttendanceReportPage';
import CourseResourcesPage from './pages/CourseResourcesPage';
import GradesPage from './pages/GradesPage';
import ProfilePage from './pages/ProfilePage';
import CertificatesPage from './pages/CertificatesPage';
import MessagesPage from './pages/MessagesPage';
import RolesPage from './pages/RolesPage';
import TaskCenterPage from './pages/TaskCenterPage';
import VerificationPage from './pages/VerificationPage';
import FinancePage from './pages/FinancePage';
import PayrollPage from './pages/PayrollPage';
import StudyHistoryPage from './pages/StudyHistoryPage';
import ClubsPage from './pages/ClubsPage';
import ClubManagementPage from './pages/ClubManagementPage';
import CafeteriaPage from './pages/CafeteriaPage';
import CafeteriaManagementPage from './pages/CafeteriaManagementPage';

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Route for Document Verification */}
          <Route path="/verify/:code" element={<VerificationPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />

            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'FINANCIER']} allowedPermissions={['manage_departments']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="specialities"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER']} allowedPermissions={['manage_specialities']}>
                  <SpecialitiesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="classes"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']} allowedPermissions={['manage_classes']}>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="modules"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']} allowedPermissions={['manage_modules']}>
                  <ModulesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="rooms"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']} allowedPermissions={['manage_rooms']}>
                  <RoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH']} allowedPermissions={['manage_staff']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'SECRETARY', 'DIRECTOR_DEPARTMENT']} allowedPermissions={['manage_students']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="absences"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH']} allowedPermissions={['manage_absences']}>
                  <AbsencesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="student-absences"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']} allowedPermissions={['manage_student_absences']}>
                  <StudentAbsencesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="attendance-report"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT']} allowedPermissions={['manage_system']}>
                  <AttendanceReportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="schedule"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT']} allowedPermissions={['manage_schedules']}>
                  <SchedulesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="resources"
              element={
                <ProtectedRoute allowedRoles={['PROFESSOR', 'STUDENT']} allowedPermissions={['upload_resources']}>
                  <CourseResourcesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="grades"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT']} allowedPermissions={['manage_grades']}>
                  <GradesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="rh-management"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']} allowedPermissions={['manage_system']}>
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
                <ProtectedRoute allowedRoles={['STUDENT', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN']} allowedPermissions={['manage_certificates', 'request_certificate']}>
                  <CertificatesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="roles"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']} allowedPermissions={['manage_roles']}>
                  <RolesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="finance"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCIER']} allowedPermissions={['manage_finance']}>
                  <FinancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="payroll"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCIER']} allowedPermissions={['manage_finance']}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="program-pricing"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCIER']} allowedPermissions={['manage_finance']}>
                  <FinancePage defaultTab="pricing" />
                </ProtectedRoute>
              }
            />

            <Route
              path="study-history"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudyHistoryPage />
                </ProtectedRoute>
              }
            />
            {/* Clubs Route */}
            <Route
              path="clubs"
              element={
                <ProtectedRoute
                  allowedRoles={['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SECRETARY', 'FINANCIER', 'CLUB_PRESIDENT']}
                  allowedPermissions={['manage_clubs']}
                >
                  <ClubsPage />
                </ProtectedRoute>
              }
            />
            {/* Club President Management Route */}
            <Route
              path="my-club"
              element={
                <ProtectedRoute
                  allowedRoles={['CLUB_PRESIDENT']}
                  allowedPermissions={['manage_clubs']}
                >
                  <ClubManagementPage />
                </ProtectedRoute>
              }
            />
            {/* Cafeteria Routes */}
            <Route
              path="cafeteria"
              element={
                <ProtectedRoute
                  allowedRoles={['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SECRETARY', 'FINANCIER']}
                >
                  <CafeteriaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="cafeteria-management"
              element={
                <ProtectedRoute
                  allowedRoles={['SUPER_ADMIN', 'CAFETERIA_STAFF', 'DIRECTOR_DEPARTMENT']}
                  allowedPermissions={['manage_cafeteria']}
                >
                  <CafeteriaManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="tasks" element={<TaskCenterPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
