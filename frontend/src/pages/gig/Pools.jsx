import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { defaultAvatars } from '../../utils/defaultAvatars';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { Users, Plus } from 'lucide-react';

const GigPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [proposedRate, setProposedRate] = useState('');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setError(null); // Clear any previous errors
    setLoading(true);
    try {
      // Try to get user coordinates for nearby ordering; fall back to server default
      let coords = {};
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          coords = { lng: pos.coords.longitude, lat: pos.coords.latitude };
        } catch (e) {
          // ignore geolocation errors and let backend return open pools
          console.warn('Geolocation failed:', e);
        }
      }

      let organizerPools = [], generalPools = [];
      try {
        organizerPools = await gigService.getOrganizerPools(coords);
      } catch (e) {
        console.error('Failed to load organizer pools:', e);
        toast.error('Failed to load some pools');
      }

      try {
        generalPools = await gigService.getPools();
      } catch (e) {
        console.error('Failed to load general pools:', e);
        toast.error('Failed to load some pools');
      }

      // Ensure both results are arrays (api layer returns transformed arrays)
      organizerPools = organizerPools || [];
      generalPools = generalPools || [];

      // Normalize pools into a consistent shape
      const normalize = (p) => ({
        _id: p._id,
        name: p.name || p.pool_name || 'Untitled Pool',
        description: p.description || '',
        organizer: p.organizer || null,
        venue: p.venue || null,
        date: p.date || p.event_date || null,
        location: p.location || (p.venue ? `${p.venue.address || ''}${p.venue.city ? ', ' + p.venue.city : ''}` : ''),
        member_count: p.member_count ?? (p.gigs?.length || p.max_capacity || p.maxPositions || 0),
        gigs: p.gigs || [],
        hasJoined: !!p.hasJoined,
        roles: p.roles || [],
        skillsRequired: p.skillsRequired || p.skills || [],
        applicationDeadline: p.applicationDeadline || p.application_deadline || null,
        requirements: p.requirements || null,
        maxPositions: p.maxPositions || p.max_capacity || null,
        filledPositions: p.filledPositions || p.filled_positions || null,
        raw: p,
      });

      const allPools = [...organizerPools.map(normalize), ...generalPools.map(normalize)];
      const uniquePools = allPools.reduce((acc, pool) => {
        if (!acc.find(p => p._id === pool._id)) {
          acc.push(pool);
        }
        return acc;
      }, []);

      if (uniquePools.length === 0 && (organizerPools.length === 0 || generalPools.length === 0)) {
        setError('Could not load all pools. Please try again later.');
      }

  setPools(uniquePools);
    } catch (error) {
      console.error('Failed to load pools', error);
      setError('Failed to load pools. Please try again later.');
      toast.error('Error loading pools');
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 15 seconds to keep the pools list fresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPools();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinPool = async () => {
    if (!selectedPool || !proposedRate) {
      console.error('Please enter a proposed rate');
      return;
    }

    try {
      // Choose API depending on pool shape (Pool model vs OrganizerPool)
      if (selectedPool.raw?.venue || selectedPool.venue) {
        // Pool model
        await gigService.joinPoolModel(selectedPool._id);
      } else {
        // OrganizerPool expects an application payload
        await gigService.joinPool(selectedPool._id, {
          proposed_rate: proposedRate,
          cover_message: 'Interested in joining this pool',
        });
      }
      toast.success('Application submitted successfully!');
      setShowJoinModal(false);
      setSelectedPool(null);
      setProposedRate('');
      fetchPools();
    } catch (error) {
      console.error('Failed to join pool', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Pools</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading pools...</div>
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => {
                setLoading(true);
                fetchPools();
              }}
              className="btn btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        ) : pools.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No pools available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <div key={pool._id} className="card">
                <div className="flex items-center mb-4">
                  {/* Organizer DP (if available) */}
                  {pool.organizer?.profile_image_url || pool.organizer?.avatar ? (
                    <img src={pool.organizer.profile_image_url || pool.organizer.avatar} alt="dp" className="w-8 h-8 rounded-full mr-2 object-cover" />
                  ) : (
                    // Use default organizer DP from defaultAvatars
                    <img src={defaultAvatars.organizer} alt="default-dp" className="w-8 h-8 rounded-full mr-2 object-cover" />
                  )}
                  <h3 className="text-xl font-semibold">{pool.name || pool.pool_name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{pool.description}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {pool.member_count || (pool.gigs?.length || 0)} members
                </p>

                {/* Roles, skills, deadline */}
                {pool.roles && pool.roles.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Roles</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {pool.roles.map((r, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{r.title}{r.requiredCount ? ` • ${r.requiredCount}` : ''}</span>
                      ))}
                    </div>
                  </div>
                )}

                {pool.skillsRequired && pool.skillsRequired.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {pool.skillsRequired.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-full">{s.skill || s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {pool.applicationDeadline && (
                  <div className="text-xs text-gray-500 mb-3">Apply by: {new Date(pool.applicationDeadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                )}
                <button
                  onClick={() => {
                    setSelectedPool(pool);
                    setShowJoinModal(true);
                  }}
                  className="btn btn-primary w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Join Pool
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Join Pool Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Join Pool</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    className="input"
                    placeholder="Enter your proposed rate"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleJoinPool}
                    className="btn btn-primary flex-1"
                  >
                    Submit Application
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setSelectedPool(null);
                      setProposedRate('');
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GigPools;

