import json
import random
import os

def initialize_game():
    # Read solutions_5.json
    with open('solutions/solutions_5.json', 'r') as f:
        solutions = json.load(f)
    
    # Randomly select a word and its solutions
    word_key = random.choice(list(solutions.keys()))
    word_solutions = solutions[word_key]
    
    # Create the solution data structure
    solution_data = {
        "word": word_key.split('/')[0],  # Use the first word as the main word
        "anagrams": word_key.split('/'),  # All possible anagrams
        "solutions": word_solutions
    }
    
    # Write to solution.json in the site directory
    with open('site/solution.json', 'w') as f:
        json.dump(solution_data, f, indent=4)
    
    print(f"Game initialized with word: {word_key}")

if __name__ == "__main__":
    initialize_game() 