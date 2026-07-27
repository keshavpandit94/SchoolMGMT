import React from 'react';
import { Box, Button, Grid } from '@mui/material';
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
  maxLength = 4,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 3.5 }}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: index < pin.length ? '#6366F1' : 'rgba(255, 255, 255, 0.08)',
              border: index < pin.length ? '2px solid #818CF8' : '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: index < pin.length ? '0 0 16px rgba(99, 102, 241, 0.8)' : 'none',
              transform: index < pin.length ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
                borderRadius: 3.5,
                fontSize: 24,
                fontWeight: 700,
                color: '#F8FAFC',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.25)',
                  borderColor: '#818CF8',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.2s ease',
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
              borderRadius: 3.5,
              color: '#F87171',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.25)',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
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
              borderRadius: 3.5,
              fontSize: 24,
              fontWeight: 700,
              color: '#F8FAFC',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.25)',
                borderColor: '#818CF8',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              transition: 'all 0.2s ease',
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
              borderRadius: 3.5,
              color: '#FBBF24',
              bgcolor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor: 'rgba(245, 158, 11, 0.25)',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
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
              borderRadius: 3.5,
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#6366F1',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                boxShadow: '0 6px 25px rgba(99, 102, 241, 0.6)',
                transform: 'translateY(-1px)',
              },
              mt: 1,
              transition: 'all 0.2s ease',
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
