import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../src/styles.scss';
import './App.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
