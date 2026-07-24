import React from 'react';
import { Box, Container, Typography, Card } from '@mui/material';
import { GraduationCap, Compass, BookOpen, Activity, Flame, ShieldAlert } from 'lucide-react';

const FacilitiesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }} className="animate-fade-in-up">
      {/* HEADER SECTION */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Outfit', mb: 1.5, fontWeight: '900' }}>
          Smart Infrastructure
        </Typography>
        <Typography variant="body1" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 0.5 }}>
          Optimized environments to foster experimental study.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        {[
          { icon: <GraduationCap size={24} />, title: 'Smart Classrooms', desc: 'Fully air-conditioned environments with interactive digital touchboards, smart projection systems, and online content libraries.' },
          { icon: <Compass size={24} />, title: 'Advanced Robotics Lab', desc: 'Maker spaces featuring Arduino kits, 3D printers, and robotic assembly desks to support AI workshops.' },
          { icon: <BookOpen size={24} />, title: 'Digitalized Library', desc: 'Housing 10,000+ volumes, scientific journals, plus Kindle e-readers linked to global digital libraries.' },
          { icon: <Activity size={24} />, title: 'Sports & Aquatics Academy', desc: 'International standard lawn tennis courts, outdoor cricket pitches, and a 25-meter temperature-controlled swimming pool.' },
          { icon: <Flame size={24} />, title: 'Biotech & Chemistry Labs', desc: 'Equipped with gas lines, high-grade microscopes, and electronic testing machines adhering to safety protocols.' },
          { icon: <ShieldAlert size={24} />, title: 'Biometric Security Grid', desc: '24/7 CCTV surveillance, gate registers, and biometric facial scan kiosk checkpoints at student entries.' },
        ].map((facility, i) => (
          <Card
            key={i}
            className="glass-panel"
            sx={{
              p: 4,
              bgcolor: 'rgba(15, 23, 42, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                p: 1.8,
                borderRadius: 3,
                bgcolor: 'rgba(14, 165, 233, 0.08)',
                color: '#38BDF8',
                display: 'inline-flex',
                alignSelf: 'flex-start',
              }}
            >
              {facility.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#F8FAFC', mb: 1.5, fontWeight: 'bold' }}>
                {facility.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7 }}>
                {facility.desc}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default FacilitiesPage;
