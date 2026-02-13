# Network Intrusion Detection System (NIDS)

A machine learning-based Network Intrusion Detection System with a FastAPI backend for real-time threat detection.

## Features

- 🔍 **Real-time Network Traffic Analysis**: Capture and analyze network packets
- 🤖 **ML-Powered Detection**: XGBoost-based multi-class attack classification
- 🚀 **FastAPI Backend**: RESTful API for easy integration
- 📊 **Multiple Attack Types**: Detect DDoS, DoS, Port Scans, and more
-  **CSV Processing**: Batch prediction from CSV files
- 🌐 **Web Integration Ready**: CORS-enabled for frontend integration

## Project Structure

```
IntrusionDetectionSystem/
├── backend/                   # Backend folder with all application files
│   ├── main.py                    # FastAPI backend application
│   ├── nids_inference.py         # Inference script
│   ├── api_test.py               # API testing suite
│   ├── client_example.py         # Python client examples
│   ├── requirements.txt          # Original dependencies
│   ├── requirements-api.txt      # API dependencies
│   ├── API_DOCUMENTATION.md      # Complete API documentation
│   ├── .env.example              # Environment configuration template
│   ├── model/                    # ML models
│   │   ├── nids_xgb_multiclass.pkl
│   │   └── attack_label_encoder.pkl
│   ├── nids/                     # Core NIDS modules
│   │   ├── feature_extraction.py
│   │   └── packet_capture.py
│   ├── demo/                     # Demo scripts
│   │   ├── demo_IDS.py
│   │   └── live_capture.py
│   ├── net flow/                 # Network flow tools
│   │   ├── nfstream_flow.py
│   │   └── generate_pcap.py
│   ├── uploads/                  # Uploaded files (created automatically)
│   └── results/                  # Prediction results (created automatically)
├── uploads/                   # Root uploads folder
├── results/                   # Root results folder
└── README.md                  # This file
```

## Quick Start

### 1. Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install all dependencies including FastAPI
pip install -r requirements.txt
```

### 2. Start the FastAPI Server

```bash
# Make sure you're in the backend folder
cd backend

# Start the server (with auto-reload for development)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API

- **API Base**: http://localhost:8000
- Make sure you're in the backend folder
cd backend

# **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

### 4. Test the API

```bash
# Run the test suite
python api_test.py

# Or run client examples
python client_example.py
```

## API Usage

### Health Check
```bash
curl http://localhost:8000/health
```

### Predict from JSON
```python
import requests

flow_data = {
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
        # ... other features
    }]
}

response = requests.post("http://localhost:8000/predict", json=flow_data)
print(response.json())
```

### Upload CSV for Prediction
```python
with open("flow_features.csv", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:8000/predict/csv", files=files)
    print(response.json())
```

### Using the Python Client
```python
from client_example import NIDSClient

client = NIDSClient("http://localhost:8000")

# Check health
health = client.health_check()

# Get model info
model_info = client.get_model_info()

# Predict
result = client.predict([flow_data])

# Upload CSV
result = client.predict_from_csv("flow_features.csv")
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint info |
| GET | `/health` | Health check |
| GET | `/model/info` | Model information |
| POST | `/model/reload` | Reload model |
| GET | `/labels` | Get attack labels |
| POST | `/predict` | Predict from JSON |
| POST | `/predict/csv` | Upload CSV for prediction |
| GET | `/download/{filename}` | Download results |
| GET | `/results` | List result files |
| GET | `/stats` | API statistics |

## Frontend Integration Example

### JavaScript/React
```javascript
// Prediction
const predictFlow = async (flowData) => {
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flows: [flowData] })
  });
  return await response.json();
};

// CSV Upload
const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/predict/csv', {
    method: 'POST',
  Navigate to backend folder and run inference
cd backend
  });
  return await response.json();
};
```

## Running Inference (Original Script)

```bash
# Run inference on flow_features.csv
python nids_inference.py
```

## Model Information
Navigate to backend folder
cd backend

# API tests
python api_test.py

# Client examples
python client_example.py
```

### Environment Configuration
Copy `backend/.env.example` to `backend/
```bash
# API tests
python api_test.py

# Client examples
python client_example.py
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_PATH=model/nids_xgb_multiclass.pkl
ENCODER_PATH=model/attack_label_encoder.pkl
```

## Deployment

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements-api.txt .
RUN pip install -r requirements-api.txt
COPY . .backend/API_DOCUMENTATION.md](backend/
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Documentation

- **API Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Interactive Docs**: http://localhost:8000/docs (when server is running)

## Technologies Used

- **FastAPI**: Modern web framework for building APIs
- **XGBoost**: Machine learning model
- **NFStream**: Network flow analysis
- **Scapy**: Packet manipulation
- **Pandas**: Data processing
- **Uvicorn**: ASGI server

## Licensebackend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
2. Run `cd backend && 
This project is provided as-is for educational and research purposes.

## Support

For issues or questions:
1. Check the [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. Run `python api_test.py` to diagnose issues
3. Check the API logs in the terminal
