import React, { useState } from 'react';
import './SignUp.scss';
import { useNavigate } from 'react-router-dom';

/**
 * Nominatim address interface.
 * @interface NominatimAddress
 *
 *
 */
interface NominatimAddress {
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  state?: string;
  state_district?: string;
  county?: string;
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  city_district?: string;
  district?: string;
  borough?: string;
  suburb?: string;
  subdivision?: string;
  hamlet?: string;
  croft?: string;
  isolated_dwelling?: string;
  neighbourhood?: string;
  allotments?: string;
  quarter?: string;
  city_block?: string;
  residental?: string;
  farm?: string;
  farmyard?: string;
  industrial?: string;
  commercial?: string;
  retail?: string;
  road?: string;
  house_number?: string;
  house_name?: string;
  emergency?: string;
  historic?: string;
  military?: string;
  natural?: string;
  landuse?: string;
  place?: string;
  railway?: string;
  man_made?: string;
  aerialway?: string;
  boundary?: string;
  amenity?: string;
  aeroway?: string;
  club?: string;
  craft?: string;
  leisure?: string;
  office?: string;
  mountain_pass?: string;
  shop?: string;
  tourism?: string;
  bridge?: string;
  tunnel?: string;
  waterway?: string;
  postcode?: string;
  [key: string]: string | undefined; // ISO3166-2-lvl_
}

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
  const address: NominatimAddress = data.address;
  // const town: string | undefined = address.town;
  // const city: string | undefined = address.city;
  // const state: string | undefined = address.state;
  // const country: string | undefined = address.country;
  // const continent: string | undefined = address.continent;
  // const countryCode: string | undefined = address.country_code;
  // const postcode: string | undefined = address.postcode;

  console.log('Your current position is:');
  //console.log(`Latitude : ${crd.latitude}`);
  //console.log(`Longitude: ${crd.longitude}`);
  //console.log(`Location: ${town}, ${city}, ${state}, ${country}, ${continent}, ${countryCode}, ${postcode}`)

  // Log the ISO3166-2-lvl keys and values
  // for (const key in address) {
  //   if (key.startsWith('ISO3166-2-lvl')) {
  //     console.log(`Key: ${key}, Value: ${address[key]}`);
  //   }
  // }

  // Log the accuracy of the user's location
  //console.log(`More or less ${crd.accuracy} meters.`);
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

    // TODO: Implement sign up logic here and send the data to the server (including the user's location)
    // If sign up is successful, navigate to another page
    // navigate('/dashboard');
  };

  const onLogInClick = () => {
    // Redirect to the log in page
    navigate('/login');
  };

  return (
    <div className={'container'}>
      <div className={'container-title'}>
        <div>Sign Up</div>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'text'}
          value={username}
          placeholder="Enter your username here"
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
          placeholder="Enter your first name here"
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
          placeholder="Enter your last name here"
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
          placeholder="Enter your date of birth here"
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
          placeholder="Enter your email here"
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
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'container-input-box'}
        />
        <label className="container-input-error">{passwordError}</label>
      </div>
      <br />
      <div className={'container-buttons'}>
        <button
          className="container-buttons-button"
          onClick={onSignUpClick}
          value={'Sign Up'}
        >
          Sign up
        </button>
        <button
          className="container-buttons-button container-buttons-button-secondary"
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