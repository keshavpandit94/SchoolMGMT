import React from 'react';
import { Box, Container, Typography } from '@mui/material';

interface FooterProps {
  onPageChange: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onPageChange }) => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        bgcolor: '#060A10',
        color: '#64748B',
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ color: '#F8FAFC', mb: 1, fontFamily: 'Outfit', fontWeight: 'bold' }}>
          KCP PUBLIC SCHOOL, LUCKNOW (KCPPS)
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 500, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
          Empowering the children of India with scientific enquiry, value education, and advanced technology integration. Affiliated to CBSE New Delhi (Affiliation No: 2730126).
        </Typography>

        {/* Quick Footer Navigation Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          {['home', 'about', 'academics', 'facilities', 'admissions', 'contact'].map((p) => (
            <Box
              key={p}
              onClick={() => onPageChange(p)}
              sx={{
                cursor: 'pointer',
                color: '#64748B',
                fontSize: 13,
                textTransform: 'capitalize',
                transition: 'color 0.2s',
                '&:hover': { color: '#818CF8' },
              }}
            >
              {p === 'home' ? 'Home' : p === 'about' ? 'About Us' : p}
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
          © {new Date().getFullYear()} KCP Public School, Lucknow (KCPPS). All rights reserved. Registered Indian K-12 Academy.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
