import React, { useState } from 'react';
import { Box, Container, Typography, Card, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import SEO from '../components/common/SEO';
import SectionHeader from '../components/common/SectionHeader';

const textFieldStyle = {
  input: { color: '#1F2937' },
  textarea: { color: '#1F2937' },
  label: { color: '#5B6573' },
  '& .MuiInputLabel-root': { color: '#5B6573' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#D1D5DB' },
    '&:hover fieldset': { borderColor: '#0F766E' },
    '&.Mui-focused fieldset': { borderColor: '#E8751A' }
  }
};

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name || !email || !message) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/api/contact', {
        name,
        email,
        message
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#FFFCF5', minHeight: '100vh', py: 6 }}>
      {/* SEO Tags */}
      <SEO 
        title="Contact Registrar Office | Campus Address & Directions"
        description="Find campus directions, contact details, phone hotlines, WhatsApp shortcuts, and office timings for the KCP Public School Lucknow admissions desk."
      />

      <Container maxWidth="lg" className="animate-fade-in-up">
        {/* HEADER SECTION */}
        <SectionHeader 
          preHeader="Campus Coordinates" 
          title="Contact Registrar & Administration"
          subtitle="Our administrative desk is open Monday to Saturday for admissions inquiries and campus tours."
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 6, mt: 4 }}>
          
          {/* Contact Details (Left) */}
          <Box>
            <Typography variant="h5" sx={{ color: '#12355B', mb: 2.5, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
              Registrar Contact Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#5B6573', mb: 4.5, lineHeight: 1.7 }}>
              Please use our official channels below to check seat availability or schedule parent-teacher meetings.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E', display: 'flex' }}>
                  <MapPin size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800 }}>
                    Campus Location
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5, lineHeight: 1.5 }}>
                    KCP Public School, Sector 4, Vikas Nagar, Lucknow, Uttar Pradesh, India - 226022
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E', display: 'flex' }}>
                  <Phone size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800 }}>
                    Phone Helpdesk
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5 }}>
                    +91 522 246 8100 • +91 98765 43210
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E', display: 'flex' }}>
                  <Mail size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800 }}>
                    Admissions Email
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5 }}>
                    admissions@kcppschool.edu.in • registrar@kcppschool.edu.in
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.06)', color: '#0F766E', display: 'flex' }}>
                  <Clock size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800 }}>
                    Office Work Hours
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5B6573', mt: 0.5 }}>
                    Monday to Saturday: 8:00 AM to 3:00 PM
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* WhatsApp Quick Shortcut */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800, mb: 1 }}>
                Instant Support via WhatsApp
              </Typography>
              <Button
                component="a"
                href="https://wa.me/915222468100?text=I%20am%20enquiring%20about%20admissions"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<MessageCircle size={18} />}
                sx={{
                  bgcolor: '#0F766E',
                  color: '#FFFFFF',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#0D645D',
                    boxShadow: 'none',
                  }
                }}
              >
                Chat on WhatsApp
              </Button>
            </Box>
          </Box>

          {/* Direct Query Card (Right) */}
          <Box>
            <Card
              sx={{
                p: { xs: 4, md: 5 },
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                borderColor: '#E5E7EB',
                boxShadow: 'none'
              }}
            >
              <Typography variant="h6" sx={{ color: '#12355B', mb: 3.5, fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}>
                Send an Enquiry Message
              </Typography>

              {successMsg && (
                <Alert severity="success" sx={{ mb: 3.5, borderRadius: 2, bgcolor: 'rgba(15, 118, 110, 0.05)', color: '#0F766E', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
                  {successMsg}
                </Alert>
              )}

              {errorMsg && (
                <Alert severity="error" sx={{ mb: 3.5, borderRadius: 2, bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                  {errorMsg}
                </Alert>
              )}

              <form onSubmit={handleContactSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={textFieldStyle}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={textFieldStyle}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Describe your query / details..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={textFieldStyle}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
                  sx={{
                    bgcolor: '#E8751A',
                    color: '#FFFFFF',
                    '&:hover': {
                      bgcolor: '#C95E10',
                    },
                    textTransform: 'none',
                    mt: 4,
                    borderRadius: 2,
                    px: 5,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: 15
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default ContactPage;
