import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LogIn.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const onLoginClick = () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Basic Email validation
    if (!email || '' === email) {
      setEmailError('Email is required');
      return;
    }
    // Advanced Email validation
    if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
      setEmailError('Invalid email');
      return;
    }
    // Basic password validation
    if (!password || '' === password) {
      setPasswordError('Password is required');
      return;
    }

    // TODO: Implement login logic here
    // If login is successful, navigate to another page
    // navigate('/dashboard');
  };

  const onSignUpClick = () => {
    // Redirect to the sign up page
    navigate('/signup');
  };

  return (
    <div className={'container'}>
      <div className={'container-title'}>
        <div>Log in</div>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'email'}
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{emailError}</label>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'password'}
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{passwordError}</label>
      </div>
      <br />
      <div className={'container-buttons'}>
        <button
          className={'container-buttons-button'}
          type="button"
          onClick={onLoginClick}
          value={'Log in'}
        >
          Log in
        </button>
        <button
          className="container-buttons-button container-buttons-button-secondary"
          onClick={onSignUpClick}
          value={'Sign Up'}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;