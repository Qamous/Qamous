import React, { useState } from 'react';
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
  showTextInput: boolean;
  onSubmit: (input: string) => void;
  onCancel: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ text, buttonText1, buttonText2, onButton1Click, onButton2Click, onClose, showTextInput, onSubmit, onCancel }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue('');
  };

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
          <button onClick={onButton1Click}>{buttonText1}</button>
            <button onClick={onButton2Click}>{buttonText2}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDialog;