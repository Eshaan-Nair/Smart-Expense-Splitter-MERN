import React from 'react';
import '../../styles/loadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner-wrapper">
          <div className="spinner"></div>
          <div className="spinner-glow"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;