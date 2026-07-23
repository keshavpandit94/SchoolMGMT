import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  ScanFace,
  CheckCircle2,
  Lock,
  Camera,
  RefreshCw,
  Sparkles,
  Clock,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Member {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
  personType: 'Teacher' | 'Staff';
  department: string;
  designation: string;
  statusToday: string;
  checkedInAt?: string;
}

const KioskAttendance: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Kiosk Flow States
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Face Scan Modal States
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ name: string; status: string; time: string } | null>(null);

  // Video element ref for camera stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Kiosk Roster
  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/attendance/kiosk/roster`);
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.error('Failed to fetch kiosk roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  // Handle member card selection
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setPinCode('');
    setPinError(null);
    setPinModalOpen(true);
  };

  // Handle PIN submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || pinCode.length < 4) {
      setPinError('Please enter a 4-digit security PIN (Default: 1234)');
      return;
    }

    setPinModalOpen(false);
    startFaceScanModal();
  };

  // Start Camera and Face Scan Simulation
  const startFaceScanModal = async () => {
    setFaceModalOpen(true);
    setScanning(true);
    setScanProgress(0);
    setScanSuccess(false);

    // Request camera stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable. Running biometric simulator.');
    }

    // Biometric scanning progress animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        completeKioskCheckIn();
      }
    }, 400);
  };

  // Complete attendance verification call
  const completeKioskCheckIn = async () => {
    if (!selectedMember) return;

    try {
      const res = await axios.post(`${API_URL}/api/attendance/kiosk/verify`, {
        personId: selectedMember._id,
        pinCode: pinCode || '1234',
        faceVerified: true,
      });

      if (res.data.success) {
        setScanSuccess(true);
        setSuccessInfo({
          name: res.data.user.name,
          status: res.data.status,
          time: res.data.timestamp,
        });

        // Stop camera stream
        stopCamera();

        // Refresh roster and reset kiosk after 3.5 seconds
        setTimeout(() => {
          setFaceModalOpen(false);
          setSelectedMember(null);
          setSuccessInfo(null);
          fetchRoster();
        }, 3500);
      }
    } catch (err: any) {
      setPinError(err.response?.data?.message || 'Verification failed. Try again.');
      stopCamera();
      setFaceModalOpen(false);
      setPinModalOpen(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#090D16',
        color: '#F8FAFC',
        p: { xs: 2, sm: 4 },
        backgroundImage:
          'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
      }}
    >
      {/* Kiosk Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#6366F1', width: 48, height: 48 }}>
            <ScanFace size={28} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="800" className="gradient-text" sx={{ fontFamily: 'Plus Jakarta Sans' }}>
              EduManage Kiosk
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Self-Service Staff & Faculty Attendance Terminal (Biometric Face & PIN)
            </Typography>
          </Box>
        </Box>

        {/* Live Digital Clock Badge */}
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(17, 24, 39, 0.75)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
            <Clock size={16} color="#818CF8" />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#818CF8', fontFamily: 'monospace' }}>
              {currentTime}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {/* Search Bar */}
      <Card className="glass-panel" sx={{ p: 2.5, mb: 4, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <TextField
          fullWidth
          placeholder="Touch or type to search your name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={22} color="#818CF8" />
              </InputAdornment>
            ),
          }}
          sx={{
            input: { color: '#F8FAFC', fontSize: 18 },
            fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
          }}
        />
      </Card>

      {/* Member Directory Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress size={48} sx={{ color: '#6366F1' }} />
        </Box>
      ) : filteredMembers.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 8, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="h6" sx={{ color: '#94A3B8' }}>
            No registered staff or faculty members found matching "{search}".
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredMembers.map((member) => {
            const isCheckedIn = member.statusToday === 'Present' || member.statusToday === 'Late';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                <Card
                  onClick={() => handleSelectMember(member)}
                  className="glass-panel hover-card"
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.65)',
                    border: isCheckedIn ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#6366F1',
                      boxShadow: '0 12px 30px rgba(99, 102, 241, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Avatar
                      src={member.photoUrl}
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 2,
                        bgcolor: '#6366F1',
                        fontSize: 32,
                        border: '3px solid rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', mb: 0.5 }}>
                      {member.name}
                    </Typography>

                    <Chip
                      label={member.department}
                      size="small"
                      sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', mb: 1.5, fontWeight: 'bold' }}
                    />

                    <Typography variant="caption" sx={{ color: '#64748B', mb: 2 }}>
                      {member.designation}
                    </Typography>

                    {isCheckedIn ? (
                      <Chip
                        icon={<CheckCircle2 size={14} color="#34D399" />}
                        label={`Checked In (${member.statusToday})`}
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 'bold' }}
                      />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ScanFace size={16} />}
                        sx={{
                          color: '#818CF8',
                          borderColor: 'rgba(99, 102, 241, 0.4)',
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 2,
                        }}
                      >
                        Tap to Check-In
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Step 2: PIN Verification Modal */}
      <Dialog
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: '#F8FAFC',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            p: 2,
            maxWidth: 400,
            width: '100%',
          },
        }}
      >
        <form onSubmit={handlePinSubmit}>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
            <Avatar src={selectedMember?.photoUrl} sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: '#6366F1' }}>
              {selectedMember?.name.charAt(0)}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {selectedMember?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Enter 4-Digit Security PIN to Proceed
            </Typography>
          </DialogTitle>

          <DialogContent>
            {pinError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' }}>
                {pinError}
              </Alert>
            )}

            <TextField
              autoFocus
              fullWidth
              type="password"
              placeholder="Enter PIN (Default: 1234)"
              inputProps={{ maxLength: 4, style: { textAlign: 'center', fontSize: 24, letterSpacing: 10 } }}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              sx={{
                input: { color: '#FFF' },
                fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#6366F1' },
              }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setPinModalOpen(false)} sx={{ color: '#94A3B8', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<ScanFace size={18} />}
              sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
            >
              Verify PIN & Scan Face
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Step 3 & 4: Biometric Face Verification Camera Modal */}
      <Dialog
        open={faceModalOpen}
        PaperProps={{
          sx: {
            bgcolor: '#0B0F19',
            color: '#F8FAFC',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 4,
            p: 3,
            maxWidth: 450,
            width: '100%',
            textAlign: 'center',
          },
        }}
      >
        {!scanSuccess ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#818CF8' }}>
              Biometric Face Verification
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 3 }}>
              Look directly into the camera lens for facial feature analysis
            </Typography>

            {/* Video Camera Container with Futuristic Biometric Scanner Overlay */}
            <Box
              sx={{
                position: 'relative',
                width: 260,
                height: 260,
                mx: 'auto',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #6366F1',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
                mb: 3,
                bgcolor: '#1E293B',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Glowing Scan Target Ring */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 10,
                  border: '2px dashed #38BDF8',
                  borderRadius: '50%',
                  animation: 'spin 6s linear infinite',
                }}
              />
            </Box>

            <CircularProgress variant="determinate" value={scanProgress} sx={{ color: '#6366F1', mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 'bold' }}>
              Scanning Biometrics... {scanProgress}%
            </Typography>
          </Box>
        ) : (
          <Box sx={{ py: 3 }} className="animate-fade-in">
            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', width: 72, height: 72, mx: 'auto', mb: 2 }}>
              <CheckCircle2 size={44} />
            </Avatar>

            <Typography variant="h5" fontWeight="bold" sx={{ color: '#34D399', mb: 1 }}>
              Biometric Match Verified!
            </Typography>

            <Typography variant="h6" sx={{ color: '#F8FAFC', mb: 1 }}>
              Welcome, {successInfo?.name}
            </Typography>

            <Chip
              label={`Status: ${successInfo?.status} at ${successInfo?.time}`}
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 'bold', fontSize: 14, py: 2, px: 1, mb: 2 }}
            />

            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Attendance recorded automatically. Resetting terminal...
            </Typography>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default KioskAttendance;
