import React from 'react';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import { AlertTriangle, Inbox } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  minHeight?: string | number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading information...', 
  minHeight = 250 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight,
        py: 4 
      }}
    >
      <CircularProgress size={40} sx={{ color: '#E8751A', mb: 2 }} />
      <Typography variant="body2" sx={{ color: '#5B6573' }}>
        {message}
      </Typography>
    </Box>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  minHeight?: string | number;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry, 
  minHeight = 200 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight,
        py: 4,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Alert 
        severity="error" 
        icon={<AlertTriangle size={20} />}
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          borderRadius: 2, 
          mb: onRetry ? 2 : 0,
          bgcolor: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FCA5A5'
        }}
      >
        {message}
      </Alert>
      {onRetry && (
        <Button 
          variant="outlined" 
          onClick={onRetry}
          sx={{ 
            color: '#E8751A', 
            borderColor: '#E8751A', 
            textTransform: 'none',
            '&:hover': {
              borderColor: '#C95E10',
              bgcolor: 'rgba(232, 117, 26, 0.04)',
            }
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

interface EmptyStateProps {
  message?: string;
  minHeight?: string | number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No records found at this moment.', 
  minHeight = 180 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight,
        py: 4,
        textAlign: 'center'
      }}
    >
      <Inbox size={36} color="#5B6573" style={{ marginBottom: 12, opacity: 0.6 }} />
      <Typography variant="body2" sx={{ color: '#5B6573' }}>
        {message}
      </Typography>
    </Box>
  );
};
