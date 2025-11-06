import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful!');
      const user = useAuthStore.getState().user;
      navigate(`/dashboard/${user?.role}`);
    } catch (error) {
      console.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] dark:bg-dark-bg bg-light-bg flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold dark:text-white text-gray-900">EventFlex</span>
          </Link>
          <h2 className="text-center text-2xl font-bold dark:text-white text-gray-900">
            Sign in to EventFlex
          </h2>
          <p className="mt-2 text-center text-sm dark:text-gray-400 text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-teal hover:text-teal-dark">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium dark:text-white text-gray-900 mb-1">
                Email address
              </label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                type="email"
                className="input"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium dark:text-white text-gray-900 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 5, message: 'Password must be at least 5 characters' } })}
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-teal py-2.5"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
