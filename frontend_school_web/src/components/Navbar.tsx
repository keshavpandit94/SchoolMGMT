import React, { useState } from 'react';
import { Box, Container, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton } from '@mui/material';
import { School, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileNavClick = (id: string) => {
    onPageChange(id);
    setMobileOpen(false);
  };

  return (
    <Box
      component="header"
      className="glass-panel"
      sx={{
        position: 'sticky',
        top: 16,
        margin: '0 auto',
        width: { xs: 'calc(100% - 24px)', md: 'calc(100% - 48px)' },
        maxWidth: 1200,
        zIndex: 1000,
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        py: 1.5,
        px: { xs: 1, sm: 2 },
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 1, sm: 2 } }}>
        {/* Brand Logo */}
        <Box
          onClick={() => onPageChange('home')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        >
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #334155 0%, #64748B 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <School size={24} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'Outfit', fontWeight: '900', letterSpacing: -0.5, lineHeight: 1.1 }}>
              KCP PUBLIC SCHOOL
            </Typography>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 1.2, display: 'block', mt: 0.2 }}>
              LUCKNOW • CBSE AFFILIATED
            </Typography>
          </Box>
        </Box>

        {/* Navigation items (Desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5 }}>
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              sx={{
                color: currentPage === item.id ? '#38BDF8' : '#94A3B8',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: 14.5,
                position: 'relative',
                transition: 'color 0.2s ease',
                '&:hover': { color: '#F8FAFC', bgcolor: 'transparent' },
                '&::after': currentPage === item.id ? {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '20%',
                  width: '60%',
                  height: 2.5,
                  background: 'linear-gradient(90deg, #38BDF8, #0EA5E9)',
                  borderRadius: '2px',
                } : {},
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Apply CTA Button & Mobile Trigger */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            onClick={() => onPageChange('admissions')}
            variant="contained"
            className="primary-gradient-btn"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3.5,
              py: 1,
            }}
          >
            Apply Online
          </Button>

          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              color: '#F8FAFC',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 2.5,
              p: 1.2,
            }}
          >
            <Menu size={20} />
          </IconButton>
        </Box>
      </Container>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: '#080C14',
            backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 60%)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            p: 3,
            color: '#F8FAFC',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#94A3B8' }}>
            NAVIGATION
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#94A3B8' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleMobileNavClick(item.id)}
                sx={{
                  borderRadius: 2.5,
                  bgcolor: currentPage === item.id ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                  color: currentPage === item.id ? '#38BDF8' : '#94A3B8',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    color: '#F8FAFC',
                  },
                }}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>
                  {item.label}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Button
          onClick={() => handleMobileNavClick('admissions')}
          variant="contained"
          className="primary-gradient-btn"
          fullWidth
          sx={{ mt: 4, borderRadius: 2.5, py: 1.5, fontWeight: 'bold' }}
        >
          Apply Online
        </Button>
      </Drawer>
    </Box>
  );
};

export default Navbar;
