import React from 'react';
import { Box, Card, Typography, Avatar } from '@mui/material';
import { Award, Compass } from 'lucide-react';

const PrincipalMessage: React.FC = () => {
  return (
    <Card
      className="glass-panel"
      sx={{
        p: 4.5,
        bgcolor: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 5,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3.5 }}>
        <Avatar
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
          sx={{ width: 70, height: 70, border: '3px solid #38BDF8' }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#F8FAFC', fontWeight: '900', fontFamily: 'Outfit' }}>
            From the Principal's Desk
          </Typography>
          <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: '800', display: 'block', mt: 0.5 }}>
            Dr. (Mrs.) Sandhya Srinivasan • Ph.D. in Education
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.75, fontStyle: 'italic' }}>
        "At KCP Public School, Lucknow (KCPPS), we strive to build a vibrant learning society. We believe in providing an environment that fosters creativity, intellectual inquiry, and high ethical standards. Our classrooms are designed to make technology an organic extension of education, ensuring our students are prepared for global challenges."
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Award size={18} color="#FBBF24" />
          <Typography variant="caption" sx={{ color: '#FCD34D', fontWeight: 'bold' }}>
            National Education Merit Awardee
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Compass size={18} color="#0EA5E9" />
          <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 'bold' }}>
            25+ Years Experience
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default PrincipalMessage;
