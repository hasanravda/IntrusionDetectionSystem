# NIDS FastAPI Backend Documentation

## Overview
This is the FastAPI backend for the Network Intrusion Detection System (NIDS). It provides RESTful API endpoints for detecting network intrusions using machine learning models.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements-api.txt
```

### 2. Start the Server
```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API
- **API Base URL**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### General Endpoints

#### 1. Root
```
GET /
```
Returns basic API information.

**Response:**
```json
{
  "message": "Network Intrusion Detection System API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

#### 2. Health Check
```
GET /health
```
Check if the API is running and model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-30T12:00:00",
  "model_loaded": true
}
```

### Model Endpoints

#### 3. Model Information
```
GET /model/info
```
Get information about the loaded ML model.

**Response:**
```json
{
  "model_loaded": true,
  "model_path": "model/nids_xgb_multiclass.pkl",
  "encoder_path": "model/attack_label_encoder.pkl",
  "expected_features": ["FLOW_START_MILLISECONDS", "..."],
  "feature_count": 18
}
```

#### 4. Reload Model
```
POST /model/reload
```
Reload the ML model from disk.

**Response:**
```json
{
  "status": "success",
  "message": "Model reloaded successfully"
}
```

#### 5. Get Attack Labels
```
GET /labels
```
Get all possible attack types that the model can predict.

**Response:**
```json
{
  "total_labels": 15,
  "labels": ["Benign", "DDoS", "DoS", "PortScan", "...]
}
```

### Prediction Endpoints

#### 6. Predict from JSON
```
POST /predict
```
Predict attack types for network flows sent as JSON.

**Request Body:**
```json
{
  "flows": [
    {
      "bidirectional_first_seen_ms": 1609459200000,
      "bidirectional_last_seen_ms": 1609459201000,
      "bidirectional_duration_ms": 1000,
      "src_port": 443,
      "dst_port": 12345,
      "protocol": 6,
      "src2dst_packets": 10,
      "dst2src_packets": 8,
      "src2dst_bytes": 5000,
      "dst2src_bytes": 3000,
      "src2dst_min_piat_ms": 10,
      "src2dst_max_piat_ms": 100,
      "src2dst_mean_piat_ms": 50,
      "src2dst_stddev_piat_ms": 20,
      "dst2src_min_piat_ms": 15,
      "dst2src_max_piat_ms": 90,
      "dst2src_mean_piat_ms": 45,
      "dst2src_stddev_piat_ms": 18
    }
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "flow_id": "0",
      "predicted_attack": "Benign",
      "is_attack": false
    }
  ],
  "total_flows": 1,
  "timestamp": "2026-01-30T12:00:00"
}
```

#### 7. Predict from CSV File
```
POST /predict/csv
```
Upload a CSV file with flow features and get predictions.

**Form Data:**
- `file`: CSV file (multipart/form-data)

**Response:**
```json
{
  "status": "success",
  "total_flows": 100,
  "attack_counts": {
    "Benign": 85,
    "DDoS": 10,
    "PortScan": 5
  },
  "output_file": "results/predictions_20260130_120000.csv",
  "download_url": "/download/predictions_20260130_120000.csv",
  "timestamp": "2026-01-30T12:00:00"
}
```

### File Management Endpoints

#### 8. Download Results
```
GET /download/{filename}
```
Download a prediction results file.

**Parameters:**
- `filename`: Name of the file to download

**Response:**
- CSV file download

#### 9. List Results
```
GET /results
```
List all available result files.

**Response:**
```json
{
  "total_files": 5,
  "files": [
    {
      "filename": "predictions_20260130_120000.csv",
      "size_bytes": 15234,
      "created": "2026-01-30T12:00:00",
      "download_url": "/download/predictions_20260130_120000.csv"
    }
  ]
}
```

### Statistics Endpoint

#### 10. Get Statistics
```
GET /stats
```
Get API usage statistics.

**Response:**
```json
{
  "model_loaded": true,
  "total_uploads": 10,
  "total_results": 10,
  "expected_features_count": 18,
  "timestamp": "2026-01-30T12:00:00"
}
```

## Testing the API

### Using the Test Script
```bash
# Make sure the API is running
python api_test.py
```

### Using cURL

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Predict from JSON:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "flows": [{
      "bidirectional_first_seen_ms": 1609459200000,
      "bidirectional_last_seen_ms": 1609459201000,
      "bidirectional_duration_ms": 1000,
      "src_port": 443,
      "dst_port": 12345,
      "protocol": 6,
      "src2dst_packets": 10,
      "dst2src_packets": 8,
      "src2dst_bytes": 5000,
      "dst2src_bytes": 3000,
      "src2dst_min_piat_ms": 10,
      "src2dst_max_piat_ms": 100,
      "src2dst_mean_piat_ms": 50,
      "src2dst_stddev_piat_ms": 20,
      "dst2src_min_piat_ms": 15,
      "dst2src_max_piat_ms": 90,
      "dst2src_mean_piat_ms": 45,
      "dst2src_stddev_piat_ms": 18
    }]
  }'
```

**Upload CSV:**
```bash
curl -X POST http://localhost:8000/predict/csv \
  -F "file=@flow_features.csv"
```

### Using Python Requests
```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())

# Prediction
flow_data = {
    "flows": [{
        "bidirectional_first_seen_ms": 1609459200000,
        # ... other features
    }]
}
response = requests.post("http://localhost:8000/predict", json=flow_data)
print(response.json())

# CSV upload
with open("flow_features.csv", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:8000/predict/csv", files=files)
    print(response.json())
```

## Frontend Integration

### React/JavaScript Example
```javascript
// Health check
fetch('http://localhost:8000/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Prediction
const flowData = {
  flows: [{
    bidirectional_first_seen_ms: 1609459200000,
    // ... other features
  }]
};

fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(flowData)
})
  .then(response => response.json())
  .then(data => console.log(data));

// CSV upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/predict/csv', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:
```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_PATH=model/nids_xgb_multiclass.pkl
ENCODER_PATH=model/attack_label_encoder.pkl
```

### CORS Configuration
By default, CORS is enabled for all origins. For production, modify in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deployment

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements-api.txt .
RUN pip install -r requirements-api.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t nids-api .
docker run -p 8000:8000 nids-api
```

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable (model not loaded)

Example error response:
```json
{
  "detail": "Model not loaded"
}
```

## Performance Tips

1. **Batch Predictions**: Send multiple flows in a single request
2. **CSV Upload**: For large datasets, use CSV upload instead of JSON
3. **Keep-Alive**: Reuse HTTP connections
4. **Caching**: Cache model info and labels endpoints

## Support

For issues or questions:
1. Check the logs in the terminal where the API is running
2. Visit the interactive docs at `/docs` for detailed endpoint information
3. Run the test script to diagnose issues: `python api_test.py`
