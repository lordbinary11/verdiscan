# import os

# data_dir = "data/cassava"
# for category in os.listdir(data_dir):
#     category_path = os.path.join(data_dir, category)
#     if os.path.isdir(category_path):  # Ensure it's a directory
#         num_images = len(os.listdir(category_path))
#         print(f"{category}: {num_images} images")


import os
import numpy as np
import matplotlib.pyplot as plt
import random
from keras.preprocessing.image import load_img, img_to_array

# Define paths
data_dir = "data"
categories = os.listdir(data_dir)  # List of class names

# Function to display images from each class
def show_sample_images(data_dir, categories, num_samples=3):
    fig, axes = plt.subplots(len(categories), num_samples, figsize=(10, 10))
    
    for i, category in enumerate(categories):
        class_path = os.path.join(data_dir, category)
        image_files = os.listdir(class_path)
        samples = random.sample(image_files, min(num_samples, len(image_files)))  # Pick random images

        for j, img_name in enumerate(samples):
            img_path = os.path.join(class_path, img_name)
            img = load_img(img_path, target_size=(224, 224))  # Load image
            img_array = img_to_array(img) / 255.0  # Normalize

            axes[i, j].imshow(img_array)
            axes[i, j].axis("off")

        axes[i, 0].set_ylabel(category, rotation=90, fontsize=12)

    plt.tight_layout()
    plt.show()

# Show sample images
show_sample_images(data_dir, categories)
