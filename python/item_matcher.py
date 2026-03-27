"""
CampusTrace – Intelligent Item Matching Module
===============================================
Compares lost items against found items using multi-factor similarity
scoring to suggest possible matches automatically.

Matching factors and weights:
  Category    → 30%  (exact or group match)
  Description → 25%  (fuzzy text similarity)
  Location    → 25%  (exact or partial match)
  Date        → 20%  (proximity scoring)

Concepts demonstrated:
  - Algorithm design (weighted scoring)
  - Dictionary and list data structures
  - Conditional logic with thresholds
  - Modular function design
"""

from utils import normalise_text, fuzzy_text_similarity, date_proximity_score, format_match_result

# ─── Category Groups ─────────────────────────────────────────────────────────
# Items in the same group get partial credit even if categories differ

CATEGORY_GROUPS = {
    "Electronics": {"Electronics", "Charger", "Headphones", "Phone", "Laptop"},
    "Books":       {"Books", "Stationery"},
    "Accessories": {"Accessories", "Keys", "ID Cards"},
    "Bags":        {"Bags"},
    "Clothing":    {"Clothing"},
    "Water Bottles": {"Water Bottles"},
}

# Scoring weights (must sum to 1.0)
WEIGHTS = {
    "category":    0.30,
    "description": 0.25,
    "location":    0.25,
    "date":        0.20,
}

# Minimum overall score (%) to qualify as a possible match
MATCH_THRESHOLD = 30


# ─── Similarity Functions ────────────────────────────────────────────────────

def category_similarity(cat_a: str, cat_b: str) -> float:
    """
    Compare two item categories.

    Returns:
        1.0 if exact match, 0.6 if in the same group, 0.0 otherwise

    Example:
        >>> category_similarity("Electronics", "Charger")
        0.6
        >>> category_similarity("Bags", "Bags")
        1.0
    """
    if normalise_text(cat_a) == normalise_text(cat_b):
        return 1.0

    for group_members in CATEGORY_GROUPS.values():
        if cat_a in group_members and cat_b in group_members:
            return 0.6

    return 0.0


def location_similarity(loc_a: str, loc_b: str) -> float:
    """
    Compare two location strings.

    Exact match scores 1.0; partial overlap is scaled by 0.7.

    Args:
        loc_a: First location name (e.g. 'AB1 Room 101')
        loc_b: Second location name (e.g. 'AB1')

    Returns:
        Float between 0.0 and 1.0
    """
    na, nb = normalise_text(loc_a), normalise_text(loc_b)
    if na == nb:
        return 1.0
    return fuzzy_text_similarity(loc_a, loc_b) * 0.7


# ─── Core Matching Logic ─────────────────────────────────────────────────────

def compute_match_score(source: dict, candidate: dict) -> dict:
    """
    Calculate weighted similarity between a source item and a candidate.

    Args:
        source: The item being searched for (e.g. a lost item)
        candidate: A potential match (e.g. a found item)

    Returns:
        Dictionary with the candidate data plus:
          - similarity_score (int): overall match percentage 0-100
          - breakdown (dict): per-factor scores
    """
    # Calculate individual factor scores (each 0.0 – 1.0)
    cat_score  = category_similarity(
        source.get("category", ""), candidate.get("category", "")
    )
    desc_score = fuzzy_text_similarity(
        source.get("description", ""), candidate.get("description", "")
    )
    loc_score  = location_similarity(
        source.get("location_name", ""), candidate.get("location_name", "")
    )
    date_score = date_proximity_score(
        source.get("date", ""), candidate.get("date", "")
    )

    # Weighted total
    total = (
        cat_score  * WEIGHTS["category"]
        + desc_score * WEIGHTS["description"]
        + loc_score  * WEIGHTS["location"]
        + date_score * WEIGHTS["date"]
    )

    breakdown = {
        "category":    round(cat_score * 100),
        "description": round(desc_score * 100),
        "location":    round(loc_score * 100),
        "date":        round(date_score * 100),
    }

    return format_match_result(candidate, round(total * 100), breakdown)


def find_matches(source: dict, candidates: list, threshold: int = MATCH_THRESHOLD, max_results: int = 5) -> list:
    """
    Find and rank possible matches for a given item.

    Args:
        source: The item to match against (dict with category, description, etc.)
        candidates: List of candidate item dicts to compare
        threshold: Minimum similarity score (%) to include
        max_results: Maximum number of matches to return

    Returns:
        List of match result dicts, sorted by similarity_score descending
    """
    results = [compute_match_score(source, c) for c in candidates]

    # Filter by threshold and sort descending
    results = [r for r in results if r["similarity_score"] >= threshold]
    results.sort(key=lambda r: r["similarity_score"], reverse=True)

    return results[:max_results]
