require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
import dotenv from "dotenv";
dotenv.config({ path: "./.env.example" });

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: { chainId: 1337 },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: 30000000000
    }
  }
};
