from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models import Tournament, Team
import json

tournament_bp = Blueprint('tournament', __name__)

@tournament_bp.route('/register', methods=['POST'])
def register_team():
    """
    Register a team for a tournament
    
    Expected JSON:
    {
        "tournament_id": 1,
        "team_name": "Thunderbolts",
        "player_names": ["Player 1", "Player 2"],
        "captain_wallet_address": "your_solana_wallet_address",
        "tournament_password": "plaintext password provided by admin"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['tournament_id', 'team_name', 'captain_wallet_address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if tournament exists
        tournament = Tournament.query.get(data['tournament_id'])
        if not tournament:
            return jsonify({'error': 'Tournament not found'}), 404
        
        if tournament.status != 'open':
            return jsonify({'error': 'Tournament registration is closed'}), 400

        # Validate tournament password if set on tournament
        provided_password = data.get('tournament_password')
        if not tournament.check_password(provided_password):
            return jsonify({'error': 'Invalid tournament password'}), 403
        
        # Create team
        team = Team(
            tournament_id=data['tournament_id'],
            team_name=data['team_name'],
            player_names=json.dumps(data.get('player_names', [])),
            captain_wallet_address=data['captain_wallet_address']
        )
        
        db.session.add(team)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'team': team.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tournament_bp.route('/<int:tournament_id>/teams', methods=['GET'])
def get_teams(tournament_id):
    """Get all teams registered for a tournament"""
    try:
        teams = Team.query.filter_by(tournament_id=tournament_id).all()
        return jsonify({
            'teams': [t.to_dict() for t in teams]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tournament_bp.route('/available', methods=['GET'])
def list_available_tournaments():
    """List all tournaments open for registration"""
    try:
        tournaments = Tournament.query.filter_by(status='open').all()
        return jsonify({
            'tournaments': [t.to_dict() for t in tournaments]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

