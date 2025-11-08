import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize theme before rendering
try {
  const theme = localStorage.getItem('theme-storage');
  if (theme) {
    const parsed = JSON.parse(theme);
    if (parsed.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    // Default to dark theme
    document.documentElement.classList.add('dark');
  }
} catch (error) {
  console.warn('Theme initialization error:', error);
  // Ensure dark theme is applied as fallback
  document.documentElement.classList.add('dark');
}

const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

