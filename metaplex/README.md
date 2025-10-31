# Metaplex NFT Minting Setup

This directory contains the Node.js integration for Metaplex NFT minting.

## Setup

1. Install Node.js dependencies:
```bash
cd metaplex
npm install
```

2. Create a Solana keypair for mint authority:
```bash
# Generate a new keypair
solana-keygen new --outfile keypair.json

# Fund it (on devnet)
solana airdrop 1 $(solana-keygen pubkey keypair.json)
```

**⚠️ IMPORTANT: Never commit keypair.json to git!**

## How It Works

1. Python Flask backend calls the Node.js script via subprocess
2. Node.js script uses Metaplex SDK to:
   - Upload metadata to Arweave via Bundlr
   - Mint NFT to recipient wallet
   - Return token ID and metadata URI

## Environment Variables

- `METAPLEX_KEYPAIR_PATH`: Path to keypair file (default: `./keypair.json`)

## Usage

The script is automatically called from `backend/solana_service.py`.

Manual testing:
```bash
node mint_nft.js \
  "RECIPIENT_WALLET_ADDRESS" \
  "NFT Name" \
  "NFT Description" \
  "IMAGE_URL" \
  '[]' \
  "https://api.devnet.solana.com"
```

## Files

- `mint_nft.js`: Main minting script
- `package.json`: Node.js dependencies
- `keypair.json`: Solana wallet keypair (create this, don't commit)

