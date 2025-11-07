import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';
import { Bell, Menu } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children, role }) => {
  const { user } = useAuthStore();
  const userRole = role || user?.role;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen dark:bg-dark-bg bg-light-bg">
      <Sidebar role={userRole} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64">
        {/* Mobile top bar */}
        <div className="lg:hidden border-b dark:border-gray-800 border-gray-200 p-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        <main className="p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
