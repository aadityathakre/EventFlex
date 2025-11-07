import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { hostService, poolService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OrganizerPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchPools(); }, []);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await hostService.getAllPools(); // backend filters open pools for organizer role
      const items = res?.data || res || [];
      setPools(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch pools', err);
      toast.error('Failed to load pools');
      setPools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (poolId) => {
    if (!confirm('Apply to this pool?')) return;
    try {
      setApplyingId(poolId);
      const res = await poolService.applyToPool(poolId);
      toast.success(res?.data?.message || 'Applied — awaiting host approval');
      await fetchPools();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Apply failed', err);
      toast.error(err?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Host Pools</h1>

        <div className="card">
          {loading ? (
            <p>Loading…</p>
          ) : pools.length === 0 ? (
            <p>No open pools available</p>
          ) : (
            <div className="space-y-3">
              {pools.map((p) => (
                <div key={p._id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{p.pool_name}</div>
                    <div className="text-sm text-gray-600">Event: {p.event?.title || p.event}</div>
                    <div className="text-sm text-gray-500">Location: {p.location_address}</div>
                    <div className="text-sm text-gray-500">Capacity: {p.max_capacity}</div>
                  </div>
                  <div>
                    <button className="btn btn-teal" disabled={applyingId === p._id} onClick={() => handleApply(p._id)}>{applyingId === p._id ? 'Applying…' : 'Apply'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerPools;

