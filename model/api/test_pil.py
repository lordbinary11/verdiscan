#!/usr/bin/env python3
"""
Test script to verify PIL installation and functionality
"""
from PIL import Image
import io
import sys

def test_pil_basic():
    """Test basic PIL functionality"""
    print("Testing PIL basic functionality...")
    
    # Test 1: Create a simple test image
    try:
        test_img = Image.new('RGB', (100, 100), color='red')
        print("✓ Successfully created test image")
        
        # Test 2: Save and reload
        img_bytes = io.BytesIO()
        test_img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        reloaded_img = Image.open(img_bytes)
        print("✓ Successfully saved and reloaded image")
        
        # Test 3: Check image properties
        print(f"  - Format: {reloaded_img.format}")
        print(f"  - Size: {reloaded_img.size}")
        print(f"  - Mode: {reloaded_img.mode}")
        
    except Exception as e:
        print(f"✗ Basic PIL test failed: {e}")
        return False
    
    return True

def test_pil_from_bytes():
    """Test creating image from bytes"""
    print("\nTesting PIL from bytes functionality...")
    
    try:
        # Create test image data (simple 2x2 RGB image)
        # Red, Green, Blue, White pixels
        pixel_data = b'\xff\x00\x00\x00\xff\x00\x00\x00\xff\xff\xff\xff'
        
        # Create image from bytes
        img = Image.frombytes('RGB', (2, 2), pixel_data)
        print("✓ Successfully created image from bytes")
        print(f"  - Size: {img.size}")
        print(f"  - Mode: {img.mode}")
        
        # Convert to array and check
        img_array = list(img.getdata())
        print(f"  - First pixel (should be red): {img_array[0]}")
        
    except Exception as e:
        print(f"✗ From bytes test failed: {e}")
        return False
    
    return True

def test_pil_versions():
    """Test PIL version information"""
    print("\nPIL Version Information:")
    print(f"PIL version: {Image.__version__}")
    print(f"Python version: {sys.version}")
    
    # Check for common issues
    try:
        from PIL import ImageFile
        print("✓ ImageFile module available")
    except ImportError:
        print("⚠ ImageFile module not available")
    
    try:
        from PIL import ImageOps
        print("✓ ImageOps module available")
    except ImportError:
        print("⚠ ImageOps module not available")

def main():
    """Run all tests"""
    print("=== PIL Functionality Test ===")
    
    success = True
    success &= test_pil_basic()
    success &= test_pil_from_bytes()
    test_pil_versions()
    
    if success:
        print("\n✅ All PIL tests passed!")
    else:
        print("\n❌ Some PIL tests failed!")
    
    return success

if __name__ == "__main__":
    main()
