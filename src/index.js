import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StandaloneMusicVideoApp from './StandaloneMusicVideoApp';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Default to standalone AI Music Video & Vocal Cloner App
// To access the Astrology Cosmic suite, pass ?app=cosmic or set localStorage app_mode='cosmic'
const urlParams = new URLSearchParams(window.location.search);
const isCosmicMode =
  urlParams.get('app') === 'cosmic' ||
  urlParams.get('app') === 'astrology' ||
  localStorage.getItem('app_mode') === 'cosmic';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isCosmicMode ? <App /> : <StandaloneMusicVideoApp />}
  </React.StrictMode>
);

// Register service worker for Progressive Web App (PWA) mobile support
serviceWorkerRegistration.register();
