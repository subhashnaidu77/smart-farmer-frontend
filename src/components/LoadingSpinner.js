import React from 'react';

// This is our new animated loading spinner component
function LoadingSpinner({ message }) {
    return (
        <div className="loading-container">
            <img src="/logo.png" alt="Smart Farmer Logo" className="loading-logo" />
            <div className="loading-spinner"></div>
            <p className="loading-message">{message || 'Loading...'}</p>
        </div>
    );
}

export default LoadingSpinner;