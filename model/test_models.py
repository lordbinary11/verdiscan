import os
import numpy as np
import tensorflow as tf
from PIL import Image
import json

# Disable GPU warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

class PlantDiseaseDetector:
    def __init__(self):
        self.models = {}
        self.class_names = {}
        self.load_models()
    
    def load_models(self):
        """Load all trained models"""
        model_paths = {
            'cassava': 'models/cassava/cassava_best_model.h5',
            'maize': 'models/maize/maize_best_model.h5',
            'tomato': 'models/tomato/tomato_best_model.h5'
        }
        
        class_names = {
            'cassava': [
                'bacterial_blight',
                'brown_streak_disease', 
                'green_mottle',
                'healthy',
                'mosaic_disease'
            ],
            'maize': [
                'common_rust',
                'gray_leaf_spot',
                'healthy',
                'northern_leaf_blight'
            ],
            'tomato': [
                'bacterial_spot',
                'early_blight',
                'healthy',
                'late_blight',
                'leaf_mold',
                'mosaic_virus',
                'septoria_leaf_spot',
                'spider_mites',
                'target_spot',
                'yellow_leaf_curl_virus'
            ]
        }
        
        for plant_type, model_path in model_paths.items():
            try:
                if os.path.exists(model_path):
                    print(f"Loading {plant_type} model from {model_path}")
                    self.models[plant_type] = tf.keras.models.load_model(model_path)
                    self.class_names[plant_type] = class_names[plant_type]
                    print(f"✓ {plant_type} model loaded successfully")
                else:
                    print(f"✗ {plant_type} model not found at {model_path}")
            except Exception as e:
                print(f"✗ Error loading {plant_type} model: {e}")
    
    def preprocess_image(self, image_path, target_size=(224, 224)):
        """Preprocess image for model input"""
        try:
            # Load and resize image
            img = Image.open(image_path)
            img = img.resize(target_size)
            
            # Convert to array and normalize
            img_array = np.array(img)
            
            # Handle different image formats
            if len(img_array.shape) == 3:
                if img_array.shape[2] == 4:  # RGBA
                    img_array = img_array[:, :, :3]  # Remove alpha channel
                elif img_array.shape[2] == 1:  # Grayscale
                    img_array = np.stack([img_array[:, :, 0]] * 3, axis=-1)
            
            # Normalize pixel values
            img_array = img_array.astype('float32') / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            print(f"Error preprocessing image {image_path}: {e}")
            return None
    
    def predict(self, plant_type, image_path):
        """Predict disease for a given plant type and image"""
        if plant_type not in self.models:
            return {"error": f"Model for {plant_type} not loaded"}
        
        # Preprocess image
        processed_image = self.preprocess_image(image_path)
        if processed_image is None:
            return {"error": "Failed to preprocess image"}
        
        try:
            # Make prediction
            predictions = self.models[plant_type].predict(processed_image, verbose=0)
            
            # Get class with highest probability
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            
            # Get class name
            predicted_class = self.class_names[plant_type][predicted_class_idx]
            
            # Get all probabilities
            all_probabilities = {}
            for i, class_name in enumerate(self.class_names[plant_type]):
                all_probabilities[class_name] = float(predictions[0][i])
            
            return {
                "plant_type": plant_type,
                "predicted_class": predicted_class,
                "confidence": confidence,
                "all_probabilities": all_probabilities,
                "image_path": image_path
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {e}"}
    
    def test_with_sample_images(self):
        """Test models with sample images if available"""
        print("\n" + "="*50)
        print("TESTING MODELS WITH SAMPLE IMAGES")
        print("="*50)
        
        # Check if there are sample images in data folder
        data_folders = ['data/cassava', 'data/maize', 'data/tomato']
        
        for folder in data_folders:
            if os.path.exists(folder):
                print(f"\nTesting {folder.split('/')[-1]} model:")
                # Look for sample images
                for file in os.listdir(folder):
                    if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                        image_path = os.path.join(folder, file)
                        plant_type = folder.split('/')[-1]
                        
                        print(f"  Testing with: {file}")
                        result = self.predict(plant_type, image_path)
                        
                        if "error" not in result:
                            print(f"    ✓ Predicted: {result['predicted_class']}")
                            print(f"    ✓ Confidence: {result['confidence']:.2%}")
                        else:
                            print(f"    ✗ Error: {result['error']}")
        
        print("\n" + "="*50)
        print("MODEL TESTING COMPLETE")
        print("="*50)

def main():
    print("Plant Disease Detection Model Tester")
    print("="*40)
    
    # Initialize detector
    detector = PlantDiseaseDetector()
    
    # Test models
    detector.test_with_sample_images()
    
    # Interactive testing
    print("\nInteractive Testing Mode")
    print("Enter 'quit' to exit")
    
    while True:
        print("\nAvailable plant types:", list(detector.models.keys()))
        plant_type = input("Enter plant type to test: ").lower().strip()
        
        if plant_type == 'quit':
            break
        
        if plant_type not in detector.models:
            print(f"✗ No model available for {plant_type}")
            continue
        
        image_path = input("Enter image path: ").strip()
        
        if not os.path.exists(image_path):
            print(f"✗ Image not found: {image_path}")
            continue
        
        print(f"\nTesting {plant_type} model with {image_path}...")
        result = detector.predict(plant_type, image_path)
        
        if "error" not in result:
            print(f"✓ Prediction successful!")
            print(f"  Plant: {result['plant_type']}")
            print(f"  Disease: {result['predicted_class']}")
            print(f"  Confidence: {result['confidence']:.2%}")
            
            # Show top 3 predictions
            sorted_probs = sorted(result['all_probabilities'].items(), 
                                key=lambda x: x[1], reverse=True)
            print("\n  Top 3 predictions:")
            for i, (class_name, prob) in enumerate(sorted_probs[:3]):
                print(f"    {i+1}. {class_name}: {prob:.2%}")
        else:
            print(f"✗ Error: {result['error']}")

if __name__ == "__main__":
    main() 