import { useState } from "react";
import "./app.css";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import { Router, Routes, Route } from "react-router-dom";

export const serverURL = "http://localhost:8080/api/v1";

function App() {
  return (
    < Routes>
      <Route path='/register' element={<Register/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/forgot-password' element={<ForgotPassword/>} />
    
    </Routes>
  );
}

export default App;
