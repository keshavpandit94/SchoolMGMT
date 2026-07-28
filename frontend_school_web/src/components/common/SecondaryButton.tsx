import React from 'react';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface SecondaryButtonProps extends ButtonProps {
  children: React.ReactNode;
  component?: any;
  to?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, sx, ...props }) => {
  return (
    <Button
      variant="outlined"
      color="primary"
      sx={{
        px: 4,
        py: 1.5,
        fontSize: '1rem',
        fontWeight: 700,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SecondaryButton;
