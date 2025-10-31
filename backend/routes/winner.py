from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models import Tournament, Team, Match, Winner
from datetime import datetime
import json

winner_bp = Blueprint('winner', __name__)

@winner_bp.route('/submit-results', methods=['POST'])
def submit_results():
    """
    Submit match results
    
    Expected JSON:
    {
        "tournament_id": 1,
        "matches": [
            {
                "team1_id": 1,
                "team2_id": 2,
                "team1_score": 85,
                "team2_score": 72,
                "round": 1
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        tournament_id = data.get('tournament_id')
        if not tournament_id:
            return jsonify({'error': 'tournament_id is required'}), 400
        
        tournament = Tournament.query.get(tournament_id)
        if not tournament:
            return jsonify({'error': 'Tournament not found'}), 404
        
        matches = data.get('matches', [])
        
        for match_data in matches:
            match = Match(
                tournament_id=tournament_id,
                team1_id=match_data['team1_id'],
                team2_id=match_data['team2_id'],
                round=match_data['round'],
                team1_score=match_data.get('team1_score'),
                team2_score=match_data.get('team2_score'),
                winner_id=match_data.get('winner_id'),
                played_at=datetime.utcnow()
            )
            db.session.add(match)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Results submitted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@winner_bp.route('/declare-winner', methods=['POST'])
def declare_winner():
    """
    Declare tournament winner and trigger NFT minting
    
    Expected JSON:
    {
        "tournament_id": 1,
        "team_id": 3
    }
    """
    try:
        data = request.get_json()
        
        tournament_id = data.get('tournament_id')
        team_id = data.get('team_id')
        
        if not tournament_id or not team_id:
            return jsonify({'error': 'tournament_id and team_id are required'}), 400
        
        # Get tournament and team
        tournament = Tournament.query.get(tournament_id)
        team = Team.query.get(team_id)
        
        if not tournament:
            return jsonify({'error': 'Tournament not found'}), 404
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        # Check if already has a winner
        existing_winner = Winner.query.filter_by(tournament_id=tournament_id).first()
        if existing_winner:
            return jsonify({'error': 'Tournament already has a winner'}), 400
        
        # Update tournament status
        tournament.status = 'completed'
        
        # Create winner record
        winner = Winner(
            tournament_id=tournament_id,
            team_id=team_id,
            wallet_address=team.captain_wallet_address
        )
        
        db.session.add(winner)
        db.session.commit()
        
        # Trigger NFT minting
        # In production, this would be done via a background task queue (Celery)
        import threading
        from backend.routes.nft import mint_champion_nft_async
        thread = threading.Thread(target=mint_champion_nft_async, args=(winner.id,))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Winner declared successfully',
            'winner': winner.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@winner_bp.route('/hall-of-champions', methods=['GET'])
def hall_of_champions():
    """Get all past winners"""
    try:
        winners = Winner.query.join(Tournament).order_by(Winner.created_at.desc()).all()
        return jsonify({
            'winners': [w.to_dict() for w in winners]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@winner_bp.route('/by-wallet/<wallet_address>', methods=['GET'])
def get_wins_by_wallet(wallet_address):
    """Get all wins for a specific wallet address"""
    try:
        winners = Winner.query.filter_by(wallet_address=wallet_address).all()
        return jsonify({
            'wins': [w.to_dict() for w in winners]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

