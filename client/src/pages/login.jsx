import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { redirect, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {auth} from "../../firebase.js"

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();


 const handleGoogleAuth = async (e)=>{
     const provider = new GoogleAuthProvider()
     const data = await signInWithPopup(auth, provider)
  try {
      const result = await axios.post( `${serverURL}/auth/users/google-auth`, {
       email:data.user.email,
      },{withCredentials:true})
      setEmail("");
      setPassword("");
      navigate("/register");
      console.log(result)
     } catch (error) {
      
    console.log(error.message)
   }
  }

  const handleLogin= async (e) => {
  e.preventDefault(); // prevent page reload
  try {
    const result = await axios.post(
      `${serverURL}/auth/users/login`,
      {email, password },
      { withCredentials: true }
    );
    setEmail("");
    setPassword("");
    console.log("Login successful:", result.data);
    navigate("/register");
    
  } catch (error) {
    console.log("Login error:", error.response?.data || error.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 rounded-2xl px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl  shadow-2xl p-8">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-black mb-2">
          Event Flex
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Login to your account and explore events!
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          className="w-full flex cursor-pointer items-center justify-center gap-3 border border-gray-300 rounded-lg shadow-md py-2 px-4 bg-white hover:bg-gray-50 transition-all duration-300 mb-6" onClick={handleGoogleAuth}
        >
          <FcGoogle className="text-2xl" />
          <span className="text-gray-700 font-medium">Login with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />

          {/* Password with toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-600"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-xl" />
              ) : (
                <AiOutlineEye className="text-xl" />
              )}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-black text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300"
          >
            Login
          </button>
          {err && <p className="text-black text-sm mt-2">{err}</p>}
        </form>
        
        <div className="flex justify-end">
  <span
    className="cursor-pointer text-sm text-black hover:underline"
    onClick={() => navigate("/forgot-password")}
  >
    Forget Password
  </span>
</div>


        {/* Footer */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          Don’t have an account?{" "} <br />
          <span onClick={() => navigate("/register")} className="cursor-pointer text-black hover:underline">
            Register here 
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;