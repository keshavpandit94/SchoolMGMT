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
  InputAdornment,
} from '@mui/material';
import { Plus, Edit2, Trash2, KeyRound } from 'lucide-react';

interface Staff {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    pinCode?: string;
    profilePicture?: string;
  };
  department: string;
  roleDetails: string;
  photoUrl?: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Resigned' | 'Retired';
  shift: 'Morning' | 'Evening' | 'Night';
  joinedDate: string;
  statusReason?: string;
  statusDuration?: number;
  pendingStatus?: string;
  pendingReason?: string;
  pendingDuration?: number;
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
  const [pinCode, setPinCode] = useState('1234');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [roleDetails, setRoleDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [role, setRole] = useState<'Staff' | 'Principal' | 'Admin'>('Staff');

  // Status Menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedStaffForStatus, setSelectedStaffForStatus] = useState<Staff | null>(null);

  // States for Leave/Suspension details dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatusToApply, setSelectedStatusToApply] = useState<Staff['status'] | 'Deleted'>('Active');
  const [statusReason, setStatusReason] = useState('');
  const [statusDuration, setStatusDuration] = useState('');
  const [selectedStaffForStatusChange, setSelectedStaffForStatusChange] = useState<Staff | null>(null);

  const handleStatusMenuClick = (status: Staff['status']) => {
    setStatusMenuAnchor(null);
    setSelectedStatusToApply(status);
    setStatusReason('');
    setStatusDuration('');
    setSelectedStaffForStatusChange(selectedStaffForStatus);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaffForStatusChange(staff);
    setSelectedStatusToApply('Deleted');
    setStatusReason('');
    setStatusDuration('');
    setStatusDialogOpen(true);
  };

  const handleStatusDialogSubmit = async () => {
    if (!selectedStaffForStatusChange) return;

    try {
      if (selectedStatusToApply === 'Deleted') {
        await axiosInstance.delete(`/api/staff/${selectedStaffForStatusChange._id}`, {
          data: { reason: statusReason }
        });
      } else {
        await axiosInstance.patch(`/api/staff/${selectedStaffForStatusChange._id}/status`, {
          status: selectedStatusToApply,
          reason: statusReason,
          duration: Number(statusDuration) || 0
        });
      }
      setStatusDialogOpen(false);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing status change request');
    }
  };

  const handleApproveStatusRequest = async (id: string, approve: boolean) => {
    try {
      await axiosInstance.patch(`/api/staff/${id}/approve-status`, { approve });
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve status request');
    }
  };

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
      setPinCode(staff.userId.pinCode || '1234');
      setPassword('');
      setDepartment(staff.department);
      setRoleDetails(staff.roleDetails);
      setPhotoUrl(staff.photoUrl || staff.userId.profilePicture || '');
      setShift(staff.shift);
      setRole((staff.userId.role as any) || 'Staff');
    } else {
      setEditingStaff(null);
      setName('');
      setEmail('');
      setPhone('');
      setPinCode(Math.floor(1000 + Math.random() * 9000).toString());
      setPassword('');
      setDepartment(DEPARTMENTS[0]);
      setRoleDetails('');
      setPhotoUrl('');
      setShift('Morning');
      setRole('Staff');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode && !/^\d{4}$/.test(pinCode.trim())) {
      setError('Security PIN must be exactly 4 numeric digits (e.g. 1234)');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      pinCode,
      department,
      roleDetails,
      photoUrl,
      shift,
    };

    try {
      if (editingStaff) {
        // Update staff profile
        await axiosInstance.put(`/api/staff/${editingStaff._id}`, payload);
      } else {
        // Register new staff / principal / admin
        await axiosInstance.post('/api/auth/register', {
          ...payload,
          password,
          role,
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
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Name & Email</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Kiosk PIN</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#F8FAFC' }}>
                      {staff.userId?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      {staff.userId?.email} {staff.userId?.phone ? `• ${staff.userId?.phone}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<KeyRound size={13} color="#F59E0B" />}
                      label={`PIN: ${staff.userId?.pinCode || '1234'}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 'bold', fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={staff.department} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818CF8' }} />
                  </TableCell>
                  <TableCell>{staff.roleDetails}</TableCell>
                   <TableCell>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                       {renderStatusChip(staff.status)}
                       {staff.statusReason && (
                         <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', maxWidth: 150, display: 'block' }}>
                           Reason: {staff.statusReason} {staff.statusDuration > 0 && `(${staff.statusDuration} days)`}
                         </Typography>
                       )}
                       {staff.pendingStatus && staff.pendingStatus !== 'None' && (
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                           <Chip
                             label={`Pending: ${staff.pendingStatus}`}
                             size="small"
                             variant="outlined"
                             sx={{ fontSize: 10, borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FBBF24' }}
                           />
                           {staff.pendingReason && (
                             <Typography variant="caption" sx={{ color: '#FBBF24', fontSize: 10, fontStyle: 'italic', maxWidth: 150, display: 'block' }}>
                               "Why: {staff.pendingReason}" {staff.pendingDuration > 0 && `(${staff.pendingDuration} days)`}
                             </Typography>
                           )}
                           {user?.role === 'Admin' && (
                             <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                               <Button
                                 size="small"
                                 variant="contained"
                                 color="success"
                                 onClick={() => handleApproveStatusRequest(staff._id, true)}
                                 sx={{ py: 0.25, px: 1, minWidth: 0, fontSize: 10, textTransform: 'none' }}
                               >
                                 Approve
                               </Button>
                               <Button
                                 size="small"
                                 variant="contained"
                                 color="error"
                                 onClick={() => handleApproveStatusRequest(staff._id, false)}
                                 sx={{ py: 0.25, px: 1, minWidth: 0, fontSize: 10, textTransform: 'none' }}
                               >
                                 Reject
                               </Button>
                             </Box>
                           )}
                         </Box>
                       )}
                     </Box>
                   </TableCell>
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
                       <IconButton onClick={() => handleDeleteClick(staff)} sx={{ color: '#EF4444' }}>
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
        <MenuItem onClick={() => handleStatusMenuClick('Active')} sx={{ color: '#34D399' }}>🟢 Mark Active</MenuItem>
        <MenuItem onClick={() => handleStatusMenuClick('On Leave')} sx={{ color: '#60A5FA' }}>🔵 Mark On Leave</MenuItem>
        <MenuItem onClick={() => handleStatusMenuClick('Suspended')} sx={{ color: '#FCA5A5' }}>🔴 Suspend Staff</MenuItem>
        <MenuItem onClick={() => handleStatusMenuClick('Resigned')} sx={{ color: '#FBBF24' }}>🟡 Resigned</MenuItem>
        <MenuItem onClick={() => handleStatusMenuClick('Retired')} sx={{ color: '#9CA3AF' }}>⚪ Retired</MenuItem>
      </Menu>

      {/* Leave/Suspension/Action Details Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0B1220',
            color: '#FDFBF7',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedStatusToApply === 'Deleted'
            ? 'Delete/Fire Account Request'
            : selectedStatusToApply === 'On Leave'
            ? 'Apply for Leave'
            : selectedStatusToApply === 'Suspended'
            ? 'Suspend Account'
            : `Set status to ${selectedStatusToApply}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              {selectedStatusToApply === 'Deleted'
                ? 'Please provide a reason for deleting/firing this account.'
                : `Please specify the details for marking this account as ${selectedStatusToApply}.`}
            </Typography>

            <TextField
              label="Reason / Remarks"
              fullWidth
              required
              multiline
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
            />

            {(selectedStatusToApply === 'On Leave' || selectedStatusToApply === 'Suspended') && (
              <TextField
                label="Duration (in Days)"
                fullWidth
                required
                type="number"
                value={statusDuration}
                onChange={(e) => setStatusDuration(e.target.value)}
                sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ color: '#94A3B8', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStatusDialogSubmit}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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
            {editingStaff ? 'Edit Staff Member Details & Security PIN' : 'Register New Staff Member & Set PIN'}
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

              {/* Security PIN Set by Admin/Principal */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Security PIN Passcode (4 Digits)"
                  required
                  value={pinCode}
                  disabled={!editingStaff || user?.role !== 'Admin'}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinCode(val);
                  }}
                  placeholder="1234"
                  helperText={!editingStaff ? "Auto-generated random PIN for Kiosk check-in" : user?.role !== 'Admin' ? "Security PIN (Only Admin can modify)" : "Security PIN (Admin editable once every 14 days)"}
                  inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyRound size={18} color="#FBBF24" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    input: { color: '#FBBF24', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 },
                    label: { color: '#94A3B8' },
                    '& .MuiFormHelperText-root': { color: '#64748B', fontSize: 11 },
                    fieldset: { borderColor: 'rgba(245, 158, 11, 0.3)' },
                  }}
                />
              </Grid>

              {!editingStaff && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Account Type (System Role)"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <MenuItem value="Staff">Support Staff</MenuItem>
                      <MenuItem value="Principal">School Principal</MenuItem>
                      <MenuItem value="Admin">System Admin</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                    />
                  </Grid>
                </>
              )}

              {role === 'Staff' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Department / Functional Area"
                      required={role === 'Staff'}
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
                      required={role === 'Staff'}
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
                            bgcolor: roleDetails === rolePreset ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                            color: roleDetails === rolePreset ? '#FFF' : '#94A3B8',
                            '&:hover': { bgcolor: 'rgba(234, 88, 12, 0.3)' },
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Specific Role Details / Job Description"
                      required={role === 'Staff'}
                      placeholder="e.g. Vice Principal, School Nurse, Bus Driver, Lab Assistant"
                      value={roleDetails}
                      onChange={(e) => setRoleDetails(e.target.value)}
                      sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                    />
                  </Grid>
                </>
              )}
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
