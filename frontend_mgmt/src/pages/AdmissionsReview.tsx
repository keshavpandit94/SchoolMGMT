import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../services/axiosInstance';
import { useSocket } from '../hooks/useSocket';
import type { Student } from '../types/student';
import {
  Box,
  Card,
  Typography,
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
  Button,
  IconButton,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
  Filter,
  Calendar,
  Phone,
  Mail,
  User,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const AdmissionsReview: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected Student & UI drawers/modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  
  // Approval modal states
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [finalClass, setFinalClass] = useState('');
  const [finalSection, setFinalSection] = useState('A');
  const [finalRollNumber, setFinalRollNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const classesList = [
    'Grade I', 'Grade II', 'Grade III', 'Grade IV', 'Grade V',
    'Grade VI', 'Grade VII', 'Grade VIII', 'Grade IX', 'Grade X',
    'Grade XI (Science)', 'Grade XI (Commerce)', 'Grade XII (Science)', 'Grade XII (Commerce)'
  ];

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/api/students', {
        params: { limit: 200 }
      });
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch admission applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Socket.io event handler memo for real-time syncing
  const socketHandlers = useMemo(
    () => ({
      student_created: (newSt: any) => {
        setStudents((prev) => {
          if (prev.some((s) => s._id === newSt._id)) return prev;
          return [newSt, ...prev];
        });
      },
      admission_created: (newSt: any) => {
        setStudents((prev) => {
          if (prev.some((s) => s._id === newSt._id)) return prev;
          return [newSt, ...prev];
        });
      },
      student_updated: (updatedSt: any) => {
        setStudents((prev) =>
          prev.map((s) => (s._id === updatedSt._id ? updatedSt : s))
        );
      },
    }),
    []
  );

  useSocket(socketHandlers);

  // Filter application rows
  const filteredStudents = useMemo(() => {
    // We only want to view applicants that have reviewable status
    const reviewStates = ['Pending Approval', 'Information Requested', 'Approved', 'Rejected', 'Active'];
    
    return students
      .filter((s) => reviewStates.includes(s.status))
      .filter((s) => {
        if (classFilter && s.class !== classFilter) return false;
        if (statusFilter && s.status !== statusFilter) return false;
        if (dateFilter) {
          const sDate = s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '';
          if (sDate !== dateFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pending first
        if (a.status === 'Pending Approval' && b.status !== 'Pending Approval') return -1;
        if (a.status !== 'Pending Approval' && b.status === 'Pending Approval') return 1;
        // Then Information Requested
        if (a.status === 'Information Requested' && b.status !== 'Information Requested') return -1;
        if (a.status !== 'Information Requested' && b.status === 'Information Requested') return 1;
        // Newest submissions first
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [students, classFilter, statusFilter, dateFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await axiosInstance.patch(`/api/students/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === id ? res.data.student : s))
        );
        if (selectedStudent && selectedStudent._id === id) {
          setSelectedStudent(res.data.student);
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || `Failed to update status to ${newStatus}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveClick = () => {
    if (!selectedStudent) return;
    setFinalClass(selectedStudent.class);
    setFinalSection('A');
    // Seed candidate unique roll number to avoid overlap
    setFinalRollNumber(`KCP-${Date.now().toString().slice(-4)}`);
    setActionError(null);
    setApprovalDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedStudent) return;
    if (!finalClass || !finalSection || !finalRollNumber) {
      setActionError('Class, Section, and Roll Number are all required for final approval.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      const res = await axiosInstance.patch(`/api/students/${selectedStudent._id}/approve`, {
        class: finalClass,
        section: finalSection,
        rollNumber: finalRollNumber,
      });

      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === selectedStudent._id ? res.data.student : s))
        );
        setSelectedStudent(res.data.student);
        setApprovalDialogOpen(false);
        setDetailDrawerOpen(false);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to approve student admission');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'Pending Approval':
        return 'warning';
      case 'Information Requested':
        return 'info';
      case 'Active':
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Page Title & Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#FDFBF7' }}>
          Admission Registrations & Reviews
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={fetchApplications}
          startIcon={<RefreshCw size={16} />}
          sx={{ color: '#0F766E', borderColor: 'rgba(15, 118, 110, 0.4)', textTransform: 'none' }}
        >
          Refresh List
        </Button>
      </Box>

      {/* Query Filters */}
      <Card sx={{ p: 2.5, mb: 4, bgcolor: '#0B1220', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Seeking Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' } }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classesList.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Review Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending Approval">Pending Approval</MenuItem>
              <MenuItem value="Information Requested">Information Requested</MenuItem>
              <MenuItem value="Active">Active (Approved)</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Submission Date"
              InputLabelProps={{ shrink: true }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Filter size={16} />}
              onClick={() => {
                setClassFilter('');
                setStatusFilter('');
                setDateFilter('');
              }}
              sx={{ textTransform: 'none', color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', bgcolor: '#0B1220' }}>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            No admission registrations matching the selected criteria.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#0B1220', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Submission Date</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Candidate Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Seeking Class</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Guardian Details</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Workflow Status</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((st) => (
                <TableRow key={st._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                  <TableCell sx={{ color: '#FDFBF7' }}>
                    {st.createdAt ? new Date(st.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#FDFBF7', fontWeight: 600 }}>{st.name}</TableCell>
                  <TableCell sx={{ color: '#FDFBF7' }}>{st.class}</TableCell>
                  <TableCell sx={{ color: '#94A3B8' }}>
                    <Typography variant="body2" sx={{ color: '#FDFBF7' }}>{st.guardianName}</Typography>
                    <Typography variant="caption">{st.guardianPhone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={st.status}
                      color={getStatusChipColor(st.status)}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      sx={{ color: '#0F766E' }}
                      onClick={() => {
                        setSelectedStudent(st);
                        setDetailDrawerOpen(true);
                      }}
                      aria-label="View applicant details"
                    >
                      <Eye size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* DETAIL DRAWER */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        sx={{
          zIndex: 1150,
          '& .MuiDrawer-paper': { width: { xs: '100%', sm: 480 }, bgcolor: '#0B1220', color: '#FDFBF7', p: 4 }
        }}
      >
        {selectedStudent && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Application Profile
              </Typography>
              <IconButton onClick={() => setDetailDrawerOpen(false)} sx={{ color: '#94A3B8' }}>
                <XCircle size={20} />
              </IconButton>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

            {/* Candidate details */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
              {actionError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {actionError}
                </Alert>
              )}

              {/* Avatar Photo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar
                  src={selectedStudent.photoUrl}
                  sx={{ width: 80, height: 80, bgcolor: '#12355B', border: '2px solid rgba(255,255,255,0.1)' }}
                >
                  <User size={36} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#FDFBF7' }}>
                    {selectedStudent.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Seeking {selectedStudent.class}
                  </Typography>
                  <Chip
                    size="small"
                    label={selectedStudent.status}
                    color={getStatusChipColor(selectedStudent.status)}
                    sx={{ mt: 1, fontWeight: 'bold' }}
                  />
                </Box>
              </Box>

              {/* Data Blocks */}
              <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                Candidate Information
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" color="textSecondary">GENDER</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedStudent.gender}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" color="textSecondary">DATE OF BIRTH</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" display="block" color="textSecondary">RESIDENTIAL ADDRESS</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, mt: 0.5 }}>
                    <MapPin size={16} color="#0F766E" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="body2">{selectedStudent.address || 'Not Provided'}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                Parent & Contact Details
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Typography variant="caption" display="block" color="textSecondary">GUARDIAN NAME</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedStudent.guardianName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" display="block" color="textSecondary">GUARDIAN PHONE</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                    <Phone size={14} color="#0F766E" />
                    <Typography variant="body2" fontWeight="bold">{selectedStudent.guardianPhone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" display="block" color="textSecondary">GUARDIAN EMAIL</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                    <Mail size={14} color="#0F766E" />
                    <Typography variant="body2" fontWeight="bold">{selectedStudent.guardianEmail}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Certificate Preview (if base64) */}
              {selectedStudent.photoUrl && selectedStudent.photoUrl.startsWith('data:') && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'uppercase' }}>
                    Uploaded Birth Certificate / Document Preview
                  </Typography>
                  {selectedStudent.photoUrl.includes('image/') ? (
                    <Box 
                      component="img" 
                      src={selectedStudent.photoUrl} 
                      alt="Certificate Preview" 
                      sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: '#060913' }}
                    />
                  ) : (
                    <Box sx={{ p: 2, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#060913' }}>
                      <Calendar size={24} color="#0F766E" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">PDF Attachment File</Typography>
                        <Typography variant="caption" display="block" color="textSecondary">Valid Document Registered</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2.5 }} />

            {/* Workflow Actions */}
            {selectedStudent.status !== 'Active' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={actionLoading}
                  startIcon={<CheckCircle size={18} />}
                  onClick={handleApproveClick}
                  sx={{ py: 1.3, bgcolor: '#E8751A', '&:hover': { bgcolor: '#C95E10' }, fontWeight: 'bold' }}
                >
                  Approve Registration
                </Button>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="info"
                      disabled={actionLoading}
                      startIcon={<HelpCircle size={16} />}
                      onClick={() => handleStatusChange(selectedStudent._id, 'Information Requested')}
                      sx={{ textTransform: 'none', py: 1.1 }}
                    >
                      Request Info
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      disabled={actionLoading}
                      startIcon={<XCircle size={16} />}
                      onClick={() => handleStatusChange(selectedStudent._id, 'Rejected')}
                      sx={{ textTransform: 'none', py: 1.1 }}
                    >
                      Reject
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#34D399', fontWeight: 'bold' }}>
                  This student has been Approved and set to Active status.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* APPROVAL POPUP DIALOG */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 1250 }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#FDFBF7' }}>
          Assign Student Credentials & Approve
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
          {actionError && (
            <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
              {actionError}
            </Alert>
          )}

          <TextField
            select
            fullWidth
            size="small"
            label="Assigned Class"
            required
            value={finalClass}
            onChange={(e) => setFinalClass(e.target.value)}
            sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' } }}
          >
            {classesList.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Assigned Section"
            required
            value={finalSection}
            onChange={(e) => setFinalSection(e.target.value)}
            sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' } }}
          >
            {['A', 'B', 'C', 'D'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            label="Assigned Roll Number"
            required
            value={finalRollNumber}
            onChange={(e) => setFinalRollNumber(e.target.value)}
            placeholder="e.g. KCP-1001"
            sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setApprovalDialogOpen(false)}
            variant="outlined"
            sx={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveSubmit}
            variant="contained"
            disabled={actionLoading}
            sx={{ bgcolor: '#E8751A', '&:hover': { bgcolor: '#C95E10' }, fontWeight: 'bold' }}
          >
            {actionLoading ? 'Saving...' : 'Confirm Approval'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdmissionsReview;
