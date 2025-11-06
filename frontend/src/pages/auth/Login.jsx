import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful!');
      const user = useAuthStore.getState().user;
      navigate(`/dashboard/${user?.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-teal rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold dark:text-white text-gray-900">EventFlex</span>
          </Link>
          <h2 className="text-center text-3xl font-bold dark:text-white text-gray-900">
            Sign in to EventFlex
          </h2>
          <p className="mt-2 text-center text-sm dark:text-gray-400 text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-teal hover:text-teal-dark">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
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
              <label htmlFor="password" className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 5, message: 'Password must be at least 5 characters' } })}
                type="password"
                className="input"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-teal text-lg py-3"
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
