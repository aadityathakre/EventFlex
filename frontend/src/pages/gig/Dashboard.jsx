import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { DollarSign, ArrowUpRight, Plus, GraduationCap, Shield, Building, Users, Search, MapPin, Calendar, Star, Award, QrCode } from 'lucide-react';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const GigDashboard = () => {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [skills, setSkills] = useState(['Bartending', 'Mixology', 'Crowd Management', 'Team Leadership', 'Communication']);
  const [certificates, setCertificates] = useState([
    { name: 'Certified Bartender', issuer: 'IBA Official | Blockchain Verified' },
    { name: 'Event Safety Certified', issuer: 'Event Management Institute' },
  ]);
  const [pools, setPools] = useState([
    { name: 'Vibrations Inc.', events: 25 },
    { name: 'Elite Events', events: 18 },
    { name: 'Wedding Planners', events: 32 },
  ]);
  const [nearbyEvents, setNearbyEvents] = useState([
    { title: 'Music Festival Volunteer', payment: '2500', location: 'Mumbai, IN (5 km away)', date: '25-27 Oct', time: '4 PM - 10 PM' },
    { title: 'Corporate Event Staff', payment: '3000', location: 'Pune, IN (15 km away)', date: '30 Oct', time: '6 PM - 11 PM' },
  ]);
  const [profileStrength, setProfileStrength] = useState(85);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await gigService.getWallet();
      setWallet(data.data || { balance_inr: 5000, escrow: 1200 });
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  return (
    <Layout role="gig">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2">
              <span className="text-gray-400">🔔</span>
            </button>
            <button className="p-2 dark:text-gray-400 text-gray-600">
              <span>⚙️</span>
            </button>
            <button className="p-2 dark:text-gray-400 text-gray-600">
              <span>🚪</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Balance */}
            <div className="card bg-gradient-to-r from-teal to-teal-dark text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Wallet Balance</p>
                  <p className="text-4xl font-bold mb-1">₹{wallet?.balance_inr || '5,000.00'}</p>
                  <p className="text-sm opacity-80">+ ₹{wallet?.escrow || '1,200'} in escrow</p>
                  <p className="text-xs opacity-70 mt-2">Instant UPI Withdrawal</p>
                </div>
                <button className="btn btn-yellow">
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Skills & Certificates */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">My Skills & Certificates</h2>
                <button className="btn btn-teal">
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium dark:text-white text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`badge ${
                        index < 3 ? 'bg-teal text-white' : 'bg-gray-600 text-white'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium dark:text-white text-gray-900 mb-3">Certificates</h3>
                <div className="space-y-3">
                  {certificates.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 dark:bg-dark-bg bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {index === 0 ? (
                          <Shield className="w-6 h-6 text-teal" />
                        ) : (
                          <Building className="w-6 h-6 text-teal" />
                        )}
                        <div>
                          <p className="font-medium dark:text-white text-gray-900">{cert.name}</p>
                          <p className="text-xs dark:text-gray-400 text-gray-600">{cert.issuer}</p>
                        </div>
                      </div>
                      <button>
                        <span className="text-gray-400">⋯</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nearby Events */}
            <div className="card relative">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Nearby Events</h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search by event name, location or role..."
                  className="input pl-10"
                />
              </div>

              <div className="space-y-3">
                {nearbyEvents.map((event, index) => (
                  <div key={index} className="p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-2xl font-bold text-teal mb-2">₹{event.payment}</p>
                        <div className="flex items-center gap-4 text-sm dark:text-gray-400 text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-teal flex-1">
                        Apply Now
                      </button>
                      <button className="btn btn-outline">
                        Compare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Join Organizer's Pools */}
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Join Organizer's Pools</h2>
              <div className="space-y-3">
                {pools.map((pool, index) => (
                  <div key={index} className="flex items-center justify-between p-3 dark:bg-dark-bg bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-400"></div>
                      <div>
                        <p className="font-medium dark:text-white text-gray-900">{pool.name}</p>
                        <p className="text-xs dark:text-gray-400 text-gray-600">{pool.events} Events Hosted</p>
                      </div>
                    </div>
                    <button className="btn btn-teal text-sm">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Achievements</h2>
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-teal mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm dark:text-white text-gray-900">Rising Star</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-600 mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Pro</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-600 mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Elite</p>
                </div>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="card">
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium dark:text-white text-gray-900">Profile Strength</span>
                  <span className="text-sm font-bold dark:text-white text-gray-900">{profileStrength}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-teal h-2 rounded-full transition-all"
                    style={{ width: `${profileStrength}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs dark:text-gray-400 text-gray-600">
                Complete your profile to get more gigs!
              </p>
            </div>

            {/* Check-In/Out */}
            <button className="btn btn-yellow w-full">
              <QrCode className="w-5 h-5" />
              Check-In/Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GigDashboard;
