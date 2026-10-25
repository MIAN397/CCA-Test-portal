import React from 'react';
import ReactDOM from 'react-dom/client';
import { initLenis } from './utils/lenis';
import App from './App';
import './index.css';

// Initialize Lenis 60fps smooth scrolling
initLenis();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

