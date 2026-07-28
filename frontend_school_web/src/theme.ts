import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E8751A',      // Primary Admissions CTA
      dark: '#C95E10',      // Hover color
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F766E',      // Supporting Teal
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFCF5',   // Warm day background
      paper: '#FFFFFF',     // Surface color
    },
    text: {
      primary: '#1F2937',   // Dark grey body text
      secondary: '#5B6573', // Muted text
    },
    divider: '#E5E7EB',     // Border color
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Outfit", "Georgia", serif',
      fontWeight: 800,
      color: '#12355B',     // Navy heading
    },
    h2: {
      fontFamily: '"Playfair Display", "Outfit", "Georgia", serif',
      fontWeight: 800,
      color: '#12355B',
    },
    h3: {
      fontFamily: '"Playfair Display", "Outfit", "Georgia", serif',
      fontWeight: 700,
      color: '#12355B',
    },
    h4: {
      fontFamily: '"Playfair Display", "Outfit", "Georgia", serif',
      fontWeight: 700,
      color: '#12355B',
    },
    h5: {
      fontFamily: '"Playfair Display", "Outfit", "Georgia", serif',
      fontWeight: 600,
      color: '#12355B',
    },
    h6: {
      fontFamily: '"Playfair Display", "Outfit", "Georgia", serif',
      fontWeight: 600,
      color: '#12355B',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      color: '#5B6573',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      color: '#5B6573',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      color: '#1F2937',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      color: '#5B6573',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#D1D5DB',
            },
            '&:hover fieldset': {
              borderColor: '#0F766E',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E8751A',
            },
          },
        },
      },
    },
  },
});

export default theme;
