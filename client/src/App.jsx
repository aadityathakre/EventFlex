import { useState } from "react";
import "./app.css";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Razorpay from "./pages/razorpay.jsx";

export const serverURL = `${import.meta.env.VITE_SERVER_URL}:${import.meta.env.VITE_PORT}/api/v1`;

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/register', '/login', '/forgot-password'].includes(location.pathname);

  return (
    <div className="relative">
      {/* Always render Home, but blur it when auth pages are open */}
      <div className={isAuthPage ? "blur-sm pointer-events-none select-none" : ""}>
        <Home />
      </div>
      
      {/* Render auth pages as modals on top */}
      {isAuthPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => navigate("/")}></div>
          <div className="relative z-10 w-full max-w-lg">
            {location.pathname === '/register' && <Register />}
            {location.pathname === '/login' && <Login />}
            {location.pathname === '/forgot-password' && <ForgotPassword />}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/register' element={<AppContent/>} />
      <Route path='/login' element={<AppContent/>} />
      <Route path='/forgot-password' element={<AppContent/>} />
      <Route path='/razorpay' element={<Razorpay/>} />
    </Routes>
  );
}

export default App;
