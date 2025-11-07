import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Search, Eye, Scale, Bell, BarChart } from 'lucide-react';
import { adminService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const Dispute = () => {
  const [verifications, setVerifications] = useState([
    { _id: '1', name: 'Olivia Bennett', role: 'Event Organizer', date: '2023-02-20', status: 'Pending Review', message:'host se ladai ho gyi', verify:'verify' },
    { _id: '2', name: 'Ethan Hayes', role: 'Gig Worker', date: '2023-02-19', status: 'Pending Review', message:'host ne paise ni diye', verify:'verify'},
    { _id: '3', name: 'James Rodriguez', role: 'Event Organizer', date: '2023-02-18', status: 'Rejected', message:'organizer badhiya tha ', verify:'disable' },
    { _id: '4', name: 'Sophia Chen', role: 'Gig Worker', date: '2023-02-17', status: 'Approved', message:'lavel sbke niklenge', verify:'verified'},
  ]);
  const [disputes, setDisputes] = useState([
    { id: '3456', parties: 'Event Host vs. Gig Worker', status: 'Urgent', priority: 'high' },
    { id: '3455', parties: 'Organizer vs. Event Host', status: 'Reviewing', priority: 'medium' },
  ]);
  const [analytics, setAnalytics] = useState({
    totalUsers: { value: '12,456', change: '+5%', positive: true },
    activeEvents: { value: '890', change: '+12%', positive: true },
    disputesRaised: { value: '42', change: '-3%', positive: false },
    platformRevenue: { value: '₹1.2 Cr', change: '+8%', positive: true },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Review':
        return 'badge-pending';
      case 'Rejected':
        return 'badge-rejected';
      case 'Approved':
        return 'badge-approved';
      default:
        return 'badge-info';
    }
  };

  return (
    <Layout role="admin">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Verification Approval</h1>

            {/* Verification Queue */}
            <div>
              <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Verification Queue</h2>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search by name, ID..."
                    className="input pl-10"
                  />
                </div>
                <button className="btn btn-outline">
                  Filter by Role
                  <span className="ml-2">▼</span>
                </button>
              </div>

              {/* Verification Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">USER</th>
                      <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">ROLE</th>
                      <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">SUBMISSION DATE</th>
                      <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">STATUS</th>
                      <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">ACTIONS</th>
                      <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">VERIFY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((verification) => (
                      <tr key={verification._id} className="border-b border-gray-200 dark:border-gray-700 hover:dark:bg-dark-bg hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium dark:text-white text-gray-900">{verification.name}</td>
                        <td className="py-4 px-4 dark:text-gray-300 text-gray-700">{verification.role}</td>
                        <td className="py-4 px-4 dark:text-gray-300 text-gray-700">{verification.date}</td>
                        <td className="py-4 px-4">
                          <span className={`badge ${getStatusBadge(verification.status)}`}>
                            {verification.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="btn btn-outline text-sm" onClick={() => toast.success(verification.message)}>
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${getStatusBadge(verification.verify)}`}>
                            {verification.verify}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Dispute Resolution */}
          <div className="card">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Dispute Resolution</h2>
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">Case #{dispute.id}</p>
                      <p className="text-sm dark:text-gray-400 text-gray-600">{dispute.parties}</p>
                    </div>
                    <span className={`text-xs font-medium ${
                      dispute.status === 'Urgent' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                  <button className={`btn w-full text-sm ${
                    dispute.status === 'Urgent' ? 'btn-teal' : 'btn-yellow'
                  }`}>
                    {dispute.status === 'Urgent' ? 'Open' : 'View'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications & Broadcast */}
          <div className="card">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Notifications & Broadcast</h2>
            <textarea
              placeholder="Compose a message..."
              className="input h-24 mb-3 resize-none"
            />
            <div className="flex gap-2">
              <button className="btn btn-yellow flex-1">
                Broadcast
              </button>
              <button className="btn btn-teal flex-1">
                Send to User
              </button>
            </div>
          </div>

          {/* Platform Analytics */}
          <div className="card">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">Platform Analytics</h2>
            <div className="space-y-3">
              {Object.entries(analytics).map(([key, data]) => (
                <div key={key} className="p-3 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold dark:text-white text-gray-900">{data.value}</p>
                    <span className={`text-sm font-medium ${
                      data.positive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {data.change}
                    </span>
                  </div>
                  <p className="text-xs dark:text-gray-500 text-gray-500 mt-1">this month</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dispute;

