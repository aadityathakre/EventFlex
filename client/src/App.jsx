import { useState } from "react";
import "./app.css";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import { Router, Routes, Route } from "react-router-dom";
import Razorpay from "./pages/razorpay.jsx";
import Landing from "./pages/Landing.jsx";
import GigDashboard from "./pages/gig/Dashboard.jsx";

export const serverURL = "http://localhost:8080/api/v1";

function App() {
  return (
    < Routes>

      <Route path="/" element={<Landing />} />

      <Route path='/register' element={<Register/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/forgot-password' element={<ForgotPassword/>} />
      {/* Add other routes here */}
      <Route path='/razorpay' element={<Razorpay/>} />
      
      {/* Gig pages */}
      <Route path="/gig/" element={<GigDashboard />} />

    </Routes>
  );
}

export default App;
