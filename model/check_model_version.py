import h5py
import json
import os

def safe_decode(value):
    """Safely decode bytes to string"""
    if isinstance(value, bytes):
        return value.decode('utf-8')
    return str(value)

def check_model_version(model_path):
    """Check the TensorFlow version used to create a model"""
    try:
        with h5py.File(model_path, 'r') as f:
            # Check if there's a keras_version attribute
            if 'keras_version' in f.attrs:
                keras_version = safe_decode(f.attrs['keras_version'])
                print(f"Keras version: {keras_version}")
            
            # Check if there's a backend attribute
            if 'backend' in f.attrs:
                backend = safe_decode(f.attrs['backend'])
                print(f"Backend: {backend}")
            
            # Check for other version-related attributes
            print("Available attributes:")
            for key, value in f.attrs.items():
                decoded_value = safe_decode(value)
                print(f"  {key}: {decoded_value}")
            
            # Check the model structure
            print(f"\nModel structure:")
            def print_structure(name, obj):
                print(f"  {name}: {type(obj).__name__}")
                if hasattr(obj, 'attrs'):
                    for attr_name, attr_value in obj.attrs.items():
                        decoded_attr = safe_decode(attr_value)
                        print(f"    {attr_name}: {decoded_attr}")
            
            f.visititems(print_structure)
            
    except Exception as e:
        print(f"Error reading {model_path}: {e}")

def main():
    print("🔍 Checking TensorFlow/Keras versions of model files...")
    print("=" * 60)
    
    models = [
        "models/cassava/cassava_best_model.h5",
        "models/maize/maize_best_model.h5", 
        "models/tomato/tomato_best_model.h5"
    ]
    
    for model_path in models:
        if os.path.exists(model_path):
            print(f"\n📁 {model_path}")
            print("-" * 40)
            check_model_version(model_path)
        else:
            print(f"\n❌ {model_path} not found")
    
    print("\n" + "=" * 60)
    print("💡 Based on the versions found, we can determine the compatible TensorFlow version")

if __name__ == "__main__":
    main()
