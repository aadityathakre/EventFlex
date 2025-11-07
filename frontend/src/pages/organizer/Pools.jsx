import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { organizerService } from '../../services/apiServices';
import { Link } from 'react-router-dom';
import CreatePoolModal from '../../components/CreatePoolModal';

const OrganizerPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPools = async () => {
      try {
        const res = await organizerService.getMyPools();
        const data = res?.data || res;
        const backendPools = data?.pools || data || [];
        if (mounted) setPools(backendPools);
      } catch (err) {
        console.error('Failed to load pools', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPools();
    return () => (mounted = false);
  }, []);

  return (
    <Layout role="organizer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Pools</h1>
          <button onClick={() => setOpenCreate(true)} className="btn btn-teal">Create Pool</button>
        </div>

        <div className="card">
          <div className="flex justify-end mb-4">
            <button
              className="btn btn-outline"
              onClick={async () => {
                // refresh pools from backend
                setLoading(true);
                try {
                  const res = await organizerService.getMyPools();
                  const data = res?.data || res;
                  setPools(data?.pools || data || []);
                } catch (err) {
                  console.error('Failed to refresh pools', err);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Refresh Pools
            </button>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading pools...</p>
          ) : pools.length === 0 ? (
            <p className="text-gray-500">No pools created yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pools.map((pool) => (
                <div key={pool._id} className="p-4 bg-white dark:bg-dark-bg rounded shadow">
                  <h3 className="font-semibold mb-1">{pool.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{pool.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{pool.venue?.address || pool.location || 'Venue not set'}</p>
                  <div className="flex gap-2">
                    <Link to={`/dashboard/organizer/pools/manage/${pool._id}`} className="btn btn-orange">Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CreatePoolModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={async () => {
          setOpenCreate(false);
          setLoading(true);
          try {
            const res = await organizerService.getMyPools();
            const data = res?.data || res;
            setPools(data?.pools || data || []);
          } catch (err) {
            console.error('Failed to refresh after create', err);
          } finally {
            setLoading(false);
          }
        }} />
      </div>
    </Layout>
  );
};

export default OrganizerPools;

