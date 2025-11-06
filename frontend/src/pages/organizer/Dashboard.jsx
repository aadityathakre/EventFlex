import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Users, Plus, MapPin, Calendar, Edit, Trash2, Upload, MoreVertical, Search, FileText, Signal, CheckCircle } from 'lucide-react';
import { organizerService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const OrganizerDashboard = () => {
  const [pools, setPools] = useState([]);
  const [events, setEvents] = useState([]);
  const [nearbyTalent, setNearbyTalent] = useState([]);
  const [searchParams, setSearchParams] = useState({
    skill: '',
    location: 'Mumbai, IN',
    maxPrice: '500',
    minRating: '4.5+ Stars'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pools (mock data for now - will integrate with backend)
      setPools([
        { _id: '1', name: 'Tech Conference Crew', location: 'Mumbai', members: 15 },
        { _id: '2', name: 'Festival Volunteers', location: 'Goa', members: 10 },
      ]);
      
      // Fetch events
      const eventsData = await organizerService.getEventDetails?.('event-id') || [];
      setEvents([
        { _id: '1', title: 'Corporate Gala Dinner', date: 'Dec 15, 2023', location: 'Delhi' },
        { _id: '2', title: 'Startup Expo 2024', date: 'Jan 20-22, 2024', location: 'Bangalore' },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFindTalent = async () => {
    try {
      // This would call a backend API for talent search
      setNearbyTalent([
        { _id: '1', name: 'Riya Sharma', role: 'Bartender', rate: '450/hr', rating: '4.9', avatar: '' },
        { _id: '2', name: 'Arjun Verma', role: 'Security', rate: '400/hr', rating: '4.8', avatar: '' },
        { _id: '3', name: 'Priya Patel', role: 'Hostess', rate: '480/hr', rating: '4.8', avatar: '' },
      ]);
      toast.success('Found 3 talent matches');
    } catch (error) {
      console.error('Failed to search talent', error);
    }
  };

  return (
    <Layout role="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Organizer Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="btn btn-teal">
              <Plus className="w-4 h-4" />
              Create Pool
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Gig Pools */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">My Gig Pools</h2>
                <Link to="/dashboard/organizer/pools" className="btn btn-teal">
                  <Users className="w-4 h-4" />
                  Create Pool
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {pools.map((pool) => (
                  <div key={pool._id} className="card p-4">
                    <h3 className="font-semibold dark:text-white text-gray-900 mb-2">{pool.name}</h3>
                    <p className="text-sm dark:text-gray-400 text-gray-600 mb-3">{pool.location}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-400 border-2 border-dark-card dark:border-dark-bg"></div>
                        ))}
                      </div>
                      <span className="text-xs dark:text-gray-400 text-gray-600 bg-dark-card dark:bg-dark-bg px-2 py-1 rounded-full">
                        +{pool.members - 3}
                      </span>
                    </div>
                    <button className="btn btn-orange w-full text-sm">
                      Manage
                    </button>
                  </div>
                ))}
                <div className="card p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600">
                  <Plus className="w-12 h-12 dark:text-gray-400 text-gray-600 mb-2" />
                  <span className="text-sm dark:text-gray-400 text-gray-600">Add New Pool</span>
                </div>
              </div>
            </div>

            {/* Manage Gigs */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Manage Gigs</h2>
                <button className="btn btn-teal">
                  <Plus className="w-4 h-4" />
                  Add Gig
                </button>
              </div>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold dark:text-white text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm dark:text-gray-400 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          @ {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 btn-orange rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Management */}
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Document Management</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">Staff_Agreement.pdf</p>
                      <p className="text-sm dark:text-gray-400 text-gray-600">Status: Signed</p>
                    </div>
                  </div>
                  <button>
                    <MoreVertical className="w-5 h-5 dark:text-gray-400 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-orange" />
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">NDA_Form.pdf</p>
                      <p className="text-sm dark:text-gray-400 text-gray-600">Status: Pending Signature</p>
                    </div>
                  </div>
                  <button>
                    <MoreVertical className="w-5 h-5 dark:text-gray-400 text-gray-600" />
                  </button>
                </div>
              </div>
              <button className="btn btn-outline w-full mt-4">
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>

            {/* Live Event Tracking */}
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Live Event Tracking</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Signal className="w-6 h-6 text-teal" />
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">Corporate Gala Dinner</p>
                      <p className="text-sm dark:text-gray-400 text-gray-600">85% Staff Checked-in</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-teal h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 dark:text-gray-400 text-gray-600" />
                    <div>
                      <p className="font-medium dark:text-white text-gray-900">Startup Expo 2024</p>
                      <p className="text-sm dark:text-gray-400 text-gray-600">Event not started</p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn btn-orange w-full mt-4">
                Monitor Attendance
              </button>
            </div>
          </div>

          {/* Right Column - Nearby Talent Search */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Nearby Talent Search</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Skill / Role</label>
                  <input
                    type="text"
                    value={searchParams.skill}
                    onChange={(e) => setSearchParams({ ...searchParams, skill: e.target.value })}
                    placeholder="e.g., Bartender, AV Technician"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-600" />
                    <input
                      type="text"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Max Price (₹/hr)</label>
                    <input
                      type="number"
                      value={searchParams.maxPrice}
                      onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Min Rating</label>
                    <select
                      value={searchParams.minRating}
                      onChange={(e) => setSearchParams({ ...searchParams, minRating: e.target.value })}
                      className="input"
                    >
                      <option>4.5+ Stars</option>
                      <option>4.0+ Stars</option>
                      <option>3.5+ Stars</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleFindTalent} className="btn btn-teal w-full">
                  <Search className="w-4 h-4" />
                  Find Talent
                </button>
              </div>

              {nearbyTalent.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                    Search Results ({nearbyTalent.length})
                  </h3>
                  <div className="space-y-3">
                    {nearbyTalent.map((talent) => (
                      <div key={talent._id} className="flex items-center gap-3 p-3 dark:bg-dark-bg bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-gray-400"></div>
                        <div className="flex-1">
                          <p className="font-medium dark:text-white text-gray-900">{talent.name}</p>
                          <p className="text-sm dark:text-gray-400 text-gray-600">
                            {talent.role} | ₹{talent.rate}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm dark:text-white text-gray-900">{talent.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerDashboard;
