import React, { useState } from 'react';
import { Box } from '@mui/material';
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
