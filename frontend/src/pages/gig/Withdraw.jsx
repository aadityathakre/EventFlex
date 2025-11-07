import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { gigService } from '../../services/apiServices';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, IndianRupee } from 'lucide-react';

const WithdrawPage = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await gigService.getWallet();
      setWallet(data.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Could not fetch wallet details');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > wallet?.balance_inr) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setWithdrawing(true);
      await gigService.withdraw({ amount: parseFloat(amount) });
      toast.success('Withdrawal processed successfully');
      await fetchWallet(); // Refresh wallet balance
      setAmount(''); // Clear form
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading wallet details...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/gig/dashboard')} className="text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
        </div>

        {/* Wallet Balance Card */}
        <div className="card bg-gradient-to-r from-teal to-teal-dark text-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Available Balance</h2>
          </div>
          <p className="text-3xl font-bold mb-1">₹{wallet?.balance_inr.toFixed(2) || '0.00'}</p>
          {wallet?.escrow > 0 && (
            <p className="text-sm opacity-80">+ ₹{wallet.escrow} in escrow</p>
          )}
        </div>

        {/* Withdrawal Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Withdrawal Amount</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Amount (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input pl-10"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {wallet?.upi_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID for Withdrawal
                </label>
                <input
                  type="text"
                  value={wallet.upi_id}
                  disabled
                  className="input bg-gray-50"
                />
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={withdrawing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > wallet?.balance_inr}
              className={`btn btn-primary w-full ${withdrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {withdrawing ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setAmount(wallet?.balance_inr?.toString() || '0')}
              className="btn btn-secondary w-full"
            >
              Withdraw All (₹{wallet?.balance_inr?.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WithdrawPage;