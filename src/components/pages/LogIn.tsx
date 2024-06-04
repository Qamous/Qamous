import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './LogIn.scss';
import { useMutation } from 'react-query';
import CustomDialog from '../CustomDialog';
import { useTranslation } from 'react-i18next';
//import OAuthStrategies from '../OAuthStrategies';

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
  const { t } = useTranslation();
  
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
      setSuccessMessage(t('login.success_message'));
      setShowSuccessDialog(true);
    },
    onError: (error: any) => {
      setErrorMessage(`${t('login.error_message')}: ${error.message}`);
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
      setUsernameError(t('login.username_required'));
      return;
    }
    // SQL injection prevention
    if (username.includes('\'') || username.includes('"') || username.includes(';')) {
      setUsernameError(t('login.invalid_username'));
      return;
    }
    // Basic password validation
    if (!password || '' === password) {
      setPasswordError(t('login.password_required'));
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
          okButtonText={t('common.ok')}
          onOkButtonClick={() => setShowErrorDialog(false)}
          onClose={() => setShowErrorDialog(false)}
        />
      )}
      {showSuccessDialog && (
        <CustomDialog
          text={successMessage}
          okButtonText={t('common.ok')}
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
          <div>{t('login.title')}</div>
        </div>
        <br />
        <div className={'container-input'}>
          <input
            type={'username'}
            value={username}
            placeholder={t('login.enter_username')}
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
            placeholder={t('login.enter_password')}
            onChange={(ev) => setPassword(ev.target.value)}
            className={'container-input-box'}
          />
          <label className="container-input-error">{passwordError}</label>
        </div>
        <NavLink to={'/forgot-password'} className={'container-forgot'}>{t('login.forgot_password')}</NavLink>
        <br />
        <div className={'container-buttons'}>
          <button
            className={'container-buttons-button'}
            type="submit"
            onClick={onLoginClick}
            value={t('login.login')}
          >
            {t('login.login')}
          </button>
          <button
            className="container-buttons-button container-buttons-button-secondary"
            onClick={onSignUpClick}
            value={t('login.sign_up')}
          >
            {t('login.sign_up')}
          </button>
        </div>
        {/*<div className={'container-oauth'}>*/}
        {/*  <p>*/}
        {/*    — {i18n.t('login.continue_with')} —*/}
        {/*  </p>*/}
        {/*  <OAuthStrategies />*/}
        {/*</div>*/}
      </form>
    </>
  );
};

export default Login;
