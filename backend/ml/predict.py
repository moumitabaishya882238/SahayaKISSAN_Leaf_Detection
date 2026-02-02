import json
import os
import sys

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np
from PIL import Image, UnidentifiedImageError
import tensorflow as tf
from tensorflow.keras.models import load_model


def load_class_names(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def preprocess_image(image, target_size):
    image = image.resize(target_size)
    array = np.array(image).astype("float32") / 255.0
    array = np.expand_dims(array, axis=0)
    return array


def normalize_class_names(class_names):
    if isinstance(class_names, dict):
        try:
            return [class_names[str(i)] for i in range(len(class_names))]
        except KeyError:
            return [class_names[key] for key in sorted(class_names.keys())]
    return class_names


def validate_image(image_path):
    try:
        with Image.open(image_path) as img:
            img.verify()
        with Image.open(image_path) as img:
            return img.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError):
        return None


def main():
    if len(sys.argv) < 4:
        print("Usage: predict.py <image_path> <model_path> <class_names_path>", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    model_path = sys.argv[2]
    class_path = sys.argv[3]

    if not os.path.exists(image_path):
        print("Image file not found", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(model_path):
        print("Model file not found", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(class_path):
        print("Class names file not found", file=sys.stderr)
        sys.exit(1)

    try:
        model = load_model(model_path)
        input_shape = model.input_shape
        height = input_shape[1] or 224
        width = input_shape[2] or 224

        class_names = normalize_class_names(load_class_names(class_path))
        image = validate_image(image_path)
        if image is None:
            print("Please enter a valid tea leaf image")
            sys.exit(1)

        image_tensor = preprocess_image(image, (width, height))
        raw_output = model.predict(image_tensor, verbose=0)[0]
        if (
            np.all(raw_output >= 0.0)
            and np.all(raw_output <= 1.0)
            and np.isclose(np.sum(raw_output), 1.0, atol=1e-3)
        ):
            probabilities = raw_output
        else:
            probabilities = tf.nn.softmax(raw_output).numpy()

        top_index = int(np.argmax(probabilities))
        confidence = float(probabilities[top_index])
        label = class_names[top_index] if top_index < len(class_names) else "Unknown"

        MIN_CONFIDENCE = float(os.getenv("MIN_CONFIDENCE", "0.70"))
        if confidence < MIN_CONFIDENCE or label == "Unknown":
            print("Please enter a valid tea leaf image")
            sys.exit(1)

        print(label)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
