import React from 'react';
import { Box, Container, Typography, Card, Chip } from '@mui/material';
import SEO from '../components/common/SEO';
import SectionHeader from '../components/common/SectionHeader';

interface AcademicProgram {
  title: string;
  age: string;
  ratio: string;
  description: string;
  subjects: string[];
}

const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  {
    title: 'Primary Wing (Grades I - V)',
    age: '6 - 10 Years',
    ratio: '1:20 Ratio',
    description: 'Focuses on foundational reading, writing, and basic mathematical operations, utilizing activity-based learning, physical mindfulness, and introductory computer concepts.',
    subjects: ['English, Hindi & Sanskrit Basics', 'Vedic Mathematics', 'Environmental Studies', 'Creative Arts & Yoga', 'Computer Basics & Scratch'],
  },
  {
    title: 'Middle Wing (Grades VI - VIII)',
    age: '11 - 13 Years',
    ratio: '1:25 Ratio',
    description: 'Nurturing student analytical skills, science experiment workflows, coding, Vedic arithmetic speed, and Sanskrit language appreciation.',
    subjects: ['Languages (English, Hindi, Sanskrit)', 'Algebra & Geometry', 'Vedic & Modern Mathematics', 'Robotics & STEM Labs', 'Social & Cultural Studies'],
  },
  {
    title: 'Secondary Wing (Grades IX - XII)',
    age: '14 - 17 Years',
    ratio: '1:30 Ratio',
    description: 'Supportive academic preparation for secondary boards and university entrance exams, along with stress-management coaching and coding tracks.',
    subjects: ['Calculus & Statistics', 'Physics & Chemistry', 'Computer Science & AI', 'Sanskrit / Hindi Literature', 'Yoga & Physical Education'],
  },
];

const AcademicsPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#FFFCF5', minHeight: '100vh', py: 6 }}>
      {/* SEO Tags */}
      <SEO 
        title="Academics & Curricula | CBSE Study Wings"
        description="Explore the curriculum structure of KCP Public School, Lucknow. Detailed details on Primary, Middle, Secondary, and Senior Secondary streams."
      />

      <Container maxWidth="lg" className="animate-fade-in-up">
        {/* HEADER SECTION */}
        <SectionHeader 
          preHeader="Wings of Learning" 
          title="Academic Curriculum & Specializations"
          subtitle="Affiliated to the Central Board of Secondary Education (CBSE), New Delhi"
        />

        {/* Roster of Academy Levels */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 10 }}>
          {ACADEMIC_PROGRAMS.map((prog, i) => (
            <Card
              key={i}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#FFFFFF',
                borderColor: '#E5E7EB',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#E8751A'
                }
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Chip
                    label={prog.age}
                    size="small"
                    sx={{ bgcolor: 'rgba(232, 117, 26, 0.08)', color: '#E8751A', fontWeight: 'bold', border: '1px solid rgba(232, 117, 26, 0.2)' }}
                  />
                  <Typography variant="caption" sx={{ color: '#5B6573', fontWeight: 'bold' }}>
                    {prog.ratio}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#12355B', mb: 2, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
                  {prog.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6573', mb: 4, lineHeight: 1.7 }}>
                  {prog.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#12355B', mb: 2, fontSize: 13, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
                  Core Curriculum Focus:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {prog.subjects.map((sub, idx) => (
                    <Chip
                      key={idx}
                      label={sub}
                      size="small"
                      sx={{ bgcolor: '#FFFCF5', color: '#1F2937', fontSize: 11, border: '1px solid #E5E7EB' }}
                    />
                  ))}
                </Box>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Senior secondary highlights */}
        <Card
          sx={{ 
            p: 5, 
            borderRadius: 3, 
            bgcolor: '#FFFFFF', 
            borderColor: '#E5E7EB',
            boxShadow: 'none'
          }}
        >
          <Typography variant="h5" sx={{ color: '#12355B', mb: 4, fontWeight: 'bold', fontFamily: '"Playfair Display", serif' }}>
            Senior Secondary Stream Specializations (Grades XI & XII)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {[
              {
                stream: 'Science Stream',
                color: '#E8751A',
                desc: 'Advanced Physics, Chemistry, Mathematics (with mental math shortcuts), Biology, and Computer Science. Prepares students for technical and medical education.',
              },
              {
                stream: 'Commerce Stream',
                color: '#0F766E',
                desc: 'Accountancy, Business Studies, Economics, and Applied Mathematics. Geared towards financial planning, business administration, and accounting.',
              },
              {
                stream: 'Humanities Stream',
                color: '#12355B',
                desc: 'History, Political Science, Psychology, and Sanskrit/Hindi Literature. Focused on communication, civil service foundations, and legal studies.',
              },
            ].map((item, idx) => (
              <Box key={idx}>
                <Typography variant="subtitle1" sx={{ color: item.color, mb: 1.5, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
                  {item.stream}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.7 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default AcademicsPage;
