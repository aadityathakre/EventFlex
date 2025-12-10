import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { serverURL } from "../App";
import axios from "axios";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [checkNewPassword, setCheckNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // states for eye toggle
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (email) => {
    try {
      await axios.post(
        `${serverURL}/auth/users/send-otp`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
    } catch (err) {
      console.log("Send OTP error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submit
    setLoading(true);

    try {
      await handleSendOTP(email);
    } finally {
      setLoading(false); // re-enable after request completes
    }
  };

  // Step 2: Verify OTP
  const handleCheckOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${serverURL}/auth/users/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setStep(3);
    } catch (err) {
      console.log("Verify OTP error:", err.response?.data);
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  // Step 3: Reset Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== checkNewPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      await axios.post(
        `${serverURL}/auth/users/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.log("Reset error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-black mb-2">
          Event Flex
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {step === 1 && "Enter your email to reset password"}
          {step === 2 && "Enter the OTP sent to your email"}
          {step === 3 && "Set your new password"}
        </p>
        {error && <p className="text-black text-sm mb-4">{error}</p>}

        {/* Step 1: Email */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={onSubmit}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800 cursor-pointer"}`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form className="space-y-4" onSubmit={handleCheckOtp}>
            <input
              type="text"
              required
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form className="space-y-4" onSubmit={handleUpdatePassword}>
            {/* New Password with eye */}
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(""); // clear error when typing
                }}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none pr-10"
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <AiOutlineEyeInvisible className="text-xl" />
                ) : (
                  <AiOutlineEye className="text-xl" />
                )}
              </span>
            </div>

            {/* Confirm Password with eye */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm Password"
                value={checkNewPassword}
                onChange={(e) => {
                  setCheckNewPassword(e.target.value);
                  setError(""); // clear error when typing
                }}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-300 focus:outline-none pr-10"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible className="text-xl" />
                ) : (
                  <AiOutlineEye className="text-xl" />
                )}
              </span>
            </div>

            {/* Error message */}
            {error && <p className="text-black text-sm">{error}</p>}

            <button className="bg-black text-white hover:bg-gray-800 cursor-pointer w-full font-semibold py-2 px-4 rounded-lg shadow-md">
              Update password
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div
          className="text-right cursor-pointer text-black hover:underline mt-4"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;