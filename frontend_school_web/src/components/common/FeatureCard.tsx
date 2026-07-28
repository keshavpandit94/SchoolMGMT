import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  sx?: object;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, sx }) => {
  return (
    <Card 
      className="day-card"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        ...sx 
      }}
    >
      <CardContent sx={{ p: 4, flexGrow: 1 }}>
        {icon && (
          <Box sx={{ mb: 2.5, display: 'inline-flex', color: '#0F766E' }}>
            {icon}
          </Box>
        )}
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontWeight: 700, 
            mb: 1.5, 
            color: '#12355B',
            fontFamily: '"Inter", sans-serif'
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
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
