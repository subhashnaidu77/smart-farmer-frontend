import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // Default to dark theme
    const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || '#4CAF50'); // Default accent

    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('accentColor', accentColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [theme, accentColor]);

    const value = { theme, setTheme, accentColor, setAccentColor };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext);
};