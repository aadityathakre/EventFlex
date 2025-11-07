import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigService } from '../../services/apiServices';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

const PoolDetails = () => {
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const { poolId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPoolDetails();
  }, [poolId]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      const response = await gigService.getPoolDetails(poolId);
      // apiClient response interceptor and our transformResponse return the payload directly
      setPool(response);
    } catch (error) {
      console.error('Error fetching pool details:', error);
      toast.error('Failed to load pool details');
      navigate('/dashboard/gig/pools');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    try {
      const loadingToast = toast.loading('Sending join request...');
      await gigService.joinPool(poolId);
      toast.dismiss(loadingToast);
      toast.success('Join request sent successfully');
      fetchPoolDetails(); // Refresh the pool details
    } catch (error) {
      console.error('Error joining pool:', error);
      toast.error(error.response?.data?.message || 'Failed to join pool');
    }
  };

  if (loading) {
    return (
      <Layout role="gig">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!pool) {
    return (
      <Layout role="gig">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800">Pool not found</h2>
          <p className="text-gray-600 mt-2">The pool you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/gig/pools')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            View All Pools
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="gig">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold">{pool.name || pool.pool_name}</h1>
              <p className="mt-2 opacity-90">Organized by {pool.organizer?.name || 'Unknown'}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Pool Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="text-gray-800">{pool.description || 'No description available'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Members</label>
                    <p className="text-gray-800">{pool.gigs?.length || 0} members</p>
                  </div>
                  {pool.pay_range && (
                    <div>
                      <label className="text-sm text-gray-500">Pay Range</label>
                      <p className="text-gray-800">₹{pool.pay_range}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Organizer Profile</h2>
                <div className="flex items-start space-x-4">
                  {pool.organizer?.profile_image_url ? (
                    <img
                      src={pool.organizer.profile_image_url}
                      alt={pool.organizer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">{pool.organizer?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {pool.events || 0} events organized
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleJoinPool}
                disabled={pool.hasJoined}
                className={`px-6 py-2 rounded-md ${
                  pool.hasJoined
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {pool.hasJoined ? 'Request Sent' : 'Join Pool'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PoolDetails;