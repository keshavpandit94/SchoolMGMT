import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import axiosInstance from '../services/axiosInstance';
import {
  Grid,
  Card,
  Typography,
  Box,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Users,
  GraduationCap,
  Hammer,
  ShieldCheck,
  Zap,
  Activity,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LiveEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Statistics states
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    staff: 0,
    inventory: 0,
  });
  
  // Real-time events state
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Fetch counts from endpoints on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentRes, teacherRes, staffRes, inventoryRes] = await Promise.all([
          axiosInstance.get('/api/students'),
          axiosInstance.get('/api/teachers'),
          axiosInstance.get('/api/staff'),
          axiosInstance.get('/api/inventory'),
        ]);

        setStats({
          students: studentRes.data.totalStudents || studentRes.data.count || 0,
          teachers: teacherRes.data.teachers?.length || 0,
          staff: staffRes.data.staff?.length || 0,
          inventory: inventoryRes.data.inventory?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      }
    };

    fetchStats();
  }, []);

  // Listen to real-time events via Socket.io
  const socketHandlers = React.useMemo(() => ({
    student_created: (student: any) => {
      setStats((prev) => ({ ...prev, students: prev.students + 1 }));
      addLiveEvent('Student', `Student "${student.name}" (Roll: ${student.rollNumber}) registered.`);
    },
    student_deleted: () => {
      setStats((prev) => ({ ...prev, students: Math.max(0, prev.students - 1) }));
      addLiveEvent('Student', `Student record removed.`);
    },
    student_updated: (student: any) => {
      addLiveEvent('Student', `Student "${student.name}" details updated.`);
    },
    inventory_created: (item: any) => {
      setStats((prev) => ({ ...prev, inventory: prev.inventory + 1 }));
      addLiveEvent('Inventory', `New asset "${item.itemName}" (${item.quantity} units) registered.`);
    },
    inventory_updated: (item: any) => {
      addLiveEvent('Inventory', `Asset "${item.itemName}" updated (Stock: ${item.quantity}).`);
    },
    inventory_deleted: () => {
      setStats((prev) => ({ ...prev, inventory: Math.max(0, prev.inventory - 1) }));
      addLiveEvent('Inventory', `Inventory asset deleted.`);
    },
    teacher_updated: (teacher: any) => {
      addLiveEvent('Faculty', `Teacher profile of ${teacher.userId?.name} updated.`);
    },
    staff_updated: (staff: any) => {
      addLiveEvent('Staff', `Staff profile of ${staff.userId?.name} updated.`);
    },
  }), []);

  useSocket(socketHandlers);

  const addLiveEvent = (type: string, message: string) => {
    const newEvent: LiveEvent = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLiveEvents((prev) => [newEvent, ...prev.slice(0, 9)]);
  };

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: <Users size={28} color="#6366F1" />, color: '#6366F1', path: '/students' },
    { title: 'Teachers', value: stats.teachers, icon: <GraduationCap size={28} color="#06B6D4" />, color: '#06B6D4', path: '/teachers' },
    { title: 'Support Staff', value: stats.staff, icon: <ShieldCheck size={28} color="#10B981" />, color: '#10B981', path: '/staff' },
    { title: 'Inventory Assets', value: stats.inventory, icon: <Hammer size={28} color="#F59E0B" />, color: '#F59E0B', path: '/inventory' },
  ];

  return (
    <Box className="animate-fade-in">
      {/* Welcome Banner */}
      <Card
        className="glass-panel"
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
        }}
      >
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ fontFamily: 'Plus Jakarta Sans', color: '#F8FAFC' }}>
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 2 }}>
              You are signed in as an <strong>{user?.role}</strong>. Here is an overview of today's school operations, asset distribution, and registration logs.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(user?.role === 'Admin' || user?.role === 'Principal' || user?.role === 'Teacher') && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/students')}
                  startIcon={<PlusCircle size={18} />}
                  sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none', borderRadius: 2 }}
                >
                  Manage Students
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => navigate('/inventory')}
                startIcon={<FileCheck size={18} />}
                sx={{
                  color: '#F8FAFC',
                  borderColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.02)' },
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Inspect Inventory
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}>
            <Avatar
              src={user?.profilePicture}
              sx={{ width: 100, height: 100, bgcolor: '#6366F1', fontSize: 36, border: '4px solid rgba(99,102,241,0.2)' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
        </Grid>
      </Card>

      {/* Grid of stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              className="glass-panel glass-panel-hover"
              onClick={() => navigate(card.path)}
              sx={{
                p: 3,
                cursor: 'pointer',
                bgcolor: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: `rgba(${card.color === '#6366F1' ? '99, 102, 241' : card.color === '#06B6D4' ? '6, 182, 212' : card.color === '#10B981' ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                    border: `1px solid rgba(${card.color === '#6366F1' ? '99, 102, 241' : card.color === '#06B6D4' ? '6, 182, 212' : card.color === '#10B981' ? '16, 185, 129' : '245, 158, 11'}, 0.2)`,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#94A3B8' }} gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
                {card.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Live Activity Feed */}
      <Card
        className="glass-panel"
        sx={{
          p: 3,
          bgcolor: 'rgba(17, 24, 39, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 2, bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' }}>
            <Activity size={20} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
            Live School Event Log (Real-Time Synchronized)
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
        
        {liveEvents.length === 0 ? (
          <Box sx={{ py: 6, textCenter: true, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Zap size={36} color="#475569" />
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Waiting for live updates... Perform actions on student records or inventory to see socket alerts here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {liveEvents.map((evt) => (
              <Box
                key={evt.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor:
                        evt.type === 'Student'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : evt.type === 'Inventory'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(6, 182, 212, 0.15)',
                      color:
                        evt.type === 'Student'
                          ? '#818CF8'
                          : evt.type === 'Inventory'
                          ? '#FBBF24'
                          : '#22D3EE',
                    }}
                  >
                    {evt.type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                    {evt.message}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {evt.timestamp}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Dashboard;
