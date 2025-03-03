import React from 'react';

export const LoadingFallback: React.FC = () => (
  <div className="loading-container">
    <div className="loading-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);