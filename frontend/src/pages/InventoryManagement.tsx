import React, { useState, useEffect } from 'react';
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
  Collapse,
} from '@mui/material';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, History } from 'lucide-react';

interface InventoryLog {
  _id: string;
  action: string;
  message: string;
  updatedBy: {
    name: string;
    role: string;
  };
  timestamp: string;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  quantity: number;
  category: string;
  condition: 'Good' | 'Needs Repair' | 'Damaged' | 'Lost';
  location: string;
  assignedTo: string;
  lastUpdatedBy: {
    name: string;
    role: string;
  };
  logs: InventoryLog[];
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Row expand state for audit logs
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<'Good' | 'Needs Repair' | 'Damaged' | 'Lost'>('Good');
  const [location, setLocation] = useState('');
  const [assignedTo, setAssignedTo] = useState('Storage');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/inventory');
      if (response.data.success) {
        setInventory(response.data.inventory);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch inventory assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.itemName);
      setQuantity(item.quantity);
      setCategory(item.category);
      setCondition(item.condition);
      setLocation(item.location);
      setAssignedTo(item.assignedTo);
    } else {
      setEditingItem(null);
      setItemName('');
      setQuantity(0);
      setCategory('');
      setCondition('Good');
      setLocation('');
      setAssignedTo('Storage');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      itemName,
      quantity,
      category,
      condition,
      location,
      assignedTo,
    };

    try {
      if (editingItem) {
        await axiosInstance.put(`/api/inventory/${editingItem._id}`, payload);
      } else {
        await axiosInstance.post('/api/inventory', payload);
      }
      handleCloseDialog();
      fetchInventory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving inventory asset');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this asset? This cannot be undone.')) {
      try {
        await axiosInstance.delete(`/api/inventory/${id}`);
        fetchInventory();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to remove asset');
      }
    }
  };

  const toggleRowExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
          Resource & Inventory Assets
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          startIcon={<Plus size={18} />}
          sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
        >
          Add Asset
        </Button>
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
      ) : inventory.length === 0 ? (
        <Card className="glass-panel" sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(17, 24, 39, 0.65)' }}>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            No assets registered.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} className="mui-table-container">
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell width="60" />
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Asset Name</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Stock Quantity</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Condition</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold' }}>Assigned To</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => {
                const isExpanded = expandedItemId === item._id;
                return (
                  <React.Fragment key={item._id}>
                    <TableRow
                      sx={{
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' },
                      }}
                    >
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRowExpand(item._id)} sx={{ color: '#94A3B8' }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </IconButton>
                      </TableCell>
                      <TableCell fontWeight="semibold">{item.itemName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              item.condition === 'Good'
                                ? '#10B981'
                                : item.condition === 'Needs Repair'
                                ? '#F59E0B'
                                : '#EF4444',
                          }}
                        >
                          {item.condition}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.assignedTo}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton onClick={() => handleOpenDialog(item)} sx={{ color: '#6366F1' }}>
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteItem(item._id)} sx={{ color: '#EF4444' }}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Expandable audit log section */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.2)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <History size={16} color="#818CF8" />
                              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#818CF8' }}>
                                Asset Change Log / Audit Trail
                              </Typography>
                            </Box>
                            {item.logs && item.logs.length > 0 ? (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ color: '#64748B', fontWeight: 'bold' }}>Action</TableCell>
                                    <TableCell sx={{ color: '#64748B', fontWeight: 'bold' }}>Log Details</TableCell>
                                    <TableCell sx={{ color: '#64748B', fontWeight: 'bold' }}>Modified By</TableCell>
                                    <TableCell sx={{ color: '#64748B', fontWeight: 'bold' }}>Date & Time</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {item.logs.map((log) => (
                                    <TableRow key={log._id}>
                                      <TableCell sx={{ color: '#94A3B8', borderBottom: 'none' }}>{log.action}</TableCell>
                                      <TableCell sx={{ color: '#E2E8F0', borderBottom: 'none' }}>{log.message}</TableCell>
                                      <TableCell sx={{ color: '#94A3B8', borderBottom: 'none' }}>
                                        {log.updatedBy ? `${log.updatedBy.name} (${log.updatedBy.role})` : 'System'}
                                      </TableCell>
                                      <TableCell sx={{ color: '#64748B', borderBottom: 'none' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#64748B' }}>
                                No audit records for this item.
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Asset Dialog */}
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
            {editingItem ? 'Edit Asset Details' : 'Register New Asset'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  required
                  placeholder="e.g. Lab Equipment, Textbooks, Sports Gear"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity in Stock"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Condition"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  sx={{ '& .MuiSelect-select': { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {['Good', 'Needs Repair', 'Damaged', 'Lost'].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Storage Location"
                  required
                  placeholder="e.g. Room 102, Main Closet"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Assigned To"
                  placeholder="e.g. Chemistry Lab, Storage, Staff Name"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
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
              {editingItem ? 'Save Changes' : 'Register Asset'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement;
