const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: "./.env.example" });

async function main() {
  console.log("🚀 Deploying EventFlex Smart Contracts to Polygon Amoy...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "MATIC\n");

  // Deploy contracts
  const UniversalGigIdentity = await hre.ethers.getContractFactory("UniversalGigIdentity");
  const universalGigIdentity = await UniversalGigIdentity.deploy();
  await universalGigIdentity.waitForDeployment();
  const ugiAddress = await universalGigIdentity.getAddress();
  console.log("✅ UniversalGigIdentity:", ugiAddress);

  const SkillBadges = await hre.ethers.getContractFactory("SkillBadges");
  const skillBadges = await SkillBadges.deploy();
  await skillBadges.waitForDeployment();
  const sbAddress = await skillBadges.getAddress();
  console.log("✅ SkillBadges:", sbAddress);

  const EventEscrow = await hre.ethers.getContractFactory("EventEscrow");
  const eventEscrow = await EventEscrow.deploy(deployer.address);
  await eventEscrow.waitForDeployment();
  const eeAddress = await eventEscrow.getAddress();
  console.log("✅ EventEscrow:", eeAddress);

  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const rsAddress = await reputationSystem.getAddress();
  console.log("✅ ReputationSystem:", rsAddress);

  // Save addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: 80002,
    UniversalGigIdentity: ugiAddress,
    SkillBadges: sbAddress,
    EventEscrow: eeAddress,
    ReputationSystem: rsAddress,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync('deployment-addresses.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Addresses saved to deployment-addresses.json");

  // Copy ABIs to backend
  const backendPath = path.join(__dirname, '../../src/blockchain/contracts');
  if (!fs.existsSync(backendPath)) fs.mkdirSync(backendPath, { recursive: true });

  ['UniversalGigIdentity', 'SkillBadges', 'EventEscrow', 'ReputationSystem'].forEach(name => {
    const artifact = require(`../artifacts/contracts/${name}.sol/${name}.json`);
    fs.writeFileSync(
      path.join(backendPath, `${name}.json`),
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
  });

  console.log("📋 ABIs copied to backend\n");

  // Generate .env
  const envContent = `
BLOCKCHAIN_ENABLED=true
POLYGON_RPC_URL=${process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology"}
BLOCKCHAIN_PRIVATE_KEY=${process.env.PRIVATE_KEY}
UNIVERSAL_GIG_IDENTITY_ADDRESS=${ugiAddress}
SKILL_BADGES_ADDRESS=${sbAddress}
EVENT_ESCROW_ADDRESS=${eeAddress}
REPUTATION_SYSTEM_ADDRESS=${rsAddress}
`;

  fs.writeFileSync('../.env.blockchain', envContent.trim());
  console.log("✅ Created .env.blockchain - Copy to backend/.env\n");
  
  console.log("🔗 View on Amoy PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${ugiAddress}`);
  console.log(`https://amoy.polygonscan.com/address/${sbAddress}`);
  console.log(`https://amoy.polygonscan.com/address/${eeAddress}`);
  console.log(`https://amoy.polygonscan.com/address/${rsAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
