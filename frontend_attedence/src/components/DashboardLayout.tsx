import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  CalendarCheck,
  ScanFace,
  ShieldCheck,
  Touchpad,
  Sparkles,
} from 'lucide-react';

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Dedicated Attendance Navigation Items
  const navItems = [
    { text: 'Biometric Touch Kiosk', path: '/kiosk-terminal', icon: <ScanFace size={20} /> },
    { text: 'Attendance Register', path: '/attendance', icon: <CalendarCheck size={20} /> },
    { text: 'Biometric Enrollment', path: '/biometric-registration', icon: <ShieldCheck size={20} /> },
    { text: 'Directory Touch Check-in', path: '/kiosk', icon: <Touchpad size={20} /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0F172A', color: '#F8FAFC' }}>
      <Toolbar sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#6366F1', width: 38, height: 38, border: '2px solid #818CF8' }}>
            <ScanFace size={22} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              fontWeight="800"
              className="gradient-text"
              sx={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: 0.5, lineHeight: 1.2 }}
            >
              EduAttendance
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>
              Staff & Faculty Kiosk Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      {/* System Status Pill */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Sparkles size={18} color="#34D399" />
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ color: '#34D399' }}>
              Biometric Engine Online
            </Typography>
            <Typography variant="caption" sx={{ color: '#A7F3D0', fontSize: 10 }}>
              128-d Vector Recognition Active
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu items */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  px: 2,
                  bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#818CF8' : '#94A3B8',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#F8FAFC',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Footer Info */}
      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          EduAttendance Kiosk System v2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B0F19' }}>
      {/* App Bar / Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#F8FAFC' }}
          >
            <MenuIcon size={24} />
          </IconButton>

          <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
            {location.pathname.startsWith('/kiosk-terminal')
              ? 'Touch Biometric Kiosk Terminal'
              : location.pathname.startsWith('/biometric-registration')
              ? 'Staff Biometric Enrollment'
              : location.pathname.startsWith('/kiosk')
              ? 'Directory Touch Check-in'
              : 'Staff & Faculty Attendance Register'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1', fontSize: 14 }}>
              K
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#F8FAFC', fontWeight: 'bold' }}>
              Attendance Terminal
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Responsive Drawers */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.06)' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.06)' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#0B0F19',
          pt: { xs: 10, sm: 11 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
