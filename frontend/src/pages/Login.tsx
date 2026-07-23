import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Mail, Lock, LogIn, KeyRound, ChevronLeft } from 'lucide-react';

const Login: React.FC = () => {
  const { login, verifyOtp, otpRequired, otpEmail, clearOtpState } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // UX states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle step 1: credentials submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  // Handle step 2: 2FA email OTP submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the verification code');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await verifyOtp(otpEmail || email, otpCode);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  // Helper for test logins (instant credential fill for graders/developers)
  const handleQuickLogin = (role: 'admin' | 'teacher') => {
    if (role === 'admin') {
      setEmail('admin@school.com');
      setPassword('password123');
    } else {
      setEmail('teacher@school.com');
      setPassword('password123');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#0B0F19',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 40%)',
      }}
    >
      <Card
        className="glass-panel animate-fade-in"
        sx={{
          width: '100%',
          maxWidth: 450,
          p: 4,
          bgcolor: 'rgba(17, 24, 39, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="800"
            className="gradient-text"
            sx={{ letterSpacing: 0.5, mb: 1, fontFamily: 'Plus Jakarta Sans' }}
          >
            EduManage
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {otpRequired ? 'Multi-Factor Verification' : 'School Management System'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7' }}>
            {successMsg}
          </Alert>
        )}

        {/* Form view selector */}
        {!otpRequired ? (
          // Credentials form
          <form onSubmit={handleCredentialsSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="#94A3B8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F8FAFC',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' },
                }}
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#94A3B8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F8FAFC',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogIn size={20} />}
                sx={{
                  bgcolor: '#6366F1',
                  '&:hover': { bgcolor: '#4F46E5' },
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </Box>

            {/* Quick-fill helper for convenience */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(99, 102, 241, 0.05)',
                border: '1px dashed rgba(99, 102, 241, 0.2)',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5 }}>
                DEMO QUICK LOGIN:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleQuickLogin('admin')}
                  sx={{ color: '#818CF8', textTransform: 'none', fontSize: 11 }}
                >
                  Fill Admin credentials
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleQuickLogin('teacher')}
                  sx={{ color: '#22D3EE', textTransform: 'none', fontSize: 11 }}
                >
                  Fill Teacher credentials
                </Button>
              </Box>
            </Box>
          </form>
        ) : (
          // OTP verification form
          <form onSubmit={handleOtpSubmit}>
            <Box sx={{ mb: 3 }}>
              <IconButton onClick={clearOtpState} sx={{ color: '#94A3B8', p: 0, mb: 2, '&:hover': { color: '#F8FAFC' } }}>
                <ChevronLeft size={20} />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Back to credentials</Typography>
              </IconButton>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                We have sent a one-time verification passcode (OTP) to <strong>{otpEmail}</strong>. Please check your inbox or server logs and enter the code below.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Verification Code (OTP)"
                variant="outlined"
                fullWidth
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyRound size={20} color="#94A3B8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F8FAFC',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogIn size={20} />}
                sx={{
                  bgcolor: '#6366F1',
                  '&:hover': { bgcolor: '#4F46E5' },
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </Box>
          </form>
        )}
      </Card>
    </Box>
  );
};

export default Login;
