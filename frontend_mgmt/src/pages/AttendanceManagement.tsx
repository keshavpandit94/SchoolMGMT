import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import {
  Box,
  Card,
  Typography,
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
  InputAdornment,
} from '@mui/material';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface AttendanceRow {
  personId: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  personType: 'Teacher' | 'Staff';
  department: string;
  designation: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  markedVia?: 'Manual' | 'Auto-Timeout';
  isLocked?: boolean;
  remarks?: string;
}

interface Stats {
  total: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  autoAbsent: number;
}

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Permissions: Admin & Principal can override locked attendance
  const isAdminOrPrincipal = user && ['Admin', 'Principal'].includes(user.role);
  const canModify = user && ['Admin', 'Principal', 'Teacher'].includes(user.role);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<AttendanceRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, present: 0, absent: 0, late: 0, onLeave: 0, autoAbsent: 0 });
  const [cutoffPassed, setCutoffPassed] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/attendance', { params: { date } });
      if (response.data.success) {
        setRoster(response.data.roster);
        setStats(response.data.stats);
        setCutoffPassed(response.data.cutoffPassed);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch attendance roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const handleStatusToggle = (personId: string, newStatus: AttendanceRow['status']) => {
    // If cutoff passed and not Admin/Principal, block editing
    if (cutoffPassed && !isAdminOrPrincipal) return;

    setRoster((prev) =>
      prev.map((row) =>
        row.personId === personId
          ? { ...row, status: newStatus, markedVia: 'Manual' }
          : row
      )
    );
    recalculateStats();
  };

  const handleRemarksChange = (personId: string, remarks: string) => {
    if (cutoffPassed && !isAdminOrPrincipal) return;

    setRoster((prev) =>
      prev.map((row) => (row.personId === personId ? { ...row, remarks } : row))
    );
  };

  const handleBulkStatus = (newStatus: AttendanceRow['status']) => {
    if (cutoffPassed && !isAdminOrPrincipal) return;
    setRoster((prev) => prev.map((row) => ({ ...row, status: newStatus, markedVia: 'Manual' })));
  };

  const recalculateStats = () => {
    setTimeout(() => {
      setRoster((currentRoster) => {
        const total = currentRoster.length;
        const present = currentRoster.filter((r) => r.status === 'Present').length;
        const absent = currentRoster.filter((r) => r.status === 'Absent').length;
        const late = currentRoster.filter((r) => r.status === 'Late').length;
        const onLeave = currentRoster.filter((r) => r.status === 'On Leave').length;
        const autoAbsent = currentRoster.filter((r) => r.markedVia === 'Auto-Timeout').length;
        setStats({ total, present, absent, late, onLeave, autoAbsent });
        return currentRoster;
      });
    }, 10);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      date,
      records: roster.map((r) => ({
        personId: r.personId,
        personType: r.personType,
        status: r.status,
        markedVia: r.markedVia,
        remarks: r.remarks,
      })),
    };

    try {
      const response = await axiosInstance.post('/api/attendance', payload);
      if (response.data.success) {
        setSuccessMsg(response.data.message || 'Attendance saved successfully!');
        fetchAttendance();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Filter roster by Category & Real-time Name Search
  const filteredRoster = roster.filter((r) => {
    const matchesCategory =
      filterType === 'All' ||
      (filterType === 'Teachers' && r.personType === 'Teacher') ||
      (filterType === 'Staff' && r.personType === 'Staff');

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.name.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.department.toLowerCase().includes(query) ||
      r.designation.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const isEditable = canModify && (!cutoffPassed || isAdminOrPrincipal);

  return (
    <Box className="animate-fade-in">
      {/* Header & Lock Cutoff Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
            Staff & Faculty Attendance Register
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Daily attendance window closes at <strong>09:30 AM</strong>. Unsubmitted entries are automatically marked Absent (Timeout).
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputProps={{
              startAdornment: <Calendar size={16} color="#818CF8" style={{ marginRight: 8 }} />,
            }}
            sx={{
              input: { color: '#FFF' },
              fieldset: { borderColor: 'rgba(255,255,255,0.1)' },
              bgcolor: 'rgba(17, 24, 39, 0.65)',
              borderRadius: 2,
            }}
          />

          {canModify && (
            <Button
              variant="contained"
              disabled={saving || loading || !isEditable}
              onClick={handleSaveAttendance}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
              sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2, px: 3 }}
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Attendance Window Status Alert */}
      <Box sx={{ mb: 3 }}>
        {cutoffPassed ? (
          <Alert
            severity="warning"
            icon={<Lock size={18} color="#FBBF24" />}
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.1)',
              color: '#FCD34D',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 2,
            }}
          >
            ⏰ <strong>Attendance Window Closed (09:30 AM Cut-off)</strong> — Records are <strong>Locked</strong>. {isAdminOrPrincipal ? ' (Admin/Principal Override Active: You have special access to edit locked attendance).' : ' (Only Admin & Principal can modify locked past attendance records).'}
          </Alert>
        ) : (
          <Alert
            severity="info"
            icon={<Clock size={18} color="#60A5FA" />}
            sx={{
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: '#93C5FD',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 2,
            }}
          >
            🟢 <strong>Attendance Window Open</strong> — Cut-off time is <strong>09:30 AM</strong> today. Unmarked entries will auto-timeout to Absent.
          </Alert>
        )}
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

      {/* Summary Statistics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-panel" sx={{ p: 2.5, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>Total Roster</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#F8FAFC', mt: 1 }}>
              {stats.total}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-panel" sx={{ p: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Typography variant="body2" sx={{ color: '#34D399' }}>Present Today</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#34D399', mt: 1 }}>
              {stats.present} <Typography component="span" variant="caption" sx={{ color: '#6EE7B7' }}>({stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%)</Typography>
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-panel" sx={{ p: 2.5, bgcolor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <Typography variant="body2" sx={{ color: '#FCA5A5' }}>Absent (Inc. Timeout)</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#FCA5A5', mt: 1 }}>
              {stats.absent} {stats.autoAbsent > 0 && <Typography component="span" variant="caption" sx={{ color: '#F87171' }}>({stats.autoAbsent} Auto-Timeout)</Typography>}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-panel" sx={{ p: 2.5, bgcolor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <Typography variant="body2" sx={{ color: '#60A5FA' }}>On Leave / Late</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#60A5FA', mt: 1 }}>
              {stats.onLeave + stats.late}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter, Name Search & Bulk Action Controls */}
      <Card className="glass-panel" sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search staff name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#94A3B8" />
                  </InputAdornment>
                ),
              }}
              sx={{
                input: { color: '#F8FAFC' },
                fieldset: { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.4)' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', mr: 0.5 }}>Filter:</Typography>
              {['All', 'Teachers', 'Staff'].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  clickable
                  onClick={() => setFilterType(type)}
                  sx={{
                    bgcolor: filterType === type ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                    color: filterType === type ? '#FFF' : '#94A3B8',
                    fontWeight: filterType === type ? 'bold' : 'normal',
                  }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
            {canModify && (
              <Box sx={{ display: 'inline-flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!isEditable}
                  onClick={() => handleBulkStatus('Present')}
                  startIcon={<CheckCircle2 size={14} color="#34D399" />}
                  sx={{ color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.3)', textTransform: 'none' }}
                >
                  Mark All Present
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!isEditable}
                  onClick={() => handleBulkStatus('Absent')}
                  startIcon={<XCircle size={14} color="#FCA5A5" />}
                  sx={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)', textTransform: 'none' }}
                >
                  Mark All Absent
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Attendance Register Roster Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : filteredRoster.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No staff or teacher matching search criteria.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} className="mui-table-container">
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Member Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Department / Role</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Attendance Status</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoster.map((row) => (
                <TableRow
                  key={row.personId}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={row.photoUrl} sx={{ width: 36, height: 36, bgcolor: '#6366F1' }}>
                        {row.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="semibold" sx={{ color: '#F8FAFC' }}>
                            {row.name}
                          </Typography>
                          {row.markedVia === 'Auto-Timeout' && (
                            <Chip label="Auto-Timeout" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', fontSize: 10, height: 18 }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {row.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.personType}
                      size="small"
                      sx={{
                        bgcolor: row.personType === 'Teacher' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: row.personType === 'Teacher' ? '#818CF8' : '#22D3EE',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.department}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {row.designation}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <ButtonGroup size="small" disabled={!isEditable}>
                      <Button
                        variant={row.status === 'Present' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(row.personId, 'Present')}
                        sx={{
                          bgcolor: row.status === 'Present' ? '#10B981' : 'transparent',
                          color: row.status === 'Present' ? '#FFF' : '#34D399',
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          '&:hover': { bgcolor: '#059669' },
                          textTransform: 'none',
                        }}
                      >
                        Present
                      </Button>
                      <Button
                        variant={row.status === 'Absent' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(row.personId, 'Absent')}
                        sx={{
                          bgcolor: row.status === 'Absent' ? '#EF4444' : 'transparent',
                          color: row.status === 'Absent' ? '#FFF' : '#FCA5A5',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          '&:hover': { bgcolor: '#DC2626' },
                          textTransform: 'none',
                        }}
                      >
                        Absent
                      </Button>
                      <Button
                        variant={row.status === 'Late' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(row.personId, 'Late')}
                        sx={{
                          bgcolor: row.status === 'Late' ? '#F59E0B' : 'transparent',
                          color: row.status === 'Late' ? '#FFF' : '#FBBF24',
                          borderColor: 'rgba(245, 158, 11, 0.3)',
                          '&:hover': { bgcolor: '#D97706' },
                          textTransform: 'none',
                        }}
                      >
                        Late
                      </Button>
                      <Button
                        variant={row.status === 'On Leave' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusToggle(row.personId, 'On Leave')}
                        sx={{
                          bgcolor: row.status === 'On Leave' ? '#3B82F6' : 'transparent',
                          color: row.status === 'On Leave' ? '#FFF' : '#60A5FA',
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          '&:hover': { bgcolor: '#2563EB' },
                          textTransform: 'none',
                        }}
                      >
                        On Leave
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      disabled={!isEditable}
                      placeholder="Add note..."
                      value={row.remarks || ''}
                      onChange={(e) => handleRemarksChange(row.personId, e.target.value)}
                      sx={{
                        input: { color: '#F8FAFC', fontSize: 12 },
                        fieldset: { borderColor: 'rgba(255,255,255,0.08)' },
                      }}
                    />
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

export default AttendanceManagement;
