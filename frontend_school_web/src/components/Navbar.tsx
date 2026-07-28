import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton } from '@mui/material';
import { School, Menu, X, GraduationCap, Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: '', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (id: string) => {
    if (id === '' && currentPath === '/') return true;
    if (id !== '' && currentPath.startsWith(`/${id}`)) return true;
    return false;
  };

  // Scroll listener to toggle scrolled styling state (passive event to optimize performance)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Slim Top Utility Announcement Bar */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#12355B',
          color: '#FFFFFF',
          py: 0.9,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 38,
          boxSizing: 'border-box',
        }}
      >
        {/* Left Side: Admissions Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GraduationCap size={14} color="#E8751A" />
          <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.75rem' }}>
            Admissions Open 2026–27
          </Typography>
        </Box>

        {/* Right Side: Contact channels & Visit (Tablet / Desktop) */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 3 }}>
          <Box component="a" href="tel:+915222468100" sx={{ color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', '&:hover': { color: '#E8751A' } }}>
            <Phone size={12} color="#E8751A" />
            <span>+91 522 246 8100</span>
          </Box>
          <Box component="a" href="mailto:admissions@kcppschool.edu.in" sx={{ color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', '&:hover': { color: '#E8751A' } }}>
            <Mail size={12} color="#E8751A" />
            <span>admissions@kcppschool.edu.in</span>
          </Box>
          <Box
            onClick={() => {
              window.dispatchEvent(new Event('open-book-visit'));
            }}
            sx={{
              color: '#E8751A',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Book a Campus Visit
          </Box>
        </Box>

        {/* Mobile Action (Mobile Only) */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
          <Box component="a" href="tel:+915222468100" sx={{ color: '#E8751A', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem' }}>
            Call Registrar
          </Box>
        </Box>
      </Box>

      {/* 2. Navigation Navbar (Sticky / Transitions on Scroll) */}
      <Box
        component="nav"
        sx={{
          width: '100%',
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.85)' : '#FFFFFF',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 2px 10px rgba(0, 0, 0, 0.02)',
          height: scrolled ? { xs: 60, md: 66 } : { xs: 68, md: 76 },
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand Logo & Tagline */}
          <Box
            component={Link}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: scrolled ? 1 : 1.5, 
              textDecoration: 'none', 
              color: 'inherit',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            <Box
              sx={{
                p: scrolled ? 0.9 : 1.1,
                borderRadius: '8px',
                background: '#12355B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <School size={scrolled ? 18 : 22} aria-label="School Logo Placeholder" />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontWeight: 900, 
                  letterSpacing: -0.5, 
                  lineHeight: 1.1, 
                  color: '#12355B', 
                  fontSize: scrolled ? '0.98rem' : '1.1rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                KCP PUBLIC SCHOOL
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#0F766E', 
                  fontWeight: '800', 
                  letterSpacing: 0.8, 
                  display: scrolled ? 'none' : 'block', // Hide tagline when scrolled for spacing
                  mt: 0.2, 
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Lucknow • CBSE Affiliated
              </Typography>
            </Box>
          </Box>

          {/* Centre/Right Navigation links (Desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2.5, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                component={Link}
                to={item.id === '' ? '/' : `/${item.id}`}
                sx={{
                  color: isActive(item.id) ? '#E8751A' : '#5B6573',
                  fontWeight: isActive(item.id) ? 800 : 600,
                  textTransform: 'none',
                  fontSize: 14.5,
                  px: 1.5,
                  py: scrolled ? 0.6 : 1,
                  position: 'relative',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { color: '#12355B', bgcolor: 'transparent' },
                  '&::after': isActive(item.id) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: scrolled ? -20 : -15, 
                    left: 0,
                    width: '100%',
                    height: 3,
                    background: '#E8751A',
                    borderRadius: '2px',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  } : {},
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Action Button & Hamburger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              component={Link}
              to="/admissions"
              variant="contained"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 750,
                px: { xs: 2.2, sm: 3 },
                py: scrolled ? 0.8 : 1,
                bgcolor: '#E8751A',
                color: '#FFFFFF',
                boxShadow: 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#C95E10',
                  boxShadow: 'none',
                },
              }}
            >
              Apply Now
            </Button>

            <IconButton
              onClick={handleDrawerToggle}
              aria-label="Open Navigation Menu"
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: '#12355B',
                bgcolor: '#F3F4F6',
                borderRadius: '8px',
                p: 1.2,
              }}
            >
              <Menu size={20} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          zIndex: 1200, // Opens above the header (which is zIndex: 1100)
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: '#FFFFFF',
            p: 3,
            color: '#1F2937',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#5B6573' }}>
            NAVIGATION
          </Typography>
          <IconButton 
            onClick={handleDrawerToggle} 
            aria-label="Close Navigation Menu" 
            sx={{ color: '#5B6573' }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                component={Link}
                to={item.id === '' ? '/' : `/${item.id}`}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: '8px',
                  bgcolor: isActive(item.id) ? 'rgba(232, 117, 26, 0.08)' : 'transparent',
                  color: isActive(item.id) ? '#E8751A' : '#5B6573',
                  '&:hover': {
                    bgcolor: '#F3F4F6',
                    color: '#12355B',
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
          component={Link}
          to="/admissions"
          onClick={handleDrawerToggle}
          variant="contained"
          fullWidth
          sx={{ 
            mt: 4, 
            borderRadius: '8px', 
            py: 1.5, 
            fontWeight: 'bold',
            bgcolor: '#E8751A',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#C95E10' }
          }}
        >
          Apply Now
        </Button>
      </Drawer>
    </Box>
  );
};

export default Navbar;
