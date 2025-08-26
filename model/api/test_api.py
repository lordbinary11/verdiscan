import requests
import json
import os
from PIL import Image
import io

# API base URL
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_models_status():
    """Test models status endpoint"""
    print("\nTesting models status endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/models/status")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_prediction(plant_type, image_path):
    """Test prediction endpoint"""
    print(f"\nTesting {plant_type} prediction endpoint...")
    
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return False
    
    try:
        # Open and prepare image
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            
            response = requests.post(f"{BASE_URL}/predict/{plant_type}", files=files)
            
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Prediction: {result['predicted_class']}")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Processing time: {result['processing_time_ms']:.2f}ms")
            
            # Show top 3 predictions
            sorted_probs = sorted(result['all_probabilities'].items(), 
                                key=lambda x: x[1], reverse=True)
            print("\nTop 3 predictions:")
            for i, (class_name, prob) in enumerate(sorted_probs[:3]):
                print(f"  {i+1}. {class_name}: {prob:.2%}")
        else:
            print(f"Error: {response.text}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("Plant Disease Detection API Test")
    print("=" * 40)
    
    # Test health
    if not test_health():
        print("❌ Health check failed")
        return
    
    # Test models status
    if not test_models_status():
        print("❌ Models status check failed")
        return
    
    # Test predictions with sample images
    test_images = {
        'cassava': 'test_images/cassava/healthy/cassava_healthy.jpeg',
        'maize': 'test_images/maize/healthy/maize_healthy1.jpeg',
        'tomato': 'test_images/tomato/healthy/thealthy1.jpeg'
    }
    
    for plant_type, image_path in test_images.items():
        if os.path.exists(image_path):
            test_prediction(plant_type, image_path)
        else:
            print(f"\nSkipping {plant_type} test - image not found: {image_path}")
    
    print("\n" + "=" * 40)
    print("API testing complete!")

if __name__ == "__main__":
    main()
