const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ReputationSystem only...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy ReputationSystem
  console.log("Deploying ReputationSystem...");
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const rsAddress = await reputationSystem.getAddress();
  
  console.log("✅ ReputationSystem deployed to:", rsAddress);
  console.log("\n🔗 View on Amoy PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${rsAddress}`);
  
  console.log("\n💾 Save this address to deployment-addresses.json!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
