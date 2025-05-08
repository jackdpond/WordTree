from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import random
import os

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

def get_random_word():
    try:
        with open('../solutions/solutions_5.json', 'r') as f:
            solutions = json.load(f)
        
        word_key = random.choice(list(solutions.keys()))
        word_solutions = solutions[word_key]
        
        return {
            "word": word_key.split('/')[0],
            "anagrams": word_key.split('/'),
            "solutions": word_solutions
        }
    except Exception as e:
        raise

@app.route('/api/random-word')
def random_word():
    return jsonify(get_random_word())

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Ensure the static folder exists
    if not os.path.exists(app.static_folder):
        os.makedirs(app.static_folder)
    
    # Run the server on all interfaces with port 5001
    app.run(debug=True, host='0.0.0.0', port=5001) 