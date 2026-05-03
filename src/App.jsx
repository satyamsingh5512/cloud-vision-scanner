import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScannerPage from './pages/ScannerPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import RegisterPage from './pages/RegisterPage';
import AttendancePage from './pages/AttendancePage';
import DashboardShell from './components/layout/DashboardShell';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen premium-gradient-bg">
        <Navbar />
        <Routes>
          {/* Default → scanner */}
          <Route path="/" element={<Navigate to="/scanner" replace />} />

          {/* Public */}
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin — protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <AdminDashboard />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <RegisterPage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <AttendancePage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/scanner" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
