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
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import { Plus, Edit2, Trash2, UserCheck, KeyRound } from 'lucide-react';

interface Teacher {
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
  designation: string;
  photoUrl?: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Resigned' | 'Retired';
  qualifications: string[];
  subjectsTaught: string[];
  isClassTeacher?: boolean;
  assignedClass?: string;
  assignedSection?: string;
  joinedDate: string;
  statusReason?: string;
  statusDuration?: number;
  pendingStatus?: string;
  pendingReason?: string;
  pendingDuration?: number;
}

const DEPARTMENTS = [
  'Science',
  'Mathematics',
  'English',
  'Social Studies',
  'Languages',
  'Arts',
  'Physical Education',
  'Primary Education',
  'Pre-Primary Education',
  'Computer Science',
  'Commerce',
];

const ROLES_DESIGNATIONS = [
  'Class Teacher',
  'Subject Teacher',
  'Head of Department (HOD)',
  'Senior Lecturer',
  'Assistant Teacher',
  'Vice Principal',
  'Primary Coordinator',
];

const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const SECTIONS = ['A', 'B', 'C', 'D'];

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Studies',
  'History',
  'Geography',
  'Computer Science',
  'Science',
  'EVS',
  'Art & Craft',
  'Physical Education',
  'Music',
  'Commerce',
  'Economics',
  'Accountancy',
];

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
  const [pinCode, setPinCode] = useState('1234');
  const [password, setPassword] = useState(''); // Only for creation
  const [department, setDepartment] = useState('Science');
  const [designation, setDesignation] = useState('Subject Teacher');
  const [photoUrl, setPhotoUrl] = useState('');
  const [qualificationsInput, setQualificationsInput] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [assignedClass, setAssignedClass] = useState('Class 1');
  const [assignedSection, setAssignedSection] = useState('A');

  // Status Menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTeacherForStatus, setSelectedTeacherForStatus] = useState<Teacher | null>(null);

  // States for Leave/Suspension details dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatusToApply, setSelectedStatusToApply] = useState<Teacher['status'] | 'Deleted'>('Active');
  const [statusReason, setStatusReason] = useState('');
  const [statusDuration, setStatusDuration] = useState('');
  const [selectedTeacherForStatusChange, setSelectedTeacherForStatusChange] = useState<Teacher | null>(null);

  const handleStatusMenuClick = (status: Teacher['status']) => {
    setStatusMenuAnchor(null);
    setSelectedStatusToApply(status);
    setStatusReason('');
    setStatusDuration('');
    setSelectedTeacherForStatusChange(selectedTeacherForStatus);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacherForStatusChange(teacher);
    setSelectedStatusToApply('Deleted');
    setStatusReason('');
    setStatusDuration('');
    setStatusDialogOpen(true);
  };

  const handleStatusDialogSubmit = async () => {
    if (!selectedTeacherForStatusChange) return;

    try {
      if (selectedStatusToApply === 'Deleted') {
        await axiosInstance.delete(`/api/teachers/${selectedTeacherForStatusChange._id}`, {
          data: { reason: statusReason }
        });
      } else {
        await axiosInstance.patch(`/api/teachers/${selectedTeacherForStatusChange._id}/status`, {
          status: selectedStatusToApply,
          reason: statusReason,
          duration: Number(statusDuration) || 0
        });
      }
      setStatusDialogOpen(false);
      fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing status change request');
    }
  };

  const handleApproveStatusRequest = async (id: string, approve: boolean) => {
    try {
      await axiosInstance.patch(`/api/teachers/${id}/approve-status`, { approve });
      fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve status request');
    }
  };

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
      setPinCode(teacher.userId.pinCode || '1234');
      setPassword('');
      setDepartment(teacher.department || 'Science');
      setDesignation(teacher.designation || 'Subject Teacher');
      setPhotoUrl(teacher.photoUrl || teacher.userId.profilePicture || '');
      setQualificationsInput(teacher.qualifications.join(', '));
      setSelectedSubjects(teacher.subjectsTaught || []);
      setIsClassTeacher(Boolean(teacher.isClassTeacher));
      setAssignedClass(teacher.assignedClass || 'Class 1');
      setAssignedSection(teacher.assignedSection || 'A');
    } else {
      setEditingTeacher(null);
      setName('');
      setEmail('');
      setPhone('');
      setPinCode(Math.floor(1000 + Math.random() * 9000).toString());
      setPassword('');
      setDepartment('Science');
      setDesignation('Subject Teacher');
      setPhotoUrl('');
      setQualificationsInput('');
      setSelectedSubjects([]);
      setIsClassTeacher(false);
      setAssignedClass('Class 1');
      setAssignedSection('A');
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

    if (pinCode && !/^\d{4}$/.test(pinCode.trim())) {
      setError('Security PIN must be exactly 4 numeric digits (e.g. 1234)');
      return;
    }

    const qualifications = qualificationsInput
      .split(',')
      .map((q) => q.trim())
      .filter((q) => q !== '');

    const payload = {
      name,
      email,
      phone,
      pinCode,
      department,
      designation,
      photoUrl,
      qualifications,
      subjectsTaught: selectedSubjects,
      isClassTeacher,
      assignedClass: isClassTeacher ? assignedClass : '',
      assignedSection: isClassTeacher ? assignedSection : '',
    };

    try {
      if (editingTeacher) {
        // Update teacher profile
        await axiosInstance.put(`/api/teachers/${editingTeacher._id}`, payload);
      } else {
        // Register new teacher
        await axiosInstance.post('/api/auth/register', {
          ...payload,
          password,
          role: 'Teacher',
        });
      }
      handleCloseDialog();
      fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving teacher profile');
    }
  };

  const handleStatusChange = async (newStatus: Teacher['status']) => {
    if (!selectedTeacherForStatus) return;
    try {
      await axiosInstance.patch(`/api/teachers/${selectedTeacherForStatus._id}/status`, { status: newStatus });
      setStatusMenuAnchor(null);
      setSelectedTeacherForStatus(null);
      fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update teacher status');
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

  const renderStatusChip = (status: Teacher['status']) => {
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
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
          Faculty Directory & Teacher Assignments
        </Typography>
        {canModify && (
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<Plus size={18} />}
            sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
          >
            Create Teacher Account
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
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Photo</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Name & Email</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Kiosk PIN</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Dept & Role</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Class Teacher Assignment</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Status</TableCell>
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
                  <TableCell>
                    <Avatar src={teacher.photoUrl || teacher.userId?.profilePicture} sx={{ width: 40, height: 40, bgcolor: '#6366F1' }}>
                      {teacher.userId?.name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#F8FAFC' }}>
                      {teacher.userId?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      {teacher.userId?.email} {teacher.userId?.phone ? `• ${teacher.userId?.phone}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<KeyRound size={13} color="#F59E0B" />}
                      label={`PIN: ${teacher.userId?.pinCode || '1234'}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 'bold', fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{teacher.department}</Typography>
                    <Typography variant="caption" sx={{ color: '#818CF8' }}>{teacher.designation}</Typography>
                  </TableCell>
                  <TableCell>
                    {teacher.isClassTeacher ? (
                      <Chip
                        icon={<UserCheck size={14} color="#10B981" />}
                        label={`Class Teacher (${teacher.assignedClass}-${teacher.assignedSection})`}
                        size="small"
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 'bold' }}
                      />
                    ) : (
                      <Chip label="Subject Teacher" size="small" variant="outlined" sx={{ color: '#64748B', borderColor: 'rgba(255,255,255,0.1)' }} />
                    )}
                  </TableCell>
                   <TableCell>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                       {renderStatusChip(teacher.status)}
                       {teacher.statusReason && (
                         <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', maxWidth: 150, display: 'block' }}>
                           Reason: {teacher.statusReason} {teacher.statusDuration > 0 && `(${teacher.statusDuration} days)`}
                         </Typography>
                       )}
                       {teacher.pendingStatus && teacher.pendingStatus !== 'None' && (
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                           <Chip
                             label={`Pending: ${teacher.pendingStatus}`}
                             size="small"
                             variant="outlined"
                             sx={{ fontSize: 10, borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FBBF24' }}
                           />
                           {teacher.pendingReason && (
                             <Typography variant="caption" sx={{ color: '#FBBF24', fontSize: 10, fontStyle: 'italic', maxWidth: 150, display: 'block' }}>
                               "Why: {teacher.pendingReason}" {teacher.pendingDuration > 0 && `(${teacher.pendingDuration} days)`}
                             </Typography>
                           )}
                           {user?.role === 'Admin' && (
                             <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                               <Button
                                 size="small"
                                 variant="contained"
                                 color="success"
                                 onClick={() => handleApproveStatusRequest(teacher._id, true)}
                                 sx={{ py: 0.25, px: 1, minWidth: 0, fontSize: 10, textTransform: 'none' }}
                               >
                                 Approve
                               </Button>
                               <Button
                                 size="small"
                                 variant="contained"
                                 color="error"
                                 onClick={() => handleApproveStatusRequest(teacher._id, false)}
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
                   <TableCell>
                     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                       {teacher.subjectsTaught && teacher.subjectsTaught.length > 0 ? (
                         teacher.subjectsTaught.map((s) => (
                           <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22D3EE', fontSize: 11 }} />
                         ))
                       ) : (
                         <Typography variant="caption" sx={{ color: '#64748B' }}>None assigned</Typography>
                       )}
                     </Box>
                   </TableCell>
                   {canModify && (
                     <TableCell sx={{ textAlign: 'center' }}>
                       <Button
                         size="small"
                         variant="outlined"
                         onClick={(e) => {
                           setSelectedTeacherForStatus(teacher);
                           setStatusMenuAnchor(e.currentTarget);
                         }}
                         sx={{ mr: 1, color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)', textTransform: 'none', fontSize: 11 }}
                       >
                         Status
                       </Button>

                       <IconButton onClick={() => handleOpenDialog(teacher)} sx={{ color: '#6366F1' }}>
                         <Edit2 size={16} />
                       </IconButton>
                       <IconButton onClick={() => handleDeleteClick(teacher)} sx={{ color: '#EF4444' }}>
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
        <MenuItem onClick={() => handleStatusMenuClick('Suspended')} sx={{ color: '#FCA5A5' }}>🔴 Suspend Teacher</MenuItem>
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

      {/* Create / Edit Teacher Dialog */}
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
            {editingTeacher ? 'Edit Teacher Details & Security PIN' : 'Create New Teacher Account & Set PIN'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>Teacher Profile Picture:</Typography>
                <ImageUploader
                  currentImageUrl={photoUrl}
                  onUploadSuccess={(url) => setPhotoUrl(url)}
                  label="Upload Teacher Photo"
                />
              </Grid>

              {/* Basic Info */}
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
                  label="Email Address (Login ID)"
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
                  disabled={!editingTeacher || user?.role !== 'Admin'}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinCode(val);
                  }}
                  placeholder="1234"
                  helperText={!editingTeacher ? "Auto-generated random PIN for Kiosk check-in" : user?.role !== 'Admin' ? "Security PIN (Only Admin can modify)" : "Security PIN (Admin editable once every 14 days)"}
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

              {!editingTeacher && (
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
              )}

              {/* Department & Role Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#94A3B8' }}>Select Department</InputLabel>
                  <Select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    label="Select Department"
                    sx={{ color: '#FFF', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#94A3B8' }}>Select Role / Designation</InputLabel>
                  <Select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    label="Select Role / Designation"
                    sx={{ color: '#FFF', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {ROLES_DESIGNATIONS.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Multiple Subjects Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#94A3B8' }}>Select Subjects Taught</InputLabel>
                  <Select
                    multiple
                    value={selectedSubjects}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedSubjects(typeof val === 'string' ? val.split(',') : val);
                    }}
                    input={<OutlinedInput label="Select Subjects Taught" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" sx={{ bgcolor: '#6366F1', color: '#FFF' }} />
                        ))}
                      </Box>
                    )}
                    sx={{ color: '#FFF', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {AVAILABLE_SUBJECTS.map((subj) => (
                      <MenuItem key={subj} value={subj}>
                        <Checkbox checked={selectedSubjects.indexOf(subj) > -1} sx={{ color: '#818CF8' }} />
                        <ListItemText primary={subj} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Qualifications */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Academic Qualifications (Comma separated)"
                  placeholder="e.g. B.Ed, M.Sc in Mathematics"
                  value={qualificationsInput}
                  onChange={(e) => setQualificationsInput(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>

              {/* Class Teacher Assignment Toggle */}
              <Grid item xs={12}>
                <Card sx={{ p: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isClassTeacher}
                        onChange={(e) => setIsClassTeacher(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography fontWeight="bold" sx={{ color: '#818CF8' }}>
                        Assign as Class Teacher (Grants Student Attendance Input Access for Class)
                      </Typography>
                    }
                  />

                  {isClassTeacher && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: '#94A3B8' }}>Assigned Class</InputLabel>
                          <Select
                            value={assignedClass}
                            onChange={(e) => setAssignedClass(e.target.value)}
                            label="Assigned Class"
                            sx={{ color: '#FFF', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                          >
                            {CLASSES.map((cls) => (
                              <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: '#94A3B8' }}>Assigned Section</InputLabel>
                          <Select
                            value={assignedSection}
                            onChange={(e) => setAssignedSection(e.target.value)}
                            label="Assigned Section"
                            sx={{ color: '#FFF', fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                          >
                            {SECTIONS.map((sec) => (
                              <MenuItem key={sec} value={sec}>Section {sec}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                </Card>
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
              {editingTeacher ? 'Save Changes' : 'Create Teacher Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TeacherManagement;
