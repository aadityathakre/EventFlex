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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Your Next Event */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Create Your Next Event</h2>
                <Link to="/dashboard/host/events" className="text-teal hover:underline">
                  Continue →
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white text-gray-900">Event Details</p>
                    <p className="text-sm text-green-500">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white text-gray-900">Find an Organizer</p>
                    <p className="text-sm text-orange">Current Step</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-gray-400 text-gray-600">Finalize & Pay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Events */}
            <div className="card">
              <div className="flex gap-4 mb-4">
                <button className="px-4 py-2 bg-teal text-white rounded-lg font-medium">
                  Active
                </button>
                <button className="px-4 py-2 dark:text-gray-400 text-gray-600 rounded-lg font-medium">
                  Completed
                </button>
              </div>
              <div className="space-y-4">
                {activeEvents.map((event) => (
                  <div key={event._id} className="p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="badge badge-success mb-2">Active</span>
                        <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm dark:text-gray-400 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                      </div>
                    </div>
                    <Link to={`/dashboard/host/events/${event._id}`} className="text-teal hover:underline text-sm">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Reputation & Reviews */}
          <div className="space-y-6">
            {/* Reputation Overview */}
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">
                Reputation Overview
              </h2>

              {/* Badges */}
              <div className="mb-6">
                <h3 className="text-sm font-medium dark:text-white text-gray-900 mb-3">Your Badges</h3>
                <div className="space-y-2">
                  {reputation.badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`badge ${
                        index === 0 ? 'bg-green-500' : 'bg-orange'
                      } text-white px-3 py-2`}
                    >
                      {badge === 'Verified Host' && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {badge === 'Trusted Event Creator' && (
                        <Star className="w-4 h-4 mr-2" />
                      )}
                      {badge}
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Rating */}
              <div>
                <h3 className="text-sm font-medium dark:text-white text-gray-900 mb-2">
                  Community Rating
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold dark:text-white text-gray-900">
                    {reputation.rating}
                  </span>
                  <span className="text-gray-400">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(reputation.rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : i < reputation.rating
                          ? 'text-yellow-500 fill-yellow-500 opacity-50'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Based on {reputation.reviews} reviews from Organizers & Gig Workers.
                </p>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">
                Recent Reviews
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                    "Excellent Collaboration"
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">
                    Anil was a pleasure to work with. Very clear communication...
                  </p>
                  <p className="text-xs dark:text-gray-500 text-gray-500">
                    by Priya (Organizer) for Tech Summit 2024
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                    "Professional & Organized"
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">
                    The event was a success. The host was very professional.
                  </p>
                  <p className="text-xs dark:text-gray-500 text-gray-500">
                    by Rohan (Gig Worker) for Indie Music Fest
                  </p>
                </div>
              </div>
              <Link to="/dashboard/host/reviews" className="text-teal hover:underline text-sm mt-4 inline-block">
                View All Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostDashboard;
