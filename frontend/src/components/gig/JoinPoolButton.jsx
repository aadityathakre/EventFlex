import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigService } from '../../services/apiServices';
import { toast } from 'react-hot-toast';

const JoinPoolButton = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.pool-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown) {
      fetchPools();
    }
  }, [showDropdown]);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await gigService.getOrganizerPools();
      console.log('Fetched pools:', response);
      // Normalize to stable shape (some pools come from Pool model, some from OrganizerPool)
      const normalized = (response || []).map(p => ({
        _id: p._id,
        name: p.name || p.pool_name,
        organizer: p.organizer || null,
        hasJoined: !!p.hasJoined,
        // mark whether this looks like a Pool-model document (has venue/date)
        poolType: p.venue || p.date ? 'pool' : 'organizerPool',
        roles: p.roles || [],
        skillsRequired: p.skillsRequired || p.skills || [],
        applicationDeadline: p.applicationDeadline || p.application_deadline || null,
        raw: p
      }));
      setPools(normalized);
    } catch (error) {
      console.error('Error fetching pools:', error);
      toast.error('Failed to load pools');
    } finally {
      setLoading(false);
    }
  };

  const handlePoolClick = async (poolId) => {
    try {
      // Try to join the pool
      const loadingToast = toast.loading('Sending join request...');
      // Find pool in local cache to determine which backend endpoint to call
      const pool = pools.find(p => p._id === poolId) || {};
      if (pool.poolType === 'pool') {
        await gigService.joinPoolModel(poolId);
      } else {
        await gigService.joinPool(poolId);
      }
      toast.dismiss(loadingToast);
      toast.success('Join request sent successfully');
      fetchPools(); // Refresh the pools list
    } catch (error) {
      console.error('Error joining pool:', error);
      toast.error(error.response?.data?.message || 'Failed to join pool');
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative pool-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 4v16m8-8H4"></path>
        </svg>
        Join Pool
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-600">Loading pools...</div>
            ) : pools.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-600">No pools available</div>
            ) : (
              pools.map((pool) => (
                <div key={pool._id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
                  <button
                    onClick={() => navigate(`/dashboard/gig/pools/${pool._id}`)}
                    className="flex-grow text-left flex items-center"
                  >
                    {pool.organizer?.profile_image_url ? (
                      <img 
                        src={pool.organizer.profile_image_url} 
                        alt={pool.organizer?.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
                    )}
                    <div>
                      <div className="font-medium">{pool.name || pool.pool_name}</div>
                      <div className="text-xs text-gray-500">by {pool.organizer?.name || 'Unknown'}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePoolClick(pool._id)}
                    className={`ml-2 px-3 py-1 rounded text-sm ${
                      pool.hasJoined
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {pool.hasJoined ? 'Requested' : 'Join'}
                  </button>
                </div>
              ))
            )}
            <div className="border-t border-gray-100">
              <button
                onClick={() => navigate('/dashboard/gig/pools')}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
              >
                View All Pools
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinPoolButton;