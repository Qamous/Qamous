import React, { useState } from 'react';
import './PasswordScreen.scss';

const PasswordScreen: React.FC<{ onPasswordCorrect: () => void }> = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setIsCaps(newPassword.toUpperCase() === newPassword && newPassword !== '');
  };
  
  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === 'QAMOOSE-THE-GOOSE') {
      onPasswordCorrect();
    } else {
      setError(true);
    }
  };

  return (
    <div className="password-screen">
      <form onSubmit={handlePasswordSubmit}>
        <label>
          Enter password: &nbsp;
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="password-screen-input"
          />
        </label>
        <input type="submit" value="Submit" className="password-screen-submit" />
      </form>
      {isCaps && <p className="password-screen-warning">Warning: Caps Lock is on!</p>}
      {error && <p className="password-screen-error">Incorrect password. Please try again.</p>}
    </div>
  );
};

export default PasswordScreen;