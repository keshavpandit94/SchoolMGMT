import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import { Camera, ScanFace, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { useWebcam } from '../hooks/useWebcam';
import { extractFacialDescriptorFromCanvas } from '../services/faceApiService';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

const StaffRegistrationScreen: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pinCode, setPinCode] = useState('1234');
  const [shiftStart, setShiftStart] = useState('08:30');
  const [shiftEnd, setShiftEnd] = useState('16:30');

  // Facial vectors captured (3-5 reference images)
  const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { videoRef, startWebcam, stopWebcam, cameraActive } = useWebcam();

  // Fetch staff & teacher list for admin registration
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const [teachersRes, staffRes] = await Promise.all([
          axiosInstance.get('/api/teachers'),
          axiosInstance.get('/api/staff'),
        ]);

        const users: StaffUser[] = [];
        if (teachersRes.data.success) {
          teachersRes.data.teachers.forEach((t: any) => {
            if (t.userId) users.push(t.userId);
          });
        }
        if (staffRes.data.success) {
          staffRes.data.staff.forEach((s: any) => {
            if (s.userId) users.push(s.userId);
          });
        }
        setStaffList(users);
        if (users.length > 0) setSelectedUserId(users[0]._id);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    startWebcam();

    return () => {
      stopWebcam();
    };
  }, []);

  // Capture reference frame & extract 128-d descriptor vector
  const handleCaptureDescriptor = () => {
    if (!videoRef.current) return;
    setError(null);

    const descriptor = extractFacialDescriptorFromCanvas(videoRef.current);
    if (capturedDescriptors.length < 5) {
      setCapturedDescriptors((prev) => [...prev, descriptor]);
    }
  };

  const handleResetCaptures = () => {
    setCapturedDescriptors([]);
  };

  // Submit Registration to Backend MongoDB
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !pinCode || capturedDescriptors.length < 1) {
      setError('Please select staff member, enter 4-6 digit PIN, and capture at least 1 facial reference photo.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await axiosInstance.post('/api/kiosk/register-face', {
        userId: selectedUserId,
        pinCode,
        faceDescriptors: capturedDescriptors,
        shiftStart,
        shiftEnd,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setCapturedDescriptors([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register facial biometric profile');
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = staffList.find((u) => u._id === selectedUserId);

  return (
    <Box className="animate-fade-in" sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans', mb: 0.5 }}>
          Admin Biometric Face & PIN Registration
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Enroll 3 to 5 reference facial descriptor vectors and security PINs for staff members into MongoDB.
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

      <Grid container spacing={3}>
        {/* Left Column: Staff Selection & PIN Form */}
        <Grid item xs={12} md={6}>
          <Card className="glass-panel" sx={{ p: 3, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', mb: 3 }}>
              Staff & Shift Settings
            </Typography>

            <form onSubmit={handleSubmitRegistration}>
              <TextField
                select
                fullWidth
                label="Select Staff Member"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                sx={{ mb: 2.5, '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
              >
                {staffList.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </MenuItem>
                ))}
              </TextField>

              {selectedUser && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 2.5, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 3 }}>
                  <Avatar src={selectedUser.profilePicture} sx={{ width: 48, height: 48, bgcolor: '#6366F1' }}>
                    {selectedUser.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="#F8FAFC">
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="caption" color="#94A3B8">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Box>
              )}

              <TextField
                fullWidth
                label="Personal 4-to-6 Digit Security PIN"
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2.5, input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
              />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    type="time"
                    fullWidth
                    label="Shift Start Time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="time"
                    fullWidth
                    label="Shift End Time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={saving || capturedDescriptors.length === 0}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={20} />}
                sx={{ py: 1.5, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
              >
                {saving ? 'Saving Profile...' : `Save Biometric Profile (${capturedDescriptors.length}/5 Captured)`}
              </Button>
            </form>
          </Card>
        </Grid>

        {/* Right Column: Facial Descriptor Capture Camera */}
        <Grid item xs={12} md={6}>
          <Card className="glass-panel" sx={{ p: 3, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', mb: 1 }}>
              Facial Feature Capture Camera
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
              Capture 3 to 5 reference angles to extract 128-d vector embeddings
            </Typography>

            {/* Camera Box */}
            <Box
              sx={{
                position: 'relative',
                width: 240,
                height: 240,
                mx: 'auto',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #6366F1',
                mb: 2.5,
                bgcolor: '#0F172A',
              }}
            >
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>

            {/* Captured Vector Badges */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              {[0, 1, 2, 3, 4].map((idx) => (
                <Chip
                  key={idx}
                  label={capturedDescriptors[idx] ? `Vector ${idx + 1} ✓` : `Sample ${idx + 1}`}
                  sx={{
                    bgcolor: capturedDescriptors[idx] ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: capturedDescriptors[idx] ? '#34D399' : '#64748B',
                    fontWeight: 'bold',
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                disabled={capturedDescriptors.length >= 5}
                onClick={handleCaptureDescriptor}
                startIcon={<Camera size={18} />}
                sx={{ bgcolor: '#38BDF8', '&:hover': { bgcolor: '#0284C7' }, borderRadius: 2, textTransform: 'none' }}
              >
                Capture Photo Sample
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetCaptures}
                startIcon={<RefreshCw size={16} />}
                sx={{ color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.2)', textTransform: 'none' }}
              >
                Reset
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffRegistrationScreen;
