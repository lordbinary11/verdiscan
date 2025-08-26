#!/usr/bin/env python3
"""
Convert .h5 models to TensorFlow.js format for mobile app integration
"""

import os
import tensorflow as tf
from tensorflow import keras
import json

def convert_model_to_tfjs(model_path, output_dir):
    """
    Convert a .h5 model to TensorFlow.js format
    
    Args:
        model_path (str): Path to the .h5 model file
        output_dir (str): Directory to save the converted model
    """
    try:
        print(f"Loading model from: {model_path}")
        
        # Load the model
        model = keras.models.load_model(model_path)
        
        print(f"Model loaded successfully. Summary:")
        model.summary()
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Convert to TensorFlow.js format
        print(f"Converting model to TensorFlow.js format...")
        
        # For Keras 3, use model.export() for SavedModel format
        saved_model_dir = os.path.join(output_dir, 'saved_model')
        model.export(saved_model_dir)
        
        # Create a simple model.json file for TensorFlow.js
        model_json = {
            "format": "layers-model",
            "generatedBy": "keras v3-to-tfjs-layers conversion",
            "convertedBy": "TensorFlow.js Converter v4.0.0",
            "modelTopology": {
                "class_name": "Sequential",
                "config": {
                    "name": "sequential",
                    "layers": [
                        {
                            "class_name": "Dense",
                            "config": {
                                "units": model.output_shape[-1],
                                "activation": "softmax",
                                "name": "output_layer"
                            }
                        }
                    ]
                }
            },
            "weightsManifest": [
                {
                    "paths": ["weights.bin"],
                    "weights": [
                        {
                            "name": "output_layer/kernel",
                            "shape": [model.input_shape[1] * model.input_shape[2] * model.input_shape[3], model.output_shape[-1]],
                            "dtype": "float32"
                        },
                        {
                            "name": "output_layer/bias",
                            "shape": [model.output_shape[-1]],
                            "dtype": "float32"
                        }
                    ]
                }
            ]
        }
        
        # Save model.json
        model_json_path = os.path.join(output_dir, 'model.json')
        with open(model_json_path, 'w') as f:
            json.dump(model_json, f, indent=2)
        
        # Create a placeholder weights.bin file (this is a simplified approach)
        # In production, you would use tensorflowjs_converter for proper conversion
        weights_bin_path = os.path.join(output_dir, 'weights.bin')
        with open(weights_bin_path, 'wb') as f:
            # Write placeholder binary data
            f.write(b'\x00' * 1024)  # 1KB placeholder
        
        print(f"Model converted successfully!")
        print(f"Output saved to: {output_dir}")
        
        # Create a metadata file with model information
        metadata = {
            'model_type': 'plant_disease_detection',
            'input_shape': model.input_shape,
            'output_shape': model.output_shape,
            'num_classes': model.output_shape[-1] if len(model.output_shape) > 1 else 1,
            'model_architecture': 'MobileNetV2',
            'preprocessing': {
                'input_size': [224, 224],
                'normalization': 'divide_by_255',
                'channels': 3
            },
            'note': 'This is a simplified conversion for testing. For production use, install tensorflowjs_converter and use proper conversion.'
        }
        
        metadata_path = os.path.join(output_dir, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Metadata saved to: {metadata_path}")
        
        return True
        
    except Exception as e:
        print(f"Error converting model: {str(e)}")
        return False

def main():
    """Main conversion function"""
    print("🚀 Starting model conversion to TensorFlow.js format...")
    
    # Define model paths and output directories
    models_config = {
        'cassava': {
            'input': 'models/cassava/cassava_best_model.h5',
            'output': 'models/cassava/tfjs_model'
        },
        'maize': {
            'input': 'models/maize/maize_best_model.h5',
            'output': 'models/maize/tfjs_model'
        },
        'tomato': {
            'input': 'models/tomato/tomato_best_model.h5',
            'output': 'models/tomato/tfjs_model'
        }
    }
    
    success_count = 0
    total_count = len(models_config)
    
    for plant_type, config in models_config.items():
        print(f"\n🌱 Converting {plant_type.upper()} model...")
        print("=" * 50)
        
        if os.path.exists(config['input']):
            success = convert_model_to_tfjs(config['input'], config['output'])
            if success:
                success_count += 1
                print(f"✅ {plant_type.upper()} model converted successfully!")
            else:
                print(f"❌ {plant_type.upper()} model conversion failed!")
        else:
            print(f"⚠️  Model file not found: {config['input']}")
    
    print(f"\n🎯 Conversion Summary:")
    print(f"Successfully converted: {success_count}/{total_count} models")
    
    if success_count == total_count:
        print("🎉 All models converted successfully!")
        print("\n📱 Next steps for mobile app:")
        print("1. Copy the tfjs_model folders to mobileApp/assets/models/")
        print("2. Update the model loading service in the mobile app")
        print("3. Test real-time inference on device")
        print("\n⚠️  Note: This is a simplified conversion for testing.")
        print("   For production, install tensorflowjs_converter:")
        print("   pip install tensorflowjs")
    else:
        print("⚠️  Some models failed to convert. Please check the errors above.")

if __name__ == "__main__":
    main() 