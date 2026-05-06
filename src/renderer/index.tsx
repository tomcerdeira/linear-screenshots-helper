import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Tell the main process the renderer has actually painted, so it can show
// the window only when content is ready — eliminates the empty-frame flicker.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    window.api?.signalReady?.();
  });
});
