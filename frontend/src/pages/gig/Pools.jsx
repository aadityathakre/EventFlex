import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { Users, Plus } from 'lucide-react';

const GigPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [proposedRate, setProposedRate] = useState('');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      const data = await gigService.getOrganizerPools();
      setPools(data.data || []);
    } catch (error) {
      console.error('Failed to load pools', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    if (!selectedPool || !proposedRate) {
      console.error('Please enter a proposed rate');
      return;
    }

    try {
      await gigService.joinPool(selectedPool._id, {
        proposed_rate: proposedRate,
        cover_message: 'Interested in joining this pool',
      });
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
        ) : pools.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No pools available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <div key={pool._id} className="card">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-primary-600 mr-2" />
                  <h3 className="text-xl font-semibold">{pool.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{pool.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {pool.gigs?.length || 0} members
                </p>
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

