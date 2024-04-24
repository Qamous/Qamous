import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
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
    const response = await fetch('http://localhost:3000/users/reset-password/' + token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword: password }),
    });
    
    if (response.ok) {
      alert('Password reset successful');
      navigate('/login');
    } else {
      alert('Failed to reset password');
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
            <h1>Reset Password</h1>
            <p>Enter your email address to reset your password.</p>
            <br />
            <div className={'container-left-input'}>
              <input
                type={'password'}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="Enter your password here"
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
          </div>
        </form>
      </div>
    )
      ;
};

export default ResetPassword;