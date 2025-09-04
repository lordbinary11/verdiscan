import argparse
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix     # type: ignore
import seaborn as sns    # type: ignore
from tensorflow.keras.preprocessing.image import ImageDataGenerator         # type: ignore

# Argument parser to choose the crop type
parser = argparse.ArgumentParser(description="Evaluate MobileNetV2 model.")
parser.add_argument("--crop", type=str, required=True, choices=["cassava", "maize", "tomato"], help="Crop type to evaluate.")
args = parser.parse_args()

# Define dataset directory and number of classes
data_dir = f"data/{args.crop}"
img_size = (224, 224)
batch_size = 32

# Load validation data
datagen = ImageDataGenerator(rescale=1.0/255, validation_split=0.2)

val_data = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset="validation",
    shuffle=False
)

# Load trained model
model_path = f"models/{args.crop}/{args.crop}_best_model.h5"
print(f"📥 Loading model from {model_path}...")
model = tf.keras.models.load_model(model_path)

# Evaluate model
print(f"🔍 Evaluating MobileNetV2 model for {args.crop}...")
eval_results = model.evaluate(val_data)
val_loss, val_acc = eval_results[0], eval_results[1]

print(f"📊 Validation Accuracy: {val_acc:.4f}")
print(f"📉 Validation Loss: {val_loss:.4f}")

# Save evaluation results
with open(f"models/{args.crop}/{args.crop}_evaluation.txt", "w") as f:
    f.write(f"Validation Accuracy: {val_acc:.4f}\n")
    f.write(f"Validation Loss: {val_loss:.4f}\n")

# Generate Confusion Matrix
y_true = val_data.classes
y_pred = np.argmax(model.predict(val_data), axis=1)

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=val_data.class_indices.keys(), yticklabels=val_data.class_indices.keys())
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title(f"Confusion Matrix for {args.crop}")
plt.savefig(f"models/{args.crop}/{args.crop}_confusion_matrix.png")
plt.show()

# Classification Report
report = classification_report(y_true, y_pred, target_names=val_data.class_indices.keys())
print(report)
with open(f"models/{args.crop}/{args.crop}_classification_report.txt", "w") as f:
    f.write(report)

print("✅ Evaluation complete! Results and confusion matrix saved.")

