import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { hostService } from '../../services/apiServices';

const HostPayments = () => {
  const [wallet, setWallet] = useState(null);
  const [escrow, setEscrow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [pools, setPools] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const w = await hostService.getWalletBalance();
      const d = await hostService.getDashboard();
      setWallet(w?.data || w);
      setEscrow(d?.data?.escrows || []);

      // fetch host events and assigned organizer pools to populate deposit form
      try {
        const ev = await hostService.getHostEvents();
        setEvents(ev?.data || []);
      } catch (e) {
        console.warn('Failed to fetch host events for payments form', e);
      }

      try {
        // Prefer fetching all pools (Organizers tab uses getAllPools)
        const ps = hostService.getAllPools ? await hostService.getAllPools() : await hostService.getAssignedOrganizers();
        setPools(ps?.data || []);
      } catch (e) {
        console.warn('Failed to fetch organizer pools for payments form', e);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch payments data', err);
    } finally {
      setLoading(false);
    }
  };

  // helpers to safely render Decimal128 and user objects
  const formatDecimal = (val) => {
    if (val == null) return '0.00';
    if (typeof val === 'object') {
      if (val.$numberDecimal) return val.$numberDecimal;
      if (typeof val.toString === 'function') return val.toString();
      return String(val);
    }
    return String(val);
  };

  const formatUserName = (user) => {
    if (!user) return '';
    if (typeof user === 'string') return user;
    const first = user.first_name || user.firstName || '';
    const last = user.last_name || user.lastName || '';
    if (first || last) return `${first} ${last}`.trim();
    if (user.name) return user.name;
    if (user.email) return user.email;
    return 'Organizer';
  };

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [mockTxnId, setMockTxnId] = useState('');
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowDetails, setEscrowDetails] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [escrowLoading, setEscrowLoading] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast.error('Enter a valid deposit amount');
      return;
    }
    if (!upiId) {
      toast.error('Enter a UPI id (mock)');
      return;
    }
    if (!selectedEvent) {
      toast.error('Select an event for this deposit');
      return;
    }
    if (!selectedPoolId) {
      toast.error('Select an organizer (pool) for this deposit');
      return;
    }

    setDepositLoading(true);
    try {
      // For mock UPI flow we'll send basic data expected by backend
      const poolObj = pools.find((p) => p._id === selectedPoolId) || {};
      const organizerId = poolObj.organizer?._id || poolObj.organizer || null;

      const payload = {
        eventId: selectedEvent,
        organizerId,
        total_amount: Number(depositAmount),
        organizer_percentage: 70,
        gigs_percentage: 30,
        payment_method: 'upi',
        upi_transaction_id: `MOCK-UPI-${Date.now()}`,
      };

      const res = await hostService.depositToEscrow(payload);
      toast.success(res?.data?.message || 'Deposit successful (mock)');
      setDepositAmount('');
      setUpiId('');
      fetchPayments();
    } catch (err) {
      console.error('Deposit failed', err);
      const msg = err?.response?.data?.message || err.message || 'Deposit failed';
      toast.error(msg);
    } finally {
      setDepositLoading(false);
    }
  };

  const viewEscrowStatus = async (eventId) => {
    if (!eventId) {
      toast.error('Invalid event id');
      return;
    }
    // open modal immediately and show loader
    setEscrowModalOpen(true);
    setEscrowDetails(null);
    setEscrowLoading(true);
    try {
      const res = await hostService.getEscrowStatus(eventId);
      const payload = res?.data?.data || res?.data || res;
      // payload expected { escrow, payments }
      setEscrowDetails(payload);
    } catch (err) {
      console.error('Failed to fetch escrow status', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch escrow status');
    } finally {
      setEscrowLoading(false);
    }
  };

  const handleVerifyAttendance = async (eventId) => {
    if (!eventId) return toast.error('Invalid event id');
    try {
      setVerifyLoading(true);
      const res = await hostService.verifyAttendance(eventId);
      toast.success(res?.data?.message || 'Escrow released');
      // refresh escrow details and payments
      await viewEscrowStatus(eventId);
      fetchPayments();
    } catch (err) {
      console.error('Verify attendance failed', err);
      toast.error(err?.response?.data?.message || 'Failed to verify attendance');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <Layout role="host">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-2">Wallet Balance</h3>
            {loading ? (
              <p>Loading…</p>
            ) : wallet ? (
              <div>
                <p className="text-2xl font-bold">₹{wallet.balance_inr ? Number(wallet.balance_inr.toString()) : '0.00'}</p>
                <p className="text-sm text-gray-500 mt-1">Available balance</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-sm text-gray-600">Address:</div>
                  <div className="font-mono text-sm">{wallet.address || '—'}</div>
                  <button title="Copy address" onClick={async ()=>{ try{ await navigator.clipboard.writeText(wallet.address || ''); toast.success('Copied address'); }catch(e){ toast.error('Copy failed'); } }} className="btn btn-outline text-xs">Copy</button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={fetchPayments} className="btn btn-outline">Refresh</button>
                  <button onClick={()=>{ setShowPaymentModal(true); setMockTxnId(`MOCK-TOPUP-${Date.now()}`); setPaymentProcessing(false); }} className="btn btn-primary">Top up</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No wallet found</p>
            )}
          </div>

          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-medium mb-2">Escrows</h3>
            <div className="mb-4 p-4 rounded shadow-sm bg-white">
              <h4 className="font-semibold mb-3">Deposit to Escrow (Mock Payment Gateway)</h4>

              <div className="md:flex md:gap-4 items-start">
                <div className="flex-1 border rounded p-3 bg-gray-50">
                  <div className="text-sm text-gray-600 mb-2">Payee</div>
                  <div className="font-medium">Event: {selectedEvent ? (events.find(ev=>ev._id===selectedEvent)?.title || 'Event') : 'Not selected'}</div>
                  <div className="text-sm text-gray-500">Organizer: {selectedPoolId ? (pools.find(pp=>pp._id===selectedPoolId)?.organizer?._id ? formatUserName(pools.find(pp=>pp._id===selectedPoolId).organizer) : 'Organizer') : 'Not selected'}</div>
                </div>

                <div className="w-full md:w-72 mt-3 md:mt-0">
                  <div className="mb-2">
                    <label className="text-sm text-gray-600">Amount (INR)</label>
                    <input value={depositAmount} onChange={(e)=>setDepositAmount(e.target.value)} className="input w-full" placeholder="1000" />
                  </div>

                  <div className="mb-2">
                    <label className="text-sm text-gray-600">UPI ID (mock)</label>
                    <input value={upiId} onChange={(e)=>setUpiId(e.target.value)} className="input w-full" placeholder="example@upi" />
                  </div>

                  <div className="mb-2">
                    <label className="text-sm text-gray-600">Event</label>
                    <select value={selectedEvent} onChange={(e)=>setSelectedEvent(e.target.value)} className="input w-full">
                      <option value="">Select event</option>
                      {events.map(ev=> (
                        <option key={ev._id} value={ev._id}>{ev.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="text-sm text-gray-600">Organizer (Pool)</label>
                    <select value={selectedPoolId} onChange={(e)=>setSelectedPoolId(e.target.value)} className="input w-full">
                      <option value="">Select organizer pool</option>
                      {pools.map(p=> (
                        <option key={p._id} value={p._id}>{p.pool_name || formatUserName(p.organizer)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => {
                      // start mock payment flow
                      if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) { toast.error('Enter a valid deposit amount'); return; }
                      if (!upiId) { toast.error('Enter a UPI id (mock)'); return; }
                      if (!selectedEvent) { toast.error('Select an event for this deposit'); return; }
                      if (!selectedPoolId) { toast.error('Select an organizer (pool) for this deposit'); return; }
                      setShowPaymentModal(true);
                      setPaymentProcessing(true);
                      setMockTxnId(`MOCK-TXN-${Date.now()}`);
                      // simulate gateway processing then call backend
                      setTimeout(async ()=>{
                        try {
                          // mark processing UI
                          await handleDeposit();
                          setPaymentProcessing(false);
                        } catch (e) {
                          setPaymentProcessing(false);
                        }
                      }, 1500);
                    }} className="btn btn-primary w-full" style={{ backgroundColor: '#2563eb', color: '#fff', border: '1px solid rgba(0,0,0,0.08)' }} aria-label="Pay Now">Pay ₹{depositAmount || '0'}</button>
                    <button type="button" onClick={()=>{ setDepositAmount(''); setUpiId(''); setSelectedEvent(''); setSelectedPoolId(''); }} className="btn btn-outline w-full">Reset</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock payment modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-40" onClick={()=>{ if(!paymentProcessing){ setShowPaymentModal(false); } }} />
                <div className="bg-white rounded shadow-lg p-6 z-50 w-96">
                  <h3 className="text-lg font-semibold mb-3">Mock UPI Payment</h3>
                  <p className="text-sm text-gray-600 mb-4">Transaction ID: <span className="font-mono">{mockTxnId}</span></p>
                  <div className="flex items-center justify-center mb-4">
                    {paymentProcessing ? (
                      <div className="flex items-center gap-3">
                        <div className="loader-border" style={{width:28,height:28,borderWidth:4,borderColor:'#3b82f6'}}></div>
                        <div>Processing payment…</div>
                      </div>
                    ) : (
                      <div className="text-green-600 font-semibold">Payment successful</div>
                    )}
                  </div>
                  <div className="text-right">
                    <button onClick={()=>{ setShowPaymentModal(false); }} className="btn btn-outline">Close</button>
                  </div>
                </div>
              </div>
            )}
            {loading ? (
              <p>Loading…</p>
            ) : escrow.length === 0 ? (
              <p className="text-gray-500">No escrow records</p>
            ) : (
              <div className="space-y-3">
                {escrow.map((e) => (
                  <div key={e._id} className="p-3 border rounded">
                    <div className="flex justify-between">
                      <div>
      <p className="font-semibold">Event: {e.event?.title || (typeof e.event === 'string' ? e.event : (e.event?.title || 'Event'))}</p>
      <p className="text-sm text-gray-500">Organizer: {formatUserName(e.organizer)}</p>
                      </div>
                      <div className="text-right">
      <p className="font-semibold">₹{formatDecimal(e.total_amount || e.amount)}</p>
                        <p className="text-sm text-gray-500">Status: {e.status}</p>
                        <div className="mt-2">
                          <button onClick={()=>viewEscrowStatus(e.event?._id || e.event)} className="btn btn-outline text-sm">View status</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Escrow status modal */}
            {escrowModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-40" onClick={()=>setEscrowModalOpen(false)} />
                <div className="bg-white rounded shadow-lg p-6 z-50 w-96">
                  <h3 className="text-lg font-semibold mb-3">Escrow Status</h3>
                  {escrowLoading ? (
                    <div className="py-6 flex items-center justify-center">
                      <div className="loader-border" style={{ width: 40, height: 40 }}></div>
                    </div>
                  ) : escrowDetails ? (
                    <div>
                      <p><strong>Event:</strong> {escrowDetails.escrow?.event?.title || escrowDetails.escrow?.event}</p>
                      <p><strong>Organizer:</strong> {formatUserName(escrowDetails.escrow?.organizer)}</p>
                      <p><strong>Total:</strong> ₹{formatDecimal(escrowDetails.escrow?.total_amount)}</p>
                      <p><strong>Status:</strong> {escrowDetails.escrow?.status}</p>

                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Payment Timeline</h4>
                        {escrowDetails.payments && escrowDetails.payments.length > 0 ? (
                          <div className="space-y-2">
                            {escrowDetails.payments.map((p) => (
                              <div key={p._id} className="p-2 border rounded flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-medium">₹{formatDecimal(p.amount)}</div>
                                  <div className="text-xs text-gray-500">Method: {p.payment_method} • Status: {p.status}</div>
                                  <div className="text-xs text-gray-400">Txn: {p.upi_transaction_id || p._id}</div>
                                </div>
                                <div className="text-right text-xs">
                                  <div>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                                  <div className="text-gray-500">To: {formatUserName(p.payee)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No payments recorded</p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="mt-4 flex justify-end gap-2">
                        {escrowDetails.escrow?.status !== 'released' && (
                          <button onClick={()=>handleVerifyAttendance(escrowDetails.escrow?.event)} disabled={verifyLoading} className="btn btn-teal">{verifyLoading ? 'Processing…' : 'Verify attendance & Release'}</button>
                        )}
                        <button onClick={()=>setEscrowModalOpen(false)} className="btn btn-outline">Close</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No details available</p>
                  )}
                  <div className="text-right mt-4">
                    <button onClick={()=>setEscrowModalOpen(false)} className="btn btn-outline">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostPayments;

