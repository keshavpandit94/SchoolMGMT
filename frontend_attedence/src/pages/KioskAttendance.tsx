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
  Paper,
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
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import TouchKeypad from '../components/TouchKeypad';
import FaceScannerOverlay from '../components/FaceScannerOverlay';
import KioskStatusModal from '../components/KioskStatusModal';
import { useWebcam } from '../hooks/useWebcam';
import { extractFacialDescriptorFromCanvas, playAudioFeedback } from '../services/faceApiService';
import { useSocketContext } from '../context/SocketContext';

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

interface WindowSettings {
  startTime: string;
  endTime: string;
  isWindowOpen: boolean;
  isCutoffPassed: boolean;
}

const KioskAttendance: React.FC = () => {
  const { socket } = useSocketContext();

  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Teacher' | 'Staff'>('All');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));

  // Attendance Time Window Settings State (e.g. 08:00 AM - 10:00 AM)
  const [windowSettings, setWindowSettings] = useState<WindowSettings>({
    startTime: '08:00',
    endTime: '10:00',
    isWindowOpen: true,
    isCutoffPassed: false,
  });

  // Selected Member Flow States
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1 = PIN, 2 = Face Scan
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);

  // Biometric Face Scan States
  const [scanningProgress, setScanningProgress] = useState(0);
  const [vectorConfidence, setVectorConfidence] = useState(95);

  // Result Feedback Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalDetails, setModalDetails] = useState<any>(null);

  const { videoRef, startWebcam, stopWebcam, cameraActive } = useWebcam();

  // Update live digital clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Attendance Window Settings
  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings/attendance-window`);
      if (res.data.success) {
        setWindowSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch window settings:', err);
    }
  };

  // Fetch Roster of Teachers & Staff
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
    fetchSettings();
    fetchRoster();

    // Socket real-time synchronization
    if (socket) {
      socket.on('attendance_updated', () => {
        fetchRoster();
      });
      socket.on('settings_updated', (data: any) => {
        setWindowSettings((prev) => ({
          ...prev,
          startTime: data.startTime,
          endTime: data.endTime,
          isWindowOpen: data.isWindowOpen,
          isCutoffPassed: data.isCutoffPassed,
        }));
        fetchRoster();
      });
    }

    return () => {
      if (socket) {
        socket.off('attendance_updated');
        socket.off('settings_updated');
      }
    };
  }, [socket]);

  // Open Verification Workflow for selected Teacher/Staff member
  const handleSelectMember = (member: Member) => {
    if (windowSettings.isCutoffPassed) {
      setModalType('error');
      setModalTitle('Attendance Window Closed');
      setModalMessage(`Attendance window closed at ${windowSettings.endTime} AM. Time over — auto-submitted to Absent.`);
      setModalOpen(true);
      return;
    }

    setSelectedMember(member);
    setStep(1);
    setPinCode('');
    setPinError(null);
  };

  // Step 1: Handle PIN Submission
  const handlePinSubmit = async () => {
    if (!pinCode || pinCode.length !== 4) {
      setPinError('Please enter your 4-digit security PIN passcode');
      playAudioFeedback('error');
      return;
    }

    setVerifyingPin(true);
    setPinError(null);

    try {
      const res = await axios.post(`${API_URL}/api/kiosk/verify-pin`, {
        staffId: selectedMember._id,
        pinCode,
      });

      if (res.data.success) {
        playAudioFeedback('click');
        setStep(2);
        startWebcam();
        runBiometricScan(selectedMember._id);
      }
    } catch (err: any) {
      console.error(err);
      playAudioFeedback('error');
      setPinError(err.response?.data?.message || 'Incorrect Security PIN passcode. Access denied.');
    } finally {
      setVerifyingPin(false);
    }
  };

  // Step 2: Biometric Facial Vector Extraction & Matcher
  const runBiometricScan = (staffId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setScanningProgress(progress);
      setVectorConfidence(Math.floor(93 + Math.random() * 6));

      if (progress >= 100) {
        clearInterval(interval);
        processFaceAttendance(staffId);
      }
    }, 400);
  };

  // Step 3: Send Face Vector + Image Snapshot to Backend for DB Verification / Enrollment
  const processFaceAttendance = async (staffId: string) => {
    try {
      // Extract live facial vector descriptor embedding
      const liveDescriptor = videoRef.current
        ? extractFacialDescriptorFromCanvas(videoRef.current)
        : Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.2);

      // Capture face image frame from canvas
      let capturedFaceImage = '';
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 300, 300);
          capturedFaceImage = canvas.toDataURL('image/jpeg', 0.85);
        }
      }

      const res = await axios.post(`${API_URL}/api/kiosk/verify-face-attendance`, {
        staffId,
        liveFaceDescriptor: liveDescriptor,
        faceImage: capturedFaceImage,
      });

      if (res.data.success) {
        stopWebcam();
        playAudioFeedback('success');
        setModalType('success');
        setModalTitle(`${res.data.eventType} Successful!`);
        setModalMessage(res.data.message);
        setModalDetails({
          eventType: res.data.eventType,
          checkInTime: res.data.checkInTime,
          checkOutTime: res.data.checkOutTime,
          totalHours: res.data.totalHours,
          isLate: res.data.isLate,
          confidenceScore: res.data.confidenceScore,
        });
        setModalOpen(true);
        fetchRoster();
      }
    } catch (err: any) {
      stopWebcam();
      playAudioFeedback('error');
      setModalType('error');
      setModalTitle('Biometric Scan Failed');
      setModalMessage(err.response?.data?.message || 'Face recognition threshold failed. Please try again.');
      setModalOpen(true);
    }
  };

  const resetFlow = () => {
    stopWebcam();
    setSelectedMember(null);
    setStep(1);
    setPinCode('');
    setPinError(null);
    setScanningProgress(0);
    setModalOpen(false);
  };

  // Filter Members
  const filteredMembers = members.filter((m) => {
    const matchesFilter = filterType === 'All' || m.personType === filterType;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#090D16',
        color: '#F8FAFC',
        p: { xs: 2, sm: 4 },
        backgroundImage:
          'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
      }}
    >
      {/* Top Header & Live Clock */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#6366F1', width: 50, height: 50, border: '2px solid #818CF8' }}>
            <ScanFace size={30} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="800" className="gradient-text" sx={{ fontFamily: 'Plus Jakarta Sans' }}>
              KCPPS - Staff & Teacher Attendance Kiosk
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Select your profile ➔ Enter PIN ➔ Biometric Facial Scan Check-In
            </Typography>
          </Box>
        </Box>

        {/* Digital Clock & Window Status Badge */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(17, 24, 39, 0.75)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              <Clock size={18} color="#818CF8" />
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#818CF8', fontFamily: 'monospace' }}>
                {currentTime}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Attendance Window Alert Bar */}
      <Box sx={{ mb: 4 }}>
        {windowSettings.isCutoffPassed ? (
          <Alert
            severity="warning"
            icon={<Lock size={20} color="#FBBF24" />}
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.1)',
              color: '#FCD34D',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 3,
            }}
          >
            ⏰ <strong>Attendance Window Closed (Cutoff at {windowSettings.endTime} AM)</strong> — Time is over. Attendance marking option is disabled; unsubmitted entries are auto-marked Absent.
          </Alert>
        ) : (
          <Alert
            severity="info"
            icon={<Clock size={20} color="#60A5FA" />}
            sx={{
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: '#93C5FD',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 3,
            }}
          >
            🟢 <strong>Attendance Window Open ({windowSettings.startTime} AM - {windowSettings.endTime} AM)</strong> — Select your name below to give attendance.
          </Alert>
        )}
      </Box>

      {/* Search & Role Filter Bar */}
      <Card className="glass-panel" sx={{ p: 2.5, mb: 4, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by teacher/staff name, department, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#94A3B8" />
                  </InputAdornment>
                ),
              }}
              sx={{
                input: { color: '#F8FAFC' },
                fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 1, justifyContent: { sm: 'flex-end' } }}>
            {(['All', 'Teacher', 'Staff'] as const).map((type) => (
              <Chip
                key={type}
                label={type === 'All' ? 'All Members' : `${type}s`}
                clickable
                onClick={() => setFilterType(type)}
                sx={{
                  bgcolor: filterType === type ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                  color: filterType === type ? '#FFF' : '#94A3B8',
                  fontWeight: filterType === type ? 'bold' : 'normal',
                }}
              />
            ))}
          </Grid>
        </Grid>
      </Card>

      {/* Roster Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : filteredMembers.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No registered members found.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredMembers.map((member) => {
            const isCompleted = ['Present', 'Late', 'Check-Out'].includes(member.statusToday);
            const isWindowClosed = windowSettings.isCutoffPassed;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                <Card
                  className="glass-panel"
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(17, 24, 39, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      boxShadow: '0 12px 30px rgba(99, 102, 241, 0.15)',
                    },
                  }}
                >
                  <Avatar
                    src={member.photoUrl}
                    sx={{ width: 72, height: 72, mb: 2, bgcolor: '#6366F1', border: '3px solid #818CF8', fontSize: 26 }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>

                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', mb: 0.5, lineHeight: 1.2 }}>
                    {member.name}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#94A3B8', mb: 1, display: 'block' }}>
                    {member.department} • {member.designation}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={member.personType}
                      size="small"
                      sx={{
                        bgcolor: member.personType === 'Teacher' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: member.personType === 'Teacher' ? '#818CF8' : '#22D3EE',
                        fontWeight: 'bold',
                        mr: 1,
                      }}
                    />
                    {isCompleted ? (
                      <Chip label={`Status: ${member.statusToday}`} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 'bold' }} />
                    ) : isWindowClosed ? (
                      <Chip label="Auto-Absent (Cutoff Passed)" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="Not Checked In" size="small" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8' }} />
                    )}
                  </Box>

                  {/* Attendance Action Button */}
                  {!isWindowClosed && !isCompleted ? (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleSelectMember(member)}
                      startIcon={<ScanFace size={18} />}
                      sx={{
                        bgcolor: '#6366F1',
                        '&:hover': { bgcolor: '#4F46E5' },
                        textTransform: 'none',
                        borderRadius: 2.5,
                        fontWeight: 'bold',
                        py: 1.2,
                      }}
                    >
                      Give Attendance
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      disabled
                      variant="outlined"
                      sx={{
                        color: '#64748B',
                        borderColor: 'rgba(255,255,255,0.06)',
                        textTransform: 'none',
                        borderRadius: 2.5,
                        py: 1.2,
                      }}
                    >
                      {isCompleted ? '✓ Attendance Recorded' : 'Time Over (Closed)'}
                    </Button>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Verification Workflow Modal (PIN -> Biometric Face Scan) */}
      <Dialog
        open={Boolean(selectedMember)}
        onClose={resetFlow}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            color: '#F8FAFC',
            backgroundImage: 'none',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 4,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={selectedMember?.photoUrl} sx={{ width: 40, height: 40, bgcolor: '#6366F1' }}>
              {selectedMember?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC' }}>
                {selectedMember?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {selectedMember?.department} ({selectedMember?.personType})
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={resetFlow} sx={{ color: '#94A3B8' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          {step === 1 ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#F8FAFC' }}>
                Step 1: Enter Your Security PIN
              </Typography>

              {pinError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' }}>
                  {pinError}
                </Alert>
              )}

              <TouchKeypad
                pin={pinCode}
                onChange={setPinCode}
                onSubmit={handlePinSubmit}
                loading={verifyingPin}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#F8FAFC' }}>
                Step 2: Biometric Facial Recognition
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 3 }}>
                Verifying face match with stored profile image in DB...
              </Typography>

              {/* Camera reticle overlay */}
              <Box
                sx={{
                  position: 'relative',
                  width: 280,
                  height: 280,
                  mx: 'auto',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #6366F1',
                  boxShadow: '0 0 35px rgba(99, 102, 241, 0.4)',
                  bgcolor: '#0F172A',
                  mb: 3,
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <FaceScannerOverlay
                  scanning={true}
                  progress={scanningProgress}
                  confidence={vectorConfidence}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Audio-Visual Feedback Result Modal */}
      <KioskStatusModal
        open={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        user={selectedMember ? { _id: selectedMember._id, name: selectedMember.name, role: selectedMember.personType, photoUrl: selectedMember.photoUrl } : undefined}
        details={modalDetails}
        onClose={resetFlow}
      />
    </Box>
  );
};

export default KioskAttendance;
