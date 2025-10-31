# TokenChamp - Tournament NFT Badge System

A full-stack web application for managing tournaments and issuing Champion NFTs on the Solana blockchain. Built with React (frontend) + Flask (Python backend) + PostgreSQL.

## Features

🏆 **Tournament Management**
- Create tournaments with customizable tournament types, formats, and badges
- Team registration with wallet addresses
- Match result tracking
- Automatic winner determination

🎨 **NFT Minting on Solana**
- Automatic Champion NFT minting for winners
- Metaplex-compatible metadata
- Badge images with tournament, month, team information
- Hall of Champions showcase

🔗 **Web3 Integration**
- Solana devnet integration
- Simple wallet onboarding (just paste address)
- NFT metadata storage
- Transaction tracking

## Architecture

### Backend (Flask)
- **Models**: Tournaments, Teams, Matches, Winners, NFTs
- **Routes**: Admin, Tournament, Winner, NFT
- **Services**: Solana NFT minting service
- **Database**: PostgreSQL with SQLAlchemy ORM

### Frontend (React)
- **Pages**: Home, Register, Dashboard, Hall of Champions, Admin
- **Routing**: React Router for navigation
- **API**: Axios-based API client
- **UI**: Modern gradient design with responsive layout

### Blockchain (Solana)
- Devnet for testing
- Metaplex metadata standard
- Decentralized metadata storage (IPFS/Arweave)
- NFT minting with custom attributes

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (or Docker)
- Solana CLI tools (optional)

### 1. Clone the repository

```bash
git clone <repository-url>
cd tokenchamp
```

### 2. Set up the database

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

Or install PostgreSQL locally and create a database:

```bash
createdb tokenchamp
```

### 3. Configure environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost/tokenchamp
SOLANA_NETWORK=devnet
SOLANA_PRIVATE_KEY=your_private_key_base58  # Optional for MVP
```

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. Initialize the database

```bash
python setup_db.py
```

### 6. Install frontend dependencies

```bash
npm install
```

### 7. Start the application

In separate terminals:

**Terminal 1 - Backend:**
```bash
python run.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Usage

### Admin Flow

1. Navigate to Admin panel
2. Create a tournament: Fill in details (name, tournament, format, month, year, badge image URL)
3. View registered teams
4. Submit match results
5. Declare a winner (triggers automatic NFT minting)

### Team Registration Flow

1. Browse available tournaments on the Home page
2. Click "Register" to register a team
3. Fill in team name, player names, and captain's Solana wallet address
4. Submit registration

### Winner Dashboard Flow

1. Navigate to Dashboard
2. Enter your Solana wallet address
3. View your Champion badges
4. Download/share badge images

### Hall of Champions

Public page showcasing all past tournament winners with their badges.

## API Endpoints

### Admin
- `POST /api/admin/create-tournament` - Create new tournament
- `GET /api/admin/tournaments` - List all tournaments
- `GET /api/admin/tournament/{id}` - Get tournament details

### Tournament
- `POST /api/tournament/register` - Register a team
- `GET /api/tournament/available` - Get available tournaments
- `GET /api/tournament/{id}/teams` - Get teams for tournament

### Winner
- `POST /api/winner/submit-results` - Submit match results
- `POST /api/winner/declare-winner` - Declare winner and mint NFT
- `GET /api/winner/hall-of-champions` - Get all winners
- `GET /api/winner/by-wallet/{address}` - Get wins by wallet

### NFT
- `POST /api/nft/mint/{winner_id}` - Manually trigger NFT minting
- `GET /api/nft/winner/{winner_id}` - Get NFT details

## Technical Details

### NFT Minting

Minting is implemented via a hybrid integration:

- Flask backend triggers a Node.js script using the Metaplex JS SDK
- Image is rehosted to Arweave via Bundlr (permanent URL)
- Metadata JSON is uploaded to Arweave
- NFT is minted on Solana devnet to the winner's wallet
- Token mint address and metadata URI are stored in Postgres

### Database Schema

**Tournaments**
- id, name, tournament_name, format_type, month, year
- badge_image_url, badge_metadata_url
- status, created_at, password_hash (optional)

**Teams**
- id, tournament_id, team_name
- player_names (JSON), captain_wallet_address
- registered_at

**Matches**
- id, tournament_id, team1_id, team2_id
- round, team1_score, team2_score, winner_id
- played_at

**Winners**
- id, tournament_id, team_id, wallet_address
- nft_token_id, nft_metadata_uri
- minted_at, created_at

## Future Enhancements

- [ ] Full Solana/Metaplex integration (real NFT minting)
- [ ] IPFS/Arweave image storage integration
- [ ] Multi-tournament support
- [ ] Configurable reward logic
- [ ] Transferable vs non-transferable badges
- [ ] Wallet connection (Phantom, Solflare)
- [ ] Real-time tournament bracket visualization
- [ ] Automated bracket generation
- [ ] Email notifications
- [ ] Social sharing features

## Project Structure

```
tokenchamp/
├── backend/
│   ├── app.py                 # Flask application factory
│   ├── models.py              # Database models
│   ├── solana_service.py      # Solana NFT minting service
│   └── routes/
│       ├── admin.py           # Admin endpoints
│       ├── tournament.py      # Tournament endpoints
│       ├── winner.py          # Winner endpoints
│       └── nft.py             # NFT endpoints
├── frontend/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── HallOfChampions.jsx
│   │   └── Admin.jsx
│   ├── services/
│   │   └── api.js             # API client
│   ├── App.jsx
│   └── App.css
├── requirements.txt
├── package.json
├── docker-compose.yml
└── README.md
```

## Acknowledgments

- Solana Foundation
- Metaplex
- Flask & React communities

