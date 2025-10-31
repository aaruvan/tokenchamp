from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models import Winner
from backend.solana_service import get_solana_service
from datetime import datetime
import time

nft_bp = Blueprint('nft', __name__)

def mint_champion_nft_async(winner_id):
    """
    Asynchronously mint NFT for a winner
    This would ideally be done in a background task queue
    """
    from backend.app import db
    try:
        winner = Winner.query.get(winner_id)
        if not winner:
            print(f"Winner not found: {winner_id}")
            return False
        
        if winner.nft_token_id:
            print(f"Winner already has NFT: {winner_id}")
            return True
        
        # Get tournament and team info
        tournament = winner.tournament
        team = winner.team
        
        # Generate badge serial ID
        badge_serial_id = time.time()
        
        # Mint NFT
        solana_service = get_solana_service()
        result = solana_service.mint_nft(
            recipient_wallet_address=winner.wallet_address,
            tournament_name=tournament.tournament_name,
            month=tournament.month,
            year=tournament.year,
            team_name=team.team_name,
            badge_image_url=tournament.badge_image_url or '',
            badge_serial_id=badge_serial_id
        )
        
        if result['success']:
            # Update winner record
            winner.nft_token_id = result['token_id']
            winner.nft_metadata_uri = result['metadata_uri']
            winner.minted_at = datetime.utcnow()
            db.session.commit()
            
            print(f"Successfully minted NFT for winner {winner_id}: {result['token_id']}")
            return True
        else:
            print(f"Failed to mint NFT for winner {winner_id}: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"Error in async NFT minting: {e}")
        return False

@nft_bp.route('/mint/<int:winner_id>', methods=['POST'])
def mint_nft_for_winner(winner_id):
    """
    Manually trigger NFT minting for a winner
    """
    try:
        result = mint_champion_nft_async(winner_id)
        
        if result:
            winner = Winner.query.get(winner_id)
            return jsonify({
                'success': True,
                'winner': winner.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Failed to mint NFT'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@nft_bp.route('/winner/<int:winner_id>', methods=['GET'])
def get_nft_details(winner_id):
    """Get NFT details for a winner"""
    try:
        winner = Winner.query.get_or_404(winner_id)
        return jsonify({'winner': winner.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

