import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import FacilitiesPage from './pages/FacilitiesPage';
import AdmissionPage from './pages/AdmissionPage';
import ContactPage from './pages/ContactPage';
import './App.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'academics':
        return <AcademicsPage />;
      case 'facilities':
        return <FacilitiesPage />;
      case 'admissions':
        return <AdmissionPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#090D16', color: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Background Accent overlay */}
      <div className="hero-bg-overlay" />

      {/* Top Admissions Banner strip */}
      <Box 
        sx={{ 
          width: '100%', 
          bgcolor: 'rgba(14, 165, 233, 0.12)', 
          borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
          py: 1, 
          textAlign: 'center', 
          color: '#38BDF8', 
          fontSize: 13, 
          fontWeight: 'bold', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          zIndex: 1001
        }}
      >
        <span>🎓 Admissions Open for Term 2026-27! Grades I to XII Seeking Admission</span>
        <Button 
          onClick={() => setCurrentPage('admissions')} 
          size="small" 
          variant="contained" 
          className="primary-gradient-btn"
          sx={{ 
            fontWeight: 'bold', 
            textTransform: 'none', 
            px: 2.5, 
            py: 0.4, 
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)'
          }}
        >
          Apply Now
        </Button>
      </Box>

      {/* Navigation Header */}
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Page Area */}
      <Box component="main" sx={{ flexGrow: 1, pt: 4 }}>
        {renderPage()}
      </Box>

      {/* Footer */}
      <Footer onPageChange={setCurrentPage} />
    </Box>
  );
};

export default App;
