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
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Staff {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  department: string;
  roleDetails: string;
  shift: 'Morning' | 'Evening' | 'Night';
  joinedDate: string;
}

const StaffManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Checking permissions: Admin & Principal can manage
  const canModify = user && ['Admin', 'Principal'].includes(user.role);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // Only for creation
  const [department, setDepartment] = useState('');
  const [roleDetails, setRoleDetails] = useState('');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/staff');
      if (response.data.success) {
        setStaffList(response.data.staff);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenDialog = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setName(staff.userId.name);
      setEmail(staff.userId.email);
      setPhone(staff.userId.phone || '');
      setPassword('');
      setDepartment(staff.department);
      setRoleDetails(staff.roleDetails);
      setShift(staff.shift);
    } else {
      setEditingStaff(null);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setDepartment('');
      setRoleDetails('');
      setShift('Morning');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingStaff) {
        // Update staff profile
        await axiosInstance.put(`/api/staff/${editingStaff._id}`, {
          name,
          email,
          phone,
          department,
          roleDetails,
          shift,
        });
      } else {
        // Register new staff
        await axiosInstance.post('/api/auth/register', {
          name,
          email,
          phone,
          password,
          role: 'Staff',
          department,
          roleDetails,
          shift,
        });
      }
      handleCloseDialog();
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving staff profile');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff account?')) {
      try {
        await axiosInstance.delete(`/api/staff/${id}`);
        fetchStaff();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete staff account');
      }
    }
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
          Support Staff Directory
        </Typography>
        {canModify && (
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<Plus size={18} />}
            sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
          >
            Register Staff
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
      ) : staffList.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No support staff registered.
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
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Role Description</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Shift</TableCell>
                {canModify && <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow
                  key={staff._id}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' },
                  }}
                >
                  <TableCell fontWeight="semibold">{staff.userId?.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{staff.userId?.email}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{staff.userId?.phone || 'No Phone'}</Typography>
                  </TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>{staff.roleDetails}</TableCell>
                  <TableCell>{staff.shift}</TableCell>
                  {canModify && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton onClick={() => handleOpenDialog(staff)} sx={{ color: '#6366F1' }}>
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteStaff(staff._id)} sx={{ color: '#EF4444' }}>
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

      {/* Register/Edit Staff Dialog */}
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
            {editingStaff ? 'Edit Staff Profile Details' : 'Register Support Staff'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
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
              {!editingStaff && (
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
                  label="Department / Assignment"
                  required
                  placeholder="e.g. Administration, Facilities, Security"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Shift"
                  required
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {['Morning', 'Evening', 'Night'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Role Details / Job Description"
                  required
                  placeholder="e.g. Handyman, Accountant, Gate Guard"
                  value={roleDetails}
                  onChange={(e) => setRoleDetails(e.target.value)}
                  sx={{ textarea: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
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
              {editingStaff ? 'Save Changes' : 'Register Staff'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
