# TokenChamp Architecture

## Overview

TokenChamp is a full-stack web application for managing tournaments and minting Champion NFTs on Solana. The system is designed to be extensible, supporting various tournament formats and sports.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Pages: Home, Register, Dashboard, Hall, Admin    │ │
│  └────────────────────────────────────────────────────┘ │
│                      ↓ API Calls                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    Backend (Flask)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Routes: Admin, Tournament, Winner, NFT           │ │
│  └────────────────────────────────────────────────────┘ │
│                      ↓                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Services: Solana NFT Minting                     │ │
│  └────────────────────────────────────────────────────┘ │
│                      ↓                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │   PostgreSQL Database          │
        │  - Tournaments                 │
        │  - Teams                       │
        │  - Matches                     │
        │  - Winners                     │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │   Solana Blockchain (Devnet)   │
        │  - NFT Minting                 │
        │  - Token Metadata              │
        └────────────────────────────────┘
```

## Component Details

### Backend Architecture

#### 1. Application Factory Pattern
- `app.py`: Flask application factory
- Blueprint-based routing for modularity
- Database initialization and migration support
- CORS configuration for frontend access

#### 2. Database Models (`models.py`)
- **Tournament**: Tournament configuration and metadata
- **Team**: Team registration with Solana wallet addresses
- **Match**: Match results and bracket tracking
- **Winner**: Champion records with NFT details

#### 3. API Routes (Blueprints)

**Admin (`routes/admin.py`)**
- Create tournaments
- List tournaments
- View tournament details

**Tournament (`routes/tournament.py`)**
- Register teams
- List available tournaments
- Get tournament teams

**Winner (`routes/winner.py`)**
- Submit match results
- Declare winners
- Hall of Champions API
- Wallet-based win lookup

**NFT (`routes/nft.py`)**
- Mint Champion NFTs
- Track NFT metadata
- Async minting support

#### 4. Solana Integration (`solana_service.py`)
- NFT metadata generation (Metaplex standard)
- Mock minting for MVP (ready for production implementation)
- IPFS/Arweave metadata upload (placeholder)
- Transaction verification

### Frontend Architecture

#### 1. React Components

**Layout**
- `App.jsx`: Main router and navigation
- Modern gradient UI with responsive design

**Pages**
- `Home.jsx`: Tournament listing and overview
- `Register.jsx`: Team registration form
- `Dashboard.jsx`: Personal champion badges
- `HallOfChampions.jsx`: Public winner showcase
- `Admin.jsx`: Tournament management

#### 2. API Client (`services/api.js`)
- Axios-based API wrapper
- Request/response interceptors for debugging
- Modular API endpoints (tournamentAPI, adminAPI, etc.)

#### 3. Routing
- React Router for client-side navigation
- RESTful URL structure

## Database Schema

### Tournaments
```sql
- id: Primary key
- name: Tournament name
- sport: Sport type
- format_type: Tournament format (knockout, round-robin, etc.)
- semester: Academic semester
- year: Year
- badge_image_url: Champion badge image
- badge_metadata_url: Badge metadata
- status: open, in_progress, completed
- created_at: Timestamp
```

### Teams
```sql
- id: Primary key
- tournament_id: Foreign key to tournaments
- team_name: Name of the team
- player_names: JSON array of player names
- captain_wallet_address: Solana wallet address
- registered_at: Timestamp
```

### Matches
```sql
- id: Primary key
- tournament_id: Foreign key to tournaments
- team1_id: First team
- team2_id: Second team
- round: Match round number
- team1_score: Score for team 1
- team2_score: Score for team 2
- winner_id: Winning team ID
- played_at: Timestamp
```

### Winners
```sql
- id: Primary key
- tournament_id: Foreign key to tournaments
- team_id: Foreign key to teams
- wallet_address: Recipient wallet
- nft_token_id: Solana NFT token ID
- nft_metadata_uri: IPFS/Arweave metadata URI
- minted_at: Minting timestamp
- created_at: Record creation timestamp
```

## API Endpoints

### Admin Endpoints
```
POST   /api/admin/create-tournament    Create new tournament
GET    /api/admin/tournaments          List all tournaments
GET    /api/admin/tournament/{id}      Get tournament details
```

### Tournament Endpoints
```
POST   /api/tournament/register        Register a team
GET    /api/tournament/available       Get available tournaments
GET    /api/tournament/{id}/teams      Get tournament teams
```

### Winner Endpoints
```
POST   /api/winner/submit-results      Submit match results
POST   /api/winner/declare-winner      Declare winner (triggers NFT)
GET    /api/winner/hall-of-champions   Get all champions
GET    /api/winner/by-wallet/{addr}    Get wins by wallet
```

### NFT Endpoints
```
POST   /api/nft/mint/{winner_id}       Manually trigger minting
GET    /api/nft/winner/{winner_id}     Get NFT details
```

## Data Flow

### Tournament Creation Flow
1. Admin creates tournament via frontend
2. Backend validates and saves to database
3. Tournament appears in "Available Tournaments"

### Registration Flow
1. User browses tournaments on Home page
2. User fills registration form with team details and wallet address
3. Backend creates team record
4. Team count updates on tournament

### Winner Declaration Flow
1. Admin submits match results
2. Admin declares winner (team ID)
3. Backend creates winner record
4. Async NFT minting triggered
5. Winner appears in Hall of Champions
6. NFT minting completes and updates winner record

### NFT Minting Flow
1. Winner declared → Minting function called
2. Generate Metaplex-compatible metadata
3. Upload metadata to IPFS/Arweave (mock for MVP)
4. Mint NFT on Solana (mock for MVP)
5. Store token ID and metadata URI
6. Update winner record with NFT details

## Extensibility Design

The system is designed for future expansion:

### Multi-Tournament Support
- Sport field allows different sports
- Format field supports various tournament types
- Badge configuration per tournament
- Clean separation between tournaments

### Configurable Rewards
- Metadata structure supports custom attributes
- Badge serial IDs for tracking
- NFT metadata can include additional perks
- Winner records link to tournament configuration

### Multi-Tenant Architecture Ready
- Blueprint-based routes for isolation
- Tournament-based data separation
- Admin endpoints ready for permission system
- Database supports user/tournament relationships

## Security Considerations (Future)

1. **Admin Authentication**: Add JWT-based admin auth
2. **Rate Limiting**: Prevent spam registrations
3. **Wallet Validation**: Verify Solana wallet addresses
4. **Transaction Signing**: Secure Solana private key management
5. **CORS Configuration**: Restrict frontend origins
6. **Input Validation**: Enhanced data sanitization
7. **SQL Injection Protection**: SQLAlchemy ORM mitigates this
8. **XSS Protection**: React automatically escapes output

## Deployment Considerations

### Production Checklist
- [ ] Replace mock NFT minting with real Solana integration
- [ ] Integrate IPFS/Arweave for image storage
- [ ] Add admin authentication
- [ ] Set up HTTPS for frontend and backend
- [ ] Configure environment variables securely
- [ ] Set up database backups
- [ ] Implement error logging and monitoring
- [ ] Add API rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Configure database migrations for production

### Scalability
- **Database**: PostgreSQL supports horizontal scaling
- **Backend**: Flask app can be deployed behind gunicorn/uwsgi
- **Frontend**: Static files can be served via CDN
- **NFT Minting**: Can be moved to background job queue (Celery)

## Technology Stack

- **Backend**: Python 3.9+, Flask, SQLAlchemy, Flask-Migrate
- **Frontend**: React 18, React Router, Vite, Axios
- **Database**: PostgreSQL 15
- **Blockchain**: Solana (Devnet), Solana Python SDK
- **Containerization**: Docker, Docker Compose
- **Package Management**: pip, npm

## Development Workflow

1. Start PostgreSQL: `docker-compose up -d`
2. Initialize database: `python setup_db.py`
3. Start backend: `python run.py`
4. Start frontend: `npm run dev`
5. Access application: http://localhost:3000

## Future Enhancements

1. **Real NFT Minting**: Implement actual Metaplex integration
2. **Image Upload**: Add file upload for badge images
3. **Wallet Connection**: Integrate Phantom/Solflare wallets
4. **Bracket Visualization**: Visual tournament bracket
5. **Live Updates**: WebSocket for real-time updates
6. **Email Notifications**: Notify winners via email
7. **Social Features**: Share badges on social media
8. **Analytics**: Tournament statistics and insights
9. **Mobile App**: React Native mobile application
10. **Multi-chain**: Support Ethereum, Polygon, etc.

