import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { CheckCircle, Pencil, Lock, Calendar, Star, ArrowRight } from 'lucide-react';
import { hostService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const HostDashboard = () => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [reputation, setReputation] = useState({
    rating: 4.7,
    reviews: 89,
    badges: ['Verified Host', 'Trusted Event Creator'],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await hostService.getHostEvents();
      setActiveEvents(data.data || [
        {
          _id: '1',
          title: 'Tech Summit 2024',
          description: 'A conference for leading minds in technology and innovation.',
          date: 'Aug 15-17, 2024',
          status: 'active',
        },
        {
          _id: '2',
          title: 'Indie Music Fest',
          description: 'Celebrating independent artists from across India.',
          date: 'Sep 05, 2024',
          status: 'active',
        },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Layout role="host">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Host Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2">
              <div className="w-2 h-2 bg-teal rounded-full absolute top-1 right-1"></div>
              <span className="text-gray-400">🔔</span>
            </button>
            <Link to="/dashboard/host/events" className="btn btn-teal">
              <span className="text-xl">+</span>
              Create New Event
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Quick Actions</h2>
                <Link to="/dashboard/host/events" className="text-sm text-teal hover:underline">Manage Events</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/dashboard/host/events/create" className="card p-3 hover:shadow-md">
                  <div className="font-medium">Create Event</div>
                  <div className="text-sm text-gray-500">Start a new event listing</div>
                </Link>
                <Link to="/dashboard/host/manage-events" className="card p-3 hover:shadow-md">
                  <div className="font-medium">Manage Events</div>
                  <div className="text-sm text-gray-500">View and edit your events</div>
                </Link>
                <Link to="/dashboard/host/organizers" className="card p-3 hover:shadow-md">
                  <div className="font-medium">Organizers</div>
                  <div className="text-sm text-gray-500">Invite / approve organizers</div>
                </Link>
                <Link to="/dashboard/host/payments" className="card p-3 hover:shadow-md">
                  <div className="font-medium">Payments</div>
                  <div className="text-sm text-gray-500">View escrow & payouts</div>
                </Link>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Upcoming Events</h2>
                <Link to="/dashboard/host/events" className="text-sm text-teal hover:underline">See all</Link>
              </div>
              <div className="space-y-4">
                {activeEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="p-3 dark:bg-dark-bg bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">{event.description}</p>
                        <div className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" />{event.date}</div>
                      </div>
                      <div className="text-right">
                        <Link to={`/dashboard/host/events/${event._id}`} className="text-teal hover:underline text-sm">Open</Link>
                      </div>
                    </div>
                  </div>
                ))}
                {activeEvents.length === 0 && <div className="text-sm text-gray-500">No upcoming events</div>}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Wallet & Reputation compact */}
          <div className="space-y-6">
            {/* Wallet / Payments summary */}
            <div className="card">
              <h2 className="text-lg font-bold mb-2">Wallet & Escrows</h2>
              <p className="text-sm text-gray-600 mb-3">Quick snapshot of your current balances and escrows.</p>
              <div className="space-y-2">
                <Link to="/dashboard/host/payments" className="flex items-center justify-between">
                  <span className="text-sm">View Escrows</span>
                  <span className="text-sm text-teal">Open</span>
                </Link>
                <Link to="/dashboard/host/wallet" className="flex items-center justify-between">
                  <span className="text-sm">Wallet Balance</span>
                  <span className="text-sm text-gray-600">—</span>
                </Link>
              </div>
            </div>

            {/* Reputation compact */}
            <div className="card">
              <h2 className="text-lg font-bold mb-2">Reputation</h2>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-2xl font-bold">{reputation.rating}</div>
                  <div className="text-sm text-gray-500">based on {reputation.reviews} reviews</div>
                </div>
                <div className="ml-auto">
                  <Link to="/dashboard/host/reviews" className="text-sm text-teal hover:underline">See reviews</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostDashboard;
