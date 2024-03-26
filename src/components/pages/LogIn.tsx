import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LogIn.scss';
import { isPasswordSecure } from '../../../backend/src/users/utils/validation';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const onButtonClick = () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Basic validation
    if (!email || '' === email) {
      setEmailError('Email is required');
      return;
    }
    if (!password || '' === password) {
      setPasswordError('Password is required');
      return;
    }
    // Email validation
    if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
      setEmailError('Invalid email');
      return;
    }

    // TODO: Implement login logic here
    // If login is successful, navigate to another page
    // navigate('/dashboard');
  };

  return (
    <div className={'login-container'}>
      <div className={'login-container-title'}>
        <div>Login</div>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{emailError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{passwordError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input className={'login-container-input-button'} type="button" onClick={onButtonClick} value={'Log in'} />
      </div>
    </div>
  );
};

export default Login;