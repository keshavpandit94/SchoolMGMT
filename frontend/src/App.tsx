import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import TeacherManagement from './pages/TeacherManagement';
import StaffManagement from './pages/StaffManagement';
import InventoryManagement from './pages/InventoryManagement';

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
        <Router>
          <Routes>
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
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
