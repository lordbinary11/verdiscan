import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator # type: ignore
from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint # type: ignore
import argparse

# Argument parser to select crop type
parser = argparse.ArgumentParser()
parser.add_argument("--crop", type=str, required=True, choices=["cassava", "maize", "tomato"], help="Crop type for fine-tuning")
args = parser.parse_args()

data_dir = f"data/{args.crop}"
num_classes = {"cassava": 5, "maize": 4, "tomato": 10}[args.crop]

# Improved data augmentation
datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=30,
    width_shift_range=0.3,
    height_shift_range=0.3,
    brightness_range=[0.7, 1.3],
    zoom_range=0.2,
    horizontal_flip=True,
    vertical_flip=True,
    validation_split=0.2
)

# Load datasets
train_data = datagen.flow_from_directory(
    data_dir, target_size=(224, 224), batch_size=64, class_mode='categorical', subset='training')
val_data = datagen.flow_from_directory(
    data_dir, target_size=(224, 224), batch_size=64, class_mode='categorical', subset='validation')

# Load pre-trained MobileNetV2 model
base_model = tf.keras.applications.MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')

# Freeze first 100 layers
for layer in base_model.layers[:100]:
    layer.trainable = False

# Unfreeze the rest
for layer in base_model.layers[100:]:
    layer.trainable = True

# Build the fine-tuned model
model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

# Compile the model
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Learning rate scheduler
lr_scheduler = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, verbose=1)

# Model checkpointing
checkpoint = ModelCheckpoint(f"models/{args.crop}/{args.crop}_best_model.h5", save_best_only=True, monitor="val_accuracy", mode="max")

# Train the model
history = model.fit(
    train_data,
    epochs=50,
    validation_data=val_data,
    callbacks=[lr_scheduler, checkpoint]
)

# Save final model
model.save(f"models/{args.crop}/{args.crop}_fine_tuned.h5")
print("✅ Fine-tuning complete! Best model saved.")