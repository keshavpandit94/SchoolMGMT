import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTopAndProgress from './components/ScrollToTopAndProgress';

// Attendance Pages
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
      <SocketProvider>
        <Router>
          {/* Automatically scrolls to top & displays top progress bar on route change */}
          <ScrollToTopAndProgress />

          <Routes>
            {/* Standalone Public Touch Kiosk Terminals */}
            <Route path="/kiosk" element={<KioskAttendance />} />
            <Route path="/kiosk-terminal" element={<KioskScreen />} />

            {/* Attendance Register & Biometric Enrollment Pages */}
            <Route
              path="/attendance"
              element={
                <DashboardLayout>
                  <AttendanceRegister />
                </DashboardLayout>
              }
            />

            <Route
              path="/attendance-register"
              element={
                <DashboardLayout>
                  <AttendanceRegister />
                </DashboardLayout>
              }
            />

            <Route
              path="/biometric-registration"
              element={
                <DashboardLayout>
                  <StaffRegistrationScreen />
                </DashboardLayout>
              }
            />

            {/* Default redirect straight to Dual Verification Kiosk */}
            <Route path="/" element={<Navigate to="/kiosk-terminal" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/kiosk-terminal" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
