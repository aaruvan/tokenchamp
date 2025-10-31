#!/bin/bash
# Database initialization script

echo "Setting up TokenChamp database..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Set up database
echo "Initializing database..."
python setup_db.py

echo "✓ Database setup complete!"
echo "\nTo start the application:"
echo "  Backend:  python run.py"
echo "  Frontend: npm install && npm run dev"

