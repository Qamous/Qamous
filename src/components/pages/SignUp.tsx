import React, { useState } from 'react';
import './SignUp.scss';
import { useNavigate } from 'react-router-dom';
import { findLocationByIP, findLocationByLatLong } from '../../assets/utils';
import { useMutation } from 'react-query';
import CustomDialog from '../CustomDialog';
import OAuthStrategies from '../OAuthStrategies';
import { useTranslation } from 'react-i18next';

type User = {
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  passwordConfirmation: string;
};

findLocationByIP();
const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmationError, setPasswordConfirmationError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  
  const mutation = useMutation((newUser: User) =>
    fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    }).then(response => {
      if (!response.ok) {
        return response.json().then(json => {
          const error: any = new Error(json.message || 'Unknown error');
          error.info = json;
          throw error;
        });
      }
      return response.json();
    }), {
    onMutate: () => {
      mutation.reset();
    },
    onSuccess: () => {
      setDialogMessage(t('sign_up.success_message'));
      setShowDialog(true);
      navigate('/login');
    },
    onError: (error: any) => {
      setDialogMessage(`${t('sign_up.error_message')}: ${error.message}`);
      setShowDialog(true);
    },
  });
  
  const onSignUpClick = () => {
    setUsernameError('');
    setFirstNameError('');
    setLastNameError('');
    setDobError('');
    setEmailError('');
    setPasswordError('');
    
    if (!username || '' === username) {
      setUsernameError(t('sign_up.username_error'));
      return;
    }
    if (username.includes('\'') || username.includes('"') || username.includes(';')) {
      setUsernameError(t('sign_up.username_invalid_error'));
      return;
    }
    if (!firstName || '' === firstName) {
      setFirstNameError(t('sign_up.first_name_error'));
      return;
    }
    if (!lastName || '' === lastName) {
      setLastNameError(t('sign_up.last_name_error'));
      return;
    }
    if (!dob || '' === dob) {
      setDobError(t('sign_up.dob_error'));
      return;
    }
    if (!email || '' === email) {
      setEmailError(t('sign_up.email_error'));
      return;
    }
    if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
      setEmailError(t('sign_up.email_invalid_error'));
      return;
    }
    if (!password || '' === password) {
      setPasswordError(t('sign_up.password_error'));
      return;
    }
    if (!passwordConfirmation || passwordConfirmation !== password) {
      setPasswordConfirmationError(t('sign_up.password_confirmation_error'));
      return;
    }
    
    findLocationByIP();
    
    mutation.mutate({
      username,
      firstName,
      lastName,
      dateOfBirth: new Date(dob),
      email,
      password,
      passwordConfirmation: password,
    });
  };
  
  const onLogInClick = () => {
    navigate('/login');
  };
  
  return (
    <div className={'container'}>
      {showDialog && (
        <CustomDialog
          text={dialogMessage}
          okButtonText={t('common.ok')}
          onOkButtonClick={() => {
            setShowDialog(false);
            if (dialogMessage.includes(t('sign_up.success_message_part'))) {
              navigate('/login');
            }
          }}
          onClose={() => setShowDialog(false)}
        />
      )}
      <div className={'container-title'}>
        <div>{t('sign_up.title')}</div>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'text'}
          value={username}
          placeholder={t('sign_up.enter_username')}
          autoComplete={'username'}
          onChange={(ev) => setUsername(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{usernameError}</label>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'text'}
          value={firstName}
          placeholder={t('sign_up.enter_first_name')}
          onChange={(ev) => setFirstName(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{firstNameError}</label>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'text'}
          value={lastName}
          placeholder={t('sign_up.enter_last_name')}
          onChange={(ev) => setLastName(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{lastNameError}</label>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'date'}
          value={dob}
          placeholder={t('sign_up.enter_dob')}
          onChange={(ev) => setDob(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{dobError}</label>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'email'}
          value={email}
          placeholder={t('sign_up.enter_email')}
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
          autoComplete={'new-password'}
          placeholder={t('sign_up.enter_password')}
          onChange={(ev) => setPassword(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{passwordError}</label>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'password'}
          value={passwordConfirmation}
          placeholder={t('sign_up.confirm_password')}
          onChange={(ev) => setPasswordConfirmation(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{passwordConfirmationError}</label>
      </div>
      <br />
      <div className={'container-buttons'}>
        <button
          className="container-buttons-button"
          onClick={onSignUpClick}
          value={t('sign_up.sign_up_button')}
        >
          {t('sign_up.sign_up_button')}
        </button>
        <button
          className="container-buttons-button container-buttons-button-secondary"
          onClick={onLogInClick}
          value={t('sign_up.log_in_button')}
        >
          {t('sign_up.log_in_button')}
        </button>
      </div>
    </div>
  );
};

export default SignUp;
