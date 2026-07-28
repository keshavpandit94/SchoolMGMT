import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const navItems = [
    { id: '', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        borderTop: '1px solid #E5E7EB',
        bgcolor: '#FFFFFF',
        color: '#5B6573',
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ color: '#12355B', mb: 0.5, fontFamily: '"Playfair Display", serif', fontWeight: 'bold', fontSize: '1.05rem' }}>
          KCP PUBLIC SCHOOL, LUCKNOW (KCPPS)
        </Typography>
        <Typography variant="caption" sx={{ color: '#E8751A', fontWeight: 'bold', display: 'block', mb: 2.5, fontStyle: 'italic', letterSpacing: 0.5 }}>
          तमसो मा ज्योतिर्गमय • Lead us from darkness to light
        </Typography>
        <Typography variant="body2" sx={{ color: '#5B6573', maxWidth: 650, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}>
          Nurturing curious minds and building values since 2012. Affiliated to the Central Board of Secondary Education (CBSE), New Delhi (Affiliation No: 2730126).
        </Typography>

        {/* Quick Footer Navigation Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mb: 3.5 }}>
          {navItems.map((p) => (
            <Box
              key={p.id}
              component={Link}
              to={p.id === '' ? '/' : `/${p.id}`}
              sx={{
                textDecoration: 'none',
                color: '#5B6573',
                fontSize: 14,
                fontWeight: 600,
                transition: 'color 0.2s',
                '&:hover': { color: '#E8751A' },
              }}
            >
              {p.label}
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', opacity: 0.8 }}>
          © {new Date().getFullYear()} KCP Public School, Lucknow. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
