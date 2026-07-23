import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import ImageUploader from '../components/ImageUploader';
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
  Avatar,
  Chip,
  Menu,
} from '@mui/material';
import { Plus, Edit2, Trash2, ShieldCheck, Briefcase } from 'lucide-react';

interface Staff {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };
  department: string;
  roleDetails: string;
  photoUrl?: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Resigned' | 'Retired';
  shift: 'Morning' | 'Evening' | 'Night';
  joinedDate: string;
}

const DEPARTMENTS = [
  'Administration & Accounts',
  'Academic Coordination & Exam Cell',
  'Kindergarten & Primary Support (Nursery - UKG)',
  'Medical & Counseling',
  'Library & Laboratory',
  'Sports & Extra-Curricular',
  'Transport & Security',
  'Facilities & Housekeeping',
];

const PRESET_ROLES = [
  'Vice Principal',
  'Academic Coordinator',
  'Exam Controller / In-charge',
  'Admissions Officer',
  'Accountant / Cashier',
  'Front Desk Receptionist',
  'Nursery Caretaker / Helper',
  'School Nurse',
  'Child Counselor & Psychologist',
  'Special Educator',
  'Head Librarian',
  'Science / Computer Lab Assistant',
  'Sports Coach & PE Instructor',
  'Transport Manager',
  'School Bus Driver',
  'Bus Attendant / Conductor',
  'Chief Security Guard',
  'Estate Maintenance & Housekeeping',
];

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
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [roleDetails, setRoleDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');

  // Status Menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedStaffForStatus, setSelectedStaffForStatus] = useState<Staff | null>(null);

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
      setPhotoUrl(staff.photoUrl || staff.userId.profilePicture || '');
      setShift(staff.shift);
    } else {
      setEditingStaff(null);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setDepartment(DEPARTMENTS[0]);
      setRoleDetails('');
      setPhotoUrl('');
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
          photoUrl,
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
          photoUrl,
          shift,
        });
      }
      handleCloseDialog();
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving staff profile');
    }
  };

  const handleStatusChange = async (newStatus: Staff['status']) => {
    if (!selectedStaffForStatus) return;
    try {
      await axiosInstance.patch(`/api/staff/${selectedStaffForStatus._id}/status`, { status: newStatus });
      setStatusMenuAnchor(null);
      setSelectedStaffForStatus(null);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update staff status');
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

  const renderStatusChip = (status: Staff['status']) => {
    switch (status) {
      case 'Active':
        return <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 'bold' }} />;
      case 'On Leave':
        return <Chip label="On Leave" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 'bold' }} />;
      case 'Suspended':
        return <Chip label="Suspended" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }} />;
      case 'Resigned':
        return <Chip label="Resigned" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 'bold' }} />;
      case 'Retired':
        return <Chip label="Retired" size="small" sx={{ bgcolor: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF', border: '1px solid rgba(107, 114, 128, 0.3)', fontWeight: 'bold' }} />;
      default:
        return <Chip label={status || 'Active'} size="small" />;
    }
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
            K-12 School Staff Directory
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Managing administrative, academic support, kindergarten care, transport, medical, and security personnel.
          </Typography>
        </Box>
        {canModify && (
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<Plus size={18} />}
            sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
          >
            Register Staff Member
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
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Photo</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Department</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Role / Designation</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Status</TableCell>
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
                  <TableCell>
                    <Avatar src={staff.photoUrl || staff.userId?.profilePicture} sx={{ width: 38, height: 38, bgcolor: '#6366F1' }}>
                      {staff.userId?.name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell fontWeight="semibold">
                    {staff.userId?.name}
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                      {staff.userId?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={staff.department} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818CF8' }} />
                  </TableCell>
                  <TableCell>{staff.roleDetails}</TableCell>
                  <TableCell>{renderStatusChip(staff.status)}</TableCell>
                  <TableCell>{staff.shift}</TableCell>
                  {canModify && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          setSelectedStaffForStatus(staff);
                          setStatusMenuAnchor(e.currentTarget);
                        }}
                        sx={{ mr: 1, color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)', textTransform: 'none', fontSize: 11 }}
                      >
                        Status
                      </Button>

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
        <MenuItem onClick={() => handleStatusChange('Suspended')} sx={{ color: '#FCA5A5' }}>🔴 Suspend Staff</MenuItem>
        <MenuItem onClick={() => handleStatusChange('Resigned')} sx={{ color: '#FBBF24' }}>🟡 Resigned</MenuItem>
        <MenuItem onClick={() => handleStatusChange('Retired')} sx={{ color: '#9CA3AF' }}>⚪ Retired</MenuItem>
      </Menu>

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
            {editingStaff ? 'Edit Staff Member Details' : 'Register New Staff Member (K-12 School)'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>Staff Profile Picture:</Typography>
                <ImageUploader
                  currentImageUrl={photoUrl}
                  onUploadSuccess={(url) => setPhotoUrl(url)}
                  label="Upload Staff Photo"
                />
              </Grid>

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
                  select
                  fullWidth
                  label="Department / Functional Area"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Work Shift"
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

              {/* Quick Role Selection Presets */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                  Quick Preset Roles (Nursery to 12th grade school):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {PRESET_ROLES.map((rolePreset) => (
                    <Chip
                      key={rolePreset}
                      label={rolePreset}
                      size="small"
                      clickable
                      onClick={() => setRoleDetails(rolePreset)}
                      sx={{
                        bgcolor: roleDetails === rolePreset ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                        color: roleDetails === rolePreset ? '#FFF' : '#94A3B8',
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.3)' },
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specific Role Details / Job Description"
                  required
                  placeholder="e.g. Vice Principal, School Nurse, Bus Driver, Lab Assistant"
                  value={roleDetails}
                  onChange={(e) => setRoleDetails(e.target.value)}
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
              {editingStaff ? 'Save Changes' : 'Register Staff'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
