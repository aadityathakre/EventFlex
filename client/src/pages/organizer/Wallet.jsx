import React, { useState } from 'react';
import './Wallet.scss';

function OrganizerWallet() {
  const [balance] = useState(1203);
  const [upiId] = useState('iswaran@okicic');
  const [transactions] = useState([
    {
      id: 1,
      eventName: 'Wedding #1',
      amount: 120,
      status: 'success',
      date: '2024-01-15',
    },
    {
      id: 2,
      eventName: 'Wedding #1',
      amount: 120,
      status: 'failed',
      date: '2024-01-14',
    },
    {
      id: 3,
      eventName: 'Corporate Event',
      amount: 300,
      status: 'success',
      date: '2024-01-10',
    },
  ]);

  const handleDeposit = () => {
    console.log('Deposit balance clicked');
  };

  const handleWithdraw = () => {
    console.log('Withdraw balance clicked');
  };

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

      <div className="wallet-info">
        <div className="balance-section">
          <span className="balance-label">CURRENT BALANCE</span>
          <span className="balance-amount">${balance}</span>
        </div>

        <div className="upi-section">
          <span className="upi-label">UPI ID</span>
          <span className="upi-id">{upiId}</span>
        </div>
      </div>

      <div className="payment-history">
        <h2 className="history-title">PAYMENT HISTORY</h2>
        <div className="transactions-list">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <span className="transaction-event">{transaction.eventName}</span>
              <span className="transaction-amount">${transaction.amount}</span>
              <span className={`transaction-status ${transaction.status}`}>
                {transaction.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizerWallet;
