import React from 'react';
import { Box, Card, Typography, Avatar } from '@mui/material';
import { Award, Star, User } from 'lucide-react';

const PrincipalMessage: React.FC = () => {
  return (
    <Card
      sx={{
        p: { xs: 4, md: 5 },
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderColor: '#E5E7EB',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3.5 }}>
          {/* Localized Portrait Placeholder */}
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              border: '2px solid #E8751A', 
              bgcolor: '#FFFCF5', 
              color: '#E8751A'
            }}
          >
            <User size={38} aria-hidden="true" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: '#12355B', fontWeight: '800', fontSize: '1.15rem' }}>
              From the Principal's Desk
            </Typography>
            <Typography variant="caption" sx={{ color: '#0F766E', fontWeight: '700', display: 'block', mt: 0.5, fontSize: 13 }}>
              Dr. (Mrs.) Sandhya Srinivasan • Ph.D. in Education
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#1F2937', 
            mb: 4, 
            lineHeight: 1.8, 
            fontStyle: 'italic', 
            fontSize: '1rem',
            fontFamily: '"Playfair Display", "Outfit", serif',
            borderLeft: '4px solid #0F766E',
            pl: 2.5
          }}
        >
          "At KCP Public School, Lucknow, we strive to build a vibrant learning environment. We believe in providing a holistic ecosystem that fosters curiosity, intellectual inquiry, and traditional ethical values. Our classrooms are designed to make technology an organic extension of education, ensuring our students are prepared for secondary challenges while remaining rooted in the rich cultural heritage of India."
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, borderTop: '1px solid #E5E7EB', pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Award size={18} color="#0F766E" />
          <Typography variant="caption" sx={{ color: '#5B6573', fontWeight: '700' }}>
            National Merit Awardee
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star size={18} color="#E8751A" />
          <Typography variant="caption" sx={{ color: '#5B6573', fontWeight: '700' }}>
            25+ Years of Leadership
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default PrincipalMessage;
