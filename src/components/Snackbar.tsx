import React, { useEffect, useState } from 'react';
import './Snackbar.scss';

interface SnackbarProps {
  open: boolean,
  message: string
}

const Snackbar: React.FC<SnackbarProps> = ({ open, message }) => {
  const [isOpen, setIsOpen] = useState(open);
  
  useEffect(() => {
    setIsOpen(open);
    if (open) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  return (
    <div className={`snackbar ${isOpen ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Snackbar;
