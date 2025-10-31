# Metaplex Setup Guide

This project now uses **Metaplex SDK** for real Solana NFT minting via a hybrid Python + Node.js approach.

## What Changed

✅ **Real NFT Minting**: No more mocks!
- Uses Metaplex JS SDK (industry standard)
- Automatic Arweave/IPFS upload via Bundlr
- Proper Metaplex metadata accounts

✅ **Best of Both Worlds**:
- Keep your Python/Flask backend (no rewrite needed)
- Use official Metaplex SDK for NFT minting

## Quick Setup (5 minutes)

### 1. Install Node.js Dependencies

```bash
cd metaplex
npm install
```

This installs:
- `@metaplex-foundation/js` - Official Metaplex SDK
- `@solana/web3.js` - Solana JavaScript library

### 2. Create Solana Keypair

**Option A: Using Node.js (Recommended - No Solana CLI needed)**

```bash
cd metaplex
node create_keypair.js

# This will:
# 1. Generate a new keypair
# 2. Save it to keypair.json
# 3. Show you the public key to fund
```

Then fund it via the faucet: https://faucet.solana.com

**Option B: Using Solana CLI (if you have it installed)**

```bash
# Generate keypair
solana-keygen new --outfile metaplex/keypair.json

# Get public key
solana-keygen pubkey metaplex/keypair.json

# Fund it with SOL (devnet)
solana airdrop 2 $(solana-keygen pubkey metaplex/keypair.json)

# Check balance
solana balance
```

**⚠️ SECURITY:** Never commit `keypair.json` to git! It's already in `.gitignore`.

### 3. That's It!

Your Flask backend will now automatically use Metaplex for real NFT minting when you declare a winner.

## How It Works

```
Python Flask Backend
    ↓
Declares Winner
    ↓
Calls solana_service.py → mint_nft()
    ↓
Executes Node.js script (metaplex/mint_nft.js)
    ↓
Metaplex SDK:
    - Uploads metadata to Arweave via Bundlr
    - Creates NFT mint
    - Mints to recipient wallet
    ↓
Returns token ID to Python
    ↓
Stored in database
```

## Testing

### 1. Start the Backend

```bash
python run.py
```

### 2. Create a Tournament (via Admin panel or API)

Use curl or the frontend:

```bash
curl -X POST http://localhost:5000/api/admin/create-tournament \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basketball Championship",
    "sport": "Basketball",
    "format_type": "knockout",
    "semester": "Fall",
    "year": 2024,
    "badge_image_url": "https://via.placeholder.com/400.png"
  }'
```

### 3. Register a Team

```bash
curl -X POST http://localhost:5000/api/tournament/register \
  -H "Content-Type: application/json" \
  -d '{
    "tournament_id": 1,
    "team_name": "Thunderbolts",
    "player_names": ["Player 1", "Player 2"],
    "captain_wallet_address": "YOUR_SOLANA_WALLET_ADDRESS"
  }'
```

### 4. Declare Winner

```bash
curl -X POST http://localhost:5000/api/winner/declare-winner \
  -H "Content-Type: application/json" \
  -d '{
    "tournament_id": 1,
    "team_id": 1
  }'
```

**Result**: Real NFT minted on Solana Devnet! 🎉

## Troubleshooting

### "Cannot find module @metaplex-foundation/js"
```bash
cd metaplex && npm install
```

### "Insufficient funds for transaction"
```bash
# Fund your keypair
solana airdrop 2 $(solana-keygen pubkey metaplex/keypair.json)
```

### "Error: Invalid keypair"
Make sure `metaplex/keypair.json` exists and is valid:
```bash
solana-keygen verify metaplex/keypair.json
```

### Check NFT on Solana Explorer
Once minted, view it at:
```
https://explorer.solana.com/address/TOKEN_ADDRESS?cluster=devnet
```

## Production Deployment

For mainnet:

1. **Change RPC endpoint** in `backend/app.py`:
   ```python
   app.config['SOLANA_NETWORK'] = 'mainnet'
   ```

2. **Fund keypair on mainnet**:
   ```bash
   solana-keygen new --outfile metaplex/mainnet_keypair.json
   # Transfer SOL to this wallet on mainnet
   ```

3. **Update environment variable**:
   ```bash
   export METAPLEX_KEYPAIR_PATH="./metaplex/mainnet_keypair.json"
   ```

4. **Test on mainnet-beta** before going live!

## Costs

- **Devnet**: Free! Use for testing
- **Mainnet**: ~0.01 SOL per NFT (~$0.20-0.50)
  - SOL for transaction fees
  - SOL for metadata storage (Arweave via Bundlr)

## Resources

- [Metaplex Docs](https://docs.metaplex.com)
- [Solana Explorer](https://explorer.solana.com)
- [Bundlr Network](https://bundlr.network) - For Arweave uploads

## What's Next

✅ Real NFT minting
✅ Arweave metadata storage
✅ Metaplex-compatible NFTs

🎯 **Your NFTs will work in:**
- Phantom wallet
- Solflare wallet
- Magic Eden marketplace
- All Metaplex-compatible wallets/markets!

