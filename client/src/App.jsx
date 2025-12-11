import { useState } from "react";
import "./app.css";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import { Router, Routes, Route } from "react-router-dom";
import Razorpay from "./pages/razorpay.jsx";

export const serverURL = `${import.meta.env.VITE_SERVER_URL}:${import.meta.env.VITE_PORT}/api/v1`;

function App() {
  return (
    < Routes>
      <Route path='/register' element={<Register/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/forgot-password' element={<ForgotPassword/>} />
      {/* Add other routes here */}
      <Route path='/razorpay' element={<Razorpay/>} />

    </Routes>
  );
}

export default App;
