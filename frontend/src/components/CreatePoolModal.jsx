import { useState } from 'react';
import toast from 'react-hot-toast';
import MapPicker from './MapPicker';
import { organizerService } from '../services/apiServices';

const CreatePoolModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    venue: { address: '', lat: null, lng: null },
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleVenueChange = (val) => setForm({ ...form, venue: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate venue: require either lat/lng or address
      if (!form.venue || (!form.venue.lat && !form.venue.address)) {
        toast.error('Please pin the venue on the map or enter an address.');
        setLoading(false);
        return;
      }
      // Build payload matching backend schema (omit budget per request)
      const payload = {
        name: form.name,
        description: form.description,
        date: form.date,
        venue: form.venue,
      };
      // Call backend to create pool (must succeed to persist)
      const res = await organizerService.createPool(payload);
      const created = res?.data || res;
      toast.success('Pool created successfully');

      if (onCreated) onCreated(created);
      onClose();
    } catch (err) {
      console.error('Create pool failed', err);
      toast.error('Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Pool</h3>
          <button onClick={onClose} className="text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pool Name</label>
            <input type="text" className="input" value={form.name} onChange={handleChange('name')} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="input" value={form.description} onChange={handleChange('description')} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Event Date</label>
            <input type="date" className="input" value={form.date} onChange={handleChange('date')} required />
          </div>

          <div>
            <MapPicker value={form.venue} onChange={handleVenueChange} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-teal" disabled={loading}>{loading ? 'Creating...' : 'Create Pool'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoolModal;
