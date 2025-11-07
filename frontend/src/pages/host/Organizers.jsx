import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { hostService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Organizers = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [messagingId, setMessagingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setLoading(true);
    try {
      // Prefer fetching all pools created by organizers
      if (hostService.getAllPools) {
        const res = await hostService.getAllPools();
        const items = res?.data || res || [];
        setPools(items);
      } else {
        const res = await hostService.getAssignedOrganizers();
        const items = res?.data || res || [];
        setPools(items);
      }
    } catch (err) {
      console.error('Failed to fetch organizer pools', err);
      toast.error('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (poolId) => {
    if (!confirm('Approve this organizer for the event?')) return;
    try {
      setApprovingId(poolId);
      await hostService.approveOrganizer(poolId);
      toast.success('Organizer approved');
      await fetchPools();
    } catch (err) {
      console.error('Approve failed', err);
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  const handleMessage = async (pool) => {
    try {
      setMessagingId(pool._id);
      const payload = { organizerId: pool.organizer?._id || pool.organizer, eventId: pool.event?._id || pool.event, poolId: pool._id };
      const res = await hostService.startChatWithOrganizer(payload);
      toast.success(res?.data?.message || 'Chat started');
      // navigate to messages
      navigate('/dashboard/host/messages');
    } catch (err) {
      console.error('Start chat failed', err);
      toast.error(err?.response?.data?.message || 'Failed to start chat');
    } finally {
      setMessagingId(null);
    }
  };

  // Payment / deposit to escrow
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [mockTxnId, setMockTxnId] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [organizerPercentage, setOrganizerPercentage] = useState(70);
  const [gigsPercentage, setGigsPercentage] = useState(30);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowDetails, setEscrowDetails] = useState(null);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  const formatDecimal = (val) => {
    try {
      if (val == null) return '—';
      if (typeof val === 'object' && typeof val.toString === 'function') {
        const n = Number(val.toString());
        return isNaN(n) ? String(val) : n.toLocaleString('en-IN');
      }
      const num = Number(val);
      return isNaN(num) ? String(val) : num.toLocaleString('en-IN');
    } catch (e) {
      return String(val);
    }
  };

  const formatUserName = (user) => {
    if (!user) return '—';
    if (typeof user === 'string') return user;
    return user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'User';
  };

  const openDeposit = (pool) => {
    setSelectedPool(pool);
    setMockTxnId(`MOCK-${Date.now()}`);
    setDepositAmount('');
    setDepositModalOpen(true);
  };

  const handleDeposit = async () => {
    if (!selectedPool) return toast.error('No pool selected');
    const organizerId = selectedPool.organizer?._id || selectedPool.organizer;
    if (!organizerId) return toast.error('Organizer not found for this pool');
    if (!depositAmount || Number(depositAmount) <= 0) return toast.error('Enter a valid amount');

    try {
      setDepositLoading(true);
      const payload = {
        eventId: selectedPool.event?._id || selectedPool.event,
        organizerId,
        total_amount: Number(depositAmount),
        organizer_percentage: Number(organizerPercentage),
        gigs_percentage: Number(gigsPercentage),
        payment_method: paymentMethod,
        upi_transaction_id: mockTxnId,
      };

      const res = await hostService.depositToEscrow(payload);
      toast.success(res?.data?.message || 'Escrow funded');
      // refresh pools list
      await fetchPools();
      // fetch escrow status for this event and show modal
      try {
        setEscrowLoading(true);
        const esc = await hostService.getEscrowStatus(payload.eventId);
        const details = esc?.data || esc || null;
        setEscrowDetails(details);
        setEscrowModalOpen(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load escrow details', e);
      } finally {
        setEscrowLoading(false);
        setDepositModalOpen(false);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Deposit failed', err);
      toast.error(err?.response?.data?.message || 'Failed to deposit');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleRelease = async (eventId) => {
    if (!confirm('Verify attendance and release escrow?')) return;
    try {
      setReleaseLoading(true);
      const res = await hostService.verifyAttendance(eventId);
      toast.success(res?.data?.message || 'Escrow released');
      // refresh escrow details
      try {
        setEscrowLoading(true);
        const esc = await hostService.getEscrowStatus(eventId);
        const details = esc?.data || esc || null;
        setEscrowDetails(details);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to refresh escrow after release', e);
      } finally {
        setEscrowLoading(false);
      }
        await fetchPools();
        // show toast with link and auto-navigate to event details after short delay
        try {
          const eventPath = `/dashboard/host/events/${eventId}`;
          toast.custom((t) => (
            <div className={`bg-white p-3 rounded shadow-lg ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
              <div className="font-semibold">Escrow released</div>
              <div className="text-sm mt-1"><a href={eventPath} onClick={(e)=>{ e.preventDefault(); navigate(eventPath); }} className="text-teal underline">Open Event</a></div>
            </div>
          ));
          setTimeout(()=>{ navigate(eventPath); }, 1200);
        } catch (e) {
          // ignore toast/navigation errors
        }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Release failed', err);
      toast.error(err?.response?.data?.message || 'Failed to release escrow');
    } finally {
      setReleaseLoading(false);
    }
  };


  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Organizers</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-6">Loading…</div>
          ) : pools.length === 0 ? (
            <div className="col-span-full p-6">No organizer pools found</div>
          ) : (
            pools.map((p) => (
              <div key={p._id} className="card p-4 flex flex-col justify-between">
                <div>
                  <div className="text-lg font-semibold">{p.pool_name}</div>
                  <div className="text-sm text-gray-600">Organizer: {p.organizer?.name || p.organizer?.first_name || p.organizer?.email}</div>
                  <div className="text-sm text-gray-500">Event: {p.event?.title || p.event}</div>
                  <div className="text-sm text-gray-500">Capacity: {p.max_capacity}</div>
                  <div className="text-sm text-gray-500">Status: <span className={`font-medium ${p.status === 'open' ? 'text-yellow-600' : p.status === 'active' ? 'text-teal' : 'text-gray-500'}`}>{p.status}</span></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-outline" onClick={() => handleMessage(p)} disabled={messagingId === p._id}>{messagingId === p._id ? 'Opening…' : 'Message'}</button>
                  {p.status === 'open' && (
                    <button className="btn btn-teal" onClick={() => handleApprove(p._id)} disabled={approvingId === p._id}>{approvingId === p._id ? 'Approving…' : 'Approve'}</button>
                  )}
                  {p.status === 'active' && (
                    <>
                      <button className="btn btn-primary" onClick={() => openDeposit(p)}>Fund</button>
                    </>
                  )}
                  {p.status !== 'open' && p.status !== 'active' && (
                    <button className="btn btn-outline" disabled>Approved</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Deposit Modal */}
      {depositModalOpen && selectedPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Fund Escrow for {selectedPool.pool_name}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Amount (INR)</label>
                <input type="number" className="input w-full" value={depositAmount} onChange={(e)=>setDepositAmount(e.target.value)} />
              </div>

              <div>
                <label className="text-sm">Payment method</label>
                <select className="input w-full" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                  <option value="upi">UPI (mock)</option>
                  <option value="card">Card (mock)</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Organizer share (%)</label>
                <input type="number" className="input w-full" value={organizerPercentage} onChange={(e)=>{
                  let v = Number(e.target.value);
                  if (Number.isNaN(v)) v = 0;
                  if (v < 0) v = 0;
                  if (v > 100) v = 100;
                  setOrganizerPercentage(v);
                  setGigsPercentage(100 - v);
                }} />
              </div>

              <div>
                <label className="text-sm">Gigs share (%)</label>
                <input type="number" className="input w-full" value={gigsPercentage} readOnly />
              </div>

              <div className="flex gap-2 justify-end">
                <button className="btn" onClick={()=>setDepositModalOpen(false)} disabled={depositLoading}>Cancel</button>
                <button className="btn btn-teal" onClick={handleDeposit} disabled={depositLoading}>{depositLoading ? 'Processing…' : 'Pay'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Escrow Modal */}
      {escrowModalOpen && escrowDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-3">Escrow Details</h3>
            {escrowLoading ? (
              <div>Loading…</div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 border rounded">
                  <div className="text-sm">Escrow ID: {escrowDetails.escrow?._id || escrowDetails.escrow}</div>
                  <div className="text-sm">Total: ₹{formatDecimal(escrowDetails.escrow?.total_amount)}</div>
                  <div className="text-sm">Status: {escrowDetails.escrow?.status || '—'}</div>
                </div>

                <div className="p-3 border rounded">
                  <h4 className="font-semibold">Payments</h4>
                  {escrowDetails.payments && escrowDetails.payments.length > 0 ? (
                    escrowDetails.payments.map((pay) => (
                      <div key={pay._id} className="p-2 border-b last:border-b-0">
                        <div className="text-sm">Amount: ₹{formatDecimal(pay.amount)}</div>
                        <div className="text-sm">Payee: {formatUserName(pay.payee)}</div>
                        <div className="text-sm">Payer: {formatUserName(pay.payer)}</div>
                        <div className="text-sm">Status: <span className={`font-medium ${pay.status === 'held' ? 'text-yellow-600' : pay.status === 'completed' || pay.status === 'released' ? 'text-green-600' : 'text-gray-500'}`}>{pay.status}</span></div>
                        <div className="text-xs text-gray-500">Method: {pay.payment_method} — {new Date(pay.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No payments logged</div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  {escrowDetails.escrow?.status !== 'released' && (
                    <button className="btn btn-yellow" onClick={()=>handleRelease(escrowDetails.escrow?.event)} disabled={releaseLoading}>{releaseLoading ? 'Releasing…' : 'Release'}</button>
                  )}
                  <button className="btn" onClick={()=>{ setEscrowModalOpen(false); setEscrowDetails(null); }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Organizers;
