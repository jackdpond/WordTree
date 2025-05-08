from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

def get_demo_word():
    # Get the absolute path to the demo solution file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    demo_path = os.path.join(current_dir, 'demo_solution.json')
    
    with open(demo_path, 'r') as f:
        return json.load(f)

@app.route('/api/random-word')
def random_word():
    return jsonify(get_demo_word())

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