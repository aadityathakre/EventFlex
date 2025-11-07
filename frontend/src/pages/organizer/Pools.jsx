import Layout from '../../components/Layout';
import { useEffect, useState, useRef } from 'react';
import { organizerService } from '../../services/apiServices';
import { Link } from 'react-router-dom';
import CreatePoolModal from '../../components/CreatePoolModal';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

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
    // subscribe to real-time updates
    const unsubPoolUpdated = notificationService.on('pool_updated', (updatedPool) => {
      // If the updated pool belongs to the current organizer, refresh
      try {
        setPools(prev => prev.map(p => (p._id === updatedPool._id ? updatedPool : p)));
      } catch (err) {
        // fallback: refetch
        fetchPools();
      }
    });

    const unsubAppCreated = notificationService.on('pool_application_created', (data) => {
      // data has poolId
      if (!data || !data.poolId) return;
      setPools(prev => prev.map(p => {
        if (p._id === data.poolId) {
          // bump a pending count locally (will be corrected on next fetch)
          const gigs = p.gigs ? [...p.gigs] : [];
          // optimistic entry placeholder
          gigs.push({ gig: { _id: data.applicationId }, status: 'pending' });
          return { ...p, gigs };
        }
        return p;
      }));
    });

    return () => {
      mounted = false;
      try { unsubPoolUpdated(); } catch(e) {}
      try { unsubAppCreated(); } catch(e) {}
    };
  }, []);

  // Helper to exclude problematic applicant(s) by name/id on frontend only
  const isExcludedApplicant = (gig) => {
    if (!gig) return false;
    const name = ((gig.first_name && gig.last_name) ? `${gig.first_name} ${gig.last_name}` : (gig.name || '')).toLowerCase();
    const email = (gig.email || '').toLowerCase();

    // Exclude known problematic user by name or email pattern. Adjust as needed.
    if (name.includes('aaditya') || name.includes('aadityathakre') || email.includes('aadityathakre')) return true;
    return false;
  };

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
                    <Link to={`/dashboard/organizer/pools/${pool._id}/applications`} className="btn btn-red">Requests ({(pool.gigs || []).filter(g => g.status === 'pending').length})</Link>
                    <button className="btn btn-teal" onClick={() => {
                      setTeamModalPool(pool);
                      setSelectedGig(null);
                      setRate('');
                    }}>Add to Your Team</button>
                  </div>

                  {/* Inline pending applicants preview */}
                  {Array.isArray(pool.gigs) && pool.gigs.filter(g => g.status === 'pending').length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="text-sm font-medium mb-2">Recent Applicants</div>
                      <div className="flex flex-col gap-2">
                        {pool.gigs.filter(g => g.status === 'pending').slice(0,3).map((gEntry) => (
                          <div key={gEntry.application || gEntry.gig._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={gEntry.gig?.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                              <div>
                                <div className="text-sm font-medium">{gEntry.gig?.first_name ? `${gEntry.gig.first_name} ${gEntry.gig.last_name || ''}` : (gEntry.gig?.name || 'Applicant')}</div>
                                <div className="text-xs text-gray-500">Applied: {gEntry.appliedAt ? new Date(gEntry.appliedAt).toLocaleDateString() : '—'}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button disabled={actionLoading} className="btn btn-sm btn-green" onClick={async () => {
                                const gigId = gEntry.gig?._id || gEntry.gig;
                                const appId = gEntry.application || null;
                                if (!gigId) {
                                  toast.error('Cannot determine applicant id');
                                  return;
                                }
                                try {
                                  setActionLoading(true);
                                  if (appId) {
                                    // If we have an application id, use the decide endpoint by application
                                    await organizerService.acceptApplication(pool._id, gigId);
                                  } else {
                                    await organizerService.acceptApplication(pool._id, gigId);
                                  }
                                  toast.success('Applicant selected');
                                  // refresh pools to reflect accurate state
                                  const res = await organizerService.getMyPools();
                                  const data = res?.data || res;
                                  setPools(data?.pools || data || []);
                                } catch (err) {
                                  console.error('Accept failed', err);
                                  toast.error('Failed to select applicant');
                                } finally { setActionLoading(false); }
                              }}>Select</button>
                              <button disabled={actionLoading} className="btn btn-sm btn-outline text-red-600" onClick={async () => {
                                const gigId = gEntry.gig?._id || gEntry.gig;
                                const appId = gEntry.application || null;
                                if (!gigId) {
                                  toast.error('Cannot determine applicant id');
                                  return;
                                }
                                try {
                                  setActionLoading(true);
                                  if (appId) {
                                    // if we can remove the specific application
                                    await organizerService.removeApplication(pool._id, appId);
                                  } else {
                                    await organizerService.rejectApplication(pool._id, gigId);
                                  }
                                  toast.success('Applicant rejected/removed');
                                  const res = await organizerService.getMyPools();
                                  const data = res?.data || res;
                                  setPools(data?.pools || data || []);
                                } catch (err) {
                                  console.error('Reject failed', err);
                                  toast.error('Failed to reject/remove applicant');
                                } finally { setActionLoading(false); }
                              }}>Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

