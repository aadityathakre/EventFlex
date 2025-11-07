import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { hostService } from '../../services/apiServices';
import { Link } from 'react-router-dom';

const HostEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await hostService.getHostEvents();
      const data = res?.data || [];
      setEvents(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch host events', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <Link to="/dashboard/host/events/create" className="btn btn-teal">
            Create New Event
          </Link>
        </div>

        <div className="card">
          {loading ? (
            <p className="text-gray-500">Loading events…</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No events created yet</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="p-4 dark:bg-dark-bg bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-secondary'} mb-2`}>{event.status || 'draft'}</span>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm dark:text-gray-400 text-gray-600">
                        {event.start_date ? new Date(event.start_date).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link to={`/dashboard/host/events/${event._id}`} className="text-teal hover:underline text-sm">View Details</Link>
                    </div>
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

export default HostEvents;

