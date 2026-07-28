import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTopAndProgress from './components/ScrollToTopAndProgress';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

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
import NoticeEventManagement from './pages/NoticeEventManagement';
import AdmissionsReview from './pages/AdmissionsReview';

// Custom Indian Luxury Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E8751A', // Saffron
      contrastText: '#FDFBF7',
    },
    secondary: {
      main: '#0F766E', // Peacock Teal
      contrastText: '#FDFBF7',
    },
    background: {
      default: '#060913', // Midnight Indigo
      paper: '#0B1220', // Card slate
    },
    text: {
      primary: '#FDFBF7',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', sans-serif",
    h1: { fontFamily: "'Marcellus', serif" },
    h2: { fontFamily: "'Marcellus', serif" },
    h3: { fontFamily: "'Marcellus', serif" },
    h4: { fontFamily: "'Marcellus', serif" },
    h5: { fontFamily: "'Marcellus', serif" },
    h6: { fontFamily: "'Marcellus', serif" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(11, 18, 32, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: '#0B1220',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                  path="/admissions-applications"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <AdmissionsReview />
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

                <Route
                  path="/bulletins"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <NoticeEventManagement />
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
    </ThemeProvider>
  );
};

export default App;
