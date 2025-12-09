import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { redirect, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { set } from "mongoose";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("gig");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

const handleRegister = async (e) => {
  e.preventDefault(); // prevent page reload
  try {
    const result = await axios.post(
      `${serverURL}/auth/users/register`,
      { first_name, last_name, email, password, phone, role },
      { withCredentials: true }
    );

    setEmail("");
    setFirst_name("");
    setLast_name("");
    setPassword("");
    setPhone("");
    setRole("gig");
    if (result.status === 200) {
      console.log("Registration successful:", result.data);
      navigate("/login");
    } else {
      console.log("Unexpected response:", result);
    }
  } catch (error) {
    setErr(error.response.data.message  || "Registration failed");
    console.error("Registration error:", error.response?.data || error.message);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-200 to-red-200 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-red-600 mb-2">
          Event Flex
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Create your account and join us today!
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegister}>

         <select
            name="role"
            onChange={(e) => {
              if(e.target.value!="selectRole"){
                setRole(e.target.value)
              }}
            }
            value={role}
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          >
           
            <option value="gig">GIG</option>
            <option value="organizer">Organizer</option>
            <option value="host">Host</option>
          </select>

          <input
            type="text"
            name="first_name"
            required
            onChange={(e) => setFirst_name(e.target.value)}
            value={first_name}
            placeholder="First Name"
            className="w-1/2 px-4 py-2 m-auto m-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
            <input
            type="text"
            name="last_name"
            required
            onChange={(e) => setLast_name(e.target.value)}
            value={last_name}
            placeholder="Last Name"
            className="w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />

          <input
            type="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
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
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-red-500"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-xl" />
              ) : (
                <AiOutlineEye className="text-xl" />
              )}
            </span>
          </div>

          <input
            type="tel"
            name="phone"
            required
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
         

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-500 text-white cursor-pointer font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
          >
            Register
          </button>
          {err && <p className="text-red-500 text-center">{err}</p>}
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-red-500 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;