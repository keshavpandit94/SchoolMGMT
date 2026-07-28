import React from 'react';
import { Box, Container, Typography, Card, Button } from '@mui/material';
import { 
  GraduationCap, 
  Cpu, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Bus, 
  Heart, 
  Palette, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import SEO from '../components/common/SEO';
import SectionHeader from '../components/common/SectionHeader';

interface FacilityItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  themeColor: '#12355B' | '#0F766E'; // Navy or Teal only, not orange
}

const FACILITIES_LIST: FacilityItem[] = [
  {
    icon: <GraduationCap size={22} />,
    title: 'Smart Classrooms',
    desc: 'Fully ventilated learning environments featuring digitized interactive touchboards and smart projection systems.',
    themeColor: '#12355B'
  },
  {
    icon: <Cpu size={22} />,
    title: 'Science, Computer & Robotics Lab',
    desc: 'Dedicated maker spaces with electronic kits, physics/chemistry tools, and robotics equipment to nurture scientific curiosity.',
    themeColor: '#0F766E'
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Digital Library',
    desc: 'Gyan Kendra library containing 10,000+ volumes, reference desks, and Kindle e-readers for online research.',
    themeColor: '#12355B'
  },
  {
    icon: <Activity size={22} />,
    title: 'Sports & Wellness',
    desc: 'Spacious courts for lawn tennis and cricket, paired with an indoor Yoga Shala for student physical health and mindfulness.',
    themeColor: '#0F766E'
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Safety & Security',
    desc: 'Round-the-clock CCTV surveillance, biometric scanning at student entry gates, and automated campus registers.',
    themeColor: '#12355B'
  },
  {
    icon: <Bus size={22} />,
    title: 'Transport Facility',
    desc: 'Safe, managed air-conditioned bus services covering major sectors of Lucknow, equipped with live GPS tracking.',
    themeColor: '#0F766E'
  },
  {
    icon: <Heart size={22} />,
    title: 'Medical / Infirmary Room',
    desc: 'Fully equipped first-aid station managed by certified healthcare coordinators for emergency checks and rest.',
    themeColor: '#12355B'
  },
  {
    icon: <Palette size={22} />,
    title: 'Arts, Music & Activity Room',
    desc: 'Creative centers for classical Indian music, vocal practice, sketching, and regional arts.',
    themeColor: '#0F766E'
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Vedic Heritage / Values Education',
    desc: 'Dedicated corridors displaying legacy Indian contributions to mathematics, astronomy, and moral values.',
    themeColor: '#12355B'
  }
];

const FacilitiesPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#FFFCF5', minHeight: '100vh', py: 6 }}>
      {/* SEO Tags */}
      <SEO 
        title="School Infrastructure & Facilities | Modern Campus"
        description="Discover the infrastructure at KCP Public School, Lucknow. Features smart classrooms, robotics labs, digital libraries, and sports centers."
      />

      <Container maxWidth="lg" className="animate-fade-in-up">
        {/* HEADER SECTION */}
        <SectionHeader 
          preHeader="Campus Infrastructure" 
          title="Modern Learning Spaces & Facilities"
          subtitle="Designed to support active study, scientific inquiry, and student well-being."
        />

        {/* 3-2-1 RESPONSIVE GRID */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
            gap: 4,
            mb: 6
          }}
        >
          {FACILITIES_LIST.map((facility, i) => (
            <Card
              key={i}
              sx={{
                p: 3, // 24px padding
                borderRadius: '16px', // 16px border-radius
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#FFFFFF',
                borderColor: '#E5E7EB',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)', // Small hover lift only
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
                  borderColor: '#E5E7EB',
                }
              }}
            >
              <Box>
                {/* Theme colored Navy or Teal icon container - not orange */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: facility.themeColor === '#12355B' ? 'rgba(18, 53, 145, 0.06)' : 'rgba(15, 118, 110, 0.06)',
                    color: facility.themeColor,
                    display: 'inline-flex',
                    mb: 2.5
                  }}
                >
                  {facility.icon}
                </Box>
                <Typography variant="h6" sx={{ color: '#12355B', mb: 1.5, fontWeight: 'bold', fontFamily: '"Inter", sans-serif', fontSize: '1.1rem' }}>
                  {facility.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.7, mb: 3 }}>
                  {facility.desc}
                </Typography>
              </Box>

              {/* Saffron CTA Link */}
              <Box sx={{ mt: 'auto' }}>
                <Button
                  component="a"
                  href="mailto:admissions@kcppschool.edu.in?subject=Facilities Inquiry"
                  size="small"
                  endIcon={<ArrowRight size={14} />}
                  sx={{
                    color: '#E8751A',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    p: 0,
                    minWidth: 0,
                    '&:hover': {
                      color: '#C95E10',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  Explore facility
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FacilitiesPage;
