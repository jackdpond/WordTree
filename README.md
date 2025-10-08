# WordTree - Daily Puzzle

A daily web-based puzzle game where players build binary trees using letter combinations and discover valid words through tree traversals. Like Wordle, but with binary trees!

## How to Play

1. Each day features a new word and its anagrams
2. Build a binary tree by placing letters in tree nodes
3. The game checks if your tree structure can produce valid words through different traversal methods:
   - Pre-order traversal
   - In-order traversal  
   - Post-order traversal
   - Breadth-first traversal
4. Find all possible valid trees to complete the daily puzzle!
5. The same word is used for everyone on the same day - just like Wordle!

## Deployment on Render

This application is configured for deployment on Render:

- `app.py` - Main Flask application entry point
- `Procfile` - Tells Render how to run the application
- `requirements.txt` - Python dependencies
- `runtime.txt` - Specifies Python version

## Local Development

To run locally:

```bash
pip install -r requirements.txt
python app.py
```

The application will be available at `http://localhost:5000`

## Project Structure

- `WordTree/site/` - Frontend HTML, CSS, and JavaScript files
- `WordTree/solutions/` - Pre-computed word solutions for different word lengths
- `WordTree/resources/` - Word lists for different lengths
- `WordTree/answer_assembly/` - Core game logic and tree generation algorithms
