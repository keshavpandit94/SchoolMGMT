import React from 'react';
import { Box, Container, Typography, Card, Avatar } from '@mui/material';
import { Compass } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }} className="animate-fade-in-up">
      {/* HEADER SECTION */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Outfit', mb: 1.5, fontWeight: '900' }}>
          Legacy & Governance
        </Typography>
        <Typography variant="body1" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 0.5 }}>
          KCP Public School, Lucknow (KCPPS) • Estd. 1998
        </Typography>
      </Box>

      {/* Legacy and vision layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 6, mb: 10, alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#F8FAFC', mb: 2.5, fontWeight: 'bold' }}>
            Historical Foundations of Academic Quality
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2.5, lineHeight: 1.7 }}>
            Founded in 1998 in Lucknow, KCPPS was established with a singular mission: to merge scientific enquiry with strong ethical values. Over the past 28 years, the institution has grown into a leading school in Uttar Pradesh, boasting sophisticated smart classroom blocks and premium sports facilities.
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2.5, lineHeight: 1.7 }}>
            We prepare our scholars for global competitiveness through direct robotics integration, computerized science laboratories, and intensive test preparation tracks that guarantee outstanding CBSE board marks.
          </Typography>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Card className="glass-panel" sx={{ p: 4, background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography variant="h6" sx={{ color: '#F8FAFC', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
              <Compass size={20} color="#38BDF8" /> Academic Commitments
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#38BDF8', fontWeight: 'bold' }}>
                  Smart Study Blocks
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                  Equipped with digital touch boards, biometric attendance check-in, and online learning archives.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#38BDF8', fontWeight: 'bold' }}>
                  Professional Sports Academy
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                  Helmed by qualified physical instructors, featuring national-standard tennis and cricket arenas.
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* MILESTONES TIMELINE */}
      <Box sx={{ mb: 12 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Outfit', fontWeight: '900', textAlign: 'center', mb: 6 }}>
          Historical Milestones
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3.5 }}>
          {[
            { year: '1998', title: 'Foundation Stone', desc: 'Inaugurated with 150 students and a primary academic block in Gomti Nagar.' },
            { year: '2008', title: 'CBSE Affiliation Upgrade', desc: 'Affiliated to CBSE New Delhi for Secondary & Senior Secondary instruction.' },
            { year: '2016', title: 'Robotics & Advanced Labs', desc: 'Launched state-of-the-art physics, biotech, and modular robotics laboratories.' },
            { year: '2024', title: 'Biometric Smart Campus', desc: 'Introduced facial scan kiosk systems and live student academic tracking portals.' },
          ].map((milestone, idx) => (
            <Card
              key={idx}
              className="glass-panel"
              sx={{
                p: 3.5,
                background: 'rgba(15, 23, 42, 0.45)',
                height: '100%',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Typography variant="h4" sx={{ fontFamily: 'Outfit', fontWeight: '900', color: '#38BDF8', mb: 1 }}>
                {milestone.year}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 'bold', mb: 1 }}>
                {milestone.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {milestone.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>

      {/* FACULTY SPOTLIGHT */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Outfit', fontWeight: '900', textAlign: 'center', mb: 6 }}>
          Faculty Spotlight & Leadership
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3.5 }}>
          {[
            { name: 'Dr. (Mrs.) Sandhya Srinivasan', role: 'Principal & Trustee Director', degree: 'Ph.D. in Educational Administration', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop' },
            { name: 'Prof. Ramesh Chandra Pathak', role: 'Head of Department, Physics', degree: 'M.Sc. in Nuclear Physics, B.Ed.', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop' },
            { name: 'Dr. Anjali Verma', role: 'Dean of Student Welfare', degree: 'Ph.D. in Child Psychology', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop' },
            { name: 'Mr. Satish Kumar Dubey', role: 'Director of Athletic Sports', degree: 'M.P.Ed., Certified NIS Coach', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
          ].map((fac, idx) => (
            <Card
              key={idx}
              className="glass-panel"
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <Avatar
                src={fac.img}
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: '2px solid #38BDF8' }}
              />
              <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 'bold' }}>
                {fac.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#38BDF8', display: 'block', fontWeight: 'bold', mt: 0.5 }}>
                {fac.role}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                {fac.degree}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default AboutPage;
