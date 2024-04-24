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
      <h1 className="profile-secondary">a dictionary written by the people</h1>
    
    </div>
  );
};

export default UserProfile;