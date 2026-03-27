"""
CampusTrace – Image Classification Module
==========================================
Classifies uploaded images of lost/found items into campus-relevant
categories using a pre-trained MobileNetV2 deep learning model.

When TensorFlow is not available (e.g. lightweight demo environments),
a heuristic fallback based on image properties is used instead.

Concepts demonstrated:
  - Object-oriented programming (class with methods)
  - External library usage (TensorFlow, Pillow, NumPy)
  - Dictionary-based label mapping
  - Graceful error handling / fallback logic
"""

import numpy as np
from utils import preprocess_image_array, extract_dominant_colors

# ─── Configuration ───────────────────────────────────────────────────────────

CAMPUS_CATEGORIES = [
    "Electronics",      # phones, laptops, chargers, headphones
    "Books",            # notebooks, textbooks
    "Clothing",         # jackets, scarves, hats
    "Accessories",      # watches, sunglasses, wallets
    "ID Cards",         # student IDs, library cards
    "Keys",             # keychains, key sets
    "Bags",             # backpacks, purses, pouches
    "Stationery",       # pens, pencils, calculators
    "Water Bottles",    # bottles, tumblers, flasks
    "Other",            # anything else
]

# Mapping from ImageNet class names → campus categories
IMAGENET_TO_CAMPUS = {
    # Electronics
    "cellular_telephone": "Electronics",
    "iPod": "Electronics",
    "laptop": "Electronics",
    "notebook": "Electronics",
    "mouse": "Electronics",
    "monitor": "Electronics",
    "screen": "Electronics",
    "television": "Electronics",
    "remote_control": "Electronics",
    "headphone": "Electronics",
    "notebook_computer": "Electronics",
    # Books
    "book_jacket": "Books",
    "comic_book": "Books",
    # Clothing
    "jersey": "Clothing",
    "sweatshirt": "Clothing",
    "suit": "Clothing",
    "jean": "Clothing",
    "sock": "Clothing",
    "running_shoe": "Clothing",
    "sandal": "Clothing",
    # Accessories
    "digital_watch": "Accessories",
    "analog_clock": "Accessories",
    "wallet": "Accessories",
    "sunglasses": "Accessories",
    "sunglass": "Accessories",
    "necklace": "Accessories",
    # Keys
    "key": "Keys",
    # Bags
    "backpack": "Bags",
    "purse": "Bags",
    "mailbag": "Bags",
    "plastic_bag": "Bags",
    # Stationery
    "ballpoint": "Stationery",
    "fountain_pen": "Stationery",
    "pencil_box": "Stationery",
    "ruler": "Stationery",
    # Water Bottles
    "water_bottle": "Water Bottles",
    "pop_bottle": "Water Bottles",
    "beer_bottle": "Water Bottles",
    "wine_bottle": "Water Bottles",
    "water_jug": "Water Bottles",
}


# ─── Classifier Class ───────────────────────────────────────────────────────

class ItemClassifier:
    """
    Classifies images of lost/found items into campus categories.

    Uses MobileNetV2 (ImageNet) when TensorFlow is available,
    otherwise falls back to simple image heuristics.
    """

    def __init__(self):
        """Load the MobileNetV2 model, or set fallback mode."""
        print("[CampusTrace] Loading MobileNetV2 model...")
        try:
            from tensorflow.keras.applications import MobileNetV2
            from tensorflow.keras.applications.mobilenet_v2 import (
                preprocess_input, decode_predictions,
            )
            self.model = MobileNetV2(weights="imagenet")
            self.preprocess_input = preprocess_input
            self.decode_predictions = decode_predictions
            print("[CampusTrace] ✅ Model loaded successfully!")
        except ImportError:
            print("[CampusTrace] ⚠️  TensorFlow not available – using fallback.")
            self.model = None

    def classify(self, image_path: str) -> dict:
        """
        Classify an item image and return the predicted campus category.

        Args:
            image_path: Path to the image file

        Returns:
            dict with keys:
              - category (str): predicted campus category
              - confidence (float): 0-1 confidence score
              - imagenet_label (str): raw model label
              - top_predictions (list): top-5 predictions with mappings
        """
        if self.model is None:
            return self._fallback_classify(image_path)

        # Preprocess image for MobileNetV2 (224×224 RGB)
        img_array = preprocess_image_array(image_path, (224, 224))
        img_array = self.preprocess_input(img_array)

        # Run inference
        predictions = self.model.predict(img_array, verbose=0)
        decoded = self.decode_predictions(predictions, top=5)[0]

        # Map the best matching ImageNet label to a campus category
        campus_category = "Other"
        top_label = decoded[0][1]
        top_confidence = float(decoded[0][2])

        for _, label_name, confidence in decoded:
            mapped = IMAGENET_TO_CAMPUS.get(label_name)
            if mapped:
                campus_category = mapped
                top_confidence = float(confidence)
                top_label = label_name
                break

        return {
            "category": campus_category,
            "confidence": round(top_confidence, 4),
            "imagenet_label": top_label,
            "top_predictions": [
                {
                    "label": label,
                    "confidence": round(float(conf), 4),
                    "campus_category": IMAGENET_TO_CAMPUS.get(label, "Other"),
                }
                for _, label, conf in decoded
            ],
        }

    def _fallback_classify(self, image_path: str) -> dict:
        """
        Fallback classification when TensorFlow is unavailable.
        Uses basic image properties (aspect ratio, dominant colours).

        Args:
            image_path: Path to the image file

        Returns:
            dict with predicted category and metadata
        """
        from PIL import Image

        img = Image.open(image_path)
        width, height = img.size
        aspect_ratio = width / height

        # Extract average colour from the image
        colors = extract_dominant_colors(image_path, num_colors=1)
        avg_r, avg_g, avg_b = colors[0]

        # Simple heuristic rules for demo
        if aspect_ratio > 1.5:
            category = "Electronics"      # landscape → phone/laptop
        elif avg_b > 150 and avg_r < 100:
            category = "Water Bottles"    # blue-ish
        elif avg_r > 180 and avg_g < 80:
            category = "Clothing"         # red-ish
        else:
            category = "Other"

        return {
            "category": category,
            "confidence": 0.45,
            "imagenet_label": "fallback_heuristic",
            "top_predictions": [],
            "note": "Using fallback heuristics (TensorFlow not available)",
        }
