import React, { useEffect } from 'react';
import './UserProfile.scss';
import { useLocation, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to /profile if the user is on /signup or /login
  useEffect(() => {
    if (location.pathname !== '/profile') {
      navigate('/profile');
    }
  }, [location, navigate]);
  
  return (
    <div className="profile">
      <h1 className="profile-primary">Qamous<span className="profile-primary-secondary">,</span></h1>
      <h1 className="profile-secondary">a dictionary written</h1>
      <h1 className="profile-secondary">by the people</h1>
      <h1 className="profile-secondary">for the people</h1>
      
      <div className="profile-card">
        <div className="profile-card-inner">
          <label>Search from your posts</label>
          <div className="profile-card-inner-search">
            <div className="profile-card-inner-search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="#657789" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="profile-card-inner-search-input">
              <input placeholder="If you've created any..." />
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-card">
        <h2>Hello,</h2>
        <h1>User!</h1>
      </div>
    </div>
  );
};

export default UserProfile;