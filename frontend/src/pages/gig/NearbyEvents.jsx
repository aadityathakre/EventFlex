import Layout from '../../components/Layout';
import { useState } from 'react';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { MapPin, Calendar } from 'lucide-react';

const GigNearbyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  const handleFindNearby = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: 50, // km
          };
          const data = await gigService.getNearbyEvents(params);
          setEvents(data.data || []);
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        } catch (error) {
          toast.error('Failed to load nearby events');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error('Failed to get your location');
        setLoading(false);
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Nearby Events</h1>
          <button onClick={handleFindNearby} className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Find Nearby Events'}
          </button>
        </div>

        {events.length === 0 && !loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">Click "Find Nearby Events" to discover events near you</p>
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
                    {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    Nearby
                  </div>
                </div>

                <span className={`badge ${
                  event.status === 'published' ? 'badge-info' : 'badge-warning'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GigNearbyEvents;

