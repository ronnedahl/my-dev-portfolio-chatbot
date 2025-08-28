/**
 * Main entry point for PeterBot AI Chat React Application
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Error boundary for the entire application
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found. Check that your HTML has a div with id="root".')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)