import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function GigWallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [wallet, setWallet] = useState({ balance: 0, upi_id: "" });
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [payments, setPayments] = useState([]);

  const [withdrawMode, setWithdrawMode] = useState("upi");
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawUPI, setWithdrawUPI] = useState("");
  const [withdrawBankAccount, setWithdrawBankAccount] = useState("");
  const [withdrawIFSC, setWithdrawIFSC] = useState("");

  useEffect(() => {
    if (wallet?.upi_id && !withdrawUPI) setWithdrawUPI(wallet.upi_id);
  }, [wallet?.upi_id]);

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
      const res = await axios.get(`${serverURL}/gigs/wallet`, { withCredentials: true });
      const rawBal = res.data?.data?.balance_inr ?? res.data?.data?.balance;
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
      const res = await axios.get(`${serverURL}/gigs/payment-history`, { withCredentials: true });
      setPayments(res.data?.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchWallet();
    fetchPayments();
  }, []);

  const withdraw = () => {
    const amountNum = parseFloat(withdrawAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    const prefill = {
      name: user?.fullName || user?.name || "Gig",
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
        returnPath: "/gig/wallet",
      },
    });
  };

  useEffect(() => {
    const st = location.state;
    if (!st) return;
    if (st.toast) showToast(st.toast.message, st.toast.type || "info");
    if (st.wallet?.visible && st.wallet?.balance !== undefined) {
      setWallet((w) => ({ ...w, balance: st.wallet.balance ?? w.balance }));
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Gig Wallet" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-start md:gap-6">
          <div className="w-full md:w-2/5">
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-32 overflow-hidden">
                <img src="/cards_images/wallet.png" alt="wallet" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                      <input type="number" min={1} step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 1000" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Destination</label>
                      <select value={withdrawMode} onChange={(e) => setWithdrawMode(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                        <option value="upi">UPI</option>
                        <option value="bank">Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Beneficiary Name</label>
                      <input type="text" value={withdrawName} onChange={(e) => setWithdrawName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Recipient name" />
                    </div>
                    {withdrawMode === "upi" ? (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
                        <input type="text" value={withdrawUPI} onChange={(e) => setWithdrawUPI(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="example@bank" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                          <input type="text" value={withdrawBankAccount} onChange={(e) => setWithdrawBankAccount(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="0000 0000 0000" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">IFSC</label>
                          <input type="text" value={withdrawIFSC} onChange={(e) => setWithdrawIFSC(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="ABCD0123456" />
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
              <h4 className="text-lg font-bold mb-3">Payment History</h4>
              {payments.length === 0 ? (
                <p className="text-gray-600">No payments yet.</p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-auto">
                  {payments.map((p) => (
                    <div key={p._id} className="border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Event: {p?.event?.title || p?.event || '-'}</p>
                        <p className="text-sm text-gray-600">Total: ₹ {(asNumber(p?.total_amount ?? p?.amount) ?? 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Status: {p?.status || 'pending'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs ${p?.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p?.status || 'pending'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GigWallet;
