import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { useAuth } from "../../context/AuthContext";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { FaTrash } from "react-icons/fa";

function OrganizerWallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wallet, setWallet] = useState({ balance: 0, upi_id: "" });
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("org_withdraw_history") || "[]");
    } catch {
      return [];
    }
  });
  const [payments, setPayments] = useState([]);

  // Withdraw UI state (introduced for Razorpay-like experience)
  const [withdrawMode, setWithdrawMode] = useState("upi");
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawUPI, setWithdrawUPI] = useState("");
  const [withdrawBankAccount, setWithdrawBankAccount] = useState("");
  const [withdrawIFSC, setWithdrawIFSC] = useState("");

  // If wallet UPI is available, prefill withdraw UPI when empty
  useEffect(() => {
    if (wallet?.upi_id && !withdrawUPI) {
      setWithdrawUPI(wallet.upi_id);
    }
  }, [wallet?.upi_id]);

  // Helper: normalize Mongo Decimal128 or mixed numeric types to Number
  const asNumber = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const n = parseFloat(val);
      return Number.isNaN(n) ? null : n;
    }
    if (typeof val === "object") {
      if ("$numberDecimal" in val) {
        const n = parseFloat(val.$numberDecimal);
        return Number.isNaN(n) ? null : n;
      }
    }
    return null;
  };

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/wallet`, { withCredentials: true });
      const rawBal = res.data?.data?.balance;
      const bal = asNumber(rawBal) ?? 0;
      const upi = res.data?.data?.upi_id || "";
      setWallet({ balance: bal, upi_id: upi });
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Failed to load wallet", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${serverURL}/organizer/payment-history`, { withCredentials: true });
      setPayments(res.data?.data || []);
    } catch (e) {
      void e;
    }
  };

  const deletePayment = async (id) => {
    const ok = typeof window !== "undefined" ? window.confirm("Delete this payment record?") : true;
    if (!ok) return;
    try {
      await axios.delete(`${serverURL}/organizer/payment-history/${id}`, { withCredentials: true });
      setPayments((prev) => prev.filter((p) => p._id !== id));
      showToast("Payment record deleted", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to delete payment record", "error");
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchPayments();
  }, []);

  const withdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    try {
      const amountNum = parseFloat(withdrawAmount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        showToast("Enter a valid amount", "error");
        return;
      }
      const prefill = {
        name: user?.name || "Organizer",
        email: user?.email || "",
        contact: user?.phone || "9999999999",
      };
      navigate("/razorpay", {
        state: {
          checkoutPurpose: "withdraw",
          amount: amountNum,
          mode: withdrawMode,
          beneficiary_name: withdrawName,
          ...(withdrawMode === "upi"
            ? { upi_id: withdrawUPI || wallet.upi_id }
            : { account_number: withdrawBankAccount, ifsc: withdrawIFSC }),
          prefill,
          returnPath: "/organizer/wallet",
        },
      });
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Failed to start checkout", "error");
    }
  };

  // Handle return from Razorpay: show toast, update balance, record debit
  useEffect(() => {
    const st = location.state;
    if (!st) return;
    if (st.toast) {
      const { type, message } = st.toast;
      showToast(message, type || "info");
    }
    if (st.wallet?.visible && st.wallet?.balance !== undefined) {
      setWallet((w) => ({ ...w, balance: st.wallet.balance ?? w.balance }));
    }
    if (st.debitedAmount) {
      const amt = parseFloat(st.debitedAmount);
      if (Number.isFinite(amt) && amt > 0) {
        const entry = { amount: amt, date: new Date().toISOString() };
        const next = [entry, ...history];
        setHistory(next);
        localStorage.setItem("org_withdraw_history", JSON.stringify(next));
      }
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Wallet & Escrow" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-start md:gap-6">
          <div className="w-full md:w-2/5">
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-32 overflow-hidden">
                <img
                  src="/cards_images/wallet.png"
                  alt="wallet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">Wallet Balance</h3>
                {loading ? (
                  <div className="mt-2 animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                ) : (
                  <p className="text-3xl font-extrabold mt-1">₹ {wallet.balance?.toFixed(2) || 0}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">UPI: {wallet.upi_id || "-"}</p>
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Amount (INR)</label>
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="e.g., 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Destination</label>
                      <select
                        value={withdrawMode}
                        onChange={(e) => setWithdrawMode(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="upi">UPI</option>
                        <option value="bank">Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Beneficiary Name</label>
                      <input
                        type="text"
                        value={withdrawName}
                        onChange={(e) => setWithdrawName(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Recipient name"
                      />
                    </div>
                    {withdrawMode === "upi" ? (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
                        <input
                          type="text"
                          value={withdrawUPI}
                          onChange={(e) => setWithdrawUPI(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="example@bank"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                          <input
                            type="text"
                            value={withdrawBankAccount}
                            onChange={(e) => setWithdrawBankAccount(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="0000 0000 0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">IFSC</label>
                          <input
                            type="text"
                            value={withdrawIFSC}
                            onChange={(e) => setWithdrawIFSC(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="ABCD0123456"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={withdraw} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Confirm Withdraw</button>
                    <button onClick={fetchWallet} className="px-4 py-2 border rounded-lg">Refresh</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-3/5 space-y-6 mt-6 md:mt-0">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="text-lg font-bold mb-3">Escrow Payment History</h4>
              {payments.length === 0 ? (
                <p className="text-gray-600">No escrow records yet.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-auto">
                  {payments.map((p) => {
                    const total = asNumber(p?.total_amount ?? p?.amount) || 0;
                    const orgPct = asNumber(p?.organizer_percentage) || 0;
                    const gigsPct = asNumber(p?.gigs_percentage) || 0;
                    
                    const orgAmount = (total * orgPct) / 100;
                    const gigsAmount = (total * gigsPct) / 100;
                    
                    return (
                      <div key={p._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900">
                              {(() => {
                                const ev = p?.event;
                                if (!ev) return "Event Payment";
                                if (typeof ev === "object") return ev?.title || ev?._id || "Event Payment";
                                return ev;
                              })()}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p?.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p?.status || 'pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Escrow</p>
                            <p className="text-lg font-bold text-gray-900">₹ {total.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => deletePayment(p._id)}
                              className="text-red-500 text-xs hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-purple-50 p-2 rounded border border-purple-100">
                            <p className="text-xs text-purple-600 font-bold">Organizer ({orgPct}%)</p>
                            <p className="font-semibold text-purple-900">+ ₹ {orgAmount.toFixed(2)}</p>
                          </div>
                          <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                            <p className="text-xs text-indigo-600 font-bold">Gigs Pool ({gigsPct}%)</p>
                            <p className="font-semibold text-indigo-900">₹ {gigsAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold mb-2">Debited History (local)</h4>
              {history.length === 0 ? (
                <p className="text-gray-600">No debits yet.</p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-auto">
                  {history.map((h, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm">
                      <span>₹ {h.amount}</span>
                      <span className="text-gray-500">{new Date(h.date).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrganizerWallet;
