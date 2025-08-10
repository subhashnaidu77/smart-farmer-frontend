import React from 'react';
import { useTheme } from '../context/ThemeContext';
// This is our new animated loading spinner component
function LoadingSpinner({ message }) {
     const { theme } = useTheme(); // Get the current theme
    const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png'; // Choose logo based on theme

    return (
        <div className="loading-container">
            <img src={logoSrc} alt="Smart Farmer Logo" className="loading-logo" />
            <div className="loading-spinner"></div>
            <p className="loading-message">{message || 'Loading...'}</p>
        </div>
    );
}

export default LoadingSpinner;