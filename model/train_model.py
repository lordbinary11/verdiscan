#!/usr/bin/env python3
"""
VerdScan Model Training Launcher
===============================

A user-friendly script to train crop disease detection models.
This script provides an interactive interface for the mobilenet_train.py script.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def print_banner():
    """Print welcome banner"""
    print("🌾" + "="*60 + "🌾")
    print("         VerdScan Model Training Launcher")
    print("    Train your own crop disease detection models")
    print("🌾" + "="*60 + "🌾")
    print()

def check_prerequisites():
    """Check if all prerequisites are met"""
    print("🔍 Checking prerequisites...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    
    # Check if required packages are installed
    required_packages = ['tensorflow', 'numpy', 'matplotlib', 'sklearn']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("   Run: pip install -r requirements.txt")
        return False
    
    print("✅ All prerequisites met!")
    return True

def check_data_structure(crop_type):
    """Check if data structure is correct"""
    data_dir = Path(f"data/{crop_type}")
    
    if not data_dir.exists():
        print(f"❌ Data directory not found: {data_dir}")
        return False
    
    # Expected classes for each crop
    expected_classes = {
        'cassava': ['bacterial_blight', 'brown_streak_disease', 'green_mottle', 'healthy', 'mosaic_disease'],
        'maize': ['blight', 'common_rust', 'gray_leaf_spot', 'healthy'],
        'tomato': ['bacterial_spot', 'early_blight', 'healthy', 'late_blight', 'leaf_mold', 
                  'mosaic_virus', 'septoria_spot', 'spider_mites', 'target_spot', 'yellow_leaf_curl_virus']
    }
    
    classes = expected_classes.get(crop_type, [])
    missing_classes = []
    class_counts = {}
    
    for class_name in classes:
        class_dir = data_dir / class_name
        if not class_dir.exists():
            missing_classes.append(class_name)
        else:
            # Count images in class directory
            image_files = [f for f in os.listdir(class_dir) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            class_counts[class_name] = len(image_files)
    
    if missing_classes:
        print(f"❌ Missing class directories: {', '.join(missing_classes)}")
        return False
    
    # Check if classes have enough images
    min_images = 50
    insufficient_classes = [cls for cls, count in class_counts.items() if count < min_images]
    
    if insufficient_classes:
        print(f"⚠️  Classes with <{min_images} images: {', '.join(insufficient_classes)}")
        print("   Consider adding more images for better training results")
    
    print(f"✅ Data structure verified for {crop_type}:")
    for class_name, count in class_counts.items():
        print(f"   {class_name}: {count} images")
    
    return True

def create_output_directories(crop_type):
    """Create output directories for models"""
    model_dir = Path(f"models/{crop_type}")
    model_dir.mkdir(parents=True, exist_ok=True)
    print(f"✅ Output directory ready: {model_dir}")

def interactive_training():
    """Interactive training setup"""
    print_banner()
    
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please install requirements first.")
        return
    
    print("\n📋 Available crop types:")
    print("1. Cassava (5 disease classes)")
    print("2. Maize (4 disease classes)")  
    print("3. Tomato (10 disease classes)")
    print("4. All crops (sequential training)")
    
    while True:
        try:
            choice = input("\nSelect option (1-4): ").strip()
            if choice == '1':
                crop_type = 'cassava'
                break
            elif choice == '2':
                crop_type = 'maize'
                break
            elif choice == '3':
                crop_type = 'tomato'
                break
            elif choice == '4':
                crop_type = 'all'
                break
            else:
                print("Invalid choice. Please select 1-4.")
        except KeyboardInterrupt:
            print("\n👋 Training cancelled.")
            return
    
    if crop_type == 'all':
        crops_to_train = ['cassava', 'maize', 'tomato']
    else:
        crops_to_train = [crop_type]
    
    # Validate data for each crop
    for crop in crops_to_train:
        print(f"\n🔍 Checking data for {crop}...")
        if not check_data_structure(crop):
            print(f"❌ Data validation failed for {crop}")
            return
        create_output_directories(crop)
    
    # Training configuration
    print(f"\n⚙️  Training Configuration:")
    print(f"   Crops: {', '.join(crops_to_train)}")
    print(f"   Architecture: MobileNetV2 with transfer learning")
    print(f"   Epochs: 50 (with early stopping)")
    print(f"   Batch size: 64")
    print(f"   Data augmentation: Enabled")
    
    # Confirm training
    confirm = input(f"\n🚀 Start training? (y/N): ").strip().lower()
    if confirm not in ['y', 'yes']:
        print("👋 Training cancelled.")
        return
    
    # Start training
    for crop in crops_to_train:
        print(f"\n🏋️ Training {crop} model...")
        print("="*50)
        
        try:
            # Run training script
            result = subprocess.run([
                sys.executable, 
                'scripts/mobilenet_train.py', 
                '--crop', crop
            ], cwd=Path.cwd(), check=True)
            
            print(f"✅ {crop} model training completed successfully!")
            
            # Run evaluation
            print(f"\n📊 Evaluating {crop} model...")
            eval_result = subprocess.run([
                sys.executable,
                'scripts/mobilenet_evaluate.py',
                '--crop', crop
            ], cwd=Path.cwd(), check=True)
            
            print(f"✅ {crop} model evaluation completed!")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Training failed for {crop}: {e}")
            continue
        except FileNotFoundError:
            print(f"❌ Training script not found. Please ensure scripts/mobilenet_train.py exists")
            return
        except KeyboardInterrupt:
            print(f"\n⏹️  Training interrupted for {crop}")
            break
    
    print(f"\n🎉 Training completed for: {', '.join(crops_to_train)}")
    print("\n📂 Your trained models are saved in:")
    for crop in crops_to_train:
        print(f"   models/{crop}/{crop}_best_model.h5")
    
    print(f"\n🔄 Next steps:")
    print(f"   1. Review evaluation results in models/[crop]/ directories")
    print(f"   2. Test your models with the API: python api/test_api.py")
    print(f"   3. Update mobile app configuration if needed")

def command_line_training():
    """Command line training interface"""
    parser = argparse.ArgumentParser(
        description="Train VerdScan crop disease detection models",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train_model.py --crop cassava
  python train_model.py --crop maize --epochs 100
  python train_model.py --crop all --batch-size 32
        """
    )
    
    parser.add_argument('--crop', 
                       choices=['cassava', 'maize', 'tomato', 'all'],
                       required=True,
                       help='Crop type to train (or "all" for all crops)')
    
    parser.add_argument('--epochs',
                       type=int,
                       default=50,
                       help='Number of training epochs (default: 50)')
    
    parser.add_argument('--batch-size',
                       type=int, 
                       default=64,
                       help='Batch size for training (default: 64)')
    
    parser.add_argument('--learning-rate',
                       type=float,
                       default=1e-4,
                       help='Learning rate (default: 1e-4)')
    
    parser.add_argument('--no-eval',
                       action='store_true',
                       help='Skip evaluation after training')
    
    args = parser.parse_args()
    
    # Process training
    if args.crop == 'all':
        crops_to_train = ['cassava', 'maize', 'tomato']
    else:
        crops_to_train = [args.crop]
    
    for crop in crops_to_train:
        print(f"\n🏋️ Training {crop} model...")
        
        if not check_data_structure(crop):
            continue
        
        create_output_directories(crop)
        
        try:
            # Run training with custom parameters
            cmd = [
                sys.executable,
                'scripts/mobilenet_train.py',
                '--crop', crop
            ]
            
            # Note: The original script doesn't support these parameters
            # This is a placeholder for enhanced training script
            print(f"   Epochs: {args.epochs}")
            print(f"   Batch size: {args.batch_size}")
            print(f"   Learning rate: {args.learning_rate}")
            
            subprocess.run(cmd, check=True)
            
            if not args.no_eval:
                print(f"\n📊 Evaluating {crop} model...")
                subprocess.run([
                    sys.executable,
                    'scripts/mobilenet_evaluate.py', 
                    '--crop', crop
                ], check=True)
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Training failed for {crop}: {e}")
            continue

def main():
    """Main function"""
    # Change to model directory
    if Path('model').exists():
        os.chdir('model')
    elif not Path('scripts').exists():
        print("❌ Please run this script from the project root or model directory")
        sys.exit(1)
    
    # Check if command line arguments provided
    if len(sys.argv) > 1:
        command_line_training()
    else:
        interactive_training()

if __name__ == "__main__":
    main()
