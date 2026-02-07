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

            <Route
              path="rh-management"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <div className="p-8"><h1 className="text-2xl font-bold">RH Management</h1><p>Control panel for HR administrators.</p></div>
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PROFESSOR', 'RH', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT']}>
                  <div className="p-8"><h1 className="text-2xl font-bold">My Profile</h1><p>Manage your personal and academic information.</p></div>
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
