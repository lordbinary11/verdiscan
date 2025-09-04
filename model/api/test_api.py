import requests
import json
from PIL import Image
import io
import numpy as np

def create_test_image():
    """Create a simple test image for testing"""
    # Create a 224x224 RGB test image
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def test_api_endpoints():
    """Test all API endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Crop Disease Detection API...")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Status: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
    
    # Test 2: Root endpoint
    print("\n2️⃣ Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Root endpoint passed")
            print(f"   Available crops: {response.json().get('available_crops', [])}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {str(e)}")
    
    # Test 3: Test image creation
    print("\n3️⃣ Creating test image...")
    try:
        test_img = create_test_image()
        print("✅ Test image created successfully")
    except Exception as e:
        print(f"❌ Test image creation failed: {str(e)}")
        return
    
    # Test 4: Test cassava detection
    print("\n4️⃣ Testing cassava detection...")
    try:
        files = {'file': ('test_image.png', test_img, 'image/png')}
        response = requests.post(f"{base_url}/detect/cassava", files=files)
        if response.status_code == 200:
            print("✅ Cassava detection passed")
            result = response.json()
            print(f"   Predicted: {result.get('predicted_disease')}")
            print(f"   Confidence: {result.get('confidence'):.3f}")
        else:
            print(f"❌ Cassava detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Cassava detection error: {str(e)}")
    
    # Test 5: Test maize detection
    print("\n5️⃣ Testing maize detection...")
    try:
        test_img.seek(0)  # Reset file pointer
        files = {'file': ('test_image.png', test_img, 'image/png')}
        response = requests.post(f"{base_url}/detect/maize", files=files)
        if response.status_code == 200:
            print("✅ Maize detection passed")
            result = response.json()
            print(f"   Predicted: {result.get('predicted_disease')}")
            print(f"   Confidence: {result.get('confidence'):.3f}")
        else:
            print(f"❌ Maize detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Maize detection error: {str(e)}")
    
    # Test 6: Test tomato detection
    print("\n6️⃣ Testing tomato detection...")
    try:
        test_img.seek(0)  # Reset file pointer
        files = {'file': ('test_image.png', test_img, 'image/png')}
        response = requests.post(f"{base_url}/detect/tomato", files=files)
        if response.status_code == 200:
            print("✅ Tomato detection passed")
            result = response.json()
            print(f"   Predicted: {result.get('predicted_disease')}")
            print(f"   Confidence: {result.get('confidence'):.3f}")
        else:
            print(f"❌ Tomato detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Tomato detection error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎯 API testing completed!")

if __name__ == "__main__":
    test_api_endpoints()
