import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { hostService } from '../../services/apiServices';
import { Link } from 'react-router-dom';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'completed'
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await hostService.getHostEvents();
      setEvents(res?.data || res || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch host events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (eventId) => {
    if (!confirm('Mark this event as completed?')) return;
    try {
      setCompletingId(eventId);
      await hostService.completeEvent(eventId);
      // Refresh list after completing
      await fetchEvents();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete event', err);
      alert(err?.response?.data?.message || 'Failed to mark event as complete');
    } finally {
      setCompletingId(null);
    }
  };

  const visibleEvents = events.filter((e) => (filter === 'all' ? true : e.status === 'completed'));

  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <Link to="/dashboard/host/events/create" className="btn btn-teal">Create New</Link>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className={`btn ${filter === 'all' ? 'btn-active' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-active' : 'btn-outline'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <div className="card">
          {loading ? (
            <p>Loading</p>
          ) : visibleEvents.length === 0 ? (
            <p>No events</p>
          ) : (
            <ul className="space-y-3">
              {visibleEvents.map((e) => (
                <li key={e._id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{e.title} <span className="text-sm text-gray-500">({e.status})</span></div>
                    <div className="text-sm text-gray-500">{e.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/host/events/${e._id}`} className="text-teal">View</Link>
                    <Link to={`/dashboard/host/events/${e._id}/edit`} className="btn btn-outline">Edit</Link>
                    {e.status !== 'completed' && (
                      <button
                        className="btn btn-red"
                        onClick={() => handleComplete(e._id)}
                        disabled={completingId === e._id}
                      >
                        {completingId === e._id ? 'Completing...' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageEvents;
