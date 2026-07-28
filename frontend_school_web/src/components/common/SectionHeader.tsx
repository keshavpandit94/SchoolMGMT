import React from 'react';
import { Box, Typography } from '@mui/material';

interface SectionHeaderProps {
  preHeader?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  sx?: object;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  preHeader, 
  title, 
  subtitle, 
  align = 'center', 
  sx 
}) => {
  return (
    <Box 
      sx={{ 
        textAlign: align, 
        mb: 6,
        maxWidth: align === 'center' ? 700 : '100%',
        mx: align === 'center' ? 'auto' : 0,
        ...sx 
      }}
    >
      {preHeader && (
        <Typography 
          variant="subtitle2" 
          component="span"
          sx={{ 
            color: '#0F766E', 
            fontWeight: 800, 
            letterSpacing: 1.5, 
            textTransform: 'uppercase',
            display: 'block',
            mb: 1,
            fontSize: '0.85rem'
          }}
        >
          {preHeader}
        </Typography>
      )}
      <Typography 
        variant="h3" 
        component="h2" 
        sx={{ 
          fontFamily: '"Playfair Display", "Outfit", serif',
          fontWeight: 800, 
          color: '#12355B', 
          mb: subtitle ? 2 : 0,
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#5B6573',
            lineHeight: 1.6,
            fontSize: '1.05rem'
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionHeader;
