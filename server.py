from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import random
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='site')
CORS(app)  # Enable CORS for all routes

def get_random_word():
    try:
        with open('solutions/solutions_5.json', 'r') as f:
            solutions = json.load(f)
        
        word_key = random.choice(list(solutions.keys()))
        word_solutions = solutions[word_key]
        
        response_data = {
            "word": word_key.split('/')[0],
            "anagrams": word_key.split('/'),
            "solutions": word_solutions
        }
        
        logger.info(f"Generated random word data: {json.dumps(response_data, indent=2)}")
        return response_data
    except Exception as e:
        logger.error(f"Error in get_random_word: {str(e)}")
        raise

@app.route('/api/random-word')
def random_word():
    logger.info("Random word requested")
    data = get_random_word()
    logger.info(f"Sending response: {json.dumps(data, indent=2)}")
    return jsonify(data)

@app.route('/')
def index():
    logger.info("Index page requested")
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    logger.info(f"Static file requested: {path}")
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Ensure the static folder exists and has correct permissions
    if not os.path.exists(app.static_folder):
        logger.info(f"Creating static folder: {app.static_folder}")
        os.makedirs(app.static_folder)
    
    logger.info(f"Static folder path: {os.path.abspath(app.static_folder)}")
    logger.info("Starting server...")
    
    # Run the server on all interfaces with port 5001
    app.run(debug=True, host='0.0.0.0', port=5001) 