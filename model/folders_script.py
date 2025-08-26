import os

# Define folder structure
folders = [
     "notebooks", "scripts", "models"
]

files = {
    "scripts/data_exploration.py": "# Script for dataset exploration",
    "scripts/preprocess.py": "# Script for image preprocessing",
    "scripts/split_data.py": "# Script for splitting dataset",
    "scripts/train.py": "# Script for training the model",
    "scripts/evaluate.py": "# Script for evaluating the model",
    "README.md": "# Cassava, Maize, and Tomato Disease Detection Project",
    "requirements.txt": "# Required dependencies"
}

# Create folders
for folder in folders:
    os.makedirs(folder, exist_ok=True)

# Create files with initial content
for file, content in files.items():
    with open(file, "w") as f:
        f.write(content)

print("✅ Project structure created successfully!")
