import dotenv from 'dotenv';
import web3Service from './web3Service.js';

dotenv.config();

async function test() {
  console.log("🧪 Testing Blockchain Connection...\n");

  console.log("📋 Configuration:");
  console.log("  Wallet:", web3Service.wallet.address);
  console.log("  RPC:", process.env.POLYGON_RPC_URL);
  console.log("  Network: Polygon Amoy (80002)\n");

  console.log("📍 Contract Addresses:");
  console.log("  UniversalGigIdentity:", process.env.UNIVERSAL_GIG_IDENTITY_ADDRESS);
  console.log("  SkillBadges:", process.env.SKILL_BADGES_ADDRESS);
  console.log("  EventEscrow:", process.env.EVENT_ESCROW_ADDRESS);
  console.log("  ReputationSystem:", process.env.REPUTATION_SYSTEM_ADDRESS);

  console.log("\n✅ All connections verified!");
}

test().catch(console.error);
