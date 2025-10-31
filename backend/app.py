from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'postgresql://aarush@localhost/tokenchamp'  # Using local user (no password)
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SOLANA_NETWORK'] = os.getenv('SOLANA_NETWORK', 'devnet')
    app.config['SOLANA_PRIVATE_KEY'] = os.getenv('SOLANA_PRIVATE_KEY', '')
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register blueprints
    from backend.routes.admin import admin_bp
    from backend.routes.tournament import tournament_bp
    from backend.routes.winner import winner_bp
    from backend.routes.nft import nft_bp
    
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(tournament_bp, url_prefix='/api/tournament')
    app.register_blueprint(winner_bp, url_prefix='/api/winner')
    app.register_blueprint(nft_bp, url_prefix='/api/nft')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

