"""
CampusTrace – Python API Server
================================
Flask REST API that exposes two AI services:
  1. Image Classification  (POST /api/classify)
  2. Item Match Detection   (POST /api/match)

Run:
    cd python
    pip install -r requirements.txt
    python app.py

The server starts on http://localhost:5000 with CORS enabled
so the React frontend can call it during development.

Concepts demonstrated:
  - REST API design with Flask
  - JSON request/response handling
  - File upload handling
  - CORS configuration
  - Modular imports from separate Python files
"""

import sys
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS

from image_classifier import ItemClassifier, CAMPUS_CATEGORIES
from item_matcher import find_matches

# ─── App Setup ───────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the React frontend

# Initialise the classifier once at startup
classifier = ItemClassifier()


# ─── Image Classification Endpoints ─────────────────────────────────────────

@app.route("/api/classify", methods=["POST"])
def classify_image():
    """
    POST /api/classify
    Accepts: multipart/form-data with an 'image' file field
    Returns: JSON { category, confidence, imagenet_label, top_predictions }
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save uploaded file temporarily for processing
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = classifier.classify(tmp_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "category": "Other", "confidence": 0}), 500
    finally:
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)


@app.route("/api/categories", methods=["GET"])
def list_categories():
    """
    GET /api/categories
    Returns the list of all supported campus item categories.
    """
    return jsonify({"categories": CAMPUS_CATEGORIES})


# ─── Item Matching Endpoints ────────────────────────────────────────────────

@app.route("/api/match", methods=["POST"])
def match_items():
    """
    POST /api/match
    Body: { "item": {...}, "candidates": [...] }
    Returns: { "matches": [ { ...candidate, similarity_score, breakdown } ] }
    """
    body = request.get_json(force=True)
    source = body.get("item")
    candidates = body.get("candidates", [])

    if not source:
        return jsonify({"error": "item is required"}), 400

    matches = find_matches(source, candidates)
    return jsonify({"matches": matches})


# ─── Health Check ────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint for monitoring."""
    return jsonify({
        "status": "ok",
        "service": "CampusTrace Python AI Services",
        "endpoints": ["/api/classify", "/api/match", "/api/categories"],
    })


# ─── Entry Point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    print(f"\n🚀 CampusTrace Python API running on http://localhost:{port}")
    print(f"   Endpoints: /api/classify, /api/match, /api/categories, /api/health\n")
    app.run(host="0.0.0.0", port=port, debug=True)
