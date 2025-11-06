const mockPaymentService = require('../services/mockPaymentService');
const blockchainService = require('../services/blockchainService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.createHostPayment = asyncHandler(async (req, res) => {
  const { eventId, amount, organizerAddress } = req.body;
  
  const upiPayment = await mockPaymentService.createPayment(amount, eventId, req.user.id);
  
  let blockchainProof = null;
  if (blockchainService.isEnabled && organizerAddress) {
    const result = await blockchainService.createEscrow(eventId, organizerAddress, 50, 40, 10, 0.001);
    if (result.success) {
      blockchainProof = {
        transactionHash: result.transactionHash,
        escrowId: result.escrowId,
        explorerUrl: `https://amoy.polygonscan.com/tx/${result.transactionHash}`
      };
    }
  }
  
  res.json(new ApiResponse(200, { payment: upiPayment, blockchainProof }, 'Payment successful'));
});
