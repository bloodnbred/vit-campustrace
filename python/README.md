# CampusTrace - Python Item Classifier

AI-powered image classification for the CampusTrace Lost & Found system.

## Setup

```bash
cd python
pip install -r requirements.txt
```

## Usage

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

### Example API Call
```bash
curl -X POST http://localhost:5000/api/classify \
  -F "image=@photo.jpg"
```

### Response
```json
{
  "category": "Electronics",
  "confidence": 0.89,
  "imagenet_label": "cellular_telephone",
  "top_predictions": [...]
}
```

## Categories
Electronics, Books, Clothing, Accessories, ID Cards, Keys, Bags, Stationery, Water Bottles, Other

## Architecture
- Uses MobileNetV2 (pre-trained on ImageNet)
- Maps 1000 ImageNet classes → 10 campus categories
- Fallback heuristic mode when TensorFlow unavailable
- Production integration via Supabase Edge Function + Gemini Vision AI
