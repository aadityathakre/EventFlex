import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gigService } from '../../services/apiServices';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrganizerPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { poolId } = useParams();

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      // Use the Pool-model endpoint that returns organizer-created pools
      const response = await gigService.getPools();
      // apiClient response interceptor returns transformed data directly
      setPools(response || []);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Organizer Pools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <div 
            key={pool._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{pool.name}</h2>
              <p className="text-gray-600 mb-4">{pool.description}</p>
              
              <div className="flex items-center mb-4">
                <img 
                  src={pool.organizer?.profile_image_url || '/default-avatar.png'} 
                  alt={pool.organizer?.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">{pool.organizer.name}</p>
                  <p className="text-sm text-gray-500">Organizer</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {pool.member_count ?? (pool.gigs?.length || 0)} members
                </span>
                <button
                  onClick={() => handleJoinPool(pool._id)}
                  disabled={pool.hasJoined || pool.status === 'joined'}
                  className={`px-4 py-2 rounded-md ${
                    pool.hasJoined || pool.status === 'joined'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
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
        <div className="text-center py-8">
          <p className="text-gray-600">No organizer pools available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default OrganizerPools;