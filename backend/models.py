from datetime import datetime
from sqlalchemy import JSON
import json
from werkzeug.security import generate_password_hash, check_password_hash

# Import db from app module
try:
    from backend.app import db
except ImportError:
    # Create a minimal db object for when running in migration context
    from flask_sqlalchemy import SQLAlchemy
    db = SQLAlchemy()

class Tournament(db.Model):
    __tablename__ = 'tournaments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    tournament_name = db.Column(db.String(100), nullable=False)  # Changed from sport
    format_type = db.Column(db.String(50), nullable=False)  # knockout, round-robin, etc.
    month = db.Column(db.String(50), nullable=False)  # Changed from semester
    year = db.Column(db.Integer, nullable=False)
    badge_image_url = db.Column(db.String(500))
    badge_metadata_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='open')  # open, in_progress, completed
    password_hash = db.Column(db.String(255))  # optional registration password
    
    # Relationships
    teams = db.relationship('Team', backref='tournament', lazy=True, cascade='all, delete-orphan')
    matches = db.relationship('Match', backref='tournament', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'tournament_name': self.tournament_name,
            'format_type': self.format_type,
            'month': self.month,
            'year': self.year,
            'badge_image_url': self.badge_image_url,
            'badge_metadata_url': self.badge_metadata_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'status': self.status,
            'team_count': len(self.teams) if self.teams else 0
        }

    def set_password(self, password: str):
        if password:
            self.password_hash = generate_password_hash(password)
        else:
            self.password_hash = None

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return True  # no password set means open registration
        try:
            return check_password_hash(self.password_hash, password or '')
        except Exception:
            return False

class Team(db.Model):
    __tablename__ = 'teams'
    
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
    team_name = db.Column(db.String(200), nullable=False)
    player_names = db.Column(db.Text)  # JSON array of player names
    captain_wallet_address = db.Column(db.String(100), nullable=False)  # Solana wallet
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    matches_as_team1 = db.relationship('Match', foreign_keys='Match.team1_id', backref='team1', lazy=True)
    matches_as_team2 = db.relationship('Match', foreign_keys='Match.team2_id', backref='team2', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tournament_id': self.tournament_id,
            'team_name': self.team_name,
            'player_names': json.loads(self.player_names) if self.player_names else [],
            'captain_wallet_address': self.captain_wallet_address,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None
        }

class Match(db.Model):
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
    team1_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    team2_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    round = db.Column(db.Integer, nullable=False)  # e.g., 1 for first round, 2 for semi, 3 for final
    team1_score = db.Column(db.Integer)
    team2_score = db.Column(db.Integer)
    winner_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    played_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tournament_id': self.tournament_id,
            'team1_id': self.team1_id,
            'team2_id': self.team2_id,
            'round': self.round,
            'team1_score': self.team1_score,
            'team2_score': self.team2_score,
            'winner_id': self.winner_id,
            'played_at': self.played_at.isoformat() if self.played_at else None
        }

class Winner(db.Model):
    __tablename__ = 'winners'
    
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournaments.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    wallet_address = db.Column(db.String(100), nullable=False)
    nft_token_id = db.Column(db.String(100))  # Solana token ID
    nft_metadata_uri = db.Column(db.String(500))
    minted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    team = db.relationship('Team', backref='wins', lazy=True)
    tournament = db.relationship('Tournament', backref='champions', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tournament_id': self.tournament_id,
            'team_id': self.team_id,
            'team_name': self.team.team_name if self.team else None,
            'tournament_name': self.tournament.tournament_name if self.tournament else None,
            'month': self.tournament.month if self.tournament else None,
            'year': self.tournament.year if self.tournament else None,
            'wallet_address': self.wallet_address,
            'nft_token_id': self.nft_token_id,
            'nft_metadata_uri': self.nft_metadata_uri,
            'badge_image_url': self.tournament.badge_image_url if self.tournament else None,
            'minted_at': self.minted_at.isoformat() if self.minted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

