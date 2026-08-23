import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StandaloneMusicVideoApp from './StandaloneMusicVideoApp';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Check if running in standalone Music Video & Vocal Studio mode
const urlParams = new URLSearchParams(window.location.search);
const isMusicVidStandalone =
  urlParams.get('app') === 'musicvid' ||
  urlParams.get('app') === 'standalone' ||
  process.env.REACT_APP_STANDALONE_MUSICVID === 'true' ||
  localStorage.getItem('app_mode') === 'musicvid';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isMusicVidStandalone ? <StandaloneMusicVideoApp /> : <App />}
  </React.StrictMode>
);

// Register service worker for Progressive Web App (PWA) mobile support
serviceWorkerRegistration.register();
