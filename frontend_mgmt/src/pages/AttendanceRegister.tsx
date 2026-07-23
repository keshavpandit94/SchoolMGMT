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
  Chip,
  ButtonGroup,
} from '@mui/material';
import {
  CalendarCheck,
  ScanFace,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  Filter,
  Calendar,
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
  const canModify = user && ['Admin', 'Principal', 'Teacher'].includes(user.role);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState('Class 1');
  const [section, setSection] = useState('A');
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchClassStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/students', {
        params: { className, section, limit: 100 },
      });

      if (response.data.success) {
        const list = response.data.students.map((st: any) => {
          // Check if attendance already exists for target date
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
    setStudents((prev) =>
      prev.map((st) => (st._id === id ? { ...st, status: newStatus } : st))
    );
  };

  const handleBulkStatus = (newStatus: StudentAttendanceRow['status']) => {
    setStudents((prev) => prev.map((st) => ({ ...st, status: newStatus })));
  };

  const handleSaveStudentAttendance = async () => {
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
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
            {canModify && (
              <Box sx={{ display: 'inline-flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkStatus('Present')}
                  startIcon={<CheckCircle2 size={14} color="#34D399" />}
                  sx={{ color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.3)', textTransform: 'none' }}
                >
                  All Present
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkStatus('Absent')}
                  startIcon={<XCircle size={14} color="#FCA5A5" />}
                  sx={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)', textTransform: 'none' }}
                >
                  All Absent
                </Button>
              </Box>
            )}
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

        {canModify && (
          <Button
            variant="contained"
            disabled={saving || loading}
            onClick={handleSaveStudentAttendance}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
            sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
          >
            {saving ? 'Saving...' : 'Save Class Attendance'}
          </Button>
        )}
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
                  <TableCell fontWeight="semibold">{st.rollNumber}</TableCell>
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
                    <ButtonGroup size="small" disabled={!canModify}>
                      <Button
                        variant={st.status === 'Present' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(st._id, 'Present')}
                        sx={{
                          bgcolor: st.status === 'Present' ? '#10B981' : 'transparent',
                          color: st.status === 'Present' ? '#FFF' : '#34D399',
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          textTransform: 'none',
                        }}
                      >
                        Present
                      </Button>
                      <Button
                        variant={st.status === 'Absent' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(st._id, 'Absent')}
                        sx={{
                          bgcolor: st.status === 'Absent' ? '#EF4444' : 'transparent',
                          color: st.status === 'Absent' ? '#FFF' : '#FCA5A5',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          textTransform: 'none',
                        }}
                      >
                        Absent
                      </Button>
                      <Button
                        variant={st.status === 'Late' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(st._id, 'Late')}
                        sx={{
                          bgcolor: st.status === 'Late' ? '#F59E0B' : 'transparent',
                          color: st.status === 'Late' ? '#FFF' : '#FBBF24',
                          borderColor: 'rgba(245, 158, 11, 0.3)',
                          textTransform: 'none',
                        }}
                      >
                        Late
                      </Button>
                    </ButtonGroup>
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
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box className="animate-fade-in">
      {/* Master Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" className="gradient-text" sx={{ fontFamily: 'Plus Jakarta Sans', mb: 0.5 }}>
          Attendance Register Portal
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Master Attendance Register Hub: Staff/Teacher Attendance, Biometric Kiosk Terminal & Student Class Attendance.
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
          <Tab icon={<CalendarCheck size={18} />} iconPosition="start" label="Staff & Faculty Register" />
          <Tab icon={<ScanFace size={18} />} iconPosition="start" label="Biometric Touchscreen Kiosk" />
          <Tab icon={<Users size={18} />} iconPosition="start" label="Student Class Attendance" />
        </Tabs>
      </Card>

      {/* Tab Panels */}
      {tabIndex === 0 && <AttendanceManagement />}
      {tabIndex === 1 && <KioskAttendance />}
      {tabIndex === 2 && <StudentClassAttendance />}
    </Box>
  );
};

export default AttendanceRegister;
