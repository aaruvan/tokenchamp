"""
Solana NFT Minting Service
Uses Solana Python SDK to mint NFTs with Metaplex metadata
"""
try:
    from solana.rpc.api import Client
    from solana.publickey import PublicKey
except ImportError:
    # Fallback if solana-py not available
    Client = None
    PublicKey = None

from solders.keypair import Keypair
import base58
import json
import os
from datetime import datetime

class SolanaNFTService:
    def __init__(self, network='devnet', private_key=None):
        """
        Initialize Solana service
        
        Args:
            network: 'devnet' or 'mainnet'
            private_key: Base58 encoded private key for mint authority
        """
        if network == 'devnet':
            self.endpoint = 'https://api.devnet.solana.com'
        else:
            self.endpoint = 'https://api.mainnet-beta.solana.com'
        
        self.client = Client(self.endpoint)
        self.network = network
        
        # Load or generate keypair for mint authority
        if private_key:
            try:
                private_key_bytes = base58.b58decode(private_key)
                self.mint_authority = Keypair.from_secret_key(private_key_bytes)
            except Exception as e:
                print(f"Error loading private key: {e}")
                self.mint_authority = None
        else:
            self.mint_authority = None
    
    def create_metadata_json(self, tournament_name, month, year, team_name, badge_image_url, badge_serial_id):
        """
        Create Metaplex metadata JSON
        
        Args:
            tournament_name: Tournament name (e.g., "Summer Solstice Cup")
            month: Month (e.g., "June")
            year: Year (e.g., 2024)
            team_name: Winner team name
            badge_image_url: URL to badge image
            badge_serial_id: Unique badge serial ID
            
        Returns:
            dict: Metaplex metadata
        """
        metadata = {
            "name": f"{tournament_name} Champion - {month} {year}",
            "symbol": "CHAMP",
            "description": f"Champion Badge for {team_name} in {tournament_name} ({month} {year})",
            "image": badge_image_url,
            "attributes": [
                {
                    "trait_type": "Tournament",
                    "value": tournament_name
                },
                {
                    "trait_type": "Month",
                    "value": month
                },
                {
                    "trait_type": "Year",
                    "value": year
                },
                {
                    "trait_type": "Team",
                    "value": team_name
                },
                {
                    "trait_type": "Badge Serial ID",
                    "value": str(badge_serial_id)
                }
            ],
            "properties": {
                "category": "image",
                "files": [
                    {
                        "uri": badge_image_url,
                        "type": "image/png"
                    }
                ]
            }
        }
        return metadata
    
    def upload_metadata_to_ipfs(self, metadata):
        """
        Upload metadata to IPFS/Arweave via Metaplex Bundlr
        Now handled by the Node.js Metaplex script
        
        Returns:
            str: Metadata URI (now returned from Metaplex)
        """
        # This is now handled by the Node.js Metaplex script
        # which uses Bundlr to upload to Arweave
        # Return placeholder - actual URI comes from mint_nft.js
        return "uploaded-via-metaplex"
    
    def mint_nft(self, recipient_wallet_address, tournament_name, month, year, team_name, badge_image_url, badge_serial_id):
        """
        Mint an NFT to the recipient wallet using Metaplex via Node.js
        
        Args:
            recipient_wallet_address: Solana wallet address to receive the NFT
            tournament_name: Tournament name
            month: Month
            year: Year
            team_name: Team name
            badge_image_url: Badge image URL
            badge_serial_id: Badge serial ID
            
        Returns:
            dict: Mint result with token_id, transaction signature, and metadata_uri
        """
        try:
            # Validate wallet address
            recipient_pubkey = PublicKey(recipient_wallet_address)
            
            # Create metadata
            metadata = self.create_metadata_json(
                tournament_name, month, year, team_name, badge_image_url, badge_serial_id
            )
            
            # Call Node.js script for actual Metaplex minting
            import subprocess
            import os
            
            # Prepare arguments
            name = metadata['name']
            description = metadata['description']
            attributes_json = json.dumps(metadata['attributes'])
            
            # Path to the Node.js minting script
            script_path = os.path.join(os.path.dirname(__file__), '..', 'metaplex', 'mint_nft.js')
            
            # Run Node.js script
            result = subprocess.run(
                ['node', script_path, 
                 recipient_wallet_address,
                 name,
                 description,
                 badge_image_url,
                 attributes_json,
                 self.endpoint],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            # Parse JSON output from Node.js
            try:
                output_lines = result.stdout.strip().split('\n')
                # Get the last line which should be the JSON output
                json_output = output_lines[-1]
                mint_result = json.loads(json_output)
                
                if mint_result.get('success'):
                    return {
                        'success': True,
                        'token_id': mint_result['tokenId'],
                        'transaction_signature': mint_result.get('signature', ''),
                        'metadata_uri': mint_result['metadataUri'],
                        'network': self.network
                    }
                else:
                    return {
                        'success': False,
                        'error': mint_result.get('error', 'Unknown error')
                    }
            except json.JSONDecodeError:
                # Fallback: If JSON parsing fails, check stderr
                return {
                    'success': False,
                    'error': f"Failed to parse output: {result.stderr}"
                }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'NFT minting timed out'
            }
        except Exception as e:
            print(f"Error minting NFT: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_transaction(self, signature):
        """
        Verify a transaction on Solana
        
        Args:
            signature: Transaction signature to verify
            
        Returns:
            bool: True if transaction is confirmed
        """
        try:
            response = self.client.confirm_transaction(signature)
            return response
        except Exception as e:
            print(f"Error verifying transaction: {e}")
            return False

# Singleton instance
_solana_service = None

def get_solana_service():
    global _solana_service
    if _solana_service is None:
        network = os.getenv('SOLANA_NETWORK', 'devnet')
        private_key = os.getenv('SOLANA_PRIVATE_KEY', '')
        _solana_service = SolanaNFTService(network, private_key)
    return _solana_service

