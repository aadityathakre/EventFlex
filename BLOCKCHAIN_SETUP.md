# EventFlex Blockchain Setup (Polygon Amoy Testnet)

## Quick Start

1. **Get test MATIC:**
   - Visit: https://faucet.polygon.technology/
   - Select "Amoy" network
   - Paste your MetaMask address
   
2. **Setup environment:**
   ```
   cd blockchain
   cp .env.example .env
   nano .env  # Add your PRIVATE_KEY and RPC URL
   ```

3. **Deploy contracts:**
   ```
   npm run compile
   npm run deploy:amoy
   ```

4. **Copy blockchain config to backend:**
   ```
   cat .env.blockchain >> ../.env
   ```

5. **Start backend:**
   ```
   cd ..
   npm start
   ```

## Verify Deployment

Check contracts on Amoy PolygonScan:
https://amoy.polygonscan.com/

## Network Details

- Chain ID: 80002
- RPC URL: https://rpc.ankr.com/polygon_amoy
- Explorer: https://amoy.polygonscan.com/
- Currency: MATIC

## Troubleshooting

If deployment fails:
- Ensure you have at least 0.05 MATIC for gas
- Check RPC URL is correct in .env
- Verify private key starts with 0x
