import json
import os

def convert_to_lowercase(data):
    if isinstance(data, dict):
        return {k.lower(): convert_to_lowercase(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_to_lowercase(item) for item in data]
    elif isinstance(data, str):
        return data.lower()
    else:
        return data

def process_file(file_path):
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Convert to lowercase
        lowercase_data = convert_to_lowercase(data)
        
        # Write back to file
        with open(file_path, 'w') as f:
            json.dump(lowercase_data, f, indent=4)
        
        print(f"Successfully processed {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    solutions_dir = "solutions"
    for filename in os.listdir(solutions_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(solutions_dir, filename)
            process_file(file_path)

if __name__ == "__main__":
    main() 