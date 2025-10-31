/**
 * Create a Solana keypair for Metaplex minting
 * Alternative to solana-keygen CLI tool
 */

const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

// Generate new keypair
const keypair = Keypair.generate();

console.log('Generated keypair:');
console.log('Public Key:', keypair.publicKey.toString());

// Save to file
const keypairData = Array.from(keypair.secretKey);
fs.writeFileSync('keypair.json', JSON.stringify(keypairData));

console.log('✓ Keypair saved to metaplex/keypair.json');

// Instructions
console.log('\nNext steps:');
console.log('1. Copy your public key above');
console.log('2. Fund it on devnet: https://faucet.solana.com');
console.log('   Or use: solana airdrop 2 [PUBLIC_KEY] (if you have solana CLI)');

