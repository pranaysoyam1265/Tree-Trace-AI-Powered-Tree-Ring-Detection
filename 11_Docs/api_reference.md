# API Reference

## FastAPI Backend Endpoints

### Health Check
```
GET /health
```

Returns server status.

**Response**:
```json
{
  "status": "healthy"
}
```

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

File: image.jpg
```

**Response**:
```json
{
  "image_id": "uuid",
  "status": "uploaded"
}
```

### Analyze Image
```
POST /api/analyze/{image_id}
```

**Response**:
```json
{
  "image_id": "uuid",
  "rings_detected": 42,
  "anomalies": [
    {
      "type": "missing_ring",
      "location": [128, 256],
      "confidence": 0.95
    }
  ],
  "visualization_url": "/outputs/predictions/{image_id}.png"
}
```

### Get Results
```
GET /api/results/{image_id}
```

Returns analysis results and visualization.

### List Images
```
GET /api/images
```

Returns paginated list of analyzed images.

---

## Streamlit App Pages

1. **Upload** (1_📤_Upload.py) - Upload tree ring images
2. **Analyze** (2_🔍_Analyze.py) - Run analysis on selected images
3. **Results** (3_📊_Results.py) - View analysis results
4. **Ring Browser** (4_🌲_Ring_Browser.py) - Interactive ring explorer
5. **Settings** (5_⚙️_Settings.py) - Configure analysis parameters
