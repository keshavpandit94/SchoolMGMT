import React, { useEffect } from 'react';
import { Dialog, Box, Typography, Avatar, Chip, Button } from '@mui/material';
import { CheckCircle2, AlertTriangle, Clock, MapPin, Award } from 'lucide-react';
import { playAudioFeedback } from '../services/faceApiService';

interface KioskStatusModalProps {
  open: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  user?: {
    name: string;
    role: string;
    photoUrl?: string;
  };
  details?: {
    eventType?: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    isLate?: boolean;
    confidenceScore?: number;
  };
  onClose: () => void;
}

const KioskStatusModal: React.FC<KioskStatusModalProps> = ({
  open,
  type,
  title,
  message,
  user,
  details,
  onClose,
}) => {
  useEffect(() => {
    if (open) {
      playAudioFeedback(type);
    }
  }, [open, type]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: type === 'success' ? '#064E3B' : '#7F1D1D',
          color: '#F8FAFC',
          border: type === 'success' ? '2px solid #10B981' : '2px solid #EF4444',
          boxShadow: type === 'success' ? '0 0 50px rgba(16, 185, 129, 0.4)' : '0 0 50px rgba(239, 68, 68, 0.4)',
          borderRadius: 5,
          p: 3,
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
        },
      }}
    >
      <Box sx={{ py: 2 }}>
        <Avatar
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2,
            bgcolor: type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: type === 'success' ? '#34D399' : '#FCA5A5',
          }}
        >
          {type === 'success' ? <CheckCircle2 size={48} /> : <AlertTriangle size={48} />}
        </Avatar>

        <Typography variant="h5" fontWeight="bold" sx={{ color: type === 'success' ? '#6EE7B7' : '#FCA5A5', mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 2 }}>
          {message}
        </Typography>

        {user && (
          <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.25)', borderRadius: 3, mb: 2 }}>
            <Avatar src={user.photoUrl} sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: '#6366F1' }}>
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#FFF' }}>
              {user.name}
            </Typography>
            <Chip label={user.role} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#FFF', fontWeight: 'bold' }} />
          </Box>
        )}

        {details && type === 'success' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {details.eventType && (
              <Chip
                icon={<Clock size={16} color="#FFF" />}
                label={`${details.eventType} at ${details.eventType === 'Check-Out' ? details.checkOutTime : details.checkInTime}`}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: '#FFF', fontWeight: 'bold', fontSize: 14 }}
              />
            )}

            {details.totalHours ? (
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#A7F3D0' }}>
                ⏱️ Total Hours Worked Today: {details.totalHours} hrs
              </Typography>
            ) : null}

            {details.isLate && (
              <Chip label="⚠️ Late Arrival Recorded" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.3)', color: '#FCD34D' }} />
            )}

            {details.confidenceScore && (
              <Typography variant="caption" sx={{ color: '#6EE7B7', display: 'block' }}>
                Biometric Confidence Score: {details.confidenceScore}% Vector Similarity
              </Typography>
            )}
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            mt: 1,
            bgcolor: type === 'success' ? '#10B981' : '#EF4444',
            '&:hover': { bgcolor: type === 'success' ? '#059669' : '#DC2626' },
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          {type === 'success' ? 'Done & Reset Kiosk' : 'Try Again'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default KioskStatusModal;
