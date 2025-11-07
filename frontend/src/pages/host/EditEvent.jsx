import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { hostService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const EditEvent = () => {
  const { id } = useParams();
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

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await hostService.getEventDetails(id);
      const e = res?.data || res;
      if (e) {
        setForm({
          title: e.title || '',
          description: e.description || '',
          event_type: e.event_type || '',
          start_date: e.start_date ? new Date(e.start_date).toISOString().slice(0,16) : '',
          end_date: e.end_date ? new Date(e.end_date).toISOString().slice(0,16) : '',
          longitude: e.location?.coordinates?.[0] ?? '',
          latitude: e.location?.coordinates?.[1] ?? '',
          budget: e.budget ? Number(e.budget.toString()) : '',
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load event', err);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      // validation (same as create)
      if (!form.title || !form.event_type || !form.start_date || !form.end_date || !form.longitude || !form.latitude || !form.budget) {
        toast.error('Please fill required fields');
        setLoading(false);
        return;
      }

      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);
      if (startDate >= endDate) {
        toast.error('End date must be after start date');
        setLoading(false);
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: { coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)] },
        budget: parseFloat(form.budget),
      };

      await hostService.editEvent(id, payload);
      toast.success('Event updated');
      navigate('/dashboard/host/manage-events');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Update failed', err?.response?.data || err.message || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      toast.error(serverMsg || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Event</h1>
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
            <button type="submit" className="btn btn-teal" disabled={loading}>{loading ? 'Updating…' : 'Update Event'}</button>
            <button type="button" className="btn" onClick={() => navigate('/dashboard/host/manage-events')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditEvent;
