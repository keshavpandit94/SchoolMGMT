import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LinearProgress, Box } from '@mui/material';

const ScrollToTopAndProgress: React.FC = () => {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show top page transition loading indicator
    setLoading(true);

    // Scroll window to top immediately on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
      }}
    >
      <LinearProgress
        sx={{
          height: 4,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
          },
        }}
      />
    </Box>
  );
};

export default ScrollToTopAndProgress;
