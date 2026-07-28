import React from 'react';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingState } from './components/common/StatusStates';
import './App.css';

// Lazy load page routes to improve initial load performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AcademicsPage = React.lazy(() => import('./pages/AcademicsPage'));
const FacilitiesPage = React.lazy(() => import('./pages/FacilitiesPage'));
const AdmissionPage = React.lazy(() => import('./pages/AdmissionPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* Keyboard accessibility Skip link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Box sx={{ minHeight: '100vh', bgcolor: '#FFFCF5', color: '#1F2937', display: 'flex', flexDirection: 'column' }}>
          
          {/* Main Sticky/Fixed Header (Announcement Bar + Navbar) */}
          <Navbar />

          {/* Main Page Area - Padded to offset the fixed header height */}
          <Box 
            component="main" 
            id="main-content" 
            sx={{ 
              flexGrow: 1, 
              pt: { xs: '106px', sm: '114px' } 
            }}
          >
            <React.Suspense fallback={<LoadingState message="Loading page content..." />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/academics" element={<AcademicsPage />} />
                <Route path="/facilities" element={<FacilitiesPage />} />
                <Route path="/admissions" element={<AdmissionPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {/* Fallback redirect to home */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </React.Suspense>
          </Box>

          {/* Footer */}
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
