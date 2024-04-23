import React, { useState } from 'react';
import './SignUp.scss';
import { useNavigate } from 'react-router-dom';
import { findLocationByIP, findLocationByLatLong } from '../../assets/utils';
import { useMutation } from 'react-query';
import OAuthStrategies from '../OAuthStrategies';

type User = {
  username: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  password: string;
};

findLocationByIP();
const SignUp: React.FC = () => {
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
      // Clear mutation error before the mutation function is called
      mutation.reset();
    },
    onSuccess: () => {
      alert('Sign up successful');
      navigate('/login');
    },
    onError: (error: any) => {
      alert(`Sign up failed: ${error.message}`);
    },
  });
  
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
    // Advanced Username validation
    if (username.includes('\'') || username.includes('"') || username.includes(';')) {
      setUsernameError('Username cannot contain \', ", or ;');
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
    // password confirmation validation
    if (!passwordConfirmation || passwordConfirmation !== password) {
      setPasswordConfirmationError('Password confirmation must match password');
      return;
    }
    
    // TODO: Implement sign up logic here and send the data to the server (including the user's location)
    // findLocationByLatLong();
    findLocationByIP();
    // If sign up is successful, navigate to another page
    // navigate('/dashboard');
    
    // Call the mutation
    mutation.mutate({
      username,
      firstName,
      lastName,
      dob,
      email,
      password,
      passwordConfirmation: password,
    });
  };
  
  const onLogInClick = () => {
    alert('You have successfully registered! Please use your credentials to log in.');
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
      <div className={'container-input'}>
        <input
          type={'password'}
          value={passwordConfirmation}
          placeholder="Confirm your password here"
          onChange={(ev) => setPasswordConfirmation(ev.target.value)}
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
      <div className={'container-oauth'}>
        <p>
          — Or continue with —
        </p>
        <OAuthStrategies />
      </div>
    </div>
  );
};

export default SignUp;