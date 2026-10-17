import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard.jsx';
import './dashboard.css';
import './disclosures.css';
import './sidebar.css';
import './tabs.css';
import './personal.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
);
