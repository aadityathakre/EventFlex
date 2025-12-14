import React, { useState } from 'react';
import Dialog from './Dialog';
import { depositPayment } from '../api/host';
import './PaymentDepositDialog.scss';

const PaymentDepositDialog = ({ isOpen, onClose, event, organizers = [] }) => {
  const [formData, setFormData] = useState({
    organizerId: '',
    totalAmount: '',
    organizerPercentage: '40',
    gigsPercentage: '60',
    paymentMethod: 'upi',
    upiTransactionId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-calculate percentages if one changes
    if (name === 'organizerPercentage') {
      const orgPercentage = parseFloat(value) || 0;
      const gigsPercentage = 100 - orgPercentage;
      setFormData({
        ...formData,
        organizerPercentage: value,
        gigsPercentage: gigsPercentage.toString(),
      });
    } else if (name === 'gigsPercentage') {
      const gigsPercentage = parseFloat(value) || 0;
      const orgPercentage = 100 - gigsPercentage;
      setFormData({
        ...formData,
        gigsPercentage: value,
        organizerPercentage: orgPercentage.toString(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event) {
      setError('No event selected');
      return;
    }

    // Validate percentages add up to 100
    const orgPercent = parseFloat(formData.organizerPercentage) || 0;
    const gigsPercent = parseFloat(formData.gigsPercentage) || 0;

    if (Math.abs(orgPercent + gigsPercent - 100) > 0.01) {
      setError('Organizer and Gigs percentages must add up to 100%');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const paymentData = {
        eventId: event.id,
        organizerId: formData.organizerId,
        total_amount: formData.totalAmount,
        organizer_percentage: formData.organizerPercentage,
        gigs_percentage: formData.gigsPercentage,
        payment_method: formData.paymentMethod,
        upi_transaction_id: formData.upiTransactionId,
      };

      console.log('Depositing payment:', paymentData);

      const response = await depositPayment(paymentData);
      console.log('Payment deposit response:', response.data);

      // Reset form and close dialog
      setFormData({
        organizerId: '',
        totalAmount: '',
        organizerPercentage: '40',
        gigsPercentage: '60',
        paymentMethod: 'upi',
        upiTransactionId: '',
      });

      alert('Payment deposited to escrow successfully!');
      onClose();
    } catch (err) {
      console.error('Error depositing payment:', err);
      setError(err.response?.data?.message || 'Failed to deposit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="payment-deposit-dialog">
      <div className="dialog-header">
        <h2 className="dialog-title">Deposit to Escrow</h2>
        {event && (
          <p className="event-title">{event.title}</p>
        )}
      </div>

      <div className="dialog-body">
        {error && (
          <div className="error-message" style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Organizer</label>
            <div className="select-wrapper">
              <select
                name="organizerId"
                value={formData.organizerId}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={loading}
              >
                <option value="">Select organizer</option>
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <svg className="select-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="form-group">
            <label>Total Amount (₹)</label>
            <input
              type="number"
              name="totalAmount"
              placeholder="Enter total amount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className="form-input"
              step="0.01"
              min="0"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Organizer Share (%)</label>
              <input
                type="number"
                name="organizerPercentage"
                placeholder="40"
                value={formData.organizerPercentage}
                onChange={handleInputChange}
                className="form-input"
                step="0.01"
                min="0"
                max="100"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Gig Workers Share (%)</label>
              <input
                type="number"
                name="gigsPercentage"
                placeholder="60"
                value={formData.gigsPercentage}
                onChange={handleInputChange}
                className="form-input"
                step="0.01"
                min="0"
                max="100"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="select-wrapper">
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={loading}
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
              </select>
              <svg className="select-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="form-group">
            <label>UPI Transaction ID</label>
            <input
              type="text"
              name="upiTransactionId"
              placeholder="Enter transaction ID"
              value={formData.upiTransactionId}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Processing...' : 'Deposit Now'}
            </button>
            <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default PaymentDepositDialog;
