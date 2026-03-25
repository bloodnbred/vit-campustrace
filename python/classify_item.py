"""
CampusTrace - AI-Powered Item Image Classification (Python Component)
=====================================================================
This Python script demonstrates image classification for the CampusTrace
Lost & Found system. It uses a pre-trained MobileNetV2 model to classify
uploaded item images into campus-relevant categories.

Used for: VIT Reimagine College - Lab ESE Presentation
Stack: Python, TensorFlow/Keras, NumPy, Pillow
"""

import sys
import json
import numpy as np
from pathlib import Path

# ─── Configuration ───────────────────────────────────────────────────────────

CAMPUS_CATEGORIES = [
    "Electronics",    # phones, laptops, chargers, headphones
    "Books",          # notebooks, textbooks
    "Clothing",       # jackets, scarves, hats
    "Accessories",    # watches, sunglasses, wallets
    "ID Cards",       # student IDs, library cards
    "Keys",           # keychains, key sets
    "Bags",           # backpacks, purses, pouches
    "Stationery",     # pens, pencils, calculators
    "Water Bottles",  # bottles, tumblers, flasks
    "Other"           # anything else
]

# Mapping from ImageNet class indices to campus categories
# MobileNetV2 outputs 1000 ImageNet classes; we map relevant ones
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
    "power_drill": "Electronics",
    "headphone": "Electronics",  # Not in ImageNet directly but mapped
    # Books
    "book_jacket": "Books",
    "comic_book": "Books",
    "notebook_computer": "Electronics",  # Override: this is electronics
    # Clothing
    "jersey": "Clothing",
    "sweatshirt": "Clothing",
    "suit": "Clothing",
    "jean": "Clothing",
    "sock": "Clothing",
    "running_shoe": "Clothing",
    "sandal": "Clothing",
    "sunglass": "Accessories",
    # Accessories
    "digital_watch": "Accessories",
    "analog_clock": "Accessories",
    "wallet": "Accessories",
    "sunglasses": "Accessories",
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


# ─── Image Classification Engine ────────────────────────────────────────────

class ItemClassifier:
    """
    Classifies images of lost/found items using MobileNetV2.
    Maps ImageNet predictions to campus-relevant categories.
    """

    def __init__(self):
        """Initialize the classifier with MobileNetV2 pre-trained model."""
        print("[CampusTrace] Loading MobileNetV2 model...")
        try:
            from tensorflow.keras.applications import MobileNetV2
            from tensorflow.keras.applications.mobilenet_v2 import (
                preprocess_input, decode_predictions
            )
            self.model = MobileNetV2(weights="imagenet")
            self.preprocess_input = preprocess_input
            self.decode_predictions = decode_predictions
            print("[CampusTrace] Model loaded successfully!")
        except ImportError:
            print("[CampusTrace] TensorFlow not available. Using fallback mode.")
            self.model = None

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Load and preprocess image for MobileNetV2 (224x224 RGB)."""
        from tensorflow.keras.preprocessing import image as keras_image

        img = keras_image.load_img(image_path, target_size=(224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = self.preprocess_input(img_array)
        return img_array

    def classify(self, image_path: str) -> dict:
        """
        Classify an item image and return campus category with confidence.

        Args:
            image_path: Path to the image file

        Returns:
            dict with 'category', 'confidence', 'imagenet_label', 'top_predictions'
        """
        if self.model is None:
            return self._fallback_classify(image_path)

        # Preprocess
        img_array = self.preprocess_image(image_path)

        # Predict
        predictions = self.model.predict(img_array, verbose=0)
        decoded = self.decode_predictions(predictions, top=5)[0]

        # Map top prediction to campus category
        top_label = decoded[0][1]  # e.g., 'cellular_telephone'
        top_confidence = float(decoded[0][2])

        # Find best matching campus category
        campus_category = "Other"
        for label_id, label_name, confidence in decoded:
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
                    "campus_category": IMAGENET_TO_CAMPUS.get(label, "Other")
                }
                for _, label, conf in decoded
            ]
        }

    def _fallback_classify(self, image_path: str) -> dict:
        """Fallback classification using image properties when TF unavailable."""
        from PIL import Image

        img = Image.open(image_path)
        width, height = img.size
        aspect_ratio = width / height

        # Simple heuristic-based classification for demo
        pixels = np.array(img.resize((50, 50)))
        avg_color = pixels.mean(axis=(0, 1))

        # Very basic heuristics for demo purposes
        if aspect_ratio > 1.5:
            category = "Electronics"  # Landscape = likely phone/laptop
        elif avg_color[2] > 150 and avg_color[0] < 100:
            category = "Water Bottles"  # Blue-ish
        else:
            category = "Other"

        return {
            "category": category,
            "confidence": 0.45,
            "imagenet_label": "fallback_mode",
            "top_predictions": [],
            "note": "Using fallback heuristics (TensorFlow not available)"
        }


# ─── API Server (Flask) ─────────────────────────────────────────────────────

def create_app():
    """Create Flask API for image classification."""
    try:
        from flask import Flask, request, jsonify
        from flask_cors import CORS
    except ImportError:
        print("Flask not installed. Run: pip install flask flask-cors")
        sys.exit(1)

    app = Flask(__name__)
    CORS(app)
    classifier = ItemClassifier()

    @app.route("/api/classify", methods=["POST"])
    def classify_image():
        """
        POST /api/classify
        Accepts: multipart/form-data with 'image' file
        Returns: JSON with category and confidence
        """
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        # Save temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        try:
            result = classifier.classify(tmp_path)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e), "category": "Other", "confidence": 0}), 500
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "CampusTrace Item Classifier"})

    @app.route("/api/categories", methods=["GET"])
    def categories():
        return jsonify({"categories": CAMPUS_CATEGORIES})

    return app


# ─── CLI Mode ────────────────────────────────────────────────────────────────

def classify_from_cli(image_path: str):
    """Classify a single image from command line."""
    print(f"\n{'='*60}")
    print(f"  CampusTrace Item Classifier")
    print(f"  Image: {image_path}")
    print(f"{'='*60}\n")

    classifier = ItemClassifier()
    result = classifier.classify(image_path)

    print(f"  Predicted Category : {result['category']}")
    print(f"  Confidence         : {result['confidence']*100:.1f}%")
    print(f"  ImageNet Label     : {result['imagenet_label']}")

    if result.get("top_predictions"):
        print(f"\n  Top 5 Predictions:")
        for i, pred in enumerate(result["top_predictions"], 1):
            print(f"    {i}. {pred['label']:30s} → {pred['campus_category']:15s} ({pred['confidence']*100:.1f}%)")

    print(f"\n{'='*60}")
    print(json.dumps(result, indent=2))
    return result


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        # Run as API server: python classify_item.py serve
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 5000
        app = create_app()
        print(f"\n[CampusTrace] Starting classifier API on port {port}...")
        app.run(host="0.0.0.0", port=port, debug=True)

    elif len(sys.argv) > 1:
        # Classify single image: python classify_item.py image.jpg
        classify_from_cli(sys.argv[1])

    else:
        print("Usage:")
        print("  python classify_item.py <image_path>   - Classify an image")
        print("  python classify_item.py serve [port]    - Start API server")
