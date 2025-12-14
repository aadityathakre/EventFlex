import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { adminRegister } from '../../api/admin';

const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await adminRegister({
        email,
        password,
      });

      console.log('Admin registration successful:', response.data);

      alert('Admin account created successfully! Please login.');
      navigate('/admin/login');
    } catch (err) {
      console.error('Admin registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 rounded-2xl px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-black mb-2">
          Event Flex
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Admin Portal - Create your account
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Admin Email"
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
              placeholder="Password (min 8 characters)"
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

          {/* Confirm Password with toggle */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              placeholder="Confirm Password"
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

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-black text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an admin account?{" "} <br />
          <span onClick={() => navigate("/admin/login")} className="cursor-pointer text-black hover:underline">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
