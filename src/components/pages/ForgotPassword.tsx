import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [email, setEmail] = useState('');
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  function onLoginClick() {
    navigate('/login');
  }
  
  const mutation = useMutation((email: string) => fetch('http://localhost:3000/users/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  }).then(async response => {
    if (!response.ok) {
      throw new Error('Failed to reset password');
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }), {
    onSuccess: () => {
      alert('Password reset email sent');
    },
    onError: (error: any) => {
      alert(`Failed to reset password: ${error.message}`);
    },
  });
  
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate(email);
  };
  
  return (
    <div>
      <form onSubmit={onSubmit} className={'container'}>
        <div className={'container-left'}>
          <img
            src="./confused-dog.jpg"
            onLoad={handleImageLoad}
            style={{ backgroundColor: imageLoaded ? 'transparent' : '#dcdcdc' }}
            loading="lazy"
            alt={'Confused Dog'}
            className={'container-left-image'}
          />
          <h1>Forgot Something?</h1>
          <p>Don't worry! We've got you covered.</p>
          <p>Just enter your email address below and we'll send you a link to reset your password.</p>
          <br />
          <div className={'container-left-input'}>
            <input
              type={'email'}
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="Enter your email address here"
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
            Submit
          </button>
          <button
            className="container-buttons-button container-buttons-button-secondary"
            onClick={onLoginClick}
            value={'Go Back'}
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  )
    ;
};

export default ForgotPassword;