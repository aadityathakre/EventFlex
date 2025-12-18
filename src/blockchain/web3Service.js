import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env.blockchain" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Web3Service {
  constructor() {
    if (!process.env.BLOCKCHAIN_ENABLED || process.env.BLOCKCHAIN_ENABLED !== 'true') {
      console.warn('⚠️ Blockchain is disabled');
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
      this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
      this.contracts = this.loadContracts();
      
      console.log('✅ Web3Service initialized');
    } catch (error) {
      console.error('❌ Web3Service initialization failed:', error.message);
      throw error;
    }
  }

  loadContracts() {
    const loadABI = (name) => {
      const abiPath = path.join(__dirname, 'contracts', `${name}.json`);
      if (!fs.existsSync(abiPath)) {
        throw new Error(`ABI file not found: ${abiPath}`);
      }
      const content = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      return content.abi;
    };

    return {
      universalGigIdentity: new ethers.Contract(
        process.env.UNIVERSAL_GIG_IDENTITY_ADDRESS,
        loadABI('UniversalGigIdentity'),
        this.wallet
      ),
      skillBadges: new ethers.Contract(
        process.env.SKILL_BADGES_ADDRESS,
        loadABI('SkillBadges'),
        this.wallet
      ),
      eventEscrow: new ethers.Contract(
        process.env.EVENT_ESCROW_ADDRESS,
        loadABI('EventEscrow'),
        this.wallet
      ),
      reputationSystem: new ethers.Contract(
        process.env.REPUTATION_SYSTEM_ADDRESS,
        loadABI('ReputationSystem'),
        this.wallet
      )
    };
  }

  // Helper to convert BigInt values
  serializeBigInt(obj) {
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeBigInt(item));
    }
    if (obj && typeof obj === 'object') {
      const serialized = {};
      for (const key in obj) {
        serialized[key] = this.serializeBigInt(obj[key]);
      }
      return serialized;
    }
    return obj;
  }

  // Universal Gig Identity
  async createGigProfile(universalId, profileHash) {
    try {
      const tx = await this.contracts.universalGigIdentity.createGigProfile(universalId, profileHash);
      const receipt = await tx.wait();
      console.log('✅ Profile created:', receipt.hash);
      return receipt;
    } catch (error) {
      console.error('❌ Profile creation failed:', error.message);
      throw error;
    }
  }

  async getProfile(address) {
    const profile = await this.contracts.universalGigIdentity.getProfile(address);
    return this.serializeBigInt(profile);
  }

  // Skill Badges
  async mintBadge(to, skillName, category, metadataURI) {
    try {
      const tx = await this.contracts.skillBadges.mintBadge(to, skillName, category, metadataURI);
      const receipt = await tx.wait();
      console.log('✅ Badge minted:', receipt.hash);
      return receipt;
    } catch (error) {
      console.error('❌ Badge mint failed:', error.message);
      throw error;
    }
  }

  async getUserBadges(address) {
    const badges = await this.contracts.skillBadges.getUserBadges(address);
    return this.serializeBigInt(badges);
  }

  // Reputation System
  async submitReview(reviewee, rating, reviewText, eventId, reviewType) {
    try {
      const tx = await this.contracts.reputationSystem.submitReview(
        reviewee, rating, reviewText, eventId, reviewType
      );
      const receipt = await tx.wait();
      console.log('✅ Review submitted:', receipt.hash);
      return receipt;
    } catch (error) {
      console.error('❌ Review failed:', error.message);
      throw error;
    }
  }

  async getReputation(address) {
    const reputation = await this.contracts.reputationSystem.getReputation(address);
    return this.serializeBigInt(reputation);
  }

  // Event Escrow
  async createEscrow(organizer, organizerPerc, gigsPerc, platformPerc, eventId, amountMatic) {
    try {
      const tx = await this.contracts.eventEscrow.createEscrow(
        organizer, organizerPerc, gigsPerc, platformPerc, eventId,
        { value: ethers.parseEther(amountMatic.toString()) }
      );
      const receipt = await tx.wait();
      console.log('✅ Escrow created:', receipt.hash);
      return receipt;
    } catch (error) {
      console.error('❌ Escrow creation failed:', error.message);
      throw error;
    }
  }
}

export default new Web3Service();
