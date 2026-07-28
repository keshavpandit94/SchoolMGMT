import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  Chip, 
  Avatar, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  Sparkles, 
  Calendar, 
  Quote, 
  Bell, 
  PhoneCall, 
  BookOpen, 
  MapPin, 
  Award, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  FileText, 
  X,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import PrincipalMessage from '../components/PrincipalMessage';
import SEO from '../components/common/SEO';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import StatCard from '../components/common/StatCard';
import SectionHeader from '../components/common/SectionHeader';
import FAQItem from '../components/common/FAQItem';
import AdmissionStep from '../components/common/AdmissionStep';
import campusHero from '../assets/campus_hero.png';

const defaultNotices = [
  { _id: '1', title: 'Admissions Open for Term 2026-27', content: 'Online applications are now open for new enrollments. Limited seats are available in Science (JEE/NEET Integrated preparation modules) and Commerce streams.', category: 'Admission', date: new Date().toISOString() },
  { _id: '2', title: 'Inter-School Sanskrit Declamation Contest', content: 'Our school is hosting the state-level recitation and Vedic chanting championship in the main auditorium.', category: 'Academic', date: new Date().toISOString() },
  { _id: '3', title: 'Independence Day Observance & Cultural Fest', content: 'Join us on August 15th for cultural celebrations and patriotic musical performances by our junior classes.', category: 'Holiday', date: new Date().toISOString() }
];

const defaultEvents = [
  { _id: '1', title: 'Vedic Mathematics & AI Expo', desc: 'Exhibiting student projects combining traditional calculation methods with modern computing and robotics models.', date: 'Aug 14', type: 'Science & Heritage' },
  { _id: '2', title: 'National Youth Mock Parliament', desc: 'Mock parliamentary debates on environmental conservation and educational values.', date: 'Sep 02', type: 'Literary Club' },
  { _id: '3', title: 'Annual Sports & Wellness Carnival', desc: 'Traditional athletic tournaments combined with mass yoga demonstrations by primary scholars.', date: 'Sep 25', type: 'Sports & Wellness' }
];

const trustFacts = [
  { icon: <Award size={24} color="#E8751A" />, title: 'CBSE Affiliated', subtitle: 'Affiliation No. 2730126' },
  { icon: <BookOpen size={24} color="#E8751A" />, title: 'Grades I to XII', subtitle: 'Science, Commerce & Humanities' },
  { icon: <MapPin size={24} color="#E8751A" />, title: 'Lucknow, UP', subtitle: '10-Acre Safe Green Campus' },
  { icon: <Calendar size={24} color="#E8751A" />, title: 'Est. 2012', subtitle: '14+ Years of Legacy' }
];

const chooseUsPillars = [
  { icon: '🕉️', title: 'Vedic Maths & Traditional Values', desc: 'Blending daily mental arithmetic techniques with character-building programs to nurture responsible and polite students.' },
  { icon: '🤖', title: 'Coding & Robotics Laboratory', desc: 'Dedicated learning spaces featuring hands-on kits to build scientific curiosity and technical skills from primary classes.' },
  { icon: '🏆', title: 'Excellent Board Performance', desc: 'Consistent high scorers in Uttar Pradesh board assessments with personal coaching tracks for classes XI and XII.' },
  { icon: '👥', title: 'Teacher-Student Mentorship', desc: 'We maintain a healthy 1:25 ratio. A dedicated mentor coordinates academic growth and general wellbeing for every child.' },
  { icon: '🌿', title: 'Lush Green Safe Campus', desc: 'Equipped with round-the-clock safety monitoring, fully ventilated classrooms, standard play fields, and a medical desk.' }
];

const academicWings = [
  { title: 'Primary Wing', range: 'Grades I - V', desc: 'Fosters foundational reading, spelling, mathematical arithmetic, and artistic skills through practical activities.', highlight: 'Experiential science models, basic Vedic arithmetic, interactive visual boards.' },
  { title: 'Middle Wing', range: 'Grades VI - VIII', desc: 'Introduces advanced scientific concepts, coding logic, language choices (Sanskrit/French), and student club activities.', highlight: 'Robotics labs, speech training, creative design clubs.' },
  { title: 'Secondary Wing', range: 'Grades IX - X', desc: 'Prepares students for analytical assessments and CBSE secondary board examinations with laboratory experiments.', highlight: 'Career interest workshops, mock board drills, laboratory practices.' },
  { title: 'Senior Secondary', range: 'Grades XI - XII', desc: 'Offers streams in Science (Physics/Chemistry/Maths/Biology) and Commerce with specialized guidance for competitive entrance exams.', highlight: 'JEE/NEET preparation support, professional admissions guidance.' }
];

const galleryItems = [
  { title: 'Robotics & Coding Center', label: 'STEM Lab', icon: '🤖' },
  { title: 'Vedic & Modern Science Wing', label: 'Innovation Lab', icon: '🔬' },
  { title: 'Sports & Play Complex', label: 'Athletic Fields', icon: '⚽' },
  { title: 'Central Library & Reading Area', label: 'Research Library', icon: '📚' },
  { title: 'Digitized Smart Classroom', label: 'Learning Space', icon: '💻' },
  { title: 'Performing Arts Auditorium', label: 'Cultural Center', icon: '🎭' }
];

const admissionSteps = [
  { step: '01', title: 'Campus Visit & Enquiry', desc: 'Fill out our campus tour request or contact our admissions desk to arrange a guided walkthrough of our classrooms.' },
  { step: '02', title: 'Online Registration Form', desc: 'Complete the candidate\'s registration details on our secure portal and attach the required documents.' },
  { step: '03', title: 'Student Interaction Day', desc: 'Visit the school for a friendly interaction and basic evaluation to check the student\'s grade readiness.' },
  { step: '04', title: 'Confirm Admission', desc: 'Complete the document review, pay standard school fees, and collect the parent onboarding guide.' }
];

const faqs = [
  { q: 'Is KCP Public School CBSE affiliated?', a: 'Yes, KCP Public School is fully affiliated with the Central Board of Secondary Education (CBSE), New Delhi, under Affiliation Number 2730126, preparing students for class X and XII board examinations.' },
  { q: 'What is the CBSE Board curriculum pattern at KCPPS?', a: 'We follow the NCERT books and syllabus, enriched with Vedic Mathematics in primary classes, AI and coding starting in class VI, and integrated study support in senior secondary.' },
  { q: 'Are transport services provided for students?', a: 'Yes, we operate a fully managed, air-conditioned bus service equipped with GPS, live tracking systems, and trained supervisors, covering all major sectors and neighborhoods of Lucknow.' },
  { q: 'What are the required documents during admissions?', a: 'The key documents include: 1. Legal Birth Certificate of candidate, 2. Transfer Certificate (TC) from the previous school, 3. Candidate & Parent Aadhaar card copies, 4. Previous grade sheets/report cards, and 5. Four passport-sized photographs.' },
  { q: 'How does the school support students preparing for national competitive exams?', a: 'In the Senior Secondary block (classes XI and XII), we offer a structured integrated syllabus. Students can attend specialized mock tests, conceptual prep sessions, and problem-solving workshops for JEE, NEET, and CUET within regular school hours.' }
];

const HomePage: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeWing, setActiveWing] = useState(0);

  // Book Visit Dialog Form State
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [visitName, setVisitName] = useState('');
  const [visitEmail, setVisitEmail] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitGrade, setVisitGrade] = useState('Grade I');
  const [visitDate, setVisitDate] = useState('');
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);
  const [visitError, setVisitError] = useState('');

  // SEO metadata & JSON-LD Schema
  const schoolSchema = {
    "@context": "https://schema.org",
    "@type": "School",
    "name": "KCP Public School, Lucknow",
    "url": "https://kcppschool.edu.in",
    "logo": "https://kcppschool.edu.in/logo.png",
    "image": "https://kcppschool.edu.in/campus.jpg",
    "description": "KCP Public School Lucknow provides quality primary, middle, and senior secondary education affiliated with CBSE, New Delhi.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sector 4, Vikas Nagar",
      "addressLocality": "Lucknow",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "226022",
      "addressCountry": "IN"
    },
    "telephone": "+91-522-2468100",
    "email": "admissions@kcppschool.edu.in"
  };

  useEffect(() => {
    // Fetch notices
    axiosInstance.get('/api/notices')
      .then(res => {
        if (res.data.success && res.data.notices.length > 0) {
          setNotices(res.data.notices);
        } else {
          setNotices(defaultNotices);
        }
      })
      .catch(() => setNotices(defaultNotices));

    // Fetch events
    axiosInstance.get('/api/events')
      .then(res => {
        if (res.data.success && res.data.events.length > 0) {
          setEvents(res.data.events);
        } else {
          setEvents(defaultEvents);
        }
      })
      .catch(() => setEvents(defaultEvents));
  }, []);

  const handleBookVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitError('');
    setVisitSuccess(false);

    if (!visitName || !visitPhone || !visitDate) {
      setVisitError('Please fill in required fields (Name, Phone number, and Preferred date).');
      return;
    }

    // Indian phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(visitPhone.replace(/[\s-]/g, ''))) {
      setVisitError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    setVisitLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVisitSuccess(true);
      setVisitName('');
      setVisitEmail('');
      setVisitPhone('');
      setVisitDate('');
    } catch (err) {
      setVisitError('Admissions desk is currently busy. Please try again later or call directly.');
    } finally {
      setVisitLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#FFFCF5', minHeight: '100vh' }}>
      {/* Dynamic SEO Meta Tags and JSON-LD structured schema */}
      <SEO 
        title="KCP Public School Lucknow | Top CBSE School"
        description="Welcome to KCP Public School, Lucknow. Affiliated to CBSE New Delhi, we provide a warm, holistic education environment with Vedic Mathematics, coding labs, and professional athletic coaching."
        schema={schoolSchema}
      />

      <Box sx={{ width: '100%', py: { xs: 4, md: 8 } }}>
        
        {/* 1. HERO SECTION */}
        <Container maxWidth="lg" sx={{ mb: 10 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
            {/* Left Info Column */}
            <Box sx={{ flex: 1.2 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: 2,
                  bgcolor: 'rgba(232, 117, 26, 0.08)',
                  border: '1px solid rgba(232, 117, 26, 0.2)',
                  mb: 3,
                }}
              >
                <Sparkles size={14} color="#E8751A" />
                <Typography variant="caption" sx={{ color: '#E8751A', fontWeight: '800', letterSpacing: 0.5 }}>
                  Admissions Open for Term 2026-27
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Playfair Display", "Outfit", serif',
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', sm: '3.4rem', md: '4rem' },
                  lineHeight: 1.15,
                  mb: 3,
                  color: '#12355B',
                }}
              >
                Nurturing Curiosity.<br />
                <span style={{ color: '#E8751A' }}>Building Character.</span>
              </Typography>

              <Typography variant="subtitle1" sx={{ color: '#0F766E', fontWeight: '800', mb: 3.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.05rem' }}>
                🕉️ “विद्ययाऽमृतमश्नुते” — Through Knowledge, Immortality is Attained.
              </Typography>

              <Typography variant="body1" sx={{ color: '#1F2937', fontSize: '1.1rem', maxW: 600, mb: 4.5, lineHeight: 1.7, borderLeft: '4px solid #0F766E', pl: 2.5 }}>
                Welcome to KCP Public School, Lucknow. We balance standard CBSE coursework with Vedic Mathematics, coding exercises, and active sports mentorship, helping children grow into capable and polite citizens.
              </Typography>

              {/* Conversion CTAs */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <PrimaryButton 
                  component={Link}
                  to="/admissions"
                >
                  Apply for Admission
                </PrimaryButton>
                <SecondaryButton 
                  onClick={() => setVisitDialogOpen(true)}
                >
                  Book a Campus Visit
                </SecondaryButton>
              </Box>
            </Box>

            {/* Right Column: Local campus image placeholder */}
            <Box sx={{ flex: 0.8, width: '100%' }}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 4,
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
                  aspectRatio: '4/3',
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="img"
                  src={campusHero}
                  alt="KCP Public School Lucknow primary building and campus courtyard - Local image placeholder"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>

        {/* 2. TRUST FACTS ROW */}
        <Container maxWidth="lg" sx={{ mb: 10 }}>
          <Box
            sx={{
              py: 3.5,
              px: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 4,
            }}
          >
            {trustFacts.map((fact, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(232, 117, 26, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {fact.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#12355B', fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
                    {fact.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5B6573', fontWeight: 600 }}>
                    {fact.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>

        {/* 3. WHY CHOOSE US & LEADERSHIP MESSAGE */}
        <Container maxWidth="lg" sx={{ mb: 12 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
            
            {/* Leadership Message (Left) */}
            <Box sx={{ flex: 0.9, width: '100%' }}>
              <PrincipalMessage />
            </Box>

            {/* Core pillars (Right) */}
            <Box sx={{ flex: 1.1 }}>
              <SectionHeader 
                preHeader="Our Foundations" 
                title="Why Choose KCPPS"
                align="left"
                sx={{ mb: 4 }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {chooseUsPillars.map((pillar, idx) => (
                  <Box 
                    key={idx}
                    sx={{
                      display: 'flex',
                      gap: 2.5,
                      p: 3,
                      borderRadius: 3,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#E8751A',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                      }
                    }}
                  >
                    <Box sx={{ fontSize: '2rem', lineHeight: 1 }}>
                      {pillar.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#12355B', fontWeight: 700, mb: 0.8, fontFamily: '"Inter", sans-serif', fontSize: '1.1rem' }}>
                        {pillar.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
                        {pillar.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>

        {/* 4. ACADEMIC PROGRAMMES */}
        <Box sx={{ py: 10, bgcolor: '#FFFFFF', borderY: '1px solid #E5E7EB', mb: 12 }}>
          <Container maxWidth="lg">
            <SectionHeader 
              preHeader="Wings of Study" 
              title="Academic Programmes"
              subtitle="We support student development across distinct stages of study matching primary and secondary educational levels."
            />

            {/* Tab navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 4.5 }}>
              {academicWings.map((wing, idx) => (
                <Button
                  key={idx}
                  onClick={() => setActiveWing(idx)}
                  variant={activeWing === idx ? 'contained' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    backgroundColor: activeWing === idx ? '#E8751A' : 'transparent',
                    color: activeWing === idx ? '#FFFFFF' : '#5B6573',
                    borderColor: activeWing === idx ? '#E8751A' : '#D1D5DB',
                    '&:hover': {
                      backgroundColor: activeWing === idx ? '#C95E10' : 'rgba(15, 118, 110, 0.05)',
                      borderColor: activeWing === idx ? '#C95E10' : '#0F766E',
                      color: activeWing === idx ? '#FFFFFF' : '#0F766E',
                    }
                  }}
                >
                  {wing.title}
                </Button>
              ))}
            </Box>

            {/* Program Detail Card */}
            <Card sx={{ p: { xs: 4, md: 5 }, bgcolor: '#FFFCF5', borderColor: '#E5E7EB' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
                <Box sx={{ flex: 1.2 }}>
                  <Chip 
                    label={academicWings[activeWing].range} 
                    sx={{ bgcolor: 'rgba(15, 118, 110, 0.08)', color: '#0F766E', fontWeight: 800, border: '1px solid rgba(15, 118, 110, 0.2)', mb: 2 }} 
                  />
                  <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 800, mb: 2, color: '#12355B' }}>
                    {academicWings[activeWing].title} Details
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1F2937', mb: 3.5, fontSize: '1.05rem' }}>
                    {academicWings[activeWing].desc}
                  </Typography>
                  
                  <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800, mb: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sparkles size={16} color="#E8751A" /> Curriculum Focus
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.5 }}>
                      {academicWings[activeWing].highlight}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 0.8, width: '100%' }}>
                  <Box sx={{ p: 3.5, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={18} color="#0F766E" /> Core Subjects
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {activeWing === 0 && ['English', 'Mathematics', 'Vedic Arithmetic', 'Hindi', 'Environmental Studies', 'Arts & Craft', 'Physical Education'].map((s, i) => (
                        <Chip key={i} label={s} size="small" sx={{ bgcolor: '#FFFCF5', color: '#1F2937', border: '1px solid #E5E7EB' }} />
                      ))}
                      {activeWing === 1 && ['Mathematics', 'Science & Physics', 'Coding Labs', 'Sanskrit / French', 'English Literature', 'Social Studies', 'Creative Arts'].map((s, i) => (
                        <Chip key={i} label={s} size="small" sx={{ bgcolor: '#FFFCF5', color: '#1F2937', border: '1px solid #E5E7EB' }} />
                      ))}
                      {activeWing === 2 && ['Physics', 'Chemistry & Biology', 'CBSE Mathematics', 'English Language', 'Social & Political Studies', 'Computer Applications'].map((s, i) => (
                        <Chip key={i} label={s} size="small" sx={{ bgcolor: '#FFFCF5', color: '#1F2937', border: '1px solid #E5E7EB' }} />
                      ))}
                      {activeWing === 3 && ['Integrated Test Track', 'Physics (Core)', 'Chemistry', 'Biology / Bio-Tech', 'Mathematics', 'Accountancy', 'Business Studies'].map((s, i) => (
                        <Chip key={i} label={s} size="small" sx={{ bgcolor: '#FFFCF5', color: '#1F2937', border: '1px solid #E5E7EB' }} />
                      ))}
                    </Box>
                    <Button 
                      component={Link}
                      to="/admissions"
                      endIcon={<ArrowRight size={16} />}
                      sx={{ mt: 4, textTransform: 'none', color: '#E8751A', fontWeight: 'bold', '&:hover': { color: '#C95E10', bgcolor: 'transparent' } }}
                    >
                      Admission Inquiry
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Container>
        </Box>

        {/* 5. VERIFIED RESULTS */}
        <Container maxWidth="lg" sx={{ mb: 12 }}>
          <SectionHeader 
            preHeader="Scholastic Records" 
            title="Verified Board Results & Achievements"
            subtitle="Genuine academic records and sport accolades achieved by our students in standard assessments."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3.5 }}>
            <StatCard 
              metric="99.4%" 
              label="Highest XII Board Score" 
              description="Achieved by Rahul Pathak in Science stream assessments."
              colorType="primary"
            />
            <StatCard 
              metric="58+" 
              label="Scores Above 95%" 
              description="Class X & XII scholars scoring high marks in standard CBSE boards."
              colorType="secondary"
            />
            <StatCard 
              metric="15+" 
              label="State Sports Medals" 
              description="Laurels won by students in official State Tennis and Athletics meets."
              colorType="primary"
            />
            <StatCard 
              metric="100%" 
              label="First Division Passes" 
              description="Passing percentage maintained consistently over consecutive board cycles."
              colorType="secondary"
            />
          </Box>
        </Container>

        {/* 6. CAMPUS GALLERY */}
        <Container maxWidth="lg" sx={{ mb: 12 }}>
          <SectionHeader 
            preHeader="Facility Courtyards" 
            title="Campus Gallery Placeholders"
            subtitle="Representative views of learning blocks and playground structures on our school campus."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3.5 }}>
            {galleryItems.map((item, idx) => (
              <Card 
                key={idx}
                sx={{ 
                  bgcolor: '#FFFFFF', 
                  border: '1px solid #E5E7EB',
                  p: 4.5,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 220,
                  boxShadow: 'none',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#0F766E'
                  }
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 2, opacity: 0.8 }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ color: '#12355B', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                  {item.title}
                </Typography>
                <Chip 
                  label={`Image Placeholder: ${item.label}`} 
                  size="small" 
                  sx={{ bgcolor: '#FFFCF5', color: '#5B6573', border: '1px solid #E5E7EB', fontSize: 11 }} 
                />
              </Card>
            ))}
          </Box>
        </Container>

        {/* 7. ADMISSIONS PROCESS & DOCUMENTS */}
        <Container maxWidth="lg" sx={{ mb: 12 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'stretch' }}>
            {/* Steps (Left) */}
            <Box sx={{ flex: 1.1 }}>
              <SectionHeader 
                preHeader="Timeline Guide" 
                title="Admissions Step-by-Step"
                align="left"
                sx={{ mb: 4 }}
              />
              
              <Box sx={{ pl: 1 }}>
                {admissionSteps.map((step, idx) => (
                  <AdmissionStep 
                    key={idx}
                    stepNumber={step.step}
                    title={step.title}
                    description={step.desc}
                    isLast={idx === admissionSteps.length - 1}
                  />
                ))}
              </Box>
            </Box>

            {/* Checklist (Right) */}
            <Box sx={{ flex: 0.9, display: 'flex' }}>
              <Card
                sx={{
                  p: 4.5,
                  borderRadius: 3,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  bgcolor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.08)', display: 'flex', color: '#0F766E' }}>
                      <FileText size={24} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, color: '#12355B', fontSize: '1.25rem' }}>
                      Admissions Checklist
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#5B6573', mb: 3.5, lineHeight: 1.5 }}>
                    Please compile clean hard copies of these official certificates for submission to the registrar desk during verification:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      'Birth Certificate (Municipal legal record copy)',
                      'School Leaving or Transfer Certificate (TC)',
                      'Progress sheet of candidate\'s last studied term',
                      'Aadhaar Card copies of candidate and parents',
                      '4 passport-size photographs of the student',
                    ].map((doc, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <CheckCircle size={16} color="#0F766E" style={{ flexShrink: 0, marginTop: 4 }} />
                        <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 500 }}>
                          {doc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <PrimaryButton 
                  component={Link}
                  to="/admissions"
                  sx={{ mt: 5 }}
                >
                  Start Admissions Portal
                </PrimaryButton>
              </Card>
            </Box>
          </Box>
        </Container>

        {/* 8. TESTIMONIALS */}
        <Box sx={{ py: 10, bgcolor: '#FFFFFF', borderY: '1px solid #E5E7EB', mb: 12 }}>
          <Container maxWidth="lg">
            <SectionHeader 
              preHeader="Community Experience" 
              title="What Parents Say"
              subtitle="Verified testimonials shared by parents of students studying in different classes."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
              {[
                { quote: "The teachers here provide genuine attention. My daughter has become much more confident with calculation exercises, thanks to the Vedic mathematics modules.", author: "Sunita Dwivedi", label: "Parent of Grade X student" },
                { quote: "We appreciate the campus sports coaching structure. The athletic mentors took personal care to help my son prepare for school tournaments.", author: "Akash Verma", label: "Parent of Grade VIII student" },
                { quote: "Our experience with admissions and academic coordination has been clear and positive. The mentoring system keeps parents well informed.", author: "Dr. Rohit Saxena", label: "Parent of Grade XII student" },
              ].map((t, idx) => (
                <Card
                  key={idx}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderColor: '#E5E7EB',
                    boxShadow: 'none'
                  }}
                >
                  <Box>
                    <Quote size={28} color="#E8751A" style={{ marginBottom: 16, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ color: '#1F2937', mb: 3.5, fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{t.quote}"
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderTop: '1px solid #E5E7EB', pt: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(232, 117, 26, 0.08)', color: '#E8751A', fontWeight: 'bold' }}>
                      {t.author.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 700 }}>
                        {t.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5B6573' }}>
                        {t.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        {/* 9. NOTICES AND EVENTS */}
        <Container maxWidth="lg" sx={{ mb: 12 }}>
          <SectionHeader 
            preHeader="Updates" 
            title="School Notices and Campus Events"
            subtitle="Refer to official notices and scheduled events on our academic calendar."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5 }}>
            {/* Left: Events Calendar */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3.5, display: 'flex', alignItems: 'center', gap: 1.5, color: '#12355B' }}>
                <Calendar size={20} color="#0F766E" /> Upcoming School Events
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {events.slice(0, 3).map((ev, idx) => (
                  <Card
                    key={ev._id || idx}
                    sx={{
                      p: 3,
                      display: 'flex',
                      gap: 2.5,
                      alignItems: 'center',
                      boxShadow: 'none'
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(15, 118, 110, 0.06)',
                        textAlign: 'center',
                        minWidth: 70,
                      }}
                    >
                      <Calendar size={18} color="#0F766E" style={{ marginBottom: 4, marginLeft: 'auto', marginRight: 'auto' }} />
                      <Typography variant="subtitle2" sx={{ color: '#0F766E', fontWeight: 800, lineHeight: 1 }}>
                        {ev.date}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip label={ev.type} size="small" sx={{ bgcolor: '#FFFCF5', color: '#5B6573', border: '1px solid #E5E7EB', mb: 1, fontWeight: 700 }} />
                      <Typography variant="subtitle1" sx={{ color: '#12355B', fontWeight: 700, mb: 0.5, fontSize: '1rem' }}>
                        {ev.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5B6573', fontSize: 13 }}>
                        {ev.desc}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Right: Notices & Announcements */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3.5, display: 'flex', alignItems: 'center', gap: 1.5, color: '#12355B' }}>
                <Bell size={20} color="#E8751A" /> Official Announcements
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {notices.slice(0, 3).map((n, idx) => (
                  <Card
                    key={n._id || idx}
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      boxShadow: 'none'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={n.category} 
                        size="small" 
                        sx={{ 
                          bgcolor: n.category === 'Holiday' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(232, 117, 26, 0.08)', 
                          color: n.category === 'Holiday' ? '#991B1B' : '#E8751A',
                          fontWeight: 700,
                          border: '1px solid rgba(0,0,0,0.05)'
                        }} 
                      />
                      <Typography variant="caption" sx={{ color: '#5B6573', fontWeight: 600 }}>
                        {new Date(n.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#12355B', fontWeight: 700, mb: 0.5, fontSize: '1rem' }}>
                        {n.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5B6573', fontSize: 13, lineHeight: 1.5 }}>
                        {n.content}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>

        {/* 10. FAQ SECTION */}
        <Container maxWidth="md" sx={{ mb: 12 }}>
          <SectionHeader 
            preHeader="Parent Inquiries" 
            title="Frequently Asked Questions"
            subtitle="Refer to these responses regarding standard admissions, transport, and classroom activities."
          />

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {faqs.map((faq, idx) => (
              <FAQItem 
                key={idx}
                question={faq.q}
                answer={faq.a}
              />
            ))}
          </Box>
        </Container>

        {/* 11. MAP, CONTACT DETAILS, AND PHYSICAL LOCATION */}
        <Box sx={{ py: 8, bgcolor: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6 }}>
              
              {/* Left Side: Contact details */}
              <Box sx={{ flex: 1 }}>
                <SectionHeader 
                  preHeader="Location Coordinates" 
                  title="Contact the Registrar Office"
                  align="left"
                  sx={{ mb: 4 }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E' }}>
                      <MapPin size={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#12355B' }}>
                        Campus Address
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5, lineHeight: 1.5 }}>
                        KCP Public School, Sector 4, Vikas Nagar, Lucknow, Uttar Pradesh - 226022
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E' }}>
                      <PhoneCall size={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#12355B' }}>
                        Admissions Desk
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5 }}>
                        +91 522 246 8100 (Helpline) • admissions@kcppschool.edu.in
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E' }}>
                      <Clock size={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#12355B' }}>
                        Office Timings
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5 }}>
                        Monday to Saturday: 8:00 AM to 3:00 PM
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Contact Maintenance warning replacing fake success message form */}
                <Card sx={{ mt: 5, p: 4, bgcolor: '#FFFCF5', borderColor: '#E5E7EB', boxShadow: 'none' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#12355B', fontFamily: '"Inter", sans-serif' }}>
                    Send an Inquiry Message
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, p: 2.5, bgcolor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 2 }}>
                    <AlertTriangle size={24} color="#D97706" style={{ flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#92400E', lineHeight: 1.5 }}>
                      <strong>Form Maintenance Note:</strong> Online message submissions are currently undergoing administrative system maintenance. Please dial our desk directly at <strong>+91 522 246 8100</strong> or write to <strong>admissions@kcppschool.edu.in</strong> to register your query.
                    </Typography>
                  </Box>
                </Card>
              </Box>

              {/* Right Side: Map location */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#12355B', display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Inter", sans-serif' }}>
                  <MapPin size={20} color="#E8751A" /> Route Location
                </Typography>
                
                {/* Clean daytime Google Maps frame - no dark-mode invert filters */}
                <Box
                  component="iframe"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14234.675662768595!2d80.95759902636737!3d26.882236894086663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3999f417b700f135%3A0xe54ef4827be9d9f5!2sVikas%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  sx={{
                    width: '100%',
                    height: 400,
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* 12. BOOK A VISIT DIALOG MODAL */}
      <Dialog
        open={visitDialogOpen}
        onClose={() => setVisitDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            p: 2,
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: '#12355B', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Book a Campus Tour</span>
          <IconButton onClick={() => setVisitDialogOpen(false)} aria-label="Close dialog" sx={{ color: '#5B6573' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={handleBookVisitSubmit}>
          <DialogContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#5B6573', mb: 1 }}>
              Schedule a personalized tour of our classrooms, laboratories, and sports playfields with an admissions coordinator.
            </Typography>

            {visitSuccess ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: 'rgba(15, 118, 110, 0.08)', mb: 2, color: '#0F766E' }}>
                  <CheckCircle size={36} />
                </Box>
                <Typography variant="h6" sx={{ color: '#12355B', mb: 1, fontWeight: 'bold' }}>
                  Tour Scheduled!
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6573', display: 'block', lineHeight: 1.5 }}>
                  We have registered your details. A coordinator will call you to confirm timings and gate entry passes.
                </Typography>
              </Box>
            ) : (
              <>
                {visitError && (
                  <Box sx={{ p: 2, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 600 }}>
                      {visitError}
                    </Typography>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Parent / Guardian Name"
                  required
                  value={visitName}
                  onChange={(e) => setVisitName(e.target.value)}
                  sx={{
                    input: { color: '#1F2937' },
                    '& .MuiInputLabel-root': { color: '#5B6573' }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Contact Phone (10-Digit)"
                  required
                  value={visitPhone}
                  onChange={(e) => setVisitPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  sx={{
                    input: { color: '#1F2937' },
                    '& .MuiInputLabel-root': { color: '#5B6573' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Email ID (Optional)"
                  type="email"
                  value={visitEmail}
                  onChange={(e) => setVisitEmail(e.target.value)}
                  sx={{
                    input: { color: '#1F2937' },
                    '& .MuiInputLabel-root': { color: '#5B6573' }
                  }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    select
                    label="Grade Seeking"
                    value={visitGrade}
                    onChange={(e) => setVisitGrade(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': { color: '#1F2937' },
                      '& .MuiInputLabel-root': { color: '#5B6573' }
                    }}
                  >
                    {['Grade I', 'Grade VI', 'Grade IX', 'Grade XI'].map(g => (
                      <MenuItem key={g} value={g} sx={{ color: '#1F2937' }}>{g}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Preferred Date"
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      input: { color: '#1F2937' },
                      '& .MuiInputLabel-root': { color: '#5B6573' }
                    }}
                  />
                </Box>
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            {visitSuccess ? (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setVisitSuccess(false);
                  setVisitDialogOpen(false);
                }}
                sx={{
                  color: '#5B6573',
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              >
                Close Dialog
              </Button>
            ) : (
              <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setVisitDialogOpen(false)}
                  sx={{
                    color: '#5B6573',
                    borderColor: '#D1D5DB',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={visitLoading}
                  sx={{
                    bgcolor: '#E8751A',
                    color: '#FFFFFF',
                    '&:hover': {
                      bgcolor: '#C95E10',
                    },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  {visitLoading ? 'Scheduling...' : 'Schedule Visit'}
                </Button>
              </Box>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HomePage;
