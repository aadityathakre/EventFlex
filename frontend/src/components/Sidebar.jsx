import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, FileText, 
  MessageSquare, Star, Settings, HelpCircle, 
  Bell, LogOut, Briefcase, Wallet, GraduationCap,
  Search, CreditCard, Shield, Scale, BarChart,
  UserCircle, Moon, Sun
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { useState, useEffect } from 'react';
import Login  from '../pages/auth/Login.jsx';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    await navigate('/login');
  };

  const getNavItems = () => {
    const commonItems = [
      { path: `/dashboard/${role}`, label: 'Dashboard', icon: LayoutDashboard },
      { path: `/dashboard/${role}/messages`, label: 'Messages', icon: MessageSquare },
    ];

    if (role === 'organizer') {
      return [
        ...commonItems,
        { path: `/dashboard/${role}/pools`, label: 'Pools', icon: Users },
        { path: `/dashboard/${role}/gigs`, label: 'Gigs', icon: Calendar },
        { path: `/dashboard/${role}/documents`, label: 'Documents', icon: FileText },
        { path: `/dashboard/${role}/tracking`, label: 'Tracking', icon: Search },
      ];
    } else if (role === 'host') {
      return [
        ...commonItems,
        { path: `/dashboard/${role}/events`, label: 'Create New Event', icon: Calendar },
        { path: `/dashboard/${role}/manage-events`, label: 'Manage Events', icon: FileText },
        { path: `/dashboard/${role}/payments`, label: 'Payment & Contracts', icon: CreditCard },
        { path: `/dashboard/${role}/reviews`, label: 'Ratings & Reviews', icon: Star },
      ];
    } else if (role === 'gig') {
      return [
        ...commonItems,
        { path: `/dashboard/${role}/gigs`, label: 'My Gigs', icon: Briefcase },
        { path: `/dashboard/${role}/skills`, label: 'My Skills', icon: GraduationCap },
        { path: `/dashboard/${role}/wallet`, label: 'Wallet', icon: Wallet },
        { path: `/dashboard/${role}/pools`, label: 'Organizer Pools', icon: Users },
      ];
    } else if (role === 'admin') {
      return [
        { path: `/${role}/dashboard/verification`, label: 'Verification', icon: Shield },
        { path: `/${role}/dashboard/disputes`, label: 'Disputes', icon: Scale },
        { path: `/${role}/dashboard/notifications`, label: 'Notifications', icon: Bell },
        { path: `/${role}/dashboard/analytics`, label: 'Analytics', icon: BarChart },
      ];
    }
    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 h-screen fixed left-0 top-0 dark:bg-dark-sidebar bg-light-sidebar border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to={`/dashboard/${role}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold dark:text-white text-gray-900">EventFlex</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== `/dashboard/${role}` && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 
          ${isActive
                  ? 'bg-teal text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>


      {/* Help & User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* <Link
          to="/help"
          className="sidebar-link"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help & Support</span>
        </Link> */}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="sidebar-link w-full"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5" />
              <span>Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span>Dark Theme</span>
            </>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.first_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium dark:text-white text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs dark:text-gray-400 text-gray-600 capitalize">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-card rounded"
          >
            <LogOut className="w-4 h-4 dark:text-gray-400 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

