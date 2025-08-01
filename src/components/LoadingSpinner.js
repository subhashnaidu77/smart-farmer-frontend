import React from 'react';

// This is our new animated loading spinner component
function LoadingSpinner({ message }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">{message || 'Loading...'}</p>
        </div>
    );
}

export default LoadingSpinner;