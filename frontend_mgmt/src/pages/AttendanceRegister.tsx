import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import AttendanceManagement from './AttendanceManagement';
import KioskAttendance from './KioskAttendance';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  ButtonGroup,
  Chip,
} from '@mui/material';
import {
  CalendarCheck,
  ScanFace,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  Lock,
  UserCheck,
} from 'lucide-react';

interface StudentAttendanceRow {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  photoUrl?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

const StudentClassAttendance: React.FC = () => {
  const { user } = useAuth();

  const isAdminOrPrincipal = Boolean(user && ['Admin', 'Principal'].includes(user.role));
  const teacherDetails = user?.teacherDetails;

  // Initial Class & Section default to Class Teacher's assigned class if applicable
  const defaultClass =
    user?.role === 'Teacher' && teacherDetails?.isClassTeacher && teacherDetails?.assignedClass
      ? teacherDetails.assignedClass
      : 'Class 1';

  const defaultSection =
    user?.role === 'Teacher' && teacherDetails?.isClassTeacher && teacherDetails?.assignedSection
      ? teacherDetails.assignedSection
      : 'A';

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState(defaultClass);
  const [section, setSection] = useState(defaultSection);
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto set assigned class if user details refresh
  useEffect(() => {
    if (user?.role === 'Teacher' && teacherDetails?.isClassTeacher) {
      if (teacherDetails.assignedClass) setClassName(teacherDetails.assignedClass);
      if (teacherDetails.assignedSection) setSection(teacherDetails.assignedSection);
    }
  }, [user, teacherDetails?.isClassTeacher, teacherDetails?.assignedClass, teacherDetails?.assignedSection]);

  // Check if current user is authorized to manually input/save attendance for this specific class & section
  const isAssignedClassTeacher =
    user?.role === 'Teacher' &&
    teacherDetails?.isClassTeacher &&
    teacherDetails?.assignedClass === className &&
    teacherDetails?.assignedSection === section;

  const canInputAttendance = isAdminOrPrincipal || isAssignedClassTeacher;

  const fetchClassStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/students', {
        params: { className, section, limit: 100 },
      });

      if (response.data.success) {
        const list = response.data.students.map((st: any) => {
          const existing = st.attendance?.find(
            (a: any) => new Date(a.date).toISOString().split('T')[0] === date
          );
          return {
            _id: st._id,
            name: st.name,
            rollNumber: st.rollNumber,
            class: st.class,
            section: st.section,
            photoUrl: st.photoUrl,
            status: existing ? existing.status : 'Present',
          };
        });
        setStudents(list);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch class student list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassStudents();
  }, [className, section, date]);

  const handleStatusToggle = (id: string, newStatus: StudentAttendanceRow['status']) => {
    if (!canInputAttendance) return;
    setStudents((prev) =>
      prev.map((st) => (st._id === id ? { ...st, status: newStatus } : st))
    );
  };

  const handleBulkStatus = (newStatus: StudentAttendanceRow['status']) => {
    if (!canInputAttendance) return;
    setStudents((prev) => prev.map((st) => ({ ...st, status: newStatus })));
  };

  const handleSaveStudentAttendance = async () => {
    if (!canInputAttendance) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      date,
      attendanceRecords: students.map((st) => ({
        studentId: st._id,
        status: st.status,
      })),
    };

    try {
      const response = await axiosInstance.post('/api/students/attendance', payload);
      if (response.data.success) {
        setSuccessMsg(response.data.message || 'Student class attendance saved successfully');
        fetchClassStudents();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save student attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;

  return (
    <Box>
      {/* Class Teacher Status / Permission Alert */}
      <Box sx={{ mb: 3 }}>
        {canInputAttendance ? (
          <Alert
            severity="success"
            icon={<UserCheck size={20} color="#10B981" />}
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 2 }}
          >
            🟢 <strong>Class Attendance Entry Access Granted</strong> — {isAdminOrPrincipal ? 'You are logged in as Admin/Principal (Full Access).' : `You are the assigned Class Teacher for ${className} (Section ${section}).`}
          </Alert>
        ) : (
          <Alert
            severity="warning"
            icon={<Lock size={20} color="#FBBF24" />}
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 2 }}
          >
            🔒 <strong>Manual Attendance Entry Restricted</strong> —{' '}
            {user?.role === 'Teacher' && teacherDetails?.isClassTeacher
              ? `You are Class Teacher for ${teacherDetails.assignedClass} (${teacherDetails.assignedSection}). You can view ${className} (${section}), but manual attendance entry is allowed ONLY for your assigned class.`
              : user?.role === 'Teacher'
              ? 'You are not assigned as a Class Teacher. Student attendance entry is permitted only for designated Class Teachers or Admin/Principal.'
              : 'Student attendance manual entry is restricted to designated Class Teachers or Admin/Principal.'}
          </Alert>
        )}
      </Box>

      {/* Class Selector Bar */}
      <Card className="glass-panel" sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Select Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
            >
              {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
            >
              {['A', 'B', 'C', 'D'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>

        </Grid>
      </Card>

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

      {/* Class Statistics Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#818CF8' }}>
          {className} (Section {section}) — Total: {students.length} | Present: {presentCount} | Absent: {absentCount}
        </Typography>

        <Button
          variant="contained"
          disabled={saving || loading || !canInputAttendance}
          onClick={handleSaveStudentAttendance}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
          sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
        >
          {saving ? 'Saving...' : 'Save Class Attendance'}
        </Button>
      </Box>

      {/* Student Attendance Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : students.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No students registered in {className} ({section}).
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} className="mui-table-container">
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Roll No</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Attendance Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((st) => (
                <TableRow key={st._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#F8FAFC' }}>
                      {st.rollNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={st.photoUrl} sx={{ width: 34, height: 34, bgcolor: '#6366F1' }}>
                        {st.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#F8FAFC' }}>
                        {st.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {st.status === 'Present' ? (
                      <Chip label="Present" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 'bold' }} />
                    ) : st.status === 'Absent' ? (
                      <Chip label="Absent" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }} />
                    ) : st.status === 'Late' ? (
                      <Chip label="Late" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="Unmarked" size="small" variant="outlined" sx={{ color: '#64748B', borderColor: 'rgba(255,255,255,0.1)' }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const AttendanceRegister: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrPrincipal = Boolean(user && ['Admin', 'Principal'].includes(user.role));

  // If user is non-Admin/Principal (e.g. Teacher), default to Student Class Attendance tab (tabIndex 2)
  const defaultTab = isAdminOrPrincipal ? 0 : 2;
  const [tabIndex, setTabIndex] = useState(defaultTab);

  useEffect(() => {
    if (!isAdminOrPrincipal) {
      setTabIndex(2);
    }
  }, [user]);

  return (
    <Box className="animate-fade-in">
      {/* Master Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" className="gradient-text" sx={{ fontFamily: 'Plus Jakarta Sans', mb: 0.5 }}>
          Attendance Register Portal
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Master Attendance Hub: Staff/Faculty Attendance (Admin & Principal), Biometric Entrance Kiosk & Class Teacher Student Attendance.
        </Typography>
      </Box>

      {/* Tabs Navigation */}
      <Card className="glass-panel" sx={{ mb: 4, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          textColor="inherit"
          sx={{
            px: 2,
            '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: 2 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: 15,
              color: '#94A3B8',
              '&.Mui-selected': { color: '#818CF8' },
            },
          }}
        >
          {isAdminOrPrincipal && <Tab icon={<CalendarCheck size={18} />} iconPosition="start" label="Staff & Faculty Register" />}
          {isAdminOrPrincipal && <Tab icon={<ScanFace size={18} />} iconPosition="start" label="Biometric Touchscreen Kiosk" />}
          <Tab icon={<Users size={18} />} iconPosition="start" label="Student Class Attendance" />
        </Tabs>
      </Card>

      {/* Tab Panels */}
      {isAdminOrPrincipal && tabIndex === 0 && <AttendanceManagement />}
      {isAdminOrPrincipal && tabIndex === 1 && <KioskAttendance />}
      {((isAdminOrPrincipal && tabIndex === 2) || !isAdminOrPrincipal) && <StudentClassAttendance />}
    </Box>
  );
};

export default AttendanceRegister;
