"""
CampusTrace – Intelligent Item Match Detection Service
======================================================
Python microservice for lab ESE demonstration.

Uses fuzzy text matching (difflib), category matching, location proximity,
and date proximity to find possible matches between lost and found items.

Run:
  pip install -r requirements.txt
  python match_items.py

API endpoint:
  POST /api/match
  Body: { "item": { "title", "description", "category", "location_name", "date" },
          "candidates": [ ... ] }
  Returns: { "matches": [ { ...candidate, "similarity_score": 82, "breakdown": {...} } ] }
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from difflib import SequenceMatcher
from datetime import datetime, timedelta
import re

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Similarity helpers
# ---------------------------------------------------------------------------

CATEGORY_GROUPS = {
    "Electronics": {"Electronics", "Charger", "Headphones", "Phone", "Laptop"},
    "Books": {"Books", "Stationery"},
    "Accessories": {"Accessories", "Keys", "ID Cards"},
    "Bags": {"Bags"},
    "Clothing": {"Clothing"},
    "Water Bottles": {"Water Bottles"},
}


def _normalise(text: str) -> str:
    """Lower-case, strip punctuation."""
    return re.sub(r"[^a-z0-9 ]", "", (text or "").lower()).strip()


def category_similarity(a: str, b: str) -> float:
    """1.0 if exact, 0.6 if in same group, else 0."""
    if _normalise(a) == _normalise(b):
        return 1.0
    for group in CATEGORY_GROUPS.values():
        if a in group and b in group:
            return 0.6
    return 0.0


def text_similarity(a: str, b: str) -> float:
    """SequenceMatcher ratio (0-1)."""
    return SequenceMatcher(None, _normalise(a), _normalise(b)).ratio()


def location_similarity(a: str, b: str) -> float:
    """Exact = 1.0, fuzzy overlap otherwise."""
    na, nb = _normalise(a), _normalise(b)
    if na == nb:
        return 1.0
    return SequenceMatcher(None, na, nb).ratio() * 0.7


def date_similarity(d1: str, d2: str) -> float:
    """Same day = 1.0, ±1 = 0.8, ±3 = 0.5, ±7 = 0.2, else 0."""
    try:
        dt1 = datetime.fromisoformat(d1[:10])
        dt2 = datetime.fromisoformat(d2[:10])
        diff = abs((dt1 - dt2).days)
    except Exception:
        return 0.0
    if diff == 0:
        return 1.0
    if diff <= 1:
        return 0.8
    if diff <= 3:
        return 0.5
    if diff <= 7:
        return 0.2
    return 0.0


# Weights
WEIGHTS = {
    "category": 0.30,
    "description": 0.25,
    "location": 0.25,
    "date": 0.20,
}
THRESHOLD = 30  # minimum % to be a "possible match"


def compute_match(source: dict, candidate: dict) -> dict:
    """Return candidate dict enriched with similarity_score & breakdown."""
    cat = category_similarity(source.get("category", ""), candidate.get("category", ""))
    desc = text_similarity(source.get("description", ""), candidate.get("description", ""))
    loc = location_similarity(source.get("location_name", ""), candidate.get("location_name", ""))
    date = date_similarity(source.get("date", ""), candidate.get("date", ""))

    total = (
        cat * WEIGHTS["category"]
        + desc * WEIGHTS["description"]
        + loc * WEIGHTS["location"]
        + date * WEIGHTS["date"]
    )

    return {
        **candidate,
        "similarity_score": round(total * 100),
        "breakdown": {
            "category": round(cat * 100),
            "description": round(desc * 100),
            "location": round(loc * 100),
            "date": round(date * 100),
        },
    }


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

@app.route("/api/match", methods=["POST"])
def match():
    """Find possible matches for a given item among candidates."""
    body = request.get_json(force=True)
    source = body.get("item")
    candidates = body.get("candidates", [])

    if not source:
        return jsonify({"error": "item is required"}), 400

    results = [compute_match(source, c) for c in candidates]
    results = [r for r in results if r["similarity_score"] >= THRESHOLD]
    results.sort(key=lambda r: r["similarity_score"], reverse=True)

    return jsonify({"matches": results[:5]})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "CampusTrace Match Service"})


if __name__ == "__main__":
    print("🔍 CampusTrace Match Service running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
