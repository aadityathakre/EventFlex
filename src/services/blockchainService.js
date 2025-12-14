const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainService {
  constructor() {
    this.isEnabled = process.env.BLOCKCHAIN_ENABLED === 'true';
    if (!this.isEnabled) {
      console.log('ℹ️  Blockchain DISABLED');
      return;
    }
    
    try {
      this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
      this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
      
      const UniversalGigIdentityABI = require('../blockchain/contracts/UniversalGigIdentity.json').abi;
      const SkillBadgesABI = require('../blockchain/contracts/SkillBadges.json').abi;
      const EventEscrowABI = require('../blockchain/contracts/EventEscrow.json').abi;
      const ReputationSystemABI = require('../blockchain/contracts/ReputationSystem.json').abi;
      
      this.contracts = {
        universalGigIdentity: new ethers.Contract(
          process.env.UNIVERSAL_GIG_IDENTITY_ADDRESS,
          UniversalGigIdentityABI,
          this.wallet
        ),
        skillBadges: new ethers.Contract(
          process.env.SKILL_BADGES_ADDRESS,
          SkillBadgesABI,
          this.wallet
        ),
        eventEscrow: new ethers.Contract(
          process.env.EVENT_ESCROW_ADDRESS,
          EventEscrowABI,
          this.wallet
        ),
        reputationSystem: new ethers.Contract(
          process.env.REPUTATION_SYSTEM_ADDRESS,
          ReputationSystemABI,
          this.wallet
        )
      };
      
      console.log('✅ Blockchain service initialized');
    } catch (error) {
      console.error('❌ Blockchain init failed:', error.message);
      this.isEnabled = false;
    }
  }
  
  async createEscrow(eventId, organizerAddress, orgPercent, gigsPercent, platformPercent, amountInMatic) {
    if (!this.isEnabled) return { success: false };
    try {
      const tx = await this.contracts.eventEscrow.createEscrow(
        organizerAddress, orgPercent, gigsPercent, platformPercent, eventId,
        { value: ethers.utils.parseEther(amountInMatic.toString()) }
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'EscrowCreated');
      return { 
        success: true, 
        transactionHash: receipt.transactionHash,
        escrowId: event.args.escrowId.toNumber()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async getReputation(walletAddress) {
    if (!this.isEnabled) return { averageRating: 0, reviewCount: 0, trustLevel: 'Bronze' };
    try {
      const [avgRating, reviewCount, trustLevel] = await this.contracts.reputationSystem.getReputation(walletAddress);
      const trustLevels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Elite'];
      return {
        averageRating: avgRating.toNumber() / 10,
        reviewCount: reviewCount.toNumber(),
        trustLevel: trustLevels[trustLevel]
      };
    } catch (error) {
      return { averageRating: 0, reviewCount: 0, trustLevel: 'Bronze' };
    }
  }
}

module.exports = new BlockchainService();
