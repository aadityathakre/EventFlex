import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { DollarSign, ArrowUpRight } from 'lucide-react';

const GigWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchPaymentHistory();
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await gigService.getWallet();
      setWallet(data.data);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const data = await gigService.getPaymentHistory();
      setPaymentHistory(data.data || []);
    } catch (error) {
      console.error('Failed to load payment history');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await gigService.withdraw({
        amount: withdrawAmount,
        upi_id: wallet?.upi_id,
      });
      toast.success('Withdrawal request submitted');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchWallet();
    } catch (error) {
      toast.error('Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading wallet...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="btn btn-primary"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Withdraw
          </button>
        </div>

        {/* Wallet Balance Card */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-2">Available Balance</p>
              <p className="text-4xl font-bold">
                ₹{wallet?.balance_inr || '0.00'}
              </p>
              <p className="text-primary-200 mt-2">UPI: {wallet?.upi_id || 'Not set'}</p>
            </div>
            <DollarSign className="w-20 h-20 text-primary-200 opacity-50" />
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          {paymentHistory.length === 0 ? (
            <p className="text-gray-500">No payment history</p>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment._id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{payment.description || 'Payment'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-semibold ${
                      payment.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {payment.type === 'credit' ? '+' : '-'}₹{payment.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Withdraw Funds</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="input"
                    placeholder="Enter amount"
                    max={wallet?.balance_inr}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: ₹{wallet?.balance_inr || '0.00'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleWithdraw}
                    className="btn btn-primary flex-1"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GigWallet;

