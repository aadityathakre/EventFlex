import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { hostService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: '',
    start_date: '',
    end_date: '',
    longitude: '',
    latitude: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Minimal validation
      if (!form.title || !form.event_type || !form.start_date || !form.end_date || !form.longitude || !form.latitude || !form.budget) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);
      const now = new Date();

      if (!(startDate instanceof Date) || isNaN(startDate)) {
        toast.error('Invalid start date');
        setLoading(false);
        return;
      }
      if (!(endDate instanceof Date) || isNaN(endDate)) {
        toast.error('Invalid end date');
        setLoading(false);
        return;
      }

      if (startDate <= now) {
        toast.error('Event start date must be in the future');
        setLoading(false);
        return;
      }

      if (endDate <= startDate) {
        toast.error('Event end date must be after start date');
        setLoading(false);
        return;
      }

      const lon = parseFloat(form.longitude);
      const lat = parseFloat(form.latitude);
      if (isNaN(lon) || isNaN(lat)) {
        toast.error('Coordinates must be numbers');
        setLoading(false);
        return;
      }
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
        toast.error('Coordinates out of bounds');
        setLoading(false);
        return;
      }

      const budgetNum = parseFloat(form.budget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        toast.error('Budget must be a positive number');
        setLoading(false);
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: { coordinates: [lon, lat] },
        budget: budgetNum,
      };

      const res = await hostService.createEvent(payload);
      toast.success('Event created');
      navigate('/dashboard/host/events');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Create event failed', err?.response?.data || err.message || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || null;
      const msg = serverMsg || err.message || 'Failed to create event';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Type *</label>
              <select name="event_type" value={form.event_type} onChange={handleChange} className="input w-full">
                <option value="">Select type</option>
                <option value="function">Function</option>
                <option value="corporate">Corporate</option>
                <option value="festival">Festival</option>
                <option value="exhibition">Exhibition</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="networking">Networking</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="retreat">Retreat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget (INR) *</label>
              <input name="budget" value={form.budget} onChange={handleChange} className="input w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input name="start_date" type="datetime-local" value={form.start_date} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input name="end_date" type="datetime-local" value={form.end_date} onChange={handleChange} className="input w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Longitude *</label>
              <input name="longitude" value={form.longitude} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Latitude *</label>
              <input name="latitude" value={form.latitude} onChange={handleChange} className="input w-full" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-teal" disabled={loading}>{loading ? 'Creating…' : 'Create Event'}</button>
            <button type="button" className="btn" onClick={() => navigate('/dashboard/host/events')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEvent;
