import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [email, setEmail] = useState('');
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const onLoginClick = () => {
    navigate('/login');
  };
  
  const mutation = useMutation(
    (email: string) =>
      fetch(`${import.meta.env.VITE_API_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(t('forgot_password.email_error'));
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      }),
    {
      onSuccess: () => {
        alert(t('forgot_password.email_sent'));
        navigate('/login');
      },
      onError: (error: any) => {
        alert(t('forgot_password.email_sent'));
        navigate('/login');
      },
    }
  );
  
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate(email);
  };
  
  return (
    <div>
      <form onSubmit={onSubmit} className={'container'}>
        <div className={'container-left'}>
          <img
            src="/confused-dog.jpg"
            onLoad={handleImageLoad}
            style={{ backgroundColor: imageLoaded ? 'transparent' : '#dcdcdc' }}
            loading="lazy"
            alt={'Confused Dog'}
            className={'container-left-image'}
          />
          <h1>{t('forgot_password.title')}</h1>
          <p>{t('forgot_password.description_1')}</p>
          <p>{t('forgot_password.description_2')}</p>
          <br />
          <div className={'container-left-input'}>
            <input
              type={'email'}
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder={t('forgot_password.enter_email')}
              className={'container-input-box'}
            />
          </div>
        </div>
        <br />
        <div className={'container-buttons'}>
          <button
            className={'container-buttons-button'}
            type="submit"
            value={'Submit'}
          >
            {t('common.submit')}
          </button>
          <button
            className="container-buttons-button container-buttons-button-secondary"
            onClick={onLoginClick}
            value={'Go Back'}
          >
            {t('forgot_password.go_back_button')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;