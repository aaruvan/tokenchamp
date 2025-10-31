#!/usr/bin/env python
"""
Setup script to initialize the database
Run this to create all necessary tables
"""
from backend.app import create_app, db
from backend.models import Tournament, Team, Match, Winner

app = create_app()

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("✓ Database tables created successfully!")
    print("\nTables created:")
    print("  - tournaments")
    print("  - teams")
    print("  - matches")
    print("  - winners")

