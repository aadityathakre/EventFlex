import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { hostService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await hostService.getEventDetails(id);
      setEvent(res?.data || res || null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch event details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout role="host"><div className="p-6">Loading event…</div></Layout>
  );

  if (!event) return (
    <Layout role="host"><div className="p-6">Event not found</div></Layout>
  );

  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <Link to="/dashboard/host/manage-events" className="btn">Back</Link>
        </div>

        <div className="card">
          <p className="text-gray-700 mb-2">{event.description}</p>
          <p className="text-sm text-gray-500">Type: {event.event_type}</p>
          <p className="text-sm text-gray-500">Start: {new Date(event.start_date).toLocaleString()}</p>
          <p className="text-sm text-gray-500">End: {new Date(event.end_date).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Budget: ₹{event.budget ? Number(event.budget.toString()) : ''}</p>
        </div>

        {/* Invite Organizer */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-3">Invite Organizer</h2>
          <InviteForm event={event} onInvited={() => {/* no-op: parent can refresh if needed */}} />
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;


const InviteForm = ({ event, onInvited }) => {
  const [organizerId, setOrganizerId] = useState('');
  const [poolName, setPoolName] = useState(event?.title ? `${event.title} - Organizer Pool` : 'Main Pool');
  const [maxCapacity, setMaxCapacity] = useState(5);
  const [locationAddress, setLocationAddress] = useState(event?.location?.address || '');
  const [requiredSkills, setRequiredSkills] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [organizers, setOrganizers] = useState([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);
  const [broadcast, setBroadcast] = useState(false);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    setLoadingOrganizers(true);
    try {
      // Prefer fetching full organizer user list so dropdown shows names
      if (hostService.getAllOrganizers) {
        const res = await hostService.getAllOrganizers();
        const items = res?.data || res || [];
        setOrganizers(items);
      } else {
        const res = await hostService.getAssignedOrganizers();
        const items = res?.data || res || [];
        const orgs = items.map((p) => p.organizer).filter(Boolean);
        setOrganizers(orgs);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch organizers', err);
      setOrganizers([]);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validation
  if (!broadcast && !organizerId) return toast.error('Select an organizer or enable broadcast');
  if (!locationAddress) return toast.error('Location address required');
    if (!poolName) return toast.error('Pool name required');

    const payload = {
  ...(organizerId ? { organizerId } : {}),
      eventId: event._id,
      pool_name: poolName,
      location_address: locationAddress,
      max_capacity: Number(maxCapacity) || 1,
      required_skills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      setSubmitting(true);
      const res = await hostService.inviteOrganizer(payload);
      toast.success(res?.data?.message || 'Organizer invited');
      onInvited?.();
      setOrganizerId('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Invite failed', {
        message: err?.message,
        response: err?.response?.data || err?.response,
        request: err?.request,
        config: err?.config,
      });
      const msg = err?.response?.data?.message || err?.message || 'Failed to invite organizer';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || !poolName || !locationAddress || !(Number(maxCapacity) > 0) || (!broadcast && !organizerId);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block md:col-span-2">
            <div className="text-sm text-gray-600">Invite mode</div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="form-checkbox" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} />
                <span className="text-sm">Broadcast to all organizers</span>
              </label>
              <div className="text-xs text-gray-500">When checked, invitation will be sent to all organizers and they can apply.</div>
            </div>
          </label>
        <label className="block">
          <div className="text-sm text-gray-600">Choose Organizer</div>
          <select className="input w-full" value={organizerId} onChange={(e) => setOrganizerId(e.target.value)} disabled={broadcast}>
            <option value="">-- Select organizer --</option>
            {loadingOrganizers ? (
              <option>Loading…</option>
            ) : organizers.length === 0 ? (
              <option>No organizers found</option>
            ) : (
              organizers.map((o) => {
                const id = typeof o === 'string' ? o : (o._id || o.universal_role_id || o.email || o.name);
                const label = typeof o === 'string' ? o : (o.name || `${o.first_name || ''} ${o.last_name || ''}`.trim() || o.email || id);
                return <option key={id} value={id}>{label}</option>;
              })
            )}
          </select>
        </label>

        <label className="block">
          <div className="text-sm text-gray-600">Pool name</div>
          <input className="input w-full" value={poolName} onChange={(e) => setPoolName(e.target.value)} />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600">Max capacity</div>
          <input type="number" min={1} className="input w-full" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm text-gray-600">Location address</div>
          <input className="input w-full" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="123 Main St, City, Country" />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm text-gray-600">Required skills (comma separated)</div>
          <input className="input w-full" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="e.g. logistics,communication" />
        </label>

  {/* pay range removed */}
      </div>

      <div className="flex gap-3 items-center">
        <button type="submit" className="btn btn-teal" disabled={isDisabled}>{submitting ? 'Inviting…' : 'Invite Organizer'}</button>
        <button type="button" className="btn" onClick={() => { setOrganizerId(''); setRequiredSkills(''); setPoolName(event?.title ? `${event.title} - Organizer Pool` : 'Main Pool'); setLocationAddress(event?.location?.address || ''); setMaxCapacity(5); }}>Clear</button>
        {isDisabled && <div className="text-sm text-gray-500">Fill required fields to enable invite</div>}
      </div>
    </form>
  );
};
