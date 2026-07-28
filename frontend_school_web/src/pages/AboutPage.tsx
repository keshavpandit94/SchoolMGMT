import React from 'react';
import { Box, Container, Typography, Card, Avatar } from '@mui/material';
import { Compass, User } from 'lucide-react';
import SEO from '../components/common/SEO';
import SectionHeader from '../components/common/SectionHeader';

const AboutPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#FFFCF5', minHeight: '100vh', py: 6 }}>
      {/* SEO Tags */}
      <SEO 
        title="About Us | School Governance & Leadership"
        description="Learn about KCP Public School's establishment in 2012, our educational milestones, and the leadership directing academic excellence."
      />

      <Container maxWidth="lg" className="animate-fade-in-up">
        {/* HEADER SECTION */}
        <SectionHeader 
          preHeader="Our Legacy" 
          title="Milestones & Leadership"
          subtitle="KCP Public School, Lucknow • Nurturing minds since 2012"
        />

        {/* Legacy and vision layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 6, mb: 10, alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#12355B', mb: 2.5, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
              Historical Foundations of Academic Quality
            </Typography>
            <Typography variant="body1" sx={{ color: '#1F2937', mb: 2.5, lineHeight: 1.8, fontSize: '0.98rem' }}>
              Founded in 2012 in Lucknow, KCP Public School was established with a clear mission: to merge scientific curiosity with strong ethical principles. Over the years, the school has grown into a leading institution in Vikas Nagar, featuring smart classroom modules, Vedic mathematics training, and sports complexes.
            </Typography>
            <Typography variant="body1" sx={{ color: '#1F2937', mb: 2.5, lineHeight: 1.8, fontSize: '0.98rem' }}>
              We prepare our students for secondary school pathways and beyond through robotics labs, computer modules, and comprehensive study plans that support strong CBSE board scores, while ensuring they participate in yoga and creative arts programs.
            </Typography>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Card sx={{ p: 4, bgcolor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <Typography variant="h6" sx={{ color: '#12355B', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
                <Compass size={20} color="#E8751A" /> Academic Commitments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#0F766E', fontWeight: 'bold' }}>
                    Digitized Study Blocks
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', mt: 0.5 }}>
                    Equipped with visual screens, computer labs, and organized library resources.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#0F766E', fontWeight: 'bold' }}>
                    Vedic Arithmetic & Wellness
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', mt: 0.5 }}>
                    Weekly calculations and basic breathing/concentration routines to support student focus.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#0F766E', fontWeight: 'bold' }}>
                    Sports & Athletic Fields
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', mt: 0.5 }}>
                    Directed by trained physical instructors, featuring standard courts for cricket and tennis.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* MILESTONES TIMELINE */}
        <Box sx={{ mb: 12 }}>
          <SectionHeader 
            title="Historical Milestones" 
            subtitle="Important phases in the growth of KCP Public School, Lucknow."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3.5 }}>
            {[
              { year: '2012', title: 'Foundation Stone', desc: 'Inaugurated with primary classes and a single academic building in Lucknow.' },
              { year: '2016', title: 'CBSE Affiliation Upgrade', desc: 'Affiliated to CBSE New Delhi for Secondary & Senior Secondary instruction.' },
              { year: '2020', title: 'Science & Coding Labs', desc: 'Launched science laboratories, computer systems, and coding modules.' },
              { year: '2025', title: 'Digital Resource Wing', desc: 'Introduced smart library archives and online study planner dashboards.' },
            ].map((milestone, idx) => (
              <Card
                key={idx}
                sx={{
                  p: 3.5,
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                }}
              >
                <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: '#E8751A', mb: 1 }}>
                  {milestone.year}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 'bold', mb: 1 }}>
                  {milestone.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', lineHeight: 1.5 }}>
                  {milestone.desc}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* FACULTY SPOTLIGHT */}
        <Box sx={{ mb: 6 }}>
          <SectionHeader 
            title="School Leadership & Faculty" 
            subtitle="Dedicated coordinators directing academic guidelines and student care."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3.5 }}>
            {[
              { name: 'Dr. (Mrs.) Sandhya Srinivasan', role: 'Principal & Trustee Director', degree: 'Ph.D. in Educational Administration (BHU)' },
              { name: 'Prof. Ramesh Chandra Pathak', role: 'Head of Department, Physics', degree: 'M.Sc. in Physics (IIT Kanpur), B.Ed.' },
              { name: 'Dr. Anjali Verma', role: 'Dean of Student Welfare', degree: 'Ph.D. in Child Psychology (JNU)' },
              { name: 'Mr. Satish Kumar Dubey', role: 'Director of Physical Sports', degree: 'M.P.Ed., Certified Physical Instructor' },
            ].map((fac, idx) => (
              <Card
                key={idx}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Local portrait avatar placeholder */}
                <Avatar
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    mx: 'auto', 
                    mb: 2, 
                    border: '2px solid #E8751A',
                    bgcolor: '#FFFCF5',
                    color: '#E8751A'
                  }}
                >
                  <User size={32} aria-hidden="true" />
                </Avatar>
                <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 'bold' }}>
                  {fac.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F766E', display: 'block', fontWeight: 'bold', mt: 0.5 }}>
                  {fac.role}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', mt: 0.5 }}>
                  {fac.degree}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
