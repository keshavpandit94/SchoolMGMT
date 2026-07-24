import React, { useState } from 'react';
import { Box, Container, Typography, Card, TextField, Button, Alert } from '@mui/material';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }} className="animate-fade-in-up">
      {/* HEADER SECTION */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Outfit', mb: 1.5, fontWeight: '900' }}>
          Contact Registrar Office
        </Typography>
        <Typography variant="body1" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 0.5 }}>
          Contact campus administrations for physical visits and admissions guides.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, gap: 6 }}>
        {/* Contact Info Cards */}
        <Box>
          <Typography variant="h5" sx={{ fontFamily: 'Outfit', mb: 3, fontWeight: 'bold' }}>
            Campus Coordinates
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 5, lineHeight: 1.7 }}>
            Our admin desks are open Monday to Saturday from 08:30 AM to 03:30 PM. Drop by or dial school helpline channels below.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
              <Box sx={{ p: 1.8, borderRadius: 3, bgcolor: 'rgba(14, 165, 233, 0.08)', color: '#38BDF8', display: 'flex' }}>
                <MapPin size={22} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 'bold' }}>
                  Our Location Campus
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Sector 2, Gomti Nagar, Lucknow, Uttar Pradesh, India 226010
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
              <Box sx={{ p: 1.8, borderRadius: 3, bgcolor: 'rgba(14, 165, 233, 0.08)', color: '#38BDF8', display: 'flex' }}>
                <Phone size={22} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 'bold' }}>
                  Phone Helpdesk Helpline
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  +91 (522) 2689-7389 • +91 98991 23456
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
              <Box sx={{ p: 1.8, borderRadius: 3, bgcolor: 'rgba(14, 165, 233, 0.08)', color: '#38BDF8', display: 'flex' }}>
                <Mail size={22} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 'bold' }}>
                  Email Desk Address
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  admissions@kcpps.edu.in
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Direct Query Card */}
        <Box>
          <Card
            className="glass-panel"
            sx={{
              p: { xs: 4, md: 5 },
              background: 'rgba(15, 23, 42, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: '#F8FAFC', mb: 3.5, fontWeight: 'bold' }}>
              Dispatch an Enquiry Message
            </Typography>

            {contactSuccess && (
              <Alert severity="success" sx={{ mb: 3.5, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7' }}>
                Thank you! Your query has been successfully dispatched to our registrar office.
              </Alert>
            )}

            <form onSubmit={handleContactSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="Your Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Describe your query / details..."
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    sx={{ textarea: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Send size={16} />}
                className="primary-gradient-btn"
                sx={{ textTransform: 'none', mt: 4, borderRadius: 3, px: 5, py: 1.5, fontWeight: 'bold', fontSize: 15 }}
              >
                Send Message
              </Button>
            </form>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ContactPage;
