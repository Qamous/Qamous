import React from 'react';

const ForgotPassword = () => {
  return (
    <div>
      <form className={'container'}>
        <div className={'container-left'}>
          <img
            src="./confused-dog.jpg"
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
            value={'Create an Account'}
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