import React from 'react';

// This is a modern, CSS-based progress circle. It looks great and is very efficient.
function CircularProgress({ percentage }) {
    const gradient = `conic-gradient(var(--accent-color) ${percentage * 3.6}deg, var(--bg-color) 0deg)`;

    return (
        <div className="conic-progress-container" style={{background: gradient}}>
            <div className="conic-progress-inner">
                <span className="conic-progress-text">{percentage.toFixed(0)}%</span>
            </div>
        </div>
    );
};

export default CircularProgress;