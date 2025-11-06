import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize theme
const theme = localStorage.getItem('theme-storage');
if (theme) {
  const parsed = JSON.parse(theme);
  if (parsed.state?.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
} else {
  // Default to dark theme
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

