# CampusTrace – Python AI Services

AI-powered image classification and intelligent match detection for the CampusTrace Lost & Found system.

## Project Structure

```
python/
├── app.py               # Flask API server (unified entry point)
├── image_classifier.py  # MobileNetV2 image classification module
├── item_matcher.py      # Multi-factor item matching algorithm
├── utils.py             # Shared utility functions
├── demo_test.py         # Standalone demo for lab ESE presentation
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## Quick Start

```bash
cd python
pip install -r requirements.txt

# Run the demo (no server needed)
python demo_test.py

# Or start the API server
python app.py
```

## Module Overview

### `app.py` – API Server
Flask REST API with CORS. Exposes all AI endpoints:

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| POST   | `/api/classify`   | Classify an uploaded image     |
| POST   | `/api/match`      | Find matches for an item       |
| GET    | `/api/categories` | List all campus categories     |
| GET    | `/api/health`     | Health check                   |

### `image_classifier.py` – Image Classification
- Uses MobileNetV2 (ImageNet) to classify item images
- Maps 1000 ImageNet classes → 10 campus categories
- Falls back to colour/aspect-ratio heuristics if TensorFlow unavailable

### `item_matcher.py` – Match Detection
Multi-factor similarity scoring:

| Factor      | Weight | Method                      |
|-------------|--------|-----------------------------|
| Category    | 30%    | Exact + group matching      |
| Description | 25%    | SequenceMatcher fuzzy text  |
| Location    | 25%    | Exact + fuzzy overlap       |
| Date        | 20%    | Proximity scoring           |

### `utils.py` – Shared Utilities
Helper functions: text normalisation, fuzzy similarity, date proximity, image preprocessing, dominant colour extraction.

### `demo_test.py` – Lab ESE Demo
Run `python demo_test.py` to see all Python AI functions in action from the terminal – no server or frontend required.

## Python Concepts Demonstrated

- **Functions & modular programming** – clean separation across files
- **External libraries** – Flask, NumPy, Pillow, TensorFlow
- **REST API development** – Flask routes, JSON responses, CORS
- **File handling** – temporary image upload processing
- **Data structures** – dictionaries, lists, sets
- **Algorithms** – weighted similarity scoring, fuzzy matching
- **OOP** – ItemClassifier class with methods
- **Error handling** – try/except, graceful fallbacks

## Example Match API Call

```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "item": {
      "category": "Electronics",
      "description": "Black Samsung phone",
      "location_name": "AB1 Room 101",
      "date": "2025-01-15"
    },
    "candidates": [{
      "id": "1",
      "category": "Electronics",
      "description": "Samsung mobile black color",
      "location_name": "AB1",
      "date": "2025-01-15"
    }]
  }'
```

## Architecture Note
- **Python services**: For lab ESE demonstration (run locally)
- **Production**: Uses Supabase Edge Functions (`classify-item`, `match-items`) with Gemini AI via Lovable Cloud
