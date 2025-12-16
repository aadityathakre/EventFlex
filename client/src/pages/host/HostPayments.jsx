import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import { useNavigate } from "react-router-dom";
import { FaWallet, FaArrowLeft, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { getEventTypeImage } from "../../utils/imageMaps.js";
import { useAuth } from "../../context/AuthContext";

function HostPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [events, setEvents] = useState([]);
  const [assignedPools, setAssignedPools] = useState([]);
  const [profile, setProfile] = useState(null);
  const [prefill, setPrefill] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [withdraw, setWithdraw] = useState({ amount: "", mode: "upi", upi_id: "", beneficiary_name: "", account_number: "", ifsc: "" });
  const [deposit, setDeposit] = useState({ total_amount: "", organizer_percentage: 70, gigs_percentage: 30, payment_method: "upi", upi_transaction_id: "", upi_id: "" });
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({ withdraw: false, deposit: false, release: false });
  const [escrowSearch, setEscrowSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [walletRes, eventsRes, poolsRes, profileRes] = await Promise.all([
          axios.get(`${serverURL}/host/wallet/balance`, { withCredentials: true }),
          axios.get(`${serverURL}/host/events`, { withCredentials: true }),
          axios.get(`${serverURL}/host/organizer`, { withCredentials: true }),
          axios.get(`${serverURL}/host/profile`, { withCredentials: true }),
        ]);
        setWallet(walletRes.data?.data || null);
        setEvents(eventsRes.data?.data || []);
        setAssignedPools(poolsRes.data?.data || []);
        const mergedProfile = profileRes.data?.data?.mergedProfile || null;
        setProfile(mergedProfile);

        // Build Razorpay prefill using profile, then auth user, then safe defaults
        const namePref = mergedProfile?.name || user?.fullName || user?.name || "Host User";
        const emailPref = mergedProfile?.email || user?.email || "";
        const phoneRaw = mergedProfile?.phone || user?.phone || user?.mobile || "9999999999";
        const phonePref = typeof phoneRaw === "string" && /^\d{10}$/.test(phoneRaw) ? phoneRaw : "9999999999";
        setPrefill({ name: namePref, email: emailPref, contact: phonePref });
        setError(null);
      } catch (err) {
        console.error("Payments init error:", err);
        setError(err.response?.data?.message || "Failed to load payments data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const selectedOrganizerId = useMemo(() => {
    const pool = assignedPools.find((p) => p?.event?._id === selectedEventId);
    return pool?.organizer?._id || null;
  }, [assignedPools, selectedEventId]);

  const filteredEvents = useMemo(() => {
    const q = escrowSearch.trim().toLowerCase();
    if (!q) return events;
    return events.filter((evt) => (evt?.title || "").toLowerCase().includes(q));
  }, [escrowSearch, events]);

  const refreshWallet = async () => {
    try {
      const res = await axios.get(`${serverURL}/host/wallet/balance`, { withCredentials: true });
      setWallet(res.data?.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshEscrow = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await axios.get(`${serverURL}/host/payment/status/${eventId}`, { withCredentials: true });
      setEscrow(res.data?.data || null);
    } catch (err) {
      setEscrow(null);
    }
  };

  useEffect(() => {
    refreshEscrow(selectedEventId);
  }, [selectedEventId]);

  const onWithdraw = async () => {
    setError(null);
    const amountNum = parseFloat(withdraw.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid withdrawal amount");
      return;
    }
    try {
      setBusy((b) => ({ ...b, withdraw: true }));
      // Navigate to Razorpay test checkout to confirm withdraw
      const safePrefill = prefill || {
        name: user?.name || user?.fullName || "Host User",
        email: user?.email || "",
        contact: (typeof user?.phone === "string" && /^\d{10}$/.test(user.phone)) ? user.phone : (typeof user?.mobile === "string" && /^\d{10}$/.test(user.mobile)) ? user.mobile : "9999999999",
      };
      navigate("/razorpay", {
        state: {
          checkoutPurpose: "withdraw",
          amount: amountNum,
          mode: withdraw.mode,
          beneficiary_name: withdraw.beneficiary_name,
          upi_id: withdraw.upi_id,
          account_number: withdraw.account_number,
          ifsc: withdraw.ifsc,
          returnPath: "/host/payments",
          prefill: safePrefill,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setBusy((b) => ({ ...b, withdraw: false }));
    }
  };

  const onDeposit = async () => {
    setError(null);
    if (!selectedEventId) {
      setError("Select an event for escrow deposit");
      return;
    }
    if (!selectedOrganizerId) {
      setError("No organizer assigned to selected event");
      return;
    }
    const total = parseFloat(deposit.total_amount);
    const orgPct = parseFloat(deposit.organizer_percentage);
    const gigsPct = parseFloat(deposit.gigs_percentage);
    if (isNaN(total) || total <= 0) {
      setError("Enter a valid total amount");
      return;
    }
    if (orgPct + gigsPct !== 100) {
      setError("Organizer and gigs percentages must sum to 100");
      return;
    }
    try {
      setBusy((b) => ({ ...b, deposit: true }));
      const payload = {
        eventId: selectedEventId,
        organizerId: selectedOrganizerId,
        total_amount: total,
        organizer_percentage: orgPct,
        gigs_percentage: gigsPct,
        payment_method: deposit.payment_method,
        upi_transaction_id: deposit.payment_method === "upi" ? deposit.upi_transaction_id : undefined,
      };
      await axios.post(`${serverURL}/host/payment/deposit`, payload, { withCredentials: true });
      await refreshEscrow(selectedEventId);
      await refreshWallet();
      setDeposit({ total_amount: "", organizer_percentage: 70, gigs_percentage: 30, payment_method: deposit.payment_method, upi_transaction_id: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Escrow deposit failed");
    } finally {
      setBusy((b) => ({ ...b, deposit: false }));
    }
  };

  const onRelease = async () => {
    setError(null);
    if (!selectedEventId) return;
    try {
      setBusy((b) => ({ ...b, release: true }));
      await axios.post(`${serverURL}/host/verify-attendance/${selectedEventId}`, {}, { withCredentials: true });
      await refreshEscrow(selectedEventId);
    } catch (err) {
      setError(err.response?.data?.message || "Escrow release failed");
    } finally {
      setBusy((b) => ({ ...b, release: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  // Robust balance parsing (handles Decimal128 JSON like { $numberDecimal: "123.45" })
  const balanceRaw = wallet?.balance_inr?.$numberDecimal ?? wallet?.balance_inr;
  const balanceDisplay = (() => {
    if (balanceRaw === undefined || balanceRaw === null) return "0.00";
    const asString = typeof balanceRaw === "string" ? balanceRaw : balanceRaw?.toString?.();
    const num = parseFloat(asString);
    return isNaN(num)
      ? "0.00"
      : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-indigo-600">
                <FaArrowLeft />
              </button>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Payments & Wallet
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {/* Wallet */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaWallet className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                {!showBalance ? (
                  <button onClick={() => setShowBalance(true)} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Show Balance</button>
                ) : (
                  <p onClick={() => setShowBalance(false)} className="text-2xl font-bold text-gray-900 cursor-pointer" title="Click to hide">₹ {balanceDisplay}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => navigate('/razorpay')} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg">Deposit via Razorpay</button>
              <button onClick={refreshWallet} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Refresh</button>
            </div>
          </div>
        </section>

        {/* Withdraw & Escrow Cards Row */}
        <div className="flex flex-col md:flex-row gap-8  items-stretch">
        {/* Withdraw Card */}
        <section className="bg-indigo-50 rounded-2xl shadow-lg mr-8 p-6 border border-indigo-300 w-full md:w-2/5">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Withdraw Funds</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={withdraw.amount}
                onChange={(e) => setWithdraw((w) => ({ ...w, amount: e.target.value }))}
                placeholder="Amount (₹)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={withdraw.mode}
                onChange={(e) => setWithdraw((w) => ({ ...w, mode: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            {withdraw.mode === "upi" ? (
              <input
                value={withdraw.upi_id}
                onChange={(e) => setWithdraw((w) => ({ ...w, upi_id: e.target.value }))}
                placeholder="UPI ID"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={withdraw.account_number}
                  onChange={(e) => setWithdraw((w) => ({ ...w, account_number: e.target.value }))}
                  placeholder="Account Number"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={withdraw.ifsc}
                  onChange={(e) => setWithdraw((w) => ({ ...w, ifsc: e.target.value }))}
                  placeholder="IFSC"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
            <input
              value={withdraw.beneficiary_name}
              onChange={(e) => setWithdraw((w) => ({ ...w, beneficiary_name: e.target.value }))}
              placeholder="Beneficiary Name (optional)"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={onWithdraw}
              disabled={busy.withdraw}
              className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm hover:shadow"
            >
              {busy.withdraw ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </section>

        {/* Escrow Deposit Card */}
        <section className="bg-emerald-50 rounded-2xl shadow-lg p-6 ml-2 border border-emerald-300 w-full md:w-2/5">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Deposit to Escrow</h3>
          <div className="space-y-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select Event</option>
              {events.map((evt) => (
                <option key={evt._id} value={evt._id}>{evt.title}</option>
              ))}
            </select>

            {!selectedOrganizerId && selectedEventId && (
              <p className="text-sm text-amber-600">No organizer assigned to this event yet.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={deposit.total_amount}
                onChange={(e) => setDeposit((d) => ({ ...d, total_amount: e.target.value }))}
                placeholder="Total Amount (₹)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={deposit.organizer_percentage}
                  onChange={(e) => setDeposit((d) => ({ ...d, organizer_percentage: e.target.value }))}
                  placeholder="Organizer %"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={deposit.gigs_percentage}
                  onChange={(e) => setDeposit((d) => ({ ...d, gigs_percentage: e.target.value }))}
                  placeholder="Gigs %"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={deposit.payment_method}
                onChange={(e) => setDeposit((d) => ({ ...d, payment_method: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="upi">UPI</option>
                <option value="cashless">Cashless</option>
              </select>
              {deposit.payment_method === "upi" && (
                <input
                  value={deposit.upi_transaction_id}
                  onChange={(e) => setDeposit((d) => ({ ...d, upi_transaction_id: e.target.value }))}
                  placeholder="UPI Transaction ID"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
            {deposit.payment_method === "upi" && (
              <input
                value={deposit.upi_id}
                onChange={(e) => setDeposit((d) => ({ ...d, upi_id: e.target.value }))}
                placeholder="Your UPI ID (e.g., name@bank)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            )}
            <button
              onClick={onDeposit}
              disabled={busy.deposit}
              className="px-3 py-2 bg-gradient-to-r from-purple-600 m-4 to-indigo-600 text-white rounded-lg text-sm hover:shadow"
            >
              {busy.deposit ? "Depositing..." : "Deposit to Escrow"}
            </button>
            {deposit.payment_method === "upi" && (
              <button
                onClick={() => {
                  const total = parseFloat(deposit.total_amount);
                  if (!selectedEventId) {
                    setError("Select an event for escrow deposit");
                    return;
                  }
                  if (!selectedOrganizerId) {
                    setError("No organizer assigned to selected event");
                    return;
                  }
                  if (isNaN(total) || total <= 0) {
                    setError("Enter a valid total amount");
                    return;
                  }
                  const safePrefill = prefill || {
                    name: user?.name || user?.fullName || "Host User",
                    email: user?.email || "",
                    contact:
                      typeof user?.phone === "string" && /^\d{10}$/.test(user.phone)
                        ? user.phone
                        : typeof user?.mobile === "string" && /^\d{10}$/.test(user.mobile)
                        ? user.mobile
                        : "9999999999",
                  };
                  navigate("/razorpay", {
                    state: {
                      checkoutPurpose: "deposit_escrow",
                      amount: total,
                      eventId: selectedEventId,
                      organizerId: selectedOrganizerId,
                      organizer_percentage: deposit.organizer_percentage,
                      gigs_percentage: deposit.gigs_percentage,
                      payment_method: "upi",
                      upi_id: deposit.upi_id,
                      returnPath: "/host/payments",
                      prefill: safePrefill,
                    },
                  });
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:shadow"
              >
                Pay via UPI (Razorpay)
              </button>
            )}
          </div>
        </section>
        </div>

        {/* Escrow Status */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">Escrow Status</h3>
            <div className="flex items-center space-x-2">
              <input
                value={escrowSearch}
                onChange={(e) => setEscrowSearch(e.target.value)}
                placeholder="Search events"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Event</option>
                {filteredEvents.map((evt) => (
                  <option key={evt._id} value={evt._id}>{evt.title}</option>
                ))}
              </select>
              <button onClick={() => refreshEscrow(selectedEventId)} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Refresh</button>
            </div>
          </div>

          {escrowSearch && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredEvents.map((evt) => (
                <button
                  key={evt._id}
                  onClick={() => setSelectedEventId(evt._id)}
                  className={`text-left p-2 border rounded-lg hover:bg-gray-50 transition ${selectedEventId === evt._id ? 'border-indigo-600' : ''}`}
                >
                  <p className="text-sm font-semibold text-gray-900">{evt.title}</p>
                  <p className="text-xs text-gray-600">{evt.event_type || 'Event'}</p>
                </button>
              ))}
            </div>
          )}

          {!escrow ? (
            <p className="text-gray-600">No escrow record for selected event.</p>
          ) : (
            <div className="group rounded-2xl border border-emerald-300 bg-emerald-50 shadow-sm overflow-hidden">
              <div className="relative h-28 overflow-hidden">
                {escrow?.event?.event_type && (
                  <img src={getEventTypeImage(escrow.event.event_type)} alt={escrow.event.event_type} className="w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-green-600/20 to-teal-600/20" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <FaShieldAlt className="text-emerald-600" />
                </div>
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{escrow?.event?.title || 'Event'}</p>
                  <p className="text-sm text-slate-600">Organizer: {escrow?.organizer?.email || ""}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${escrow.status === 'released' ? 'bg-green-100 text-green-700' : escrow.status === 'pending_verification' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{escrow.status}</span>
              </div>
              <div className="px-4 pb-4">
                <button
                  onClick={onRelease}
                  disabled={busy.release || escrow.status === "released"}
                  className={`px-3 py-2 text-sm rounded-lg flex items-center space-x-2 ${escrow.status === "released" ? "bg-green-100 text-green-700" : "bg-emerald-600 text-white"}`}
                >
                  <FaCheckCircle />
                  <span>{escrow.status === "released" ? "Released" : busy.release ? "Releasing..." : "Verify Attendance (Release)"}</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HostPayments;
