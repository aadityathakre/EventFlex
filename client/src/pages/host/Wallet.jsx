import React, { useState, useEffect } from 'react';
import { getWalletBalance } from '../../api/host';
import './Wallet.scss';

function HostWallet() {
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
      const response = await getWalletBalance();

      // Extract wallet data from response
      const walletData = response.data.data || response.data;

      // Set balance
      const balanceAmount = walletData.balance_inr?.$numberDecimal || walletData.balance_inr || 0;
      setBalance(parseFloat(balanceAmount));

      // Set UPI ID if available
      if (walletData.upi_id) {
        setUpiId(walletData.upi_id);
      }

      // Set transaction history if available
      if (walletData.transactions && Array.isArray(walletData.transactions)) {
        const formattedTransactions = walletData.transactions.map((txn) => ({
          id: txn._id || txn.id,
          eventName: txn.event_name || txn.description || 'N/A',
          amount: parseFloat(txn.amount?.$numberDecimal || txn.amount || 0),
          status: txn.status || 'pending',
          date: txn.date || txn.createdAt,
        }));
        setTransactions(formattedTransactions);
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

export default HostWallet;
