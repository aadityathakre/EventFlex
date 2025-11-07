import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { organizerService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const ManagePool = () => {
  const { id } = useParams();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await organizerService.getPoolDetails(id);
        const data = res?.data || res;
        if (mounted) setPool(data?.pool || data);
      } catch (err) {
        console.error('Failed to load pool from backend', err);
        toast.error('Failed to load pool from backend');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [id]);

  const handleSave = async () => {
    try {
      const payload = { name: pool.name, description: pool.description, date: pool.date, venue: pool.venue };
      await organizerService.managePool(id, payload);
      toast.success('Pool updated');
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update pool');
    }
  };

  if (loading) return <Layout role="organizer"><div className="p-6">Loading...</div></Layout>;

  if (!pool) return <Layout role="organizer"><div className="p-6">Pool not found</div></Layout>;

  return (
    <Layout role="organizer">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Pool - {pool.name}</h1>
          <div>
            {editing ? (
              <>
                <button onClick={handleSave} className="btn btn-teal mr-2">Save</button>
                <button onClick={() => setEditing(false)} className="btn btn-outline">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn btn-orange">Edit</button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input value={pool.name} onChange={(e) => setPool({ ...pool, name: e.target.value })} className="input" disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea value={pool.description} onChange={(e) => setPool({ ...pool, description: e.target.value })} className="input" disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input type="date" value={pool.date?.split('T')[0] || ''} onChange={(e) => setPool({ ...pool, date: e.target.value })} className="input" disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium">Venue</label>
              <p className="text-sm text-gray-600">{pool.venue?.address || JSON.stringify(pool.venue) || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagePool;
