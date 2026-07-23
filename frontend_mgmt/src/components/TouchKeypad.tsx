import React from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { Delete, Check, RotateCcw } from 'lucide-react';
import { playAudioFeedback } from '../services/faceApiService';

interface TouchKeypadProps {
  pin: string;
  onChange: (newPin: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  loading?: boolean;
}

const TouchKeypad: React.FC<TouchKeypadProps> = ({
  pin,
  onChange,
  onSubmit,
  maxLength = 6,
  loading = false,
}) => {
  const handleKeyClick = (num: string) => {
    if (pin.length < maxLength) {
      playAudioFeedback('click');
      onChange(pin + num);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      playAudioFeedback('click');
      onChange(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    playAudioFeedback('click');
    onChange('');
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', p: 1 }}>
      {/* PIN Progress Dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 3 }}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: index < pin.length ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
              border: index < pin.length ? '2px solid #818CF8' : '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: index < pin.length ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </Box>

      {/* Numeric Keypad Grid */}
      <Grid container spacing={1.5}>
        {keys.map((num) => (
          <Grid item xs={4} key={num}>
            <Button
              fullWidth
              disabled={loading}
              onClick={() => handleKeyClick(num)}
              sx={{
                height: 64,
                borderRadius: 3,
                fontSize: 24,
                fontWeight: 'bold',
                color: '#F8FAFC',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.2)',
                  borderColor: '#6366F1',
                  transform: 'scale(1.03)',
                },
                '&:active': {
                  transform: 'scale(0.96)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              {num}
            </Button>
          </Grid>
        ))}

        {/* Clear Button */}
        <Grid item xs={4}>
          <Button
            fullWidth
            disabled={loading || pin.length === 0}
            onClick={handleClear}
            sx={{
              height: 64,
              borderRadius: 3,
              color: '#F87171',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
            }}
          >
            <RotateCcw size={22} />
          </Button>
        </Grid>

        {/* Zero Key */}
        <Grid item xs={4}>
          <Button
            fullWidth
            disabled={loading}
            onClick={() => handleKeyClick('0')}
            sx={{
              height: 64,
              borderRadius: 3,
              fontSize: 24,
              fontWeight: 'bold',
              color: '#F8FAFC',
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366F1',
                transform: 'scale(1.03)',
              },
            }}
          >
            0
          </Button>
        </Grid>

        {/* Backspace Button */}
        <Grid item xs={4}>
          <Button
            fullWidth
            disabled={loading || pin.length === 0}
            onClick={handleBackspace}
            sx={{
              height: 64,
              borderRadius: 3,
              color: '#FBBF24',
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)' },
            }}
          >
            <Delete size={22} />
          </Button>
        </Grid>

        {/* Submit PIN Button */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            disabled={loading || pin.length < 4}
            onClick={onSubmit}
            startIcon={<Check size={20} />}
            sx={{
              height: 56,
              borderRadius: 3,
              fontSize: 16,
              fontWeight: 'bold',
              textTransform: 'none',
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
              mt: 1,
            }}
          >
            Submit PIN Code
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TouchKeypad;
