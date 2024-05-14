import React, { useEffect } from 'react';
import './UserProfile.scss';
import { useLocation, useNavigate } from 'react-router-dom';
//import { ReactComponent as ArrowForwardIcon } from '../../assets/arrow_forward.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowRightFromBracket,
  faFlag,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';
import { useMutation } from 'react-query';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handlePostLanguageClick = () => {
  };
  
  const logoutMutation = useMutation(() =>
      fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),
    {
      onSuccess: () => {
        // Redirect to login page after successful logout
        navigate('/login');
      },
    }
  );
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Redirect to /profile if the user is on /signup or /login
  useEffect(() => {
    if (location.pathname !== '/profile') {
      navigate('/profile');
    }
  }, [location, navigate]);
  
  return (
    <div className="profile">
      {/*<h1 className="profile-primary">Qamous<span className="profile-primary-secondary">,</span></h1>*/}
      {/*<h1 className="profile-secondary">a dictionary written</h1>*/}
      {/*<h1 className="profile-secondary">by the people</h1>*/}
      {/*<h1 className="profile-secondary">for the people</h1>*/}
      
      {/*<div className="profile-card">*/}
      {/*  <div className="profile-card-inner">*/}
      {/*    <label>Search from your posts</label>*/}
      {/*    <div className="profile-card-inner-search">*/}
      {/*      <div className="profile-card-inner-search-icon">*/}
      {/*        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"*/}
      {/*             stroke="#657789" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">*/}
      {/*          <circle cx="11" cy="11" r="8" />*/}
      {/*          <line x1="21" y1="21" x2="16.65" y2="16.65" />*/}
      {/*        </svg>*/}
      {/*      </div>*/}
      {/*      <div className="profile-card-inner-search-input">*/}
      {/*        <input placeholder="If you've created any..." />*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      
      {/*<div className="profile-card">*/}
      {/*  <h2>Hello,</h2>*/}
      {/*  <h1>User!</h1>*/}
      {/*</div>*/}
      <div className="buttons profile-logout">
        <button onClick={handleLogout} className="buttons-button">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <p>Logout</p>
        </button>
      </div>
      
      <form className="search" action="">
        <button type="submit">Search</button>
        <input type="search" placeholder="Search your posts..." required />
      </form>
      
      <div className="profile-post">
        <div className="profile-post-language">
          <p className="profile-post-language-left">FRANCO-ARABIC</p>
          <div
            className="profile-post-language-right"
            onClick={handlePostLanguageClick}
          >
            <p>View translations</p>
            &nbsp;
            <FontAwesomeIcon icon={faArrowRight} className="profile-post-language-right-arrow" />
          </div>
        
        </div>
        <h2>Yalla</h2>
        <p>
          The Arabic word "يلا" (pronounced: yalla) is a popular term used across different Arabic dialects, including
          Levantine, Egyptian, and Gulf dialects. Yalla is a versatile expression that conveys encouragement,
          motivation, or a sense of urgency. Its primary translation is "let's go" or "come on" in English. Yalla is
          commonly used to spur action, rally enthusiasm, or prompt others to join in an activity. Whether used casually
          among friends or in more formal settings, yalla embodies a dynamic and spirited tone, encouraging engagement
          and participation.
        </p>
        <p className="profile-post-date">October 9th, 2024</p>
        <div className="buttons">
          <button className="profile-post-buttons-button">Edit</button>
          <button className="profile-post-buttons-button" disabled>
            <FontAwesomeIcon icon={faThumbsUp} />
            <p>2</p>
          </button>
          <button className="profile-post-buttons-button" disabled>
            <FontAwesomeIcon icon={faThumbsDown} />
            <p>1</p>
          </button>
          <button className="profile-post-buttons-button" disabled>
            <FontAwesomeIcon icon={faFlag} />
            <p>3</p>
          </button>
        </div>
        <hr />
      </div>
      
      <div className="profile-post">
        <div className="profile-post-language">
          <p className="profile-post-language-left">ARABIC</p>
          <div
            className="profile-post-language-right"
            onClick={handlePostLanguageClick}
          >
            <p>View translations</p>
            &nbsp;
            <FontAwesomeIcon icon={faArrowRight} className="profile-post-language-right-arrow" />
          </div>
        
        </div>
        <h2 dir="rtl">معلش</h2>
        <p dir="rtl">
          تعبير عامي مصري يُستخدم للتعبير عن الموافقة أو الاستسماح،
          ويعني "ما فيش مشكلة" أو "ما عليك". يُستخدم كبديل عن التعبير عن الشكر
          أو الاعتذار.
        </p>
        <p className="profile-post-date">October 9th, 2024</p>
        <div className="buttons">
          <button className="profile-post-buttons-button">Edit</button>
          <button className="profile-post-buttons-button" disabled>
            <FontAwesomeIcon icon={faThumbsUp} />
            <p>100</p>
          </button>
          <button className="profile-post-buttons-button" disabled>
            <FontAwesomeIcon icon={faThumbsDown} />
            <p>16</p>
          </button>
          <button className="profile-post-buttons-button" disabled>
            <FontAwesomeIcon icon={faFlag} />
            <p>11</p>
          </button>
        </div>
        <hr />
      </div>
    </div>
  );
};

export default UserProfile;