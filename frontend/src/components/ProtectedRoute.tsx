import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'Admin' | 'Principal' | 'Teacher' | 'Staff'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#0F172A',
          color: '#F8FAFC',
        }}
      >
        <CircularProgress sx={{ color: '#6366F1', mb: 2 }} />
        <Typography variant="h6">Checking authorization credentials...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login but save the path they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Show beautiful "Access Denied" screen
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          p: 3,
          textAlign: 'center',
          color: '#F8FAFC',
        }}
      >
        <Box
          sx={{
            p: 3,
            borderRadius: '50%',
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'inline-flex',
            mb: 3,
          }}
        >
          <ShieldAlert size={64} color="#EF4444" />
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#EF4444' }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 500, mb: 4 }}>
          Your account role ({user.role}) is not authorized to access the page at{' '}
          <code>{location.pathname}</code>. If you believe this is an error, please contact your System Administrator.
        </Typography>
        <Button
          variant="contained"
          onClick={() => (window.location.href = '/')}
          sx={{
            bgcolor: '#6366F1',
            '&:hover': { bgcolor: '#4F46E5' },
            textTransform: 'none',
            borderRadius: 2,
            px: 4,
            py: 1.2,
          }}
        >
          Return to Dashboard
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
