import React from 'react';
import { Box, Typography } from '@mui/material';

interface AdmissionStepProps {
  stepNumber: string;
  title: string;
  description: string;
  isLast?: boolean;
}

const AdmissionStep: React.FC<AdmissionStepProps> = ({ 
  stepNumber, 
  title, 
  description, 
  isLast = false 
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 3, position: 'relative', pb: isLast ? 0 : 4 }}>
      {/* Connector line */}
      {!isLast && (
        <Box 
          sx={{ 
            position: 'absolute', 
            left: 20, 
            top: 40, 
            bottom: 0, 
            width: 2, 
            bgcolor: '#E5E7EB' 
          }} 
        />
      )}

      {/* Step Circle */}
      <Box 
        sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          bgcolor: '#FFF', 
          border: '2px solid #E8751A', 
          color: '#E8751A', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontWeight: 700,
          fontSize: '0.95rem',
          flexShrink: 0,
          zIndex: 1
        }}
      >
        {stepNumber}
      </Box>

      {/* Step Text content */}
      <Box sx={{ pt: 0.5 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontWeight: 700, 
            color: '#12355B', 
            mb: 0.8,
            fontFamily: '"Inter", sans-serif',
            fontSize: '1.1rem'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#5B6573', 
            lineHeight: 1.6 
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export default AdmissionStep;
