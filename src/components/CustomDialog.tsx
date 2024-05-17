import React from 'react';
import './CustomDialog.scss';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CustomDialogProps {
  text: string;
  buttonText1: string;
  buttonText2: string;
  onButton1Click: () => void;
  onButton2Click: () => void;
  onClose: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ text, buttonText1, buttonText2, onButton1Click, onButton2Click, onClose }) => {
  return (
    <div className="custom-dialog">
      <div className="custom-dialog-content">
        <FontAwesomeIcon className="custom-dialog-close" onClick={onClose} icon={faX} />
        <p>{text}</p>
        <button onClick={onButton1Click}>{buttonText1}</button>
        <button onClick={onButton2Click}>{buttonText2}</button>
      </div>
    </div>
  );
};

export default CustomDialog;