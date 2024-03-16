import React, { useState } from 'react';
import './SignUp.scss';
import { useNavigate } from 'react-router-dom';

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

async function success(pos: any) {
  var crd = pos.coords;
  // Get the user's country based on their latitude and longitude
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${crd.latitude}&lon=${crd.longitude}`);
  const data = await response.json();
  const country = data.address.country;
  const countryCode = data.address.country_code;

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`Country: ${country}`);
  console.log(`Country Code: ${countryCode}`); // Log the country code
  console.log(`More or less ${crd.accuracy} meters.`);
}

function errors(err: any) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

if (navigator.geolocation) {
  navigator.permissions
    .query({ name: 'geolocation' })
    .then(function(result) {
      // console.log(result);
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(success, errors, options);
      } else if (result.state === 'prompt') {
        //If prompt then the user will be asked to give permission
        navigator.geolocation.getCurrentPosition(success, errors, options);
      } else if (result.state === "denied") {

      }
    });
} else {
  console.log('Geolocation is not supported by this browser.');
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [dobError, setDobError] = useState('');

  const onSignUpClick = () => {
    // Clear previous errors
    setUsernameError('');
    setFirstNameError('');
    setLastNameError('');
    setDobError('');
    setEmailError('');
    setPasswordError('');

    // Basic Username validation
    if (!username || '' === username) {
      setUsernameError('Username is required');
      return;
    }
    // Basic First name validation
    if (!firstName || '' === firstName) {
      setFirstNameError('First name is required');
      return;
    }
    // Basic Last name validation
    if (!lastName || '' === lastName) {
      setLastNameError('Last name is required');
      return;
    }
    // Basic Date of birth validation
    if (!dob || '' === dob) {
      setDobError('Date of birth is required');
      return;
    }
    // Basic Email validation
    if (!email || '' === email) {
      setEmailError('Email is required');
      return;
    }
    // Advanced Email validation
    if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
      setEmailError('Invalid email');
      return;
    }
    // Basic password validation
    if (!password || '' === password) {
      setPasswordError('Password is required');
      return;
    }

    // TODO: Implement sign up logic here
    // If sign up is successful, navigate to another page
    // navigate('/dashboard');
  };

  const onLogInClick = () => {
    // Redirect to the log in page
    navigate('/login');
  };

  return (
    <div className={'login-container'}>
      <div className={'login-container-title'}>
        <div>Sign Up</div>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          type={'text'}
          value={username}
          placeholder="Enter your username here"
          onChange={(ev) => setUsername(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{usernameError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          type={'text'}
          value={firstName}
          placeholder="Enter your first name here"
          onChange={(ev) => setFirstName(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{firstNameError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          type={'text'}
          value={lastName}
          placeholder="Enter your last name here"
          onChange={(ev) => setLastName(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{lastNameError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          type={'date'}
          value={dob}
          placeholder="Enter your date of birth here"
          onChange={(ev) => setDob(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{dobError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          type={'email'}
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{emailError}</label>
      </div>
      <br />
      <div className={'login-container-input'}>
        <input
          type={'password'}
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'login-container-input-box'}
        />
        <label className="login-container-input-error">{passwordError}</label>
      </div>
      <br />
      <div className={'login-container-buttons'}>
        <button
          className="login-container-buttons-button"
          onClick={onSignUpClick}
          value={'Sign Up'}
        >
          Sign up
        </button>
        <button
          className="login-container-buttons-button login-container-buttons-button-signup"
          onClick={onLogInClick}
          value={'Sign Up'}
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default SignUp;