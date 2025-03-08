import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="loading-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);

export default LoadingSpinner;