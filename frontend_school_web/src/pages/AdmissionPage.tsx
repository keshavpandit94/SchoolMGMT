import React, { useState } from 'react';
import { Box, Container, Typography, Card, TextField, MenuItem, Chip, Alert, Button, CircularProgress } from '@mui/material';
import { CheckCircle, Info } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdmissionPage: React.FC = () => {
  const [admissionStep, setAdmissionStep] = useState<1 | 2>(1);
  const [studentName, setStudentName] = useState('');
  const [targetClass, setTargetClass] = useState('Grade I');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const classes = [
    'Grade I', 'Grade II', 'Grade III', 'Grade IV', 'Grade V',
    'Grade VI', 'Grade VII', 'Grade VIII', 'Grade IX', 'Grade X',
    'Grade XI (Science)', 'Grade XI (Commerce)', 'Grade XII (Science)', 'Grade XII (Commerce)'
  ];

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (admissionStep === 1) {
      if (!studentName || !dateOfBirth || !targetClass || !gender) {
        setFormError('Please fill in all student details');
        return;
      }
      setAdmissionStep(2);
      return;
    }

    if (!guardianName || !guardianPhone || !guardianEmail) {
      setFormError('Please fill in guardian contact details');
      return;
    }

    setFormLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/students/public-admission`, {
        name: studentName,
        class: targetClass,
        dateOfBirth,
        gender,
        address,
        guardianName,
        guardianPhone,
        guardianEmail,
        photoUrl,
      });

      if (res.data.success) {
        setFormSuccess(res.data.message);
        // Reset states
        setStudentName('');
        setDateOfBirth('');
        setGuardianName('');
        setGuardianPhone('');
        setGuardianEmail('');
        setAddress('');
        setPhotoUrl('');
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit admission application.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }} className="animate-fade-in-up">
      {/* HEADER SECTION */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Outfit', mb: 1.5, fontWeight: '900' }}>
          Registration Portal
        </Typography>
        <Typography variant="body1" sx={{ color: '#38BDF8', fontWeight: '800', letterSpacing: 0.5 }}>
          CBSE Online Registration Track • Registrar Office review
        </Typography>
      </Box>

      {/* Info Warning banner */}
      <Box
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: 3,
          bgcolor: 'rgba(14, 165, 233, 0.05)',
          border: '1px solid rgba(14, 165, 233, 0.15)',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Info size={22} color="#38BDF8" style={{ flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: '#E2E8F0', lineHeight: 1.5 }}>
          <strong>Important Instructions:</strong> Please ensure all entered details match the student's legal birth certificate and official school leaving certificates. Double check the contact mobile number to receive tracking SMS.
        </Typography>
      </Box>

      <Card
        className="glass-panel"
        sx={{
          p: { xs: 4, md: 5 },
          bgcolor: 'rgba(15, 23, 42, 0.75)',
          borderRadius: 5,
          border: '1px solid rgba(255, 255, 255, 0.04)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {formSuccess ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.12)', mb: 3 }}>
              <CheckCircle size={52} color="#34D399" />
            </Box>
            <Typography variant="h5" sx={{ color: '#F8FAFC', mb: 2, fontWeight: 'bold' }}>
              Application Successfully Dispatched!
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 520, mx: 'auto', mb: 5, lineHeight: 1.7 }}>
              {formSuccess}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setFormSuccess(null);
                setAdmissionStep(1);
              }}
              sx={{
                color: '#38BDF8',
                borderColor: 'rgba(14, 165, 233, 0.4)',
                textTransform: 'none',
                borderRadius: 3,
                px: 4.5,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#38BDF8',
                  bgcolor: 'rgba(14, 165, 233, 0.05)',
                },
              }}
            >
              Submit Another Application
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleAdmissionSubmit}>
            {/* Step Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 5 }}>
              <Chip
                label="1. Student Details"
                sx={{
                  fontWeight: 'bold',
                  px: 2,
                  py: 2.2,
                  bgcolor: admissionStep === 1 ? '#0EA5E9' : 'rgba(255,255,255,0.03)',
                  color: admissionStep === 1 ? '#FFF' : '#94A3B8',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
              <Chip
                label="2. Guardian Contacts"
                sx={{
                  fontWeight: 'bold',
                  px: 2,
                  py: 2.2,
                  bgcolor: admissionStep === 2 ? '#0EA5E9' : 'rgba(255,255,255,0.03)',
                  color: admissionStep === 2 ? '#FFF' : '#94A3B8',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            </Box>

            {formError && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' }}>
                {formError}
              </Alert>
            )}

            {/* STEP 1: Applicant/Student Details */}
            {admissionStep === 1 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3.5 }}>
                <TextField
                  fullWidth
                  label="Student Full Name"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
                <TextField
                  fullWidth
                  select
                  label="Class seeking admission"
                  required
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {classes.map((c) => (
                    <MenuItem key={c} value={c} sx={{ color: '#F8FAFC' }}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {['Male', 'Female', 'Other'].map((g) => (
                    <MenuItem key={g} value={g} sx={{ color: '#F8FAFC' }}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    label="Candidate Photo URL (Optional)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Box>
              </Box>
            )}

            {/* STEP 2: Parent/Guardian Details */}
            {admissionStep === 2 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3.5 }}>
                <TextField
                  fullWidth
                  label="Parent / Guardian Name"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
                <TextField
                  fullWidth
                  label="Guardian Contact Phone"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                />
                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    label="Guardian Email ID"
                    type="email"
                    required
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    sx={{ input: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Box>
                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Residential Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete residential address..."
                    sx={{ textarea: { color: '#FFF' }, label: { color: '#94A3B8' }, fieldset: { borderColor: 'rgba(255,255,255,0.1)' } }}
                  />
                </Box>
              </Box>
            )}

            {/* Form Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
              {admissionStep === 2 && (
                <Button
                  variant="outlined"
                  onClick={() => setAdmissionStep(1)}
                  sx={{
                    color: '#94A3B8',
                    borderColor: 'rgba(255,255,255,0.08)',
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 3.5,
                    '&:hover': {
                      borderColor: '#F8FAFC',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  Back
                </Button>
              )}
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formLoading}
                  startIcon={formLoading && <CircularProgress size={16} color="inherit" />}
                  className="primary-gradient-btn"
                  sx={{ textTransform: 'none', borderRadius: 3, px: 5, py: 1.6, fontWeight: 'bold', fontSize: 15 }}
                >
                  {formLoading ? 'Submitting...' : admissionStep === 1 ? 'Next: Contact details' : 'Register Applicant'}
                </Button>
              </div>
            </Box>
          </form>
        )}
      </Card>
    </Container>
  );
};

export default AdmissionPage;
