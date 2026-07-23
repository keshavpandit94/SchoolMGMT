import React from 'react';
import { Box, Typography } from '@mui/material';
import { Scan, ShieldCheck } from 'lucide-react';

interface FaceScannerOverlayProps {
  scanning: boolean;
  progress: number;
  confidence?: number;
}

const FaceScannerOverlay: React.FC<FaceScannerOverlayProps> = ({
  scanning,
  progress,
  confidence = 95,
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Target Reticle Outer Ring */}
      <Box
        sx={{
          position: 'relative',
          width: 240,
          height: 240,
          borderRadius: '50%',
          border: '3px dashed rgba(99, 102, 241, 0.6)',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
          animation: scanning ? 'spin 8s linear infinite' : 'none',
        }}
      />

      {/* Target Corner Landmarks */}
      <Box
        sx={{
          position: 'absolute',
          width: 260,
          height: 260,
          border: '2px solid transparent',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 30,
            height: 30,
            borderTop: '4px solid #38BDF8',
            borderLeft: '4px solid #38BDF8',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 30,
            height: 30,
            borderTop: '4px solid #38BDF8',
            borderRight: '4px solid #38BDF8',
          },
        }}
      />

      {/* Scanning Laser Beam Line */}
      {scanning && (
        <Box
          sx={{
            position: 'absolute',
            width: 260,
            height: 3,
            bgcolor: '#38BDF8',
            boxShadow: '0 0 15px #38BDF8, 0 0 30px #38BDF8',
            top: `${progress}%`,
            transition: 'top 0.1s linear',
          }}
        />
      )}

      {/* Status Overlay Info */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          px: 2.5,
          py: 1,
          borderRadius: 4,
          border: '1px solid rgba(99, 102, 241, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Scan size={18} color="#38BDF8" className="animate-spin" />
        <Typography variant="caption" fontWeight="bold" sx={{ color: '#F8FAFC' }}>
          Biometric Facial Analysis: {progress}% (Vector Confidence: {confidence}%)
        </Typography>
      </Box>
    </Box>
  );
};

export default FaceScannerOverlay;
