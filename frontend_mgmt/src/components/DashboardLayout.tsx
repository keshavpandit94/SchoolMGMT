import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LogOut,
  Users,
  UserCheck,
  Contact,
  Package,
  LayoutDashboard,
  CalendarCheck,
  ScanFace,
} from 'lucide-react';

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  // Dynamic Sidebar Navigation items based on role
  const getNavItems = () => {
    const items = [
      { text: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ];

    if (user) {
      // Students
      items.push({ text: 'Students', path: '/students', icon: <Users size={20} /> });

      // Teachers
      items.push({ text: 'Teachers', path: '/teachers', icon: <UserCheck size={20} /> });

      // Staff Members
      items.push({ text: 'Staff Members', path: '/staff', icon: <Contact size={20} /> });

      // Attendance Register
      items.push({ text: 'Attendance Register', path: '/attendance', icon: <CalendarCheck size={20} /> });

      // Kiosk Terminal
      items.push({ text: 'Self Check-in Kiosk', path: '/kiosk', icon: <ScanFace size={20} /> });

      // Inventory Assets
      items.push({ text: 'Inventory Assets', path: '/inventory', icon: <Package size={20} /> });
    }

    return items;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0F172A', color: '#F8FAFC' }}>
      <Toolbar sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', py: 2 }}>
        <Typography
          variant="h5"
          fontWeight="800"
          className="gradient-text"
          sx={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: 0.5 }}
        >
          EduManage
        </Typography>
      </Toolbar>
      
      {/* User profile capsule in sidebar */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Avatar
          src={user?.profilePicture}
          sx={{ bgcolor: '#6366F1', border: '2px solid rgba(99,102,241,0.5)' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 'bold', display: 'block' }}>
            {user?.role}
          </Typography>
        </Box>
      </Box>

      {/* Menu items */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {getNavItems().map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
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

      {/* Quick Info / School system identifier */}
      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          EduManage v1.0.0 (K-12)
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

          {/* Dynamic screen name placeholder */}
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#F8FAFC', fontFamily: 'Plus Jakarta Sans' }}>
            {location.pathname.startsWith('/students')
              ? 'Student Records'
              : location.pathname.startsWith('/teachers')
              ? 'Faculty Directory'
              : location.pathname.startsWith('/staff')
              ? 'Support Staff'
              : location.pathname.startsWith('/attendance')
              ? 'Attendance Register'
              : location.pathname.startsWith('/inventory')
              ? 'Resource & Inventory Assets'
              : 'School Management Dashboard'}
          </Typography>

          {/* Profile options */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={handleProfileMenuOpen}
              sx={{
                textTransform: 'none',
                color: '#F8FAFC',
                gap: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
              }}
            >
              <Avatar
                src={user?.profilePicture}
                sx={{ width: 32, height: 32, bgcolor: '#6366F1', border: '1.5px solid rgba(99,102,241,0.5)' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: '#1E293B',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  mt: 1.5,
                  minWidth: 160,
                },
              }}
            >
              <MenuItem disabled sx={{ color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1, mb: 1 }}>
                <Box>
                  <Typography variant="caption" display="block">Logged in as</Typography>
                  <Typography variant="body2" fontWeight="bold" color="#F8FAFC">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogoutClick} sx={{ color: '#F87171', gap: 1.5 }}>
                <LogOut size={16} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Responsive Drawers */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
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
        {/* Desktop drawer */}
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
