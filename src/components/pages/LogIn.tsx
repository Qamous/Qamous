import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './LogIn.scss';
import { useMutation } from 'react-query';
import OAuthStrategies from '../OAuthStrategies';
import CustomDialog from '../CustomDialog';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const forgotPasswordHuh = (): void => {
    const forgotPasswordElement = document.querySelector('.container-forgot');
    if (forgotPasswordElement && !forgotPasswordElement.classList.contains('show')) {
      forgotPasswordElement.classList.add('show');
    }
  };
  
  const mutation = useMutation((data: {
    username: string;
    password: string;
  }) => fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  }).then(async response => {
    if (!response.ok) {
      const json = await response.json();
      const error: any = new Error(json.message || 'Unknown error');
      error.info = json;
      throw error;
    }
    return response.json();
  }), {
    onSuccess: () => {
      setSuccessMessage('Login successful');
      setShowSuccessDialog(true);
    },
    onError: (error: any) => {
      setErrorMessage(`Login failed: ${error.message}`);
      setShowErrorDialog(true);
      forgotPasswordHuh();
    },
  });
  
  const onLoginClick = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the form from refreshing the page and redirecting to .../login?
    // Clear previous errors
    setUsernameError('');
    setPasswordError('');
    
    // Basic Username validation
    if (!username || '' === username) {
      setUsernameError('Username is required');
      return;
    }
    // SQL injection prevention
    if (username.includes('\'') || username.includes('"') || username.includes(';')) {
      setUsernameError('Invalid username');
      return;
    }
    // Basic password validation
    if (!password || '' === password) {
      setPasswordError('Password is required');
      // make container-forgot visible
      forgotPasswordHuh();
    }
    
    // Call the mutation
    mutation.mutate({ username, password });
  };
  
  const onSignUpClick = () => {
    // Redirect to the sign up page
    navigate('/signup');
  };
  
  return (
    <>
      {showErrorDialog && (
        <CustomDialog
          text={errorMessage}
          okButtonText="OK"
          onOkButtonClick={() => setShowErrorDialog(false)}
          onClose={() => setShowErrorDialog(false)}
        />
      )}
      {showSuccessDialog && (
        <CustomDialog
          text={successMessage}
          okButtonText="OK"
          onOkButtonClick={() => {
            setShowSuccessDialog(false);
            navigate('/');
          }}
          onClose={() => {
            setShowSuccessDialog(false);
            navigate('/');
          }}
        />
      )}
      
      <form onSubmit={onLoginClick} className={'container'}>
        
        <div className={'container-title'}>
          <div>Log in</div>
        </div>
        <br />
        <div className={'container-input'}>
          <input
            type={'username'}
            value={username}
            placeholder="Enter your username here"
            onChange={(ev) => setUsername(ev.target.value)}
            className={'container-input-box'}
          />
          <label className="container-input-error">{usernameError}</label>
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
        <NavLink to={'/forgot-password'} className={'container-forgot'}>Forgot password?</NavLink>
        <br />
        <div className={'container-buttons'}>
          <button
            className={'container-buttons-button'}
            type="submit"
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
        {/*<div className={'container-oauth'}>*/}
        {/*  <p>*/}
        {/*    — Or continue with —*/}
        {/*  </p>*/}
        {/*  <OAuthStrategies />*/}
        {/*</div>*/}
      </form>
    </>
  );
};

export default Login;