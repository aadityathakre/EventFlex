import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/axiosConfig.js' // Set axios credentials globally
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
<BrowserRouter>
  <AuthProvider>
    <App/>
  </AuthProvider>
</BrowserRouter>
)
