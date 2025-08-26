#!/usr/bin/env python3
"""
Test script to verify image upload functionality
"""
import requests
import os
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    # Create a 224x224 test image
    img = Image.new('RGB', (224, 224), color='green')
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes

def test_image_upload():
    """Test image upload to the API"""
    api_url = "http://localhost:8000"
    
    # Test health endpoint first
    try:
        response = requests.get(f"{api_url}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test model status
    try:
        response = requests.get(f"{api_url}/models/status")
        print(f"Model status: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Model status failed: {e}")
        return
    
    # Create test image
    test_image = create_test_image()
    
    # Test cassava prediction
    try:
        files = {'image': ('test_image.jpg', test_image, 'image/jpeg')}
        response = requests.post(f"{api_url}/predict/cassava", files=files)
        print(f"Cassava prediction: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Cassava prediction failed: {e}")
    
    # Test maize prediction
    try:
        test_image.seek(0)  # Reset file pointer
        files = {'image': ('test_image.jpg', test_image, 'image/jpeg')}
        response = requests.post(f"{api_url}/predict/maize", files=files)
        print(f"Maize prediction: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Maize prediction failed: {e}")
    
    # Test tomato prediction
    try:
        test_image.seek(0)  # Reset file pointer
        files = {'image': ('test_image.jpg', test_image, 'image/jpeg')}
        response = requests.post(f"{api_url}/predict/tomato", files=files)
        print(f"Tomato prediction: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Tomato prediction failed: {e}")

if __name__ == "__main__":
    test_image_upload()
