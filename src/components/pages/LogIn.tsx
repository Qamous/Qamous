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

  const onSignUpClick = () => {
    // Redirect to the sign up page
    navigate('/signup');
  };

  return (
    <div className={'login-container'}>
      <div className={'login-container-title'}>
        <div>Log in</div>
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
        <button
          className={'login-container-input-button'}
          type="button"
          onClick={onLoginClick}
          value={'Log in'}
        >
          Log in
        </button>
        <button
          className="login-container-input-button login-container-input-button-signup"
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