/**
 * Metaplex NFT Minting Script
 * Called from Python Flask backend
 */

const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } = require('@metaplex-foundation/js');
const fs = require('fs');
const https = require('https');
const http = require('http');

// Get parameters from command line arguments
const args = process.argv.slice(2);
const recipientWallet = args[0];
const name = args[1];
const description = args[2];
const imageUrl = args[3];
const attributes = JSON.parse(args[4] || '[]');
const rpcUrl = args[5] || 'https://api.devnet.solana.com';

async function mintNFT() {
    try {
        // Load wallet keypair for mint authority
        const secretKeyPath = process.env.METAPLEX_KEYPAIR_PATH || './metaplex/keypair.json';
        
        // Load secret key
        const secretKey = JSON.parse(fs.readFileSync(secretKeyPath));
        const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

        // Establish connection
        const connection = new Connection(rpcUrl, 'confirmed');
        
        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(wallet))
            .use(bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: rpcUrl,
                timeout: 60000,
            }));

        // Download and upload image to Arweave first
        let finalImageUrl = imageUrl;
        if (imageUrl && !imageUrl.startsWith('http://localhost') && !imageUrl.includes('arweave.net') && !imageUrl.includes('ipfs.io')) {
            console.log('Uploading image to Arweave for permanent storage...');
            try {
                // Download image from URL
                const buffer = await new Promise((resolve, reject) => {
                    const protocol = imageUrl.startsWith('https') ? https : http;
                    protocol.get(imageUrl, (response) => {
                        const data = [];
                        response.on('data', (chunk) => data.push(chunk));
                        response.on('end', () => resolve(Buffer.concat(data)));
                        response.on('error', reject);
                    }).on('error', reject);
                });
                
                // Upload to Arweave
                const metaplexFile = toMetaplexFile(buffer, 'image.png');
                const imageUri = await metaplex.storage().upload(metaplexFile);
                finalImageUrl = imageUri;
                console.log('Image uploaded to Arweave:', imageUri);
            } catch (imageError) {
                console.log('Failed to upload image, using original URL:', imageError.message);
                // Fall back to original URL
            }
        }

        // Create metadata
        const metadata = {
            name: name,
            description: description,
            image: finalImageUrl,
            attributes: attributes,
        };

        // Upload metadata to Arweave via Bundlr
        console.log('Uploading metadata...');
        const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(metadata);
        console.log('Metadata URI:', metadataUri);

        // Mint NFT to recipient
        console.log('Minting NFT...');
        const { nft } = await metaplex.nfts().create({
            uri: metadataUri,
            name: name,
            sellerFeeBasisPoints: 0, // No royalties for tournament badges
            tokenOwner: new PublicKey(recipientWallet),
            collection: null,
        });

        console.log('NFT minted successfully!');
        console.log('Token address:', nft.address.toString());
        console.log('Metadata URI:', metadataUri);

        // Output JSON for Python to parse
        const output = {
            success: true,
            tokenId: nft.address.toString(),
            metadataUri: metadataUri,
            signature: '',
        };

        console.log(JSON.stringify(output));
        
    } catch (error) {
        console.error('Error minting NFT:', error.message);
        const errorOutput = {
            success: false,
            error: error.message,
        };
        console.log(JSON.stringify(errorOutput));
        process.exit(1);
    }
}

mintNFT();

