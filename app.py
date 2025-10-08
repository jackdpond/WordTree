from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import random
import os
from datetime import datetime, date
import hashlib

app = Flask(__name__, static_folder='site')
CORS(app)  # Enable CORS for all routes

def get_daily_word():
    """Get the word for today's puzzle based on the date."""
    # Get the absolute path to the solutions file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    solutions_path = os.path.join(current_dir, 'solutions', 'solutions_5.json')
    
    with open(solutions_path, 'r') as f:
        solutions = json.load(f)
    
    # Get today's date
    today = date.today()
    
    # Create a seed based on today's date (YYYY-MM-DD format)
    date_str = today.strftime('%Y-%m-%d')
    
    # Use hash to get a consistent but seemingly random selection
    hash_object = hashlib.md5(date_str.encode())
    hash_int = int(hash_object.hexdigest(), 16)
    
    # Get list of available words
    word_keys = list(solutions.keys())
    
    # Use the hash to select a word for today
    word_index = hash_int % len(word_keys)
    word_key = word_keys[word_index]
    word_solutions = solutions[word_key]
    
    return {
        "word": word_key.split('/')[0],
        "anagrams": word_key.split('/'),
        "solutions": word_solutions,
        "date": date_str,
        "day_number": (today - date(2024, 1, 1)).days + 1  # Day number since Jan 1, 2024
    }

@app.route('/api/daily-word')
def daily_word():
    return jsonify(get_daily_word())

@app.route('/api/random-word')
def random_word():
    """Legacy endpoint for backward compatibility"""
    return jsonify(get_daily_word())

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Debug information for deployment
    print(f"Current working directory: {os.getcwd()}")
    print(f"Script directory: {os.path.dirname(os.path.abspath(__file__))}")
    print(f"Files in current directory: {os.listdir('.')}")
    print(f"Static folder: site")
    print(f"Static folder exists: {os.path.exists('site')}")
    
    # For local development
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
