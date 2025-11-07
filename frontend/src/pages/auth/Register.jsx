import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useThemeStore from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { PartyPopper, Megaphone, UserCog, Eye, EyeOff } from 'lucide-react';
import { defaultAvatars } from '../../utils/defaultAvatars';

const Register = () => {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const getRoleFromQuery = () => {
    try {
      const q = new URLSearchParams(location.search);
      const r = q.get('role');
      if (r === 'host' || r === 'organizer' || r === 'gig') return r;
    } catch (e) {
      // ignore
    }
    return 'gig';
  };

  const [selectedRole, setSelectedRole] = useState(getRoleFromQuery());
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  ];

  useEffect(() => {
    // if query param changes, update selected role
    const q = new URLSearchParams(location.search);
    const r = q.get('role');
    if (r && (r === 'host' || r === 'organizer' || r === 'gig')) {
      setSelectedRole(r);
    }
  }, [location.search]);

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
      // Validate required fields
      const requiredFields = {
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: selectedRole,
        first_name: data.first_name,
        last_name: data.last_name
      };

      // Check if any required field is missing
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('role', selectedRole);
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('avatar', defaultAvatars[selectedRole]);
      formData.append('wallet_address', '');

      // Register via auth store (includes api call)
      const registerResponse = await auth.register(formData);
      console.debug('registerResponse', registerResponse);
      
      // If we have a user object, registration worked
      if (registerResponse?.data?.user) {
        // Now try to login with the same credentials
        const loginResponse = await auth.login({ 
          email: data.email, 
          password: data.password 
        });
        console.debug('loginResponse', loginResponse);
        
        if (loginResponse?.data?.user) {
          // Login worked, redirect to dashboard
          toast.success('Registration successful');
          navigate(`/dashboard/${selectedRole}`);
          return;
        }
      }
        
      // If we get here, registration worked but login failed
      toast.success('Registration completed, please login');
      navigate('/login');
        
    } catch (error) {
      console.error('Registration error:', error);
      // Log detailed error information
      if (error.response) {
        // Server responded with error
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        toast.error(error.response.data?.message || 'Registration failed: Server error');
      } else if (error.request) {
        // Request made but no response
        console.error('No response received:', error.request);
        toast.error('Registration failed: No response from server');
      } else {
        // Request setup error
        console.error('Request error:', error.message);
        toast.error('Registration failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 dark:bg-dark-bg bg-light-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-1">
            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="text-base font-bold dark:text-white text-gray-900">EventFlex</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="p-1 rounded border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </button>
            <Link to="/login" className="btn btn-outline text-xs py-1 px-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-teal text-xs py-1 px-2">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-2xl mx-auto px-3 py-2 flex flex-col">
          <div className="card flex-1 p-3 flex flex-col">
            {/* Role Selection */}
            <div className="mb-2">
              <h1 className="text-xl font-bold dark:text-white text-gray-900 mb-0.5">
                Join EventFlex
              </h1>
              <p className="text-gray-400 text-xs mb-2">
                Select your role to begin your journey.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {roles.map((roleItem) => {
                  const Icon = roleItem.icon;
                  const isSelected = selectedRole === roleItem.id;
                  return (
                    <button
                      key={roleItem.id}
                      onClick={() => setSelectedRole(roleItem.id)}
                      className={`card p-2 text-center transition-all ${
                        isSelected
                          ? 'border-2 border-purple-500 dark:border-purple-500'
                          : 'border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className={`w-6 h-6 ${roleItem.color} rounded mx-auto mb-1 flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h3 className="font-bold dark:text-white text-gray-900 text-xs">{roleItem.label}</h3>
                      <p className="text-[10px] dark:text-gray-400 text-gray-600 leading-tight">{roleItem.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 flex-1 overflow-auto">
              <div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium dark:text-white text-gray-900 mb-0.5">First name</label>
                    <input
                      {...register('first_name', { required: 'First name is required' })}
                      type="text"
                      className="input py-1 text-xs h-7"
                      placeholder="First name"
                    />
                    {errors.first_name && (
                      <p className="text-[10px] text-red-500 mt-0.5">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium dark:text-white text-gray-900 mb-0.5">Last name</label>
                    <input
                      {...register('last_name', { required: 'Last name is required' })}
                      type="text"
                      className="input py-1 text-xs h-7"
                      placeholder="Last name"
                    />
                    {errors.last_name && (
                      <p className="text-[10px] text-red-500 mt-0.5">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-medium dark:text-white text-gray-900 mb-0.5">Phone number</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">+91</span>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian phone number' },
                      })}
                      type="tel"
                      className="input pl-8 py-1 text-xs h-7"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 mt-0.5">{errors.phone.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Password</label>
                    <div className="relative">
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 5, message: 'Password must be at least 5 characters' },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
                            message: 'Password must contain uppercase, lowercase, number and special character',
                          },
                        })}
                        type={showPassword ? "text" : "password"}
                        className="input pr-10"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        {...register('confirm_password', {
                          required: 'Please confirm your password',
                          validate: (value) => value === watch('password') || 'Passwords do not match',
                        })}
                        type={showConfirmPassword ? "text" : "password"}
                        className="input pr-10"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirm_password.message}</p>
                    )}
                  </div>
                </div>

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

                <div className="mb-2">
                  <label className="block text-xs font-medium dark:text-white text-gray-900 mb-0.5">
                    Enter 4-digit OTP (demo)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="input py-1 text-xs h-7"
                    placeholder="1234"
                  />
                  <p className="text-[10px] dark:text-gray-400 text-gray-600 mt-0.5">
                    Demo only: any 4-digit number is accepted.
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <button type="submit" disabled={loading} className="btn btn-orange py-1.5 text-xs w-full">
                  {loading ? 'Verifying...' : 'Create Account'}
                </button>

                <p className="text-center text-[10px] dark:text-gray-400 text-gray-600 mt-1">
                  Already have an account?{' '}
                  <Link to="/login" className="text-teal hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;