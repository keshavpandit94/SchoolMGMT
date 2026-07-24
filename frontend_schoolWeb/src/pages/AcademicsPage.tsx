import React from 'react';
import { Box, Container, Typography, Card, Chip } from '@mui/material';

interface AcademicProgram {
  title: string;
  age: string;
  ratio: string;
  description: string;
  subjects: string[];
}

const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  {
    title: 'Primary Academy (Grades I - V)',
    age: '6 - 10 Years',
    ratio: '1:20 Ratio',
    description: 'Foundational literacy and numeracy utilizing play-based inquiry, tactile model-building, and entry-level programming logics.',
    subjects: ['English & Hindi', 'Elementary Mathematics', 'General Science', 'Visual Arts & Drama', 'Coding Basics & Scratch'],
  },
  {
    title: 'Middle School (Grades VI - VIII)',
    age: '11 - 13 Years',
    ratio: '1:25 Ratio',
    description: 'Nurturing independent thought, core scientific hypotheses, foreign languages, and algorithmic reasoning frameworks.',
    subjects: ['Languages (English/Sanskrit/French)', 'Algebra & Geometry', 'Experimental Physics', 'Robotics & Hardware Design', 'Social Science'],
  },
  {
    title: 'High School Academy (Grades IX - XII)',
    age: '14 - 17 Years',
    ratio: '1:30 Ratio',
    description: 'Advanced university preparation, career profiling, mock board examination sprints, and specialized stream selection grids.',
    subjects: ['Calculus & Stats', 'Organic Chemistry', 'Computer Science & AI', 'Micro Economics', 'English Literature'],
  },
];

const AcademicsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }} className="animate-fade-in-up">
      {/* HEADER SECTION */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Outfit', mb: 1.5, fontWeight: '900' }}>
          Academic Rigor & Curricula
        </Typography>
        <Typography variant="body1" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 0.5 }}>
          Affiliated to Central Board of Secondary Education (CBSE), New Delhi
        </Typography>
      </Box>

      {/* Roster of Academy Levels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 10 }}>
        {ACADEMIC_PROGRAMS.map((prog, i) => (
          <Card
            key={i}
            className="glass-panel"
            sx={{
              p: 4,
              bgcolor: 'rgba(15, 23, 42, 0.45)',
              border: '1px solid rgba(255,255,255,0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Chip
                  label={prog.age}
                  size="small"
                  sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#38BDF8', fontWeight: 'bold', border: '1px solid rgba(14, 165, 233, 0.15)' }}
                />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 'bold' }}>
                  {prog.ratio}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#F8FAFC', mb: 2, fontWeight: 'bold' }}>
                {prog.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.7 }}>
                {prog.description}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: '#F8FAFC', mb: 2, fontSize: 13, fontWeight: 'bold' }}>
                Core Curriculum Focus:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {prog.subjects.map((sub, idx) => (
                  <Chip
                    key={idx}
                    label={sub}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: '#CBD5E1', fontSize: 11, border: '1px solid rgba(255,255,255,0.04)' }}
                  />
                ))}
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Senior secondary highlights */}
      <Card
        className="glass-panel"
        sx={{ p: 5, borderRadius: 4, background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <Typography variant="h5" sx={{ color: '#F8FAFC', mb: 4, fontWeight: 'bold' }}>
          Senior Secondary Stream Specializations (Grades XI & XII)
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {[
            {
              stream: 'Science Stream',
              color: '#38BDF8',
              desc: 'Advanced Physics, Chemistry, Mathematics, Biology, Computer Science, and Informatics. Geared towards engineering, medical research, and tech careers.',
            },
            {
              stream: 'Commerce Stream',
              color: '#38BDF8',
              desc: 'Accountancy, Business Studies, Economics, and Financial Mathematics. Focused on corporate leadership, charter credentials, and entrepreneurial setups.',
            },
            {
              stream: 'Humanities Stream',
              color: '#38BDF8',
              desc: 'History, Political Science, Child Psychology, Sociology, and English Literature. Fostering rich sociological understanding and media journalism credentials.',
            },
          ].map((item, idx) => (
            <Box key={idx}>
              <Typography variant="subtitle1" sx={{ color: item.color, mb: 1.5, fontWeight: 'bold' }}>
                {item.stream}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7 }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Container>
  );
};

export default AcademicsPage;
