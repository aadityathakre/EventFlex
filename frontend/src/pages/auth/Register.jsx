import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { PartyPopper, Megaphone, UserCog, Shield } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { setState } = useAuthStore; // access store setter for mock registration
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('gig');
  const [otp, setOtp] = useState('');

  const roles = [
    {
      id: 'host',
      label: 'Host',
      icon: PartyPopper,
      description: 'Organize private events',
      color: 'bg-green-500',
    },
    {
      id: 'organizer',
      label: 'Organizer',
      icon: Megaphone,
      description: 'Manage large-scale events',
      color: 'bg-yellow-500',
    },
    {
      id: 'gig',
      label: 'Gig Worker',
      icon: UserCog,
      description: 'Find event-based work',
      color: 'bg-purple-500',
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Platform management',
      color: 'bg-red-500',
    },
  ];

  const onSubmit = async (data) => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    if (!/^[0-9]{4}$/.test(otp)) {
      toast.error('Enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Mock registration (no backend changes): accept any 4-digit OTP
      const mockUser = {
        _id: `mock_${Date.now()}`,
        email: data.email,
        role: selectedRole,
        first_name: 'User',
        last_name: '',
        universal_role_id: `user${Math.floor(Math.random() * 100000)}`,
        avatar: '',
      };
      // Persist locally to reuse existing auth flow
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('accessToken', 'mock-token');
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });

      toast.success('Email verified and account created');
      navigate(`/dashboard/${selectedRole}`);
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold dark:text-white text-gray-900">EventFlex</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-teal">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card max-w-2xl mx-auto">
          {/* Role Selection */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              Join EventFlex
            </h1>
            <p className="text-gray-400 mb-6">
              Select your role to begin your journey.
            </p>

            <div className="grid grid-cols-4 gap-4">
              {roles.map((roleItem) => {
                const Icon = roleItem.icon;
                const isSelected = selectedRole === roleItem.id;
                return (
                  <button
                    key={roleItem.id}
                    onClick={() => setSelectedRole(roleItem.id)}
                    className={`card p-4 text-center transition-all ${
                      isSelected
                        ? 'border-2 border-purple-500 dark:border-purple-500'
                        : 'border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className={`w-12 h-12 ${roleItem.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold dark:text-white text-gray-900 mb-1">{roleItem.label}</h3>
                    <p className="text-xs dark:text-gray-400 text-gray-600">{roleItem.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimal Email + OTP Verification */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">
                Verify your Email
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                  Email
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                  Enter 4-digit OTP (demo)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="input"
                  placeholder="1234"
                />
                <p className="text-xs dark:text-gray-400 text-gray-600 mt-2">
                  Demo only: any 4-digit number is accepted.
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-orange w-full text-lg">
              {loading ? 'Verifying...' : 'Create Account'}
            </button>

            <p className="text-center text-sm dark:text-gray-400 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
