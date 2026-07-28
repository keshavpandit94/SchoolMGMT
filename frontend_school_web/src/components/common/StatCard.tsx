import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface StatCardProps {
  metric: string;
  label: string;
  description: string;
  colorType?: 'primary' | 'secondary';
  sx?: object;
}

const StatCard: React.FC<StatCardProps> = ({ 
  metric, 
  label, 
  description, 
  colorType = 'primary', 
  sx 
}) => {
  const textColor = colorType === 'primary' ? '#E8751A' : '#0F766E';

  return (
    <Card 
      className="day-card"
      sx={{ 
        p: 3, 
        textAlign: 'center', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        ...sx 
      }}
    >
      <CardContent>
        <Typography 
          variant="h2" 
          component="div" 
          sx={{ 
            fontWeight: 800, 
            color: textColor, 
            mb: 1,
            fontFamily: '"Playfair Display", "Outfit", serif'
          }}
        >
          {metric}
        </Typography>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontWeight: 700, 
            color: '#12355B', 
            mb: 1.5,
            fontSize: '1.15rem'
          }}
        >
          {label}
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

export default StatCard;
