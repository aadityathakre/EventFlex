import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';

const GigEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await gigService.getMyEvents();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (eventId) => {
    try {
      await gigService.checkIn(eventId);
      toast.success('Checked in successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Check-in failed', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading events...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>

        {events.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No events assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="card">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location available
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className={`badge ${
                    event.status === 'completed' ? 'badge-success' :
                    event.status === 'in_progress' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {event.status}
                  </span>
                  {event.status === 'in_progress' && (
                    <button
                      onClick={() => handleCheckIn(event._id)}
                      className="btn btn-primary text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Check In
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GigEvents;

