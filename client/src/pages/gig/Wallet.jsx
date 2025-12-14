import React, { useState, useEffect } from 'react';
import { getWallet, getPaymentHistory } from '../../api/gig';
import './Wallet.scss';

function GigWallet() {
  const [balance, setBalance] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch wallet balance
      const walletResponse = await getWallet();

      // Extract wallet data from response
      const walletData = walletResponse.data.data || walletResponse.data;

      console.log('Wallet response:', walletResponse.data);
      console.log('Wallet data:', walletData);
      console.log('Balance INR:', walletData.balance_inr);

      // Set balance - balance_inr can be a number or Decimal128
      const balanceAmount = walletData.balance_inr?.$numberDecimal ||
                           walletData.balance_inr || 0;
      console.log('Balance amount:', balanceAmount);
      setBalance(parseFloat(balanceAmount));

      // Set UPI ID if available
      if (walletData.upi_id) {
        setUpiId(walletData.upi_id);
      }

      // Try to fetch payment history (optional - don't fail if this endpoint doesn't exist)
      try {
        const paymentsResponse = await getPaymentHistory();
        const paymentsData = paymentsResponse.data.data || paymentsResponse.data.payments || [];

        // Transform payments to match component structure
        const formattedTransactions = paymentsData.map((payment) => ({
          id: payment._id || payment.id,
          eventName: payment.event_name || payment.event?.title || payment.description || 'N/A',
          amount: parseFloat(payment.amount?.$numberDecimal || payment.amount || 0),
          status: payment.status || 'pending',
          date: payment.date || payment.createdAt,
        }));

        setTransactions(formattedTransactions);
      } catch (paymentErr) {
        console.warn('Payment history not available:', paymentErr.message);
        // Leave transactions as empty array
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err.response?.data?.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    console.log('Deposit balance clicked');
  };

  const handleWithdraw = () => {
    console.log('Withdraw balance clicked');
  };

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="loading-state">
          <p>Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>Wallet</h1>
        <div className="wallet-actions">
          <button className="deposit-button" onClick={handleDeposit}>
            Deposit balance
          </button>
          <button className="withdraw-button" onClick={handleWithdraw}>
            Withdraw balance
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="wallet-info">
        <div className="balance-section">
          <span className="balance-label">CURRENT BALANCE</span>
          <span className="balance-amount">₹{balance.toFixed(2)}</span>
        </div>

        {upiId && (
          <div className="upi-section">
            <span className="upi-label">UPI ID</span>
            <span className="upi-id">{upiId}</span>
          </div>
        )}
      </div>

      <div className="payment-history">
        <h2 className="history-title">PAYMENT HISTORY</h2>
        {transactions.length === 0 ? (
          <div className="empty-transactions">
            <p>No transaction history available</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <span className="transaction-event">{transaction.eventName}</span>
                <span className="transaction-amount">₹{transaction.amount.toFixed(2)}</span>
                <span className={`transaction-status ${transaction.status}`}>
                  {transaction.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GigWallet;
