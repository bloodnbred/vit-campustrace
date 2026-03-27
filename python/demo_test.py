"""
CampusTrace – Demo Test Script
===============================
Run this script to demonstrate the Python AI logic directly from
the terminal, without needing the React frontend or Flask server.

Usage:
    cd python
    python demo_test.py

Demonstrates:
  - Item matching with sample data
  - Similarity score calculation
  - Category grouping logic
  - Date proximity scoring

Concepts shown:
  - Python dictionaries and lists
  - Function calls and return values
  - Formatted terminal output
  - Conditional logic
"""

from item_matcher import find_matches, category_similarity, location_similarity, MATCH_THRESHOLD
from utils import fuzzy_text_similarity, date_proximity_score


def print_header(title: str):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def demo_similarity_functions():
    """Show individual similarity functions in action."""
    print_header("1. Individual Similarity Functions")

    # Category similarity
    print("\n  Category Similarity:")
    pairs = [
        ("Electronics", "Electronics"),
        ("Electronics", "Charger"),
        ("Books", "Clothing"),
    ]
    for a, b in pairs:
        score = category_similarity(a, b)
        print(f"    '{a}' vs '{b}' → {score:.1f}")

    # Text similarity
    print("\n  Description Similarity:")
    text_pairs = [
        ("Black Samsung phone with cracked screen", "Samsung mobile black color"),
        ("Blue water bottle with stickers", "Blue Hydro Flask bottle"),
        ("Red backpack", "Calculator Casio"),
    ]
    for a, b in text_pairs:
        score = fuzzy_text_similarity(a, b)
        print(f"    '{a}'\n    '{b}' → {score:.2f}")

    # Location similarity
    print("\n  Location Similarity:")
    loc_pairs = [
        ("AB1 Room 101", "AB1 Room 101"),
        ("AB1 Room 101", "AB1"),
        ("AB1", "AB2"),
    ]
    for a, b in loc_pairs:
        score = location_similarity(a, b)
        print(f"    '{a}' vs '{b}' → {score:.2f}")

    # Date proximity
    print("\n  Date Proximity:")
    date_pairs = [
        ("2025-01-15", "2025-01-15"),
        ("2025-01-15", "2025-01-16"),
        ("2025-01-15", "2025-01-20"),
        ("2025-01-15", "2025-02-01"),
    ]
    for a, b in date_pairs:
        score = date_proximity_score(a, b)
        print(f"    {a} vs {b} → {score:.1f}")


def demo_item_matching():
    """Demonstrate full item matching with sample campus data."""
    print_header("2. Full Item Matching Demo")

    # A student lost their phone
    lost_item = {
        "id": "lost-001",
        "title": "Lost Samsung Phone",
        "category": "Electronics",
        "description": "Black Samsung Galaxy phone with a cracked screen protector",
        "location_name": "AB1 Room 101",
        "date": "2025-01-15",
    }

    # Items that have been found on campus
    found_items = [
        {
            "id": "found-001",
            "title": "Samsung Phone Found",
            "category": "Electronics",
            "description": "Samsung mobile phone, black colour, found on desk",
            "location_name": "AB1 Room 103",
            "date": "2025-01-15",
        },
        {
            "id": "found-002",
            "title": "iPhone Found",
            "category": "Electronics",
            "description": "White iPhone with blue case",
            "location_name": "Library 2nd Floor",
            "date": "2025-01-16",
        },
        {
            "id": "found-003",
            "title": "Water Bottle",
            "category": "Water Bottles",
            "description": "Blue Hydro Flask water bottle",
            "location_name": "AB1 Cafeteria",
            "date": "2025-01-15",
        },
        {
            "id": "found-004",
            "title": "Black Phone",
            "category": "Electronics",
            "description": "Black phone found near AB1 entrance",
            "location_name": "AB1",
            "date": "2025-01-14",
        },
        {
            "id": "found-005",
            "title": "Textbook",
            "category": "Books",
            "description": "Engineering Mathematics textbook",
            "location_name": "AB2 Room 205",
            "date": "2025-01-10",
        },
    ]

    print(f"\n  Lost Item: {lost_item['title']}")
    print(f"  Category:  {lost_item['category']}")
    print(f"  Location:  {lost_item['location_name']}")
    print(f"  Date:      {lost_item['date']}")
    print(f"  Description: {lost_item['description']}")
    print(f"\n  Searching among {len(found_items)} found items...")
    print(f"  Match threshold: {MATCH_THRESHOLD}%\n")

    matches = find_matches(lost_item, found_items)

    if matches:
        print(f"  ✅ Found {len(matches)} possible match(es):\n")
        for i, match in enumerate(matches, 1):
            print(f"  Match #{i}: {match.get('title', 'Unknown')}")
            print(f"    Overall Score : {match['similarity_score']}%")
            print(f"    Category      : {match['breakdown']['category']}%")
            print(f"    Description   : {match['breakdown']['description']}%")
            print(f"    Location      : {match['breakdown']['location']}%")
            print(f"    Date          : {match['breakdown']['date']}%")
            print()
    else:
        print("  ❌ No matches found above threshold.")


def demo_edge_cases():
    """Show how the system handles edge cases."""
    print_header("3. Edge Cases")

    # Empty candidate list
    result = find_matches({"category": "Books"}, [])
    print(f"\n  Empty candidates list → {len(result)} matches")

    # Missing fields
    result = find_matches(
        {"category": "Electronics"},
        [{"id": "x", "category": "Electronics"}],
    )
    print(f"  Missing fields (desc, loc, date) → score: {result[0]['similarity_score']}%")

    # No match above threshold
    result = find_matches(
        {"category": "Books", "description": "Math textbook", "location_name": "Library", "date": "2025-01-01"},
        [{"id": "y", "category": "Clothing", "description": "Red jacket", "location_name": "Gym", "date": "2025-06-01"}],
    )
    print(f"  Completely different items → {len(result)} matches (filtered out)")


# ─── Main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n🔬 CampusTrace – Python AI Demo")
    print("   Running without frontend or server\n")

    demo_similarity_functions()
    demo_item_matching()
    demo_edge_cases()

    print_header("Demo Complete")
    print("  All Python AI functions demonstrated successfully! ✅\n")
