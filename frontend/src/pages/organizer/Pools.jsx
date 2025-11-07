import Layout from '../../components/Layout';
import { useEffect, useState, useRef } from 'react';
import { organizerService } from '../../services/apiServices';
import { Link } from 'react-router-dom';
import CreatePoolModal from '../../components/CreatePoolModal';

const OrganizerPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [teamModalPool, setTeamModalPool] = useState(null);
  const [selectedGig, setSelectedGig] = useState(null);
  const [rate, setRate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const refreshPools = useRef(null);

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
                  <div className="text-xs text-gray-500 mb-2">
                    <div>City: {pool.city || (pool.venue?.address ? (String(pool.venue.address).split(',').pop().trim()) : '—')}</div>
                    <div>Venue: {pool.venue?.address || 'Venue not set'}</div>
                    <div>Date: {pool.date ? new Date(pool.date).toLocaleDateString() : '—'}</div>
                    <div>Slots: {pool.filledPositions || 0} / {pool.maxPositions || '-'}</div>
                  </div>

                  {/* Roles */}
                  {Array.isArray(pool.roles) && pool.roles.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium">Roles</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {pool.roles.map((r, i) => (
                          <li key={i}>{r.title} — {r.filledCount || 0} / {r.requiredCount || 0}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {Array.isArray(pool.skillsRequired) && pool.skillsRequired.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium">Skills</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {pool.skillsRequired.map((s, i) => (
                          <li key={i}>{s.skill} — {s.filledCount || 0} / {s.requiredCount || 0}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link to={`/dashboard/organizer/pools/manage/${pool._id}`} className="btn btn-orange">Manage</Link>
                    <button className="btn btn-teal" onClick={() => {
                      setTeamModalPool(pool);
                      setSelectedGig(null);
                      setRate('');
                    }}>Add to Your Team</button>
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

