import express from 'express';
import web3Service from '../blockchain/web3Service.js';

const router = express.Router();

// Profile Routes
router.post('/profile/create', async (req, res) => {
  try {
    const { universalId, profileHash } = req.body;
    const receipt = await web3Service.createGigProfile(universalId, profileHash);
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/:address', async (req, res) => {
  try {
    const profile = await web3Service.getProfile(req.params.address);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Badge Routes
router.post('/badge/mint', async (req, res) => {
  try {
    const { to, skillName, category, metadataURI } = req.body;
    const receipt = await web3Service.mintBadge(to, skillName, category, metadataURI);
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/badge/:address', async (req, res) => {
  try {
    const badges = await web3Service.getUserBadges(req.params.address);
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reputation Routes
router.post('/reputation/review', async (req, res) => {
  try {
    const { reviewee, rating, reviewText, eventId, reviewType } = req.body;
    const receipt = await web3Service.submitReview(reviewee, rating, reviewText, eventId, reviewType);
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reputation/:address', async (req, res) => {
  try {
    const reputation = await web3Service.getReputation(req.params.address);
    const formatted = {
      averageRating: reputation[0],
      totalReviews: reputation[1],
      trustLevel: reputation[2]
    };
    res.json({ success: true, reputation: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Escrow Routes
router.post('/escrow/create', async (req, res) => {
  try {
    const { organizer, organizerPerc, gigsPerc, platformPerc, eventId, amountMatic } = req.body;
    const receipt = await web3Service.createEscrow(
      organizer, organizerPerc, gigsPerc, platformPerc, eventId, amountMatic
    );
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
