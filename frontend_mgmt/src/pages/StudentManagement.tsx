import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import ImageUploader from '../components/ImageUploader';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Menu,
} from '@mui/material';
import { Plus, Search, Edit2, Trash2, Filter, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  photoUrl?: string;
  status: 'Pending Approval' | 'Active' | 'On Leave' | 'Suspended' | 'Graduated';
  createdBy?: { name: string; email: string; role: string };
  approvedBy?: { name: string; email: string; role: string };
}

const StudentManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Checking permissions
  const canModify = user && ['Admin', 'Principal', 'Teacher'].includes(user.role);
  const canApprove = user && ['Admin', 'Principal'].includes(user.role);

  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Search states
  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formName, setFormName] = useState('');
  const [formRoll, setFormRoll] = useState('');
  const [formClass, setFormClass] = useState('');
  const [formSection, setFormSection] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formAddress, setFormAddress] = useState('');
  const [formGuardianName, setFormGuardianName] = useState('');
  const [formGuardianPhone, setFormGuardianPhone] = useState('');
  const [formGuardianEmail, setFormGuardianEmail] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formStatus, setFormStatus] = useState<Student['status']>('Active');

  // Status Menu Anchor State
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState<Student | null>(null);

  // Fetch students function
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/students', {
        params: {
          page,
          search,
          className,
          section,
          status: statusFilter,
          limit: 10,
        },
      });
      if (response.data.success) {
        setStudents(response.data.students);
        setTotalPages(response.data.totalPages);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch students data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, className, section, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormName(student.name);
      setFormRoll(student.rollNumber);
      setFormClass(student.class);
      setFormSection(student.section);
      setFormDob(student.dateOfBirth.split('T')[0]);
      setFormGender(student.gender);
      setFormAddress(student.address || '');
      setFormGuardianName(student.guardianName);
      setFormGuardianPhone(student.guardianPhone);
      setFormGuardianEmail(student.guardianEmail || '');
      setFormPhotoUrl(student.photoUrl || '');
      setFormStatus(student.status || 'Active');
    } else {
      setEditingStudent(null);
      setFormName('');
      setFormRoll('');
      setFormClass('');
      setFormSection('');
      setFormDob('');
      setFormGender('Male');
      setFormAddress('');
      setFormGuardianName('');
      setFormGuardianPhone('');
      setFormGuardianEmail('');
      setFormPhotoUrl('');
      setFormStatus(user?.role === 'Teacher' ? 'Pending Approval' : 'Active');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStudent(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      rollNumber: formRoll,
      class: formClass,
      section: formSection,
      dateOfBirth: formDob,
      gender: formGender,
      address: formAddress,
      guardianName: formGuardianName,
      guardianPhone: formGuardianPhone,
      guardianEmail: formGuardianEmail,
      photoUrl: formPhotoUrl,
      status: formStatus,
    };

    try {
      if (editingStudent) {
        await axiosInstance.put(`/api/students/${editingStudent._id}`, payload);
      } else {
        await axiosInstance.post('/api/students', payload);
      }
      handleCloseDialog();
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving student record');
    }
  };

  const handleApproveStudent = async (id: string) => {
    try {
      await axiosInstance.patch(`/api/students/${id}/approve`);
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve student admission');
    }
  };

  const handleStatusChange = async (newStatus: Student['status']) => {
    if (!selectedStudentForStatus) return;
    try {
      await axiosInstance.patch(`/api/students/${selectedStudentForStatus._id}/status`, { status: newStatus });
      setStatusMenuAnchor(null);
      setSelectedStudentForStatus(null);
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update student status');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await axiosInstance.delete(`/api/students/${id}`);
        fetchStudents();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const renderStatusChip = (status: Student['status']) => {
    switch (status) {
      case 'Pending Approval':
        return <Chip label="Pending Approval" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 'bold' }} />;
      case 'Active':
        return <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 'bold' }} />;
      case 'On Leave':
        return <Chip label="On Leave" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 'bold' }} />;
      case 'Suspended':
        return <Chip label="Suspended" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }} />;
      case 'Graduated':
        return <Chip label="Graduated" size="small" sx={{ bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: 'bold' }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
            Students Management
          </Typography>
          {user?.role === 'Teacher' && (
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Note: Students registered by teachers require Principal/Admin approval before becoming active.
            </Typography>
          )}
        </Box>
        {canModify && (
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<Plus size={18} />}
            sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
          >
            Add Student
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' }}>
          {error}
        </Alert>
      )}

      {/* Filter and Search Panel */}
      <Card
        className="glass-panel"
        sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search name, roll, guardian..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />,
                }}
                sx={{
                  input: { color: '#F8FAFC' },
                  fieldset: { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.4)' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                sx={{
                  '& .MuiSelect-select': { color: '#F8FAFC' },
                  fieldset: { borderColor: 'rgba(255,255,255,0.08)' },
                  '& label': { color: '#94A3B8' },
                }}
              >
                <MenuItem value="">All Classes</MenuItem>
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
                sx={{
                  '& .MuiSelect-select': { color: '#F8FAFC' },
                  fieldset: { borderColor: 'rgba(255,255,255,0.08)' },
                  '& label': { color: '#94A3B8' },
                }}
              >
                <MenuItem value="">All Sections</MenuItem>
                {['A', 'B', 'C', 'D'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  '& .MuiSelect-select': { color: '#F8FAFC' },
                  fieldset: { borderColor: 'rgba(255,255,255,0.08)' },
                  '& label': { color: '#94A3B8' },
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Pending Approval">⏳ Pending Approval</MenuItem>
                <MenuItem value="Active">🟢 Active</MenuItem>
                <MenuItem value="On Leave">🔵 On Leave</MenuItem>
                <MenuItem value="Suspended">🔴 Suspended</MenuItem>
                <MenuItem value="Graduated">🟣 Graduated</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  startIcon={<Filter size={16} />}
                  sx={{
                    color: '#F8FAFC',
                    borderColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { borderColor: 'rgba(99, 102, 241, 0.4)' },
                    textTransform: 'none',
                  }}
                >
                  Filter
                </Button>
                <Button
                  variant="text"
                  sx={{ color: '#94A3B8', textTransform: 'none' }}
                  onClick={() => {
                    setSearch('');
                    setClassName('');
                    setSection('');
                    setStatusFilter('');
                    setPage(1);
                    setTimeout(() => fetchStudents(), 50);
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Students Data Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : students.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No student records found matching filters.
          </Typography>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper} className="mui-table-container">
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Photo</TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Roll No</TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Class / Section</TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Guardian</TableCell>
                  {canModify && <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student._id}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                      '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' },
                    }}
                  >
                    <TableCell>
                      <Avatar src={student.photoUrl} sx={{ width: 36, height: 36, bgcolor: '#6366F1', fontSize: 14 }}>
                        {student.name.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell fontWeight="semibold">{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class} ({student.section})</TableCell>
                    <TableCell>{renderStatusChip(student.status)}</TableCell>
                    <TableCell>
                      {student.guardianName}
                      <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8' }}>
                        {student.guardianPhone}
                      </Typography>
                    </TableCell>
                    {canModify && (
                      <TableCell sx={{ textAlign: 'center' }}>
                        {/* Approval button for Principal / Admin if student is Pending Approval */}
                        {student.status === 'Pending Approval' && canApprove && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => handleApproveStudent(student._id)}
                            startIcon={<CheckCircle2 size={14} />}
                            sx={{ mr: 1, textTransform: 'none', borderRadius: 1.5, fontSize: 12 }}
                          >
                            Approve
                          </Button>
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            setSelectedStudentForStatus(student);
                            setStatusMenuAnchor(e.currentTarget);
                          }}
                          sx={{ mr: 1, color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)', textTransform: 'none', fontSize: 11 }}
                        >
                          Change Status
                        </Button>

                        <IconButton onClick={() => handleOpenDialog(student)} sx={{ color: '#6366F1' }}>
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteStudent(student._id)} sx={{ color: '#EF4444' }}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Status Change Dropdown Menu */}
          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={() => setStatusMenuAnchor(null)}
            PaperProps={{
              sx: { bgcolor: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' },
            }}
          >
            <MenuItem onClick={() => handleStatusChange('Active')} sx={{ color: '#34D399' }}>🟢 Mark Active</MenuItem>
            <MenuItem onClick={() => handleStatusChange('On Leave')} sx={{ color: '#60A5FA' }}>🔵 Mark On Leave</MenuItem>
            <MenuItem onClick={() => handleStatusChange('Suspended')} sx={{ color: '#FCA5A5' }}>🔴 Suspend Student</MenuItem>
            <MenuItem onClick={() => handleStatusChange('Graduated')} sx={{ color: '#A78BFA' }}>🟣 Mark Graduated</MenuItem>
          </Menu>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#94A3B8',
                  borderColor: 'rgba(255,255,255,0.08)',
                  '&.Mui-selected': { bgcolor: '#6366F1', color: '#FFF' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                },
              }}
            />
          </Box>
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: '#F8FAFC',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
          },
        }}
      >
        <form onSubmit={handleFormSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>
            {editingStudent ? 'Edit Student Details' : 'Register New Student'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>Student Profile Picture:</Typography>
                <ImageUploader
                  currentImageUrl={formPhotoUrl}
                  onUploadSuccess={(url) => setFormPhotoUrl(url)}
                  label="Upload Student Photo"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student Full Name"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  required
                  value={formRoll}
                  onChange={(e) => setFormRoll(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Class"
                  required
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Section"
                  required
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {['A', 'B', 'C', 'D'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  required
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {['Male', 'Female', 'Other'].map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Residential Address"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  sx={{ textarea: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Guardian Full Name"
                  required
                  value={formGuardianName}
                  onChange={(e) => setFormGuardianName(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Guardian Phone"
                  required
                  value={formGuardianPhone}
                  onChange={(e) => setFormGuardianPhone(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Guardian Email"
                  type="email"
                  value={formGuardianEmail}
                  onChange={(e) => setFormGuardianEmail(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#94A3B8', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
            >
              {editingStudent ? 'Save Changes' : user?.role === 'Teacher' ? 'Submit for Principal Approval' : 'Register Student'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;
