# 🤖 VerdScan Model Training Guide

A comprehensive guide for training your own crop disease detection models using MobileNetV2 transfer learning.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Dataset Preparation](#dataset-preparation)
4. [Training Process](#training-process)
5. [Model Evaluation](#model-evaluation)
6. [Using Custom Models](#using-custom-models)
7. [Advanced Training Options](#advanced-training-options)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

VerdScan uses **MobileNetV2** with transfer learning to detect diseases in:
- **Cassava** (5 classes): bacterial_blight, brown_streak_disease, green_mottle, healthy, mosaic_disease
- **Maize** (4 classes): blight, common_rust, gray_leaf_spot, healthy  
- **Tomato** (10 classes): bacterial_spot, early_blight, healthy, late_blight, leaf_mold, mosaic_virus, septoria_spot, spider_mites, target_spot, yellow_leaf_curl_virus

### Model Architecture
- **Base Model**: MobileNetV2 (pre-trained on ImageNet)
- **Transfer Learning**: Fine-tuning last 54 layers
- **Input Size**: 224x224x3 RGB images
- **Output**: Softmax classification

## 🔧 Prerequisites

### System Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Python | 3.8+ | 3.9+ |
| RAM | 8GB | 16GB+ |
| Storage | 10GB | 20GB+ |
| GPU | Optional | NVIDIA GPU with CUDA |

### Software Dependencies
```bash
# Install training requirements
cd model
pip install -r requirements.txt

# Additional packages for visualization
pip install seaborn matplotlib
```

### Hardware Recommendations
- **CPU Training**: 4+ cores, expect 2-4 hours per crop
- **GPU Training**: NVIDIA GPU with 4GB+ VRAM, expect 30-60 minutes per crop
- **Storage**: SSD recommended for faster data loading

## 📁 Dataset Preparation

### Step 1: Dataset Structure

Organize your dataset in the following structure:

```
model/
├── data/
│   ├── cassava/
│   │   ├── bacterial_blight/
│   │   │   ├── image1.jpg
│   │   │   ├── image2.jpg
│   │   │   └── ...
│   │   ├── brown_streak_disease/
│   │   ├── green_mottle/
│   │   ├── healthy/
│   │   └── mosaic_disease/
│   ├── maize/
│   │   ├── blight/
│   │   ├── common_rust/
│   │   ├── gray_leaf_spot/
│   │   └── healthy/
│   └── tomato/
│       ├── bacterial_spot/
│       ├── early_blight/
│       ├── healthy/
│       ├── late_blight/
│       ├── leaf_mold/
│       ├── mosaic_virus/
│       ├── septoria_spot/
│       ├── spider_mites/
│       ├── target_spot/
│       └── yellow_leaf_curl_virus/
└── scripts/
    ├── mobilenet_train.py
    ├── mobilenet_evaluate.py
    └── data_exploration.py
```

### Step 2: Dataset Requirements

#### Image Requirements
- **Format**: JPG, PNG, or other common image formats
- **Size**: Minimum 224x224 pixels (will be resized automatically)
- **Quality**: Clear, well-lit images of leaves
- **Orientation**: Any orientation (data augmentation handles rotation)

#### Dataset Size Guidelines
| Crop Type | Classes | Min Images/Class | Recommended Images/Class |
|-----------|---------|------------------|-------------------------|
| Cassava | 5 | 100 | 500+ |
| Maize | 4 | 100 | 500+ |
| Tomato | 10 | 100 | 300+ |

#### Data Quality Tips
- **Diverse backgrounds**: Include various lighting conditions
- **Multiple angles**: Different leaf orientations and positions
- **Disease stages**: Early, moderate, and severe disease symptoms
- **Healthy samples**: Include various healthy leaf conditions
- **Balanced classes**: Try to have similar numbers of images per class

### Step 3: Data Exploration

Before training, explore your dataset:

```bash
cd model/scripts
python data_exploration.py
```

This will show:
- Sample images from each class
- Class distribution
- Image statistics

## 🏋️ Training Process

### Step 1: Basic Training

Train a model for a specific crop:

```bash
cd model/scripts

# Train cassava model
python mobilenet_train.py --crop cassava

# Train maize model  
python mobilenet_train.py --crop maize

# Train tomato model
python mobilenet_train.py --crop tomato
```

### Step 2: Training Parameters

The training script uses the following configuration:

```python
# Data Augmentation
datagen = ImageDataGenerator(
    rescale=1.0/255,           # Normalize pixel values
    rotation_range=30,         # Random rotation ±30°
    width_shift_range=0.3,     # Random horizontal shift
    height_shift_range=0.3,    # Random vertical shift
    brightness_range=[0.7, 1.3], # Random brightness
    zoom_range=0.2,            # Random zoom
    horizontal_flip=True,      # Random horizontal flip
    vertical_flip=True,        # Random vertical flip
    validation_split=0.2       # 80% train, 20% validation
)

# Model Architecture
base_model = MobileNetV2(weights='imagenet', include_top=False)
# Freeze first 100 layers, unfreeze last 54 layers

# Training Configuration
optimizer = Adam(learning_rate=1e-4)
loss = 'categorical_crossentropy'
epochs = 50
batch_size = 64
```

### Step 3: Monitor Training

During training, you'll see output like:

```
Epoch 1/50
157/157 [==============================] - 45s 287ms/step - loss: 1.2345 - accuracy: 0.6789 - val_loss: 0.9876 - val_accuracy: 0.7654
Epoch 2/50
157/157 [==============================] - 42s 268ms/step - loss: 0.9876 - accuracy: 0.7654 - val_loss: 0.8765 - val_accuracy: 0.8123
...
```

**Key Metrics to Watch:**
- **Training Accuracy**: Should gradually increase
- **Validation Accuracy**: Should increase without overfitting
- **Loss**: Should decrease over time
- **Learning Rate**: Will reduce automatically when loss plateaus

### Step 4: Training Outputs

After training, you'll get:

```
models/
├── cassava/
│   ├── cassava_best_model.h5      # Best model (highest val_accuracy)
│   └── cassava_fine_tuned.h5      # Final model (last epoch)
├── maize/
│   ├── maize_best_model.h5
│   └── maize_fine_tuned.h5
└── tomato/
    ├── tomato_best_model.h5
    └── tomato_fine_tuned.h5
```

## 📊 Model Evaluation

### Automatic Evaluation

Evaluate your trained model:

```bash
cd model/scripts

# Evaluate cassava model
python mobilenet_evaluate.py --crop cassava

# Evaluate maize model
python mobilenet_evaluate.py --crop maize

# Evaluate tomato model
python mobilenet_evaluate.py --crop tomato
```

### Evaluation Outputs

The evaluation script generates:

```
models/cassava/
├── cassava_evaluation.txt           # Accuracy and loss metrics
├── cassava_classification_report.txt # Precision, recall, F1-score per class
└── cassava_confusion_matrix.png     # Visual confusion matrix
```

### Expected Performance

Based on the provided models:

| Crop | Accuracy | Classes | Notes |
|------|----------|---------|-------|
| **Cassava** | ~83% | 5 | Good performance, some confusion between diseases |
| **Maize** | ~95% | 4 | Excellent performance, well-balanced |
| **Tomato** | ~95% | 10 | High accuracy despite many classes |

### Performance Metrics Explanation

```
                    precision    recall  f1-score   support
bacterial_blight       0.61      0.67      0.64        93
brown_streak_disease   0.86      0.75      0.80       288
green_mottle           0.83      0.65      0.73       154
healthy                0.62      0.86      0.72        63
mosaic_disease         0.88      0.95      0.91       531
```

- **Precision**: Of all predicted positive cases, how many were actually positive
- **Recall**: Of all actual positive cases, how many were correctly predicted
- **F1-score**: Harmonic mean of precision and recall
- **Support**: Number of actual occurrences of the class in the dataset

## 🔄 Using Custom Models

### Step 1: Replace Model Files

After training, replace the existing models:

```bash
# Copy your trained models to the correct locations
cp models/cassava/cassava_best_model.h5 ../api/models/cassava/
cp models/maize/maize_best_model.h5 ../api/models/maize/
cp models/tomato/tomato_best_model.h5 ../api/models/tomato/
```

### Step 2: Update Class Names (if needed)

If you have different classes, update `api/main.py`:

```python
class_names = {
    'cassava': [
        'your_class_1',
        'your_class_2',
        'your_class_3',
        'healthy'
    ],
    'maize': [
        'your_disease_1',
        'your_disease_2',
        'healthy'
    ],
    'tomato': [
        'your_disease_1',
        'your_disease_2',
        'your_disease_3',
        'healthy'
    ]
}
```

### Step 3: Test Your Custom Models

```bash
cd model/api
python test_api.py
```

## 🚀 Advanced Training Options

### Custom Training Script

Create your own training script with custom parameters:

```python
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint, EarlyStopping
import argparse
import os

def create_custom_model(num_classes, input_shape=(224, 224, 3)):
    """Create a custom model architecture"""
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    return model, base_model

def train_custom_model(data_dir, crop_type, num_classes):
    """Train model with custom parameters"""
    
    # Enhanced data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0/255,
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )
    
    # Validation data (no augmentation)
    val_datagen = ImageDataGenerator(
        rescale=1.0/255,
        validation_split=0.2
    )
    
    # Load data
    train_data = train_datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        subset='training'
    )
    
    val_data = val_datagen.flow_from_directory(
        data_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        subset='validation'
    )
    
    # Create model
    model, base_model = create_custom_model(num_classes)
    
    # Initial training (frozen base)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            f"models/{crop_type}/{crop_type}_best_model.h5",
            save_best_only=True,
            monitor="val_accuracy",
            mode="max"
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=5,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True
        )
    ]
    
    # Phase 1: Train with frozen base model
    print("🚀 Phase 1: Training with frozen base model...")
    history1 = model.fit(
        train_data,
        epochs=20,
        validation_data=val_data,
        callbacks=callbacks
    )
    
    # Phase 2: Fine-tune with unfrozen layers
    print("🔥 Phase 2: Fine-tuning with unfrozen layers...")
    base_model.trainable = True
    
    # Use lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history2 = model.fit(
        train_data,
        epochs=30,
        validation_data=val_data,
        callbacks=callbacks
    )
    
    return model, history1, history2

# Usage example
if __name__ == "__main__":
    train_custom_model("data/cassava", "cassava", 5)
```

### Hyperparameter Tuning

#### Learning Rate Scheduling
```python
# Cosine annealing
cosine_scheduler = tf.keras.callbacks.CosineRestartScheduler(
    first_restart_step=10,
    t_mul=2.0,
    m_mul=1.0,
    alpha=1e-6
)

# Step decay
def step_decay_schedule(initial_lr=1e-3, decay_factor=0.75, step_size=10):
    def schedule(epoch):
        return initial_lr * (decay_factor ** np.floor(epoch/step_size))
    return tf.keras.callbacks.LearningRateScheduler(schedule)
```

#### Custom Data Augmentation
```python
# Advanced augmentation pipeline
def advanced_augmentation():
    return ImageDataGenerator(
        rescale=1.0/255,
        rotation_range=45,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.3,
        channel_shift_range=0.2,
        brightness_range=[0.6, 1.4],
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='reflect',
        validation_split=0.2
    )
```

## 🏃 Training Process

### Step 1: Prepare Your Dataset

1. **Collect Images**: Gather high-quality images for each disease class
2. **Organize Structure**: Follow the directory structure shown above
3. **Quality Check**: Remove blurry, mislabeled, or poor-quality images
4. **Balance Classes**: Ensure roughly equal numbers of images per class

### Step 2: Explore Your Data

```bash
cd model/scripts
python data_exploration.py
```

This will help you:
- Visualize sample images from each class
- Check class distribution
- Identify potential data quality issues

### Step 3: Start Training

#### Basic Training (Recommended)
```bash
cd model/scripts

# Train cassava model (adjust based on your crop)
python mobilenet_train.py --crop cassava
```

#### Custom Training with Parameters
```python
# Create custom training script
python custom_train.py --crop cassava --epochs 100 --batch_size 32 --learning_rate 1e-4
```

### Step 4: Monitor Training Progress

#### Training Metrics to Monitor
- **Loss**: Should decrease steadily
- **Accuracy**: Should increase over time
- **Validation Loss**: Should not increase significantly (overfitting indicator)
- **Validation Accuracy**: Should track training accuracy closely

#### Expected Training Time
| Setup | Cassava (5 classes) | Maize (4 classes) | Tomato (10 classes) |
|-------|-------------------|------------------|-------------------|
| **CPU Only** | 2-4 hours | 1.5-3 hours | 4-6 hours |
| **GPU (GTX 1060)** | 30-60 min | 20-45 min | 60-90 min |
| **GPU (RTX 3080)** | 15-30 min | 10-20 min | 30-45 min |

### Step 5: Training Best Practices

#### Early Stopping
```python
early_stopping = EarlyStopping(
    monitor='val_accuracy',
    patience=10,
    restore_best_weights=True,
    verbose=1
)
```

#### Model Checkpointing
```python
checkpoint = ModelCheckpoint(
    f"models/{crop_type}/{crop_type}_best_model.h5",
    save_best_only=True,
    monitor="val_accuracy",
    mode="max",
    verbose=1
)
```

#### Learning Rate Reduction
```python
lr_scheduler = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,
    min_lr=1e-7,
    verbose=1
)
```

## 📈 Model Evaluation

### Step 1: Evaluate Trained Model

```bash
cd model/scripts
python mobilenet_evaluate.py --crop cassava
```

### Step 2: Analyze Results

The evaluation generates:

#### 1. **Accuracy Metrics**
```
Validation Accuracy: 0.8264
Validation Loss: 0.6196
```

#### 2. **Classification Report**
```
                    precision    recall  f1-score   support
bacterial_blight       0.61      0.67      0.64        93
brown_streak_disease   0.86      0.75      0.80       288
green_mottle           0.83      0.65      0.73       154
healthy                0.62      0.86      0.72        63
mosaic_disease         0.88      0.95      0.91       531
```

#### 3. **Confusion Matrix**
Visual representation showing prediction accuracy for each class.

### Step 3: Interpret Results

#### Good Model Indicators
- **High overall accuracy** (>80% for most crops)
- **Balanced precision and recall** across classes
- **Low confusion** between healthy and diseased classes
- **Consistent performance** across different disease types

#### Model Improvement Strategies

**If accuracy is low (<70%):**
- Increase dataset size
- Improve data quality
- Try different augmentation strategies
- Increase training epochs
- Adjust learning rate

**If overfitting (train acc >> val acc):**
- Add more dropout layers
- Increase data augmentation
- Reduce model complexity
- Add regularization

**If underfitting (both accuracies low):**
- Increase model complexity
- Reduce regularization
- Increase learning rate
- Train for more epochs

## 🔧 Using Custom Models

### Step 1: Model Integration

After training, integrate your model into the API:

1. **Copy Model File**:
```bash
cp models/cassava/cassava_best_model.h5 api/models/cassava/
```

2. **Update API Configuration** (if class names changed):
```python
# In api/main.py
class_names = {
    'cassava': [
        'your_custom_class_1',
        'your_custom_class_2',
        'healthy'
    ]
}
```

### Step 2: Test Custom Model

```bash
cd model/api
python test_api.py
```

### Step 3: Model Optimization

#### Convert to TensorFlow Lite (Optional)
```python
# Convert model for mobile deployment
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Save TFLite model
with open(f"models/{crop_type}/{crop_type}_model.tflite", "wb") as f:
    f.write(tflite_model)
```

#### Model Quantization
```python
# Post-training quantization
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]
quantized_model = converter.convert()
```

## 🛠️ Troubleshooting

### Common Training Issues

#### 1. **Out of Memory (OOM) Errors**
```
ResourceExhaustedError: OOM when allocating tensor
```

**Solutions:**
```python
# Reduce batch size
batch_size = 16  # or even 8

# Use gradient accumulation
@tf.function
def train_step_with_accumulation(images, labels, accumulate_grad_steps=4):
    gradients = []
    for i in range(accumulate_grad_steps):
        with tf.GradientTape() as tape:
            predictions = model(images[i], training=True)
            loss = loss_fn(labels[i], predictions) / accumulate_grad_steps
        gradients.append(tape.gradient(loss, model.trainable_variables))
    
    # Average gradients and apply
    avg_gradients = [tf.reduce_mean(grad, axis=0) for grad in zip(*gradients)]
    optimizer.apply_gradients(zip(avg_gradients, model.trainable_variables))
```

#### 2. **Slow Training**
```
Training taking too long...
```

**Solutions:**
- Use GPU if available
- Reduce image size temporarily
- Use mixed precision training
- Reduce dataset size for initial testing

#### 3. **Poor Convergence**
```
Loss not decreasing or accuracy stuck
```

**Solutions:**
```python
# Try different optimizers
optimizer = tf.keras.optimizers.RMSprop(learning_rate=1e-4)
# or
optimizer = tf.keras.optimizers.SGD(learning_rate=1e-3, momentum=0.9)

# Adjust learning rate
initial_learning_rate = 1e-5  # Start smaller
# or
initial_learning_rate = 1e-3   # Start larger
```

#### 4. **Class Imbalance**
```
Some classes performing much worse than others
```

**Solutions:**
```python
# Calculate class weights
from sklearn.utils.class_weight import compute_class_weight

class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(train_labels),
    y=train_labels
)

# Use in training
model.fit(
    train_data,
    class_weight=dict(enumerate(class_weights)),
    # ... other parameters
)
```

### Performance Optimization

#### GPU Setup
```bash
# Check GPU availability
python -c "import tensorflow as tf; print('GPU Available:', tf.config.list_physical_devices('GPU'))"

# Enable memory growth (prevents OOM)
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    tf.config.experimental.set_memory_growth(gpus[0], True)
```

#### Mixed Precision Training
```python
# Enable mixed precision for faster training
policy = tf.keras.mixed_precision.Policy('mixed_float16')
tf.keras.mixed_precision.set_global_policy(policy)

# Compile model with loss scaling
optimizer = tf.keras.optimizers.Adam(learning_rate=1e-4)
optimizer = tf.keras.mixed_precision.LossScaleOptimizer(optimizer)
```

## 📚 Additional Resources

### Model Architecture Alternatives

#### EfficientNet (Better Accuracy)
```python
base_model = tf.keras.applications.EfficientNetB0(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)
```

#### ResNet50 (More Parameters)
```python
base_model = tf.keras.applications.ResNet50(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)
```

### Custom Loss Functions

#### Focal Loss (for imbalanced data)
```python
def focal_loss(gamma=2., alpha=0.25):
    def focal_loss_fixed(y_true, y_pred):
        epsilon = tf.keras.backend.epsilon()
        y_pred = tf.clip_by_value(y_pred, epsilon, 1. - epsilon)
        p_t = tf.where(tf.equal(y_true, 1), y_pred, 1 - y_pred)
        alpha_factor = tf.ones_like(y_true) * alpha
        alpha_t = tf.where(tf.equal(y_true, 1), alpha_factor, 1 - alpha_factor)
        cross_entropy = -tf.log(p_t)
        weight = alpha_t * tf.pow((1 - p_t), gamma)
        loss = weight * cross_entropy
        return tf.reduce_mean(loss)
    return focal_loss_fixed
```

## 🎯 Next Steps

After successful training:

1. **Deploy your models** to the API server
2. **Test thoroughly** with real-world images
3. **Monitor performance** in production
4. **Collect feedback** and iterate on the model
5. **Consider ensemble methods** for improved accuracy

### Continuous Improvement

1. **Data Collection**: Continuously collect new images
2. **Model Retraining**: Retrain periodically with new data
3. **A/B Testing**: Compare model versions in production
4. **Performance Monitoring**: Track prediction accuracy over time

---

**Happy Training! 🚀🤖**

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check the training logs for detailed error messages.
