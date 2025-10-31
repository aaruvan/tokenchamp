# Quick Start Guide

Get TokenChamp up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Python version (should be 3.9+)
python3 --version

# Check Node.js version (should be 18+)
node --version
```

## Step 1: Start PostgreSQL

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb tokenchamp
```

## Step 2: Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt

# Install Node.js packages
npm install
```

## Step 3: Initialize Database

```bash
python setup_db.py
```

## Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
python run.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Step 5: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Admin" to create a tournament
3. Fill in tournament details (use any badge image URL for now)
4. Click "Register" to register a test team
5. Use any Solana wallet address (e.g., `11111111111111111111111111111111`)
6. Click "Declare Winner" in Admin to test NFT minting

## Example URLs for Testing

When creating tournaments, you can use these placeholder image URLs:
- https://via.placeholder.com/400/667eea/ffffff?text=Basketball+Champion
- https://via.placeholder.com/400/764ba2/ffffff?text=Football+Champion
- https://via.placeholder.com/400/f093fb/ffffff?text=Soccer+Champion

## Troubleshooting

**Backend won't start:**
- Check if PostgreSQL is running: `docker ps` or `pg_isready`
- Check if port 5000 is available

**Frontend won't start:**
- Run `npm install` again
- Check if port 3000 is available

**Database connection error:**
- Verify DATABASE_URL in .env file
- Ensure PostgreSQL container is running: `docker ps`

**Import errors:**
- Make sure you're running commands from the project root
- Check that all Python packages are installed: `pip list`

## Next Steps

1. Read the full README.md for detailed documentation
2. Implement real NFT minting (currently mocked)
3. Add IPFS/Arweave integration for badge images
4. Set up Solana wallet connection

Happy coding! 🏆

