import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';
import { Bell } from 'lucide-react';

const Layout = ({ children, role }) => {
  const { user } = useAuthStore();
  const userRole = role || user?.role;

  return (
    <div className="flex h-screen dark:bg-dark-bg bg-light-bg">
      <Sidebar role={userRole} />
      <div className="flex-1 ml-64 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
