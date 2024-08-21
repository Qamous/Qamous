import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [password, setPassword] = useState('');
  const { token } = useParams(); // Get the token from the URL parameters
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Call the reset-password API with the token and the new password
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/reset-password/` + token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword: password }),
    });
    
    if (response.ok) {
      alert(t('reset_password.password_reset_success'));
      navigate('/login');
    } else {
      alert(t('reset_password.password_reset_error'));
    }
  };
  
  return (
    <div>
      <form onSubmit={onSubmit} className={'container'}>
        <div className={'container-left'}>
          <img
            src="/nerdy-dog.jpg"
            onLoad={handleImageLoad}
            style={{ backgroundColor: imageLoaded ? 'transparent' : '#e5dfdf' }}
            loading="lazy"
            alt={'Nerdy Dog'}
            className={'container-left-image'}
          />
          <h1>{t('reset_password.title')}</h1>
          <p>{t('reset_password.description')}</p>
          <br />
          <div className={'container-left-input'}>
            <input
              type={'password'}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder={t('reset_password.enter_password')}
              className={'container-input-box'}
            />
          </div>
        </div>
        <br />
        <div className={'container-buttons'}>
          <button className={'container-buttons-button'} type="submit" value={'Submit'}>
            {t('common.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
