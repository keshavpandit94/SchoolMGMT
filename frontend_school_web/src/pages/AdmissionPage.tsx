import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  TextField, 
  MenuItem, 
  Chip, 
  Alert, 
  Button, 
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { 
  CheckCircle, 
  Info, 
  Upload, 
  Calendar, 
  Check, 
  PhoneCall, 
  Mail,
  FileText,
  X
} from 'lucide-react';
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
  
  // Local File Upload states
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Consent & Privacy policy states
  const [consentChecked, setConsentChecked] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Local Book Tour dialog state
  const [tourOpen, setTourOpen] = useState(false);
  const [tourName, setTourName] = useState('');
  const [tourPhone, setTourPhone] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [tourSuccess, setTourSuccess] = useState(false);
  const [tourError, setTourError] = useState('');
  const [tourLoading, setTourLoading] = useState(false);

  const classes = [
    'Grade I', 'Grade II', 'Grade III', 'Grade IV', 'Grade V',
    'Grade VI', 'Grade VII', 'Grade VIII', 'Grade IX', 'Grade X',
    'Grade XI (Science)', 'Grade XI (Commerce)', 'Grade XII (Science)', 'Grade XII (Commerce)'
  ];

  // Custom Event Listener to open tour dialog from top utility bar
  useEffect(() => {
    const handleOpenTour = () => setTourOpen(true);
    window.addEventListener('open-book-visit', handleOpenTour);
    return () => window.removeEventListener('open-book-visit', handleOpenTour);
  }, []);

  // Client-side file upload and validation (Max 2MB, PDF/Images only)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadedFileName('');
    setUploadedBase64('');

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size exceeds the 2MB limit. Please upload a smaller file.');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Allowed file formats are PDF, JPG, JPEG, and PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedBase64(reader.result);
        setUploadedFileName(file.name);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read and process the selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (admissionStep === 1) {
      if (!studentName || !dateOfBirth || !targetClass || !gender) {
        setFormError('Please fill in all candidate details.');
        return;
      }
      setAdmissionStep(2);
      return;
    }

    // Form Step 2 Validations
    if (!guardianName || !guardianPhone || !guardianEmail) {
      setFormError('Please fill in guardian contact details.');
      return;
    }

    // Indian Mobile Format Validation (10 digits starting with 6-9)
    const cleanPhone = guardianPhone.replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!consentChecked) {
      setFormError('Please review and check the declaration consent checkbox.');
      return;
    }

    setFormLoading(true);

    try {
      const res = await axiosInstance.post('/api/students/public-admission', {
        name: studentName,
        class: targetClass,
        dateOfBirth,
        gender,
        address,
        guardianName,
        guardianPhone: cleanPhone,
        guardianEmail,
        photoUrl: uploadedBase64, // Send Base64 data string as photoUrl
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
        setUploadedFileName('');
        setUploadedBase64('');
        setConsentChecked(false);
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit admission application. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourError('');
    setTourSuccess(false);

    if (!tourName || !tourPhone || !tourDate) {
      setTourError('Please fill in all tour fields.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(tourPhone.replace(/[\s-]/g, ''))) {
      setTourError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    setTourLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTourSuccess(true);
      setTourName('');
      setTourPhone('');
      setTourDate('');
    } catch (err) {
      setTourError('Failed to schedule visit. Please try again.');
    } finally {
      setTourLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#FFFCF5', minHeight: '100vh', py: 6 }}>
      {/* SEO Metadata */}
      <SEO 
        title="Apply for Admission | Online Registration Portal"
        description="Submit your child's admission application securely online. Review eligibility requirements, upload candidate certificates, and track enrollment steps."
      />

      <Container maxWidth="lg" className="animate-fade-in-up">
        {/* HEADER SECTION */}
        <SectionHeader 
          preHeader="Online Admissions" 
          title="Student Registration Portal"
          subtitle="Submit applications for classes Grade I through XII. Please enter details matching municipal birth records."
        />

        {/* TWO-COLUMN LAYOUT */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' }, gap: 6, alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Admission info, checklist, contact & visit */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* 1. Benefits & Eligibility */}
            <Card sx={{ p: 4, bgcolor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ color: '#12355B', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Inter", sans-serif' }}>
                <Info size={20} color="#0F766E" /> Admission Eligibility & Benefits
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
                  • <strong>Grade I:</strong> Candidate must complete 6 years of age on or before March 31st of the academic term.
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
                  • <strong>Grades II - X:</strong> Successful completion of the previous grade assessments along with a valid Transfer Certificate.
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
                  • <strong>Integrated Science Track:</strong> Comprehensive preparation modules for board results and national competitive exams.
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800, mb: 1.5, fontFamily: '"Inter", sans-serif' }}>
                Admission Timeline
              </Typography>
              <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
                Enquire & Campus Visit → Online Registration Form → Student Interaction Day → Fee Settlement & Onboarding.
              </Typography>
            </Card>

            {/* 2. Checklist & Documents */}
            <Card sx={{ p: 4, bgcolor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ color: '#12355B', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Inter", sans-serif' }}>
                <FileText size={20} color="#0F766E" /> Required Checklist Documents
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  'Candidate Birth Certificate copy',
                  'Transfer Certificate (TC) from previous school',
                  'Aadhaar Card copies of candidate & parent',
                  'Last grade card sheet or equivalent report',
                  '4 passport-size photographs of the student'
                ].map((doc, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                    <CheckCircle size={16} color="#0F766E" style={{ flexShrink: 0, marginTop: 3 }} />
                    <Typography variant="body2" sx={{ color: '#1F2937' }}>
                      {doc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* 3. Help Contact & Visit button */}
            <Card sx={{ p: 4, bgcolor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ color: '#12355B', fontWeight: 800, mb: 1, fontFamily: '"Inter", sans-serif' }}>
                Need help?
              </Typography>
              <Typography variant="body2" sx={{ color: '#5B6573', mb: 3 }}>
                Our registration coordinators are available for manual assistance.
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1F2937' }}>
                  <PhoneCall size={16} color="#0F766E" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>+91 522 246 8100</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1F2937' }}>
                  <Mail size={16} color="#0F766E" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>admissions@kcppschool.edu.in</Typography>
                </Box>
              </Box>

              <Button
                onClick={() => setTourOpen(true)}
                variant="outlined"
                fullWidth
                sx={{
                  color: '#E8751A',
                  borderColor: '#E8751A',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#C95E10',
                    bgcolor: 'rgba(232, 117, 26, 0.04)',
                  }
                }}
              >
                Book a Campus Visit
              </Button>
            </Card>
          </Box>

          {/* RIGHT COLUMN: Clean White Form Card with Stepper */}
          <Box>
            <Card
              sx={{
                p: { xs: 4, md: 5 },
                bgcolor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
              }}
            >
              {formSuccess ? (
                /* Confirmation Screen State (Success) */
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'rgba(15, 118, 110, 0.08)', mb: 3, color: '#0F766E' }}>
                    <CheckCircle size={48} />
                  </Box>
                  <Typography variant="h5" sx={{ color: '#12355B', mb: 2.5, fontWeight: 'bold' }}>
                    Registration Submitted Successfully
                  </Typography>
                  
                  <Alert severity="success" sx={{ mb: 4, borderRadius: 2, textAlign: 'left', bgcolor: 'rgba(15, 118, 110, 0.04)', color: '#0F766E', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
                    {formSuccess}
                  </Alert>

                  <Box sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFCF5', textAlign: 'left', mb: 5 }}>
                    <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Inter", sans-serif' }}>
                      <Calendar size={16} color="#E8751A" /> What Happens Next?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
                      1. <strong>Verification:</strong> Our administrative registrar office will verify your submitted documents and candidate details.<br />
                      2. <strong>Interaction Call:</strong> An admissions coordinator will call your registered guardian phone number within 3 working days.<br />
                      3. <strong>Enrollment:</strong> Complete the document review, pay standard onboarding fees, and collect uniform credentials.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFormSuccess(null);
                      setAdmissionStep(1);
                    }}
                    sx={{
                      color: '#E8751A',
                      borderColor: '#E8751A',
                      textTransform: 'none',
                      borderRadius: '8px',
                      px: 4.5,
                      py: 1.5,
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: '#C95E10',
                        bgcolor: 'rgba(232, 117, 26, 0.04)',
                      },
                    }}
                  >
                    Submit Another Application
                  </Button>
                </Box>
              ) : (
                <form onSubmit={handleAdmissionSubmit}>
                  {/* Three-Step Stepper Component */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4.5, flexWrap: 'wrap' }}>
                    <Chip
                      label="1. Student Details"
                      sx={{
                        fontWeight: 700,
                        px: 1,
                        py: 2,
                        bgcolor: admissionStep === 1 ? '#E8751A' : '#F3F4F6',
                        color: admissionStep === 1 ? '#FFFFFF' : '#5B6573',
                        border: admissionStep === 1 ? 'none' : '1px solid #E5E7EB',
                      }}
                    />
                    <Chip
                      label="2. Parent Details"
                      sx={{
                        fontWeight: 700,
                        px: 1,
                        py: 2,
                        bgcolor: admissionStep === 2 ? '#E8751A' : '#F3F4F6',
                        color: admissionStep === 2 ? '#FFFFFF' : '#5B6573',
                        border: admissionStep === 2 ? 'none' : '1px solid #E5E7EB',
                      }}
                    />
                    <Chip
                      label="3. Confirmation"
                      disabled
                      sx={{
                        fontWeight: 700,
                        px: 1,
                        py: 2,
                        bgcolor: '#F3F4F6',
                        color: '#5B6573',
                        border: '1px solid #E5E7EB',
                      }}
                    />
                  </Box>

                  {formError && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                      {formError}
                    </Alert>
                  )}

                  {/* STEP 1: Applicant Details */}
                  {admissionStep === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <TextField
                        fullWidth
                        label="Candidate Full Name"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        select
                        label="Class Seeking Admission"
                        required
                        value={targetClass}
                        onChange={(e) => setTargetClass(e.target.value)}
                        sx={textFieldStyle}
                      >
                        {classes.map((c) => (
                          <MenuItem key={c} value={c} sx={{ color: '#1F2937' }}>
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
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        select
                        label="Gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        sx={textFieldStyle}
                      >
                        {['Male', 'Female', 'Other'].map((g) => (
                          <MenuItem key={g} value={g} sx={{ color: '#1F2937' }}>
                            {g}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* File Uploader */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#12355B', fontWeight: 800, mb: 1, fontFamily: '"Inter", sans-serif' }}>
                          Birth Certificate or Marksheet Upload (Required)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', mb: 2 }}>
                          Maximum file size: 2MB. Supported formats: PDF, JPG, JPEG, PNG.
                        </Typography>
                        
                        <Box
                          sx={{
                            border: '2px dashed #D1D5DB',
                            borderRadius: '8px',
                            p: 3,
                            textAlign: 'center',
                            bgcolor: '#FFFCF5',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#E8751A',
                              bgcolor: '#FFFFFF',
                            }
                          }}
                          component="label"
                        >
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <Upload size={24} color="#0F766E" style={{ marginBottom: 8, marginLeft: 'auto', marginRight: 'auto' }} />
                          <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                            {uploadedFileName ? 'Change Selected File' : 'Click to Browse File'}
                          </Typography>
                          {uploadedFileName && (
                            <Chip 
                              icon={<Check size={14} color="#0F766E" />}
                              label={uploadedFileName} 
                              size="small" 
                              sx={{ mt: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#0F766E', fontWeight: 'bold' }} 
                            />
                          )}
                        </Box>

                        {uploadError && (
                          <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 600, display: 'block', mt: 1 }}>
                            {uploadError}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* STEP 2: Parent/Guardian Details */}
                  {admissionStep === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <TextField
                        fullWidth
                        label="Parent / Guardian Name"
                        required
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        label="Guardian Contact Phone (10-Digit)"
                        required
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        label="Guardian Email Address"
                        type="email"
                        required
                        value={guardianEmail}
                        onChange={(e) => setGuardianEmail(e.target.value)}
                        placeholder="guardian@email.com"
                        sx={textFieldStyle}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Residential Home Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter complete residential address..."
                        sx={textFieldStyle}
                      />

                      {/* Declaration & Privacy Consent checkboxes */}
                      <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={consentChecked} 
                              onChange={(e) => setConsentChecked(e.target.checked)} 
                              sx={{
                                color: '#D1D5DB',
                                '&.Mui-checked': {
                                  color: '#E8751A',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ color: '#1F2937' }}>
                              I hereby declare that all details provided are correct and match the official birth certificate.
                            </Typography>
                          }
                        />
                        
                        <Typography variant="caption" sx={{ color: '#5B6573', display: 'block', mt: 1, pl: 4 }}>
                          Please read our{' '}
                          <span 
                            onClick={() => setPrivacyOpen(true)}
                            style={{ color: '#0F766E', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Privacy Policy
                          </span>{' '}
                          regarding how we handle admissions records.
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Form Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                    {admissionStep === 2 && (
                      <Button
                        variant="outlined"
                        onClick={() => setAdmissionStep(1)}
                        sx={{
                          color: '#5B6573',
                          borderColor: '#D1D5DB',
                          textTransform: 'none',
                          borderRadius: '8px',
                          px: 3.5,
                          '&:hover': {
                            borderColor: '#1F2937',
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
                        sx={{ 
                          bgcolor: '#E8751A',
                          color: '#FFFFFF',
                          '&:hover': {
                            bgcolor: '#C95E10',
                          },
                          textTransform: 'none', 
                          borderRadius: '8px', 
                          px: 5, 
                          py: 1.5, 
                          fontWeight: 'bold', 
                          fontSize: 15 
                        }}
                      >
                        {formLoading ? 'Submitting...' : admissionStep === 1 ? 'Next Step' : 'Submit Registration'}
                      </Button>
                    </div>
                  </Box>
                </form>
              )}
            </Card>
          </Box>
        </Box>
      </Container>

      {/* PRIVACY POLICY BRIEF DIALOG */}
      <Dialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 2,
            bgcolor: '#FFFFFF',
            border: '1px solid #E5E7EB',
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: '#12355B' }}>
          Admissions Privacy Policy
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#5B6573', lineHeight: 1.6 }}>
            KCP Public School respects student and guardian privacy. All information submitted via this registration portal, including candidate names, guardian contacts, addresses, and uploaded certificates, is collected solely for verification and enrolment workflows. The records are stored securely and are never shared with external agencies.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPrivacyOpen(false)}
            sx={{ color: '#E8751A', fontWeight: 'bold' }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* LOCAL BOOK VISIT DIALOG */}
      <Dialog
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 2,
            bgcolor: '#FFFFFF',
            border: '1px solid #E5E7EB',
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: '#12355B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Book a Campus Tour</span>
          <IconButton onClick={() => setTourOpen(false)} aria-label="Close dialog" sx={{ color: '#5B6573' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleTourSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#5B6573', mb: 1 }}>
              Schedule a personalized tour of our classrooms, laboratories, and sports playfields with an admissions coordinator.
            </Typography>

            {tourSuccess ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
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
                {tourError && (
                  <Box sx={{ p: 2, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 600 }}>
                      {tourError}
                    </Typography>
                  </Box>
                )}
                <TextField
                  fullWidth
                  label="Parent / Guardian Name"
                  required
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  sx={textFieldStyle}
                />
                <TextField
                  fullWidth
                  label="Contact Phone (10-Digit)"
                  required
                  value={tourPhone}
                  onChange={(e) => setTourPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  sx={textFieldStyle}
                />
                <TextField
                  fullWidth
                  label="Preferred Date"
                  type="date"
                  required
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={textFieldStyle}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            {tourSuccess ? (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setTourSuccess(false);
                  setTourOpen(false);
                }}
                sx={{ borderRadius: '8px', color: '#5B6573', textTransform: 'none' }}
              >
                Close Dialog
              </Button>
            ) : (
              <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setTourOpen(false)}
                  sx={{ borderRadius: '8px', color: '#5B6573', textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={tourLoading}
                  sx={{
                    bgcolor: '#E8751A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#C95E10' }
                  }}
                >
                  {tourLoading ? 'Scheduling...' : 'Schedule Visit'}
                </Button>
              </Box>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdmissionPage;
