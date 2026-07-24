import React from 'react';
import { Box, Container, Typography, Button, Card, Chip, Avatar } from '@mui/material';
import { Sparkles, Calendar, Trophy, Quote, ArrowRight } from 'lucide-react';
import PrincipalMessage from '../components/PrincipalMessage';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  return (
    <Box className="animate-fade-in-up">
      {/* HERO SECTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
            <Box sx={{ flex: 1.2 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2.5,
                  py: 1,
                  borderRadius: 5,
                  bgcolor: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  mb: 3,
                }}
              >
                <Sparkles size={16} color="#38BDF8" />
                <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 0.5 }}>
                  Admission Enrolments Open for Term 2026-27
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Outfit',
                  fontWeight: '900',
                  fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.5rem' },
                  lineHeight: 1.05,
                  mb: 3,
                  letterSpacing: -1,
                }}
              >
                Shaping Minds.<br />
                <span className="lightning-text">Inspiring Futures.</span>
              </Typography>

              <Typography variant="body1" sx={{ color: '#94A3B8', fontSize: '1.15rem', maxW: 600, mb: 5, lineHeight: 1.7 }}>
                Welcome to KCP Public School, Lucknow (KCPPS). We synergize rigorous CBSE academic curricula with top-tier robotics labs and state-level sports training to deliver a transformative learning experience.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                <Button
                  onClick={() => onPageChange('admissions')}
                  variant="contained"
                  className="primary-gradient-btn"
                  sx={{ borderRadius: 3, py: 1.8, px: 4.5, textTransform: 'none', fontWeight: '800', fontSize: 16 }}
                >
                  Apply Online Now
                </Button>
                <Button
                  onClick={() => onPageChange('about')}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    py: 1.8,
                    px: 4.5,
                    textTransform: 'none',
                    fontWeight: '800',
                    fontSize: 16,
                    color: '#F8FAFC',
                    borderColor: 'rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    '&:hover': {
                      borderColor: '#0EA5E9',
                      bgcolor: 'rgba(14, 165, 233, 0.05)',
                    },
                  }}
                >
                  Learn History
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 0.8, width: '100%' }} className="animate-float">
              <PrincipalMessage />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ACCREDITATION & RECOGNITION ROW */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box
          className="glass-panel"
          sx={{
            py: 3,
            px: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 4,
            borderRadius: 4,
            background: 'rgba(15, 23, 42, 0.4)',
          }}
        >
          <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 'bold' }}>
            AFFILIATED & ACCREDITED BY:
          </Typography>
          {['CBSE New Delhi', 'ISO 9001:2015', 'FIT India Certified School', 'National Cleanliness Awardee'].map((logo, i) => (
            <Chip
              key={i}
              label={logo}
              sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                color: '#E2E8F0',
                fontWeight: 'bold',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            />
          ))}
        </Box>
      </Container>

      {/* CBSE BOARD HIGHLIGHTS SECTION */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: '900', mb: 1.5 }}>
            Outstanding CBSE Results 2025
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', maxW: 600, mx: 'auto' }}>
            Our students consistently rank among the top scorers in the state in standard CBSE Class X & XII examinations.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3.5 }}>
          {[
            { metric: '99.4%', label: 'Highest Board Score', desc: 'Achieved in Science stream by Rahul Pathak' },
            { metric: '42+', label: 'Students above 95%', desc: 'Demonstrating systemic pedagogical excellence' },
            { metric: '100%', label: 'First Division Passes', desc: 'Maintained for the 12th consecutive year' },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="glass-panel"
              sx={{
                p: 4.5,
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Typography variant="h2" sx={{ fontFamily: 'Outfit', fontWeight: '900', color: '#38BDF8', mb: 1 }}>
                {item.metric}
              </Typography>
              <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 'bold', mb: 1.5 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                {item.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>

      {/* RECENT EVENTS & NEWS CALENDAR */}
      <Box sx={{ py: 10, bgcolor: 'rgba(15, 23, 42, 0.3)', borderY: '1px solid rgba(255,255,255,0.04)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.8fr' }, gap: 5, alignItems: 'center' }}>
            <Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(14, 165, 233, 0.08)',
                  color: '#38BDF8',
                  display: 'inline-flex',
                  mb: 2.5,
                }}
              >
                <Trophy size={20} />
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: '900', mb: 2 }}>
                Campus Pulse & Updates
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.7 }}>
                Stay up to date with KCPPS events, upcoming science exhibitions, and annual athletic meets held across our high-performance campus facilities.
              </Typography>
              <Button
                onClick={() => onPageChange('contact')}
                variant="text"
                sx={{ color: '#38BDF8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none' }}
              >
                Join Event Newsletter <ArrowRight size={16} />
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { date: 'Aug 14', title: 'National Smart Robotics Expo 2026', type: 'Technology Event', desc: 'Student projects from grades 8 to 12 showcase AI-based automated solutions.' },
                { date: 'Sep 02', title: 'Inter-School Debate Championship', type: 'Literary Club', desc: 'Hosted at KCPPS main auditorium with participation from over 35 city schools.' },
                { date: 'Sep 25', title: 'Annual Athletic Carnival', type: 'Sports Academy', desc: 'Track & field championships, gymnastic arrays, and professional swimming finals.' },
              ].map((ev, idx) => (
                <Card
                  key={idx}
                  className="glass-panel"
                  sx={{
                    p: 3,
                    display: 'flex',
                    gap: 3,
                    alignItems: 'center',
                    background: 'rgba(18, 26, 38, 0.6)',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      textAlign: 'center',
                      minWidth: 70,
                    }}
                  >
                    <Calendar size={18} color="#38BDF8" style={{ marginBottom: 4 }} />
                    <Typography variant="subtitle2" sx={{ color: '#38BDF8', fontWeight: 'bold', lineHeight: 1 }}>
                      {ev.date}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip label={ev.type} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: '#94A3B8', mb: 1, fontWeight: 'bold' }} />
                    <Typography variant="subtitle1" sx={{ color: '#F8FAFC', fontWeight: 'bold', mb: 0.5 }}>
                      {ev.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {ev.desc}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* TESTIMONIALS SECTION */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: '900', mb: 1.5 }}>
            Hear From Our Community
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', maxW: 600, mx: 'auto' }}>
            Trusted by parents and celebrated by alumni succeeding at premium universities worldwide.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3.5 }}>
          {[
            { quote: "KCPPS has transformed our son's attitude towards science. The coding and robotics syllabus here is practical and forward-looking.", author: "Sunita Dwivedi", label: "Parent of Grade X Scholar" },
            { quote: "The athletic coaches at the sports complex are outstanding. I received personal mentoring that helped me qualify for State Tennis.", author: "Akash Verma", label: "Alumnus (Batch 2024)" },
            { quote: "The curriculum here prepares you for competitive exams like JEE and NEET while ensuring your base values remain strong.", author: "Dr. Rohit Saxena", label: "Parent & Senior Surgeon" },
          ].map((t, idx) => (
            <Card
              key={idx}
              className="glass-panel"
              sx={{
                p: 4.5,
                background: 'rgba(15, 23, 42, 0.45)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Quote size={32} color="#0EA5E9" style={{ marginBottom: 20, opacity: 0.8 }} />
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, fontStyle: 'italic', lineHeight: 1.7 }}>
                "{t.quote}"
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#38BDF8', fontWeight: 'bold' }}>
                  {t.author.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 'bold' }}>
                    {t.author}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {t.label}
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
