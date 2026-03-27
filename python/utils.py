"""
CampusTrace – Utility Functions
================================
Shared helper functions for image preprocessing, text normalization,
and similarity calculations used across the Python modules.

Concepts demonstrated:
  - Python functions with docstrings
  - Regular expressions for text cleaning
  - Date parsing and comparison
  - Reusable utility module pattern
"""

import re
from datetime import datetime
from difflib import SequenceMatcher


# ─── Text Utilities ──────────────────────────────────────────────────────────

def normalise_text(text: str) -> str:
    """
    Normalise a string for comparison: lowercase, remove punctuation.

    Args:
        text: Raw input string (can be None)

    Returns:
        Cleaned lowercase string with only alphanumeric chars and spaces

    Example:
        >>> normalise_text("AB-1, Room 101!")
        'ab1 room 101'
    """
    return re.sub(r"[^a-z0-9 ]", "", (text or "").lower()).strip()


# ─── Similarity Helpers ──────────────────────────────────────────────────────

def fuzzy_text_similarity(a: str, b: str) -> float:
    """
    Calculate fuzzy text similarity using Python's SequenceMatcher.

    Uses difflib.SequenceMatcher which implements the Ratcliff/Obershelp
    pattern-matching algorithm – no external dependencies required.

    Args:
        a: First string to compare
        b: Second string to compare

    Returns:
        Float between 0.0 (no match) and 1.0 (identical)
    """
    return SequenceMatcher(None, normalise_text(a), normalise_text(b)).ratio()


def date_proximity_score(date_str_1: str, date_str_2: str) -> float:
    """
    Score how close two dates are to each other.

    Scoring table:
        Same day   → 1.0
        ±1 day     → 0.8
        ±3 days    → 0.5
        ±7 days    → 0.2
        >7 days    → 0.0

    Args:
        date_str_1: ISO-format date string (e.g. '2025-01-15')
        date_str_2: ISO-format date string

    Returns:
        Float between 0.0 and 1.0
    """
    try:
        dt1 = datetime.fromisoformat(date_str_1[:10])
        dt2 = datetime.fromisoformat(date_str_2[:10])
        diff = abs((dt1 - dt2).days)
    except (ValueError, TypeError):
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


# ─── Image Utilities ─────────────────────────────────────────────────────────

def preprocess_image_array(image_path: str, target_size: tuple = (224, 224)):
    """
    Load an image and convert it to a NumPy array suitable for ML models.

    Uses Pillow (PIL) for image loading – lightweight and portable.

    Args:
        image_path: Path to the image file on disk
        target_size: Tuple of (width, height) to resize to

    Returns:
        numpy.ndarray of shape (1, height, width, 3) with float32 values
    """
    import numpy as np
    from PIL import Image

    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)
    arr = np.array(img, dtype=np.float32)
    # Add batch dimension: (H, W, 3) → (1, H, W, 3)
    return np.expand_dims(arr, axis=0)


def extract_dominant_colors(image_path: str, num_colors: int = 3) -> list:
    """
    Extract dominant RGB colours from an image using simple averaging.

    Splits the image into regions and computes mean colour per region.
    This is a lightweight alternative to k-means clustering.

    Args:
        image_path: Path to the image file
        num_colors: Number of colour regions to extract

    Returns:
        List of [R, G, B] average colour values (0-255)
    """
    import numpy as np
    from PIL import Image

    img = Image.open(image_path).convert("RGB").resize((100, 100))
    pixels = np.array(img)

    # Split image into horizontal bands and get average colour per band
    band_height = pixels.shape[0] // num_colors
    colors = []
    for i in range(num_colors):
        band = pixels[i * band_height : (i + 1) * band_height]
        avg = band.mean(axis=(0, 1)).astype(int).tolist()
        colors.append(avg)

    return colors


# ─── Data Formatting ─────────────────────────────────────────────────────────

def format_match_result(candidate: dict, score: int, breakdown: dict) -> dict:
    """
    Format a match result into a standardised JSON-serialisable dictionary.

    Args:
        candidate: The matched item dictionary
        score: Overall similarity score (0-100)
        breakdown: Per-factor score breakdown

    Returns:
        Dictionary combining candidate data with match metadata
    """
    return {
        **candidate,
        "similarity_score": score,
        "breakdown": breakdown,
    }
