import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTopAndProgress from './components/ScrollToTopAndProgress';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import TeacherManagement from './pages/TeacherManagement';
import StaffManagement from './pages/StaffManagement';
import InventoryManagement from './pages/InventoryManagement';
import AttendanceRegister from './pages/AttendanceRegister';
import KioskAttendance from './pages/KioskAttendance';
import KioskScreen from './pages/KioskScreen';
import StaffRegistrationScreen from './pages/StaffRegistrationScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            {/* Automatically scrolls to top & displays top progress bar on route change */}
            <ScrollToTopAndProgress />

            <Routes>
              {/* Standalone Public Kiosk Terminal */}
              <Route path="/kiosk" element={<KioskAttendance />} />
              <Route path="/kiosk-terminal" element={<KioskScreen />} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <StudentManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teachers"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TeacherManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <StaffManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AttendanceRegister />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance-register"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AttendanceRegister />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/biometric-registration"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <StaffRegistrationScreen />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <InventoryManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect to Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
