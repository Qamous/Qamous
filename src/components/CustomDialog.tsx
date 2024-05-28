import React, { ReactNode, useEffect, useState } from 'react';
import './CustomDialog.scss';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CustomDialogProps {
  text: ReactNode;
  buttonText1?: string; // Make this prop optional
  buttonText2?: string; // Make this prop optional
  onButton1Click?: () => void; // Make this prop optional
  onButton2Click?: () => void; // Make this prop optional
  onClose?: () => void; // Make this prop optional
  showTextInput?: boolean; // Make this prop optional
  onSubmit?: (input: string) => void; // Make this prop optional
  onCancel?: () => void; // Make this prop optional
  okButtonText?: string;
  onOkButtonClick?: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ text, buttonText1, buttonText2, onButton1Click, onButton2Click, onClose, showTextInput, onSubmit, onCancel, okButtonText, onOkButtonClick }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };
  
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(inputValue);
    }
    setInputValue('');
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  return (
    <div className="custom-dialog">
      <div className="custom-dialog-content">
        <FontAwesomeIcon className="custom-dialog-close" onClick={onClose} icon={faX} />
        <p>{text}</p>
        {showTextInput && (
          <div>
            <div className="custom-dialog-content-input">
              <textarea
                value={inputValue}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        )}
        {!showTextInput && (
          <div>
            {buttonText1 && onButton1Click && (
              <button onClick={onButton1Click}>{buttonText1}</button>
            )}
            {buttonText2 && onButton2Click && (
              <button onClick={onButton2Click}>{buttonText2}</button>
            )}
            {okButtonText && onOkButtonClick && (
              <button onClick={onOkButtonClick}>{okButtonText}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDialog;