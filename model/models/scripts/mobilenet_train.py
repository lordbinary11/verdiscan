import os
import argparse
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator # type: ignore
from tensorflow.keras.applications import MobileNetV2 # type: ignore
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D # type: ignore
from tensorflow.keras.models import Model # type: ignore
from tensorflow.keras.optimizers import Adam # type: ignore

# Argument parser for selecting the crop type
parser = argparse.ArgumentParser(description="Train MobileNetV2 model for crop disease classification")
parser.add_argument("--crop", type=str, required=True, choices=["cassava", "maize", "tomato"],
                    help="Specify which crop model to train (cassava, maize, tomato)")
args = parser.parse_args()

# Dataset paths and class numbers
data_dir = f"data/{args.crop}"
num_classes = {"cassava": 5, "maize": 4, "tomato": 10}[args.crop]

# Training parameters
img_size = (224, 224)
batch_size = 32
epochs = 15  # Adjust as needed
learning_rate = 0.0001  # Fine-tuned learning rate

# Data Augmentation
datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)

# Load training data
train_data = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset="training"
)

# Load validation data
val_data = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset="validation"
)

# Load MobileNetV2 as base model
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights="imagenet")
base_model.trainable = False  # Freeze base model layers

# Add custom classifier layers
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
x = Dense(num_classes, activation="softmax")(x)

# Compile model
model = Model(inputs=base_model.input, outputs=x)
model.compile(optimizer=Adam(learning_rate), loss="categorical_crossentropy", metrics=["accuracy"])

# Train the model
print(f"🚀 Training MobileNetV2 for {args.crop}...")
history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=epochs
)

# Save trained model
model_save_path = f"models/{args.crop}_mobilenet.h5"
model.save(model_save_path)
print(f"✅ Model saved at {model_save_path}")
