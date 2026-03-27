# CampusTrace – Python AI Services

AI-powered image classification and intelligent match detection for the CampusTrace Lost & Found system.

## Setup

```bash
cd python
pip install -r requirements.txt
```

## Service 1: Image Classifier

### Classify a single image
```bash
python classify_item.py path/to/image.jpg
```

### Run as API server
```bash
python classify_item.py serve 5000
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classify` | Classify an uploaded image |
| GET | `/api/health` | Health check |
| GET | `/api/categories` | List all categories |

## Service 2: Match Detection

Finds possible matches between lost and found items using multi-factor similarity scoring.

### Run the match service
```bash
python match_items.py
```
Runs on `http://localhost:5001`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/match` | Find matches for an item |
| GET | `/health` | Health check |

### Matching Factors
| Factor | Weight | Method |
|--------|--------|--------|
| Category | 30% | Exact + group matching |
| Description | 25% | SequenceMatcher fuzzy text |
| Location | 25% | Exact + fuzzy overlap |
| Date | 20% | Proximity scoring |

### Example API Call
```bash
curl -X POST http://localhost:5001/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "item": {"category":"Electronics","description":"Black Samsung phone","location_name":"AB1 Room 101","date":"2025-01-15"},
    "candidates": [{"id":"1","category":"Electronics","description":"Samsung mobile black color","location_name":"AB1","date":"2025-01-15"}]
  }'
```

## Architecture
- **Classifier**: MobileNetV2 (ImageNet) → campus categories; production uses Gemini Vision AI
- **Matcher**: Multi-factor similarity with weighted scoring; production uses Supabase Edge Function
