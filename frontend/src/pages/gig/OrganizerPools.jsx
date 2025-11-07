import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gigService } from '../../services/apiServices';
import { toast } from 'react-hot-toast';
import { MapPin, Calendar, Users, Clock, Tag, Building, Search, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Layout from '../../components/Layout';

const OrganizerPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();
  const { poolId } = useParams();

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      // Use the Pool-model endpoint that returns organizer-created pools
      const params = {};
      if (city) params.city = city;
      if (date) params.date = date; // format YYYY-MM-DD from input[type=date]

      const response = await gigService.getPools(params);
      // apiClient response interceptor returns transformed data directly
      // Normalize fields so the card rendering can rely on a consistent shape
      const normalized = (response || []).map((p) => ({
        _id: p._id,
        name: p.name || p.pool_name || 'Untitled Pool',
        description: p.description || p.pool_name || '',
        category: p.category || p.type || null,
        pay_range: p.pay_range || p.payRange || null,
        // For older OrganizerPool shape we expose a single location string
        location: p.location || (p.venue ? `${p.venue.address || ''}${p.venue.city ? ', ' + p.venue.city : ''}` : ''),
        // event_date used by UI; prefer Pool.date
        event_date: p.date || p.event_date || null,
        duration: p.duration || null,
        member_count: p.member_count ?? (p.gigs?.length || p.max_capacity || p.maxPositions || 0),
        gigs: p.gigs || [],
        organizer: p.organizer || null,
        hasJoined: !!p.hasJoined,
        status: p.status || 'open',
        venue: p.venue || null,
        roles: p.roles || [],
        skillsRequired: p.skillsRequired || p.skills || [],
        applicationDeadline: p.applicationDeadline || p.application_deadline || null,
        requirements: p.requirements || null,
        maxPositions: p.maxPositions || p.max_capacity || null,
        filledPositions: p.filledPositions || p.filled_positions || null,
        raw: p
      }));

      setPools(normalized);
    } catch (error) {
      console.error('Error fetching pools:', error);
      toast.error('Failed to load organizer pools');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async (poolId) => {
    try {
      const loadingToast = toast.loading('Sending join request...');
      // Join pool created via Pool model
      await gigService.joinPoolModel(poolId);
      toast.dismiss(loadingToast);
      toast.success('Join request sent successfully');
      fetchPools(); // Refresh the pools list
    } catch (error) {
      console.error('Error joining pool:', error);
      toast.error(error.response?.data?.message || 'Failed to join pool');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const formatDate = (dateString) => {
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <Layout role="gig">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-900">All Available Pools</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse and join event teams that match your skills</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pools..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
        
            {/* Filters - show only Date and City filters */}
            <div className="flex gap-4 items-center overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-600">All Pools</button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="input w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <button
                  onClick={() => { setLoading(true); fetchPools(); }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pools.map((pool) => (
            <div 
              key={pool._id} 
              className="bg-white dark:bg-dark-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pool.name}</h2>
                    {pool.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                        <Building className="w-3 h-3 mr-1" />
                        {pool.category}
                      </span>
                    )}
                  </div>
                  {pool.pay_range && (
                    <div className="text-right">
                      <div className="flex items-center text-teal-600 dark:text-teal-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{pool.pay_range}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">per event</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{pool.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {pool.venue?.city && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                      <span className="text-sm">{pool.venue.city}{pool.venue.address ? `, ${pool.venue.address}` : ''}</span>
                    </div>
                  )}

                  {!pool.venue?.city && pool.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                      <span className="text-sm">{pool.location}</span>
                    </div>
                  )}

                  {pool.event_date && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2 text-teal-500" />
                      <span className="text-sm">{formatDate(pool.event_date)}</span>
                    </div>
                  )}
                  
                  {pool.duration && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2 text-teal-500" />
                      <span className="text-sm">{pool.duration}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-teal-500" />
                    <span className="text-sm">
                      {pool.member_count ?? (pool.gigs?.length || 0)} members
                    </span>
                  </div>
                </div>

                {/* Roles / Skills / Deadline */}
                <div className="mb-4">
                  {pool.roles && pool.roles.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Roles</div>
                      <div className="flex flex-wrap gap-2">
                        {pool.roles.map((r, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">{r.title}{r.requiredCount ? ` • ${r.requiredCount}` : ''}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pool.skillsRequired && pool.skillsRequired.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {pool.skillsRequired.map((s, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-full">{s.skill || s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pool.applicationDeadline && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Apply by: {formatDate(pool.applicationDeadline)}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <img 
                      src={pool.organizer?.profile_image_url || '/default-avatar.png'} 
                      alt={pool.organizer?.name}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{pool.organizer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Event Organizer</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleJoinPool(pool._id)}
                    disabled={pool.hasJoined || pool.status === 'joined'}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      pool.hasJoined || pool.status === 'joined'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-teal-500 hover:bg-teal-600 text-white shadow hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {pool.hasJoined ? 'Request Sent' : 'Join Pool'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No organizer pools available at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrganizerPools;