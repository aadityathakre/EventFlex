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
import { gigService } from '../services/apiServices';
import { defaultAvatars } from '../utils/defaultAvatars';

const Sidebar = ({ role, mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [pools, setPools] = useState([]);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [joining, setJoining] = useState({});

  useEffect(() => {
    // Initialize theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch a short list of organizer-created pools for the gig sidebar
  useEffect(() => {
    let mounted = true;
    const fetchPools = async () => {
      try {
        const res = await gigService.getPools();
        if (!mounted) return;
        // gigService.getPools uses a transformResponse that returns the array itself
        setPools(res || []);
      } catch (err) {
        console.error('Failed to load pools for sidebar', err);
      } finally {
        if (mounted) setPoolsLoading(false);
      }
    };
    if (role === 'gig') fetchPools();
    return () => { mounted = false; };
  }, [role]);

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
        { path: `/dashboard/${role}/organizers`, label: 'Organizers', icon: Users },
        { path: `/dashboard/${role}/payments`, label: 'Payment & Contracts', icon: CreditCard },
        { path: `/dashboard/${role}/reviews`, label: 'Ratings & Reviews', icon: Star },
      ];
    } else if (role === 'gig') {
      return [
        ...commonItems,
        { path: `/dashboard/${role}/gigs`, label: 'My Events', icon: Briefcase },
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
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 h-screen fixed left-0 top-0 dark:bg-dark-sidebar bg-light-sidebar border-r border-gray-200 dark:border-gray-700 flex-col">
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
        {/* No pools list in sidebar */}
        <Link
          to="/help"
          className="sidebar-link"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help & Support</span>
        </Link> 

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
          <Link to={`/dashboard/${role}/profile`} className="block">
            <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal transition-all">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.first_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/dashboard/${role}/profile`} className="block">
              <p className="text-sm font-medium dark:text-white text-gray-900 truncate hover:text-teal transition-colors">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs dark:text-gray-400 text-gray-600 capitalize">{role}</p>
            </Link>
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

      {/* Mobile overlay sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div className={`absolute inset-0 bg-black/40 ${mobileOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`} onClick={onClose} />
        <div className={`absolute left-0 top-0 h-full w-64 dark:bg-dark-sidebar bg-light-sidebar border-r border-gray-200 dark:border-gray-700 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}> 
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal rounded flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-lg font-bold">EventFlex</span>
            </div>
            <button onClick={onClose} className="p-2">Close</button>
          </div>
          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-96px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== `/dashboard/${role}` && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

