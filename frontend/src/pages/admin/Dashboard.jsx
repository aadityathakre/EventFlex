import Layout from '../../components/Layout';
import { Users, Shield, DollarSign, FileText } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Users className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending KYC</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Shield className="w-12 h-12 text-yellow-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹0.00</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <FileText className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

