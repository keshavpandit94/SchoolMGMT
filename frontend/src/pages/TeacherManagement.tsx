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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Teacher {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  department: string;
  designation: string;
  qualifications: string[];
  subjectsTaught: string[];
  joinedDate: string;
}

const TeacherManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Checking permissions: Admin & Principal can manage
  const canModify = user && ['Admin', 'Principal'].includes(user.role);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // Only for creation
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [qualificationsInput, setQualificationsInput] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/teachers');
      if (response.data.success) {
        setTeachers(response.data.teachers);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch teachers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setName(teacher.userId.name);
      setEmail(teacher.userId.email);
      setPhone(teacher.userId.phone || '');
      setPassword(''); // No password change here
      setDepartment(teacher.department);
      setDesignation(teacher.designation);
      setQualificationsInput(teacher.qualifications.join(', '));
      setSubjectsInput(teacher.subjectsTaught.join(', '));
    } else {
      setEditingTeacher(null);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setDepartment('');
      setDesignation('');
      setQualificationsInput('');
      setSubjectsInput('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTeacher(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qualifications = qualificationsInput.split(',').map((q) => q.trim()).filter((q) => q !== '');
    const subjectsTaught = subjectsInput.split(',').map((s) => s.trim()).filter((s) => s !== '');

    try {
      if (editingTeacher) {
        // Update teacher profile
        await axiosInstance.put(`/api/teachers/${editingTeacher._id}`, {
          name,
          email,
          phone,
          department,
          designation,
          qualifications,
          subjectsTaught,
        });
      } else {
        // Register new teacher
        await axiosInstance.post('/api/auth/register', {
          name,
          email,
          phone,
          password,
          role: 'Teacher',
          department,
          designation,
          qualifications,
          subjectsTaught,
        });
      }
      handleCloseDialog();
      fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving teacher profile');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher account? All associated login details will be deleted.')) {
      try {
        await axiosInstance.delete(`/api/teachers/${id}`);
        fetchTeachers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete teacher account');
      }
    }
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
          Faculty Directory
        </Typography>
        {canModify && (
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<Plus size={18} />}
            sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
          >
            Register Teacher
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : teachers.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No faculty members registered.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} className="mui-table-container">
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Email / Phone</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Department</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Designation</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Qualifications</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Subjects Taught</TableCell>
                {canModify && <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow
                  key={teacher._id}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' },
                  }}
                >
                  <TableCell fontWeight="semibold">{teacher.userId?.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{teacher.userId?.email}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{teacher.userId?.phone || 'No Phone'}</Typography>
                  </TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>{teacher.designation}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {teacher.qualifications.map((q) => (
                        <Chip key={q} label={q} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818CF8' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {teacher.subjectsTaught.map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22D3EE' }} />
                      ))}
                    </Box>
                  </TableCell>
                  {canModify && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton onClick={() => handleOpenDialog(teacher)} sx={{ color: '#6366F1' }}>
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTeacher(teacher._id)} sx={{ color: '#EF4444' }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Register/Edit Teacher Dialog */}
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
            {editingTeacher ? 'Edit Faculty Member Details' : 'Register Faculty Member'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teacher Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              {!editingTeacher && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  required
                  placeholder="e.g. Science, Mathematics"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  required
                  placeholder="e.g. Senior Lecturer, Head of Department"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Qualifications (Comma separated)"
                  placeholder="e.g. B.Ed, M.Sc in Physics"
                  value={qualificationsInput}
                  onChange={(e) => setQualificationsInput(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subjects Taught (Comma separated)"
                  placeholder="e.g. Physics, Chemistry"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
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
              {editingTeacher ? 'Save Changes' : 'Register Faculty'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TeacherManagement;
