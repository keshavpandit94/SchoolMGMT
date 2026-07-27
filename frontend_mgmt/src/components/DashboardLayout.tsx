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
  Megaphone,
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



      // Inventory Assets
      items.push({ text: 'Inventory Assets', path: '/inventory', icon: <Package size={20} /> });

      // Website Bulletins (Notices & Events)
      if (['Admin', 'Principal'].includes(user.role)) {
        items.push({ text: 'Website Bulletins', path: '/bulletins', icon: <Megaphone size={20} /> });
      }
    }

    return items;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0B1220', color: '#FDFBF7', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <Toolbar sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', py: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EA580C', boxShadow: '0 0 12px #EA580C' }} />
          <Typography
            variant="h5"
            fontWeight="800"
            className="gradient-text font-marcellus"
            sx={{ letterSpacing: 0.5 }}
          >
            KCPPS Admin
          </Typography>
        </Box>
      </Toolbar>
      
      {/* User profile capsule in sidebar */}
      <Box sx={{ p: 2.5, mx: 2, my: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Avatar
          src={user?.profilePicture}
          sx={{ width: 42, height: 42, bgcolor: '#EA580C', border: '2px solid rgba(234,88,12,0.6)', boxShadow: '0 0 12px rgba(234,88,12,0.3)' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight="700" noWrap sx={{ color: '#FDFBF7' }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#D4AF37', fontWeight: '700', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px' }}>
            {user?.role}
          </Typography>
        </Box>
      </Box>

      {/* Menu items */}
      <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
        {getNavItems().map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  py: 1.3,
                  px: 2,
                  bgcolor: isActive ? 'rgba(13, 148, 136, 0.12)' : 'transparent',
                  color: isActive ? '#D4AF37' : '#94A3B8',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(13, 148, 136, 0.08)' : 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.04)',
                    color: '#FDFBF7',
                    transform: 'translateX(3px)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#D4AF37' : '#64748B', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Quick Info / School system identifier */}
      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          EduManage Enterprise v1.0 (K-12)
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
      {/* App Bar / Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(6, 9, 19, 0.75)',
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
            sx={{ mr: 2, display: { md: 'none' }, color: '#FDFBF7' }}
          >
            <MenuIcon size={24} />
          </IconButton>

          {/* Dynamic screen name placeholder */}
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#FDFBF7', fontFamily: 'Plus Jakarta Sans' }}>
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
                color: '#FDFBF7',
                gap: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
              }}
            >
              <Avatar
                src={user?.profilePicture}
                sx={{ width: 32, height: 32, bgcolor: '#EA580C', border: '1.5px solid rgba(234,88,12,0.5)' }}
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
                  bgcolor: '#0B1220',
                  color: '#FDFBF7',
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
                  <Typography variant="body2" fontWeight="bold" color="#FDFBF7">{user?.email}</Typography>
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
          bgcolor: 'transparent',
          pt: { xs: 10, sm: 11 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
