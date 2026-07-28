import React from 'react';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface PrimaryButtonProps extends ButtonProps {
  children: React.ReactNode;
  component?: any;
  to?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, sx, ...props }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        px: 4,
        py: 1.5,
        fontSize: '1rem',
        fontWeight: 700,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
