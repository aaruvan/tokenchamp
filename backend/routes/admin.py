from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models import Tournament
import uuid

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/create-tournament', methods=['POST'])
def create_tournament():
    """
    Create a new tournament
    
    Expected JSON:
    {
        "name": "Intramural Basketball Championship",
        "tournament_name": "Summer Solstice Cup",
        "format_type": "knockout",
        "month": "June",
        "year": 2024,
        "badge_image_url": "https://...",
        "badge_metadata_url": "https://...",
        "tournament_password": "optional-plaintext"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'tournament_name', 'format_type', 'month', 'year']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create tournament
        tournament = Tournament(
            name=data['name'],
            tournament_name=data['tournament_name'],
            format_type=data['format_type'],
            month=data['month'],
            year=data['year'],
            badge_image_url=data.get('badge_image_url', ''),
            badge_metadata_url=data.get('badge_metadata_url', ''),
            status='open'
        )
        # set password if provided
        tournament.set_password(data.get('tournament_password'))
        
        db.session.add(tournament)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'tournament': tournament.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/tournaments', methods=['GET'])
def list_tournaments():
    """List all tournaments"""
    try:
        tournaments = Tournament.query.all()
        return jsonify({
            'tournaments': [t.to_dict() for t in tournaments]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/tournament/<int:tournament_id>', methods=['GET'])
def get_tournament(tournament_id):
    """Get a specific tournament"""
    try:
        tournament = Tournament.query.get_or_404(tournament_id)
        return jsonify({'tournament': tournament.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

