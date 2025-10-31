#!/usr/bin/env python
"""
Main entry point for the Flask application
Run this file to start the backend server
"""
from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

