import React from 'react';
import './Snackbar.scss';

interface SnackbarProps {
    open: boolean,
    message: string
}

const Snackbar: React.FC<SnackbarProps> = ({ open, message }) => {
    return (
        <div className={`snackbar ${open ? 'show' : ''}`}>
            {message}
        </div>
    );
}

export default Snackbar;