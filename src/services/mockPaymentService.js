class MockPaymentService {
  async createPayment(amount, eventId, hostId) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const upiTransactionId = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return {
      success: true,
      paymentId: upiTransactionId,
      amount: amount,
      status: 'SUCCESS',
      message: 'Payment received via UPI',
      timestamp: new Date()
    };
  }
  
  async sendPayout(gigUpiId, gigName, amount) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const utr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    return {
      success: true,
      utr: utr,
      amount: amount,
      recipientUpiId: gigUpiId,
      recipientName: gigName,
      status: 'SUCCESS',
      timestamp: new Date()
    };
  }
}

module.exports = new MockPaymentService();
