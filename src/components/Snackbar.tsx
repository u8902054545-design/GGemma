import React from 'react';
import SnackbarMUI from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, isOpen, onClose, duration = 4000 }) => {
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  const action = (
    <Button 
      color="secondary" 
      size="small" 
      onClick={handleClose}
      style={{ color: 'var(--md-sys-color-primary)', fontWeight: 'bold' }}
    >
      OK
    </Button>
  );

  return (
    <SnackbarMUI
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      message={message}
      action={action}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  );
};

export default Snackbar;
