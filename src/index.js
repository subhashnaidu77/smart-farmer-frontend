import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import { ModalProvider } from './context/ModalContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
       <ModalProvider>
      <App />
      </ModalProvider>
    </ThemeProvider>
  </React.StrictMode>
);