import React, { useState } from 'react';
import './PasswordScreen.scss';

const PasswordScreen: React.FC<{ onPasswordCorrect: () => void }> = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

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
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 className="password-screen-input" />
        </label>
        <input type="submit" value="Submit" className="password-screen-submit" />
      </form>
      {error && <p className="password-screen-error">Incorrect password. Please try again.</p>}
    </div>
  );
};

export default PasswordScreen;