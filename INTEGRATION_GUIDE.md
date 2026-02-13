# Backend and Frontend Integration Guide

## Overview
The Intrusion Detection System now has full integration between the React frontend and FastAPI backend. The system captures live network traffic, analyzes it using ML models, and displays real-time results.

## Architecture

### Backend (FastAPI)
- **Port**: 8000
- **Framework**: FastAPI with Python
- **Main Features**:
  - Live network capture endpoint (`/scan/live`)
  - CSV file upload and analysis
  - ML-based intrusion detection
  - Real-time prediction results

### Frontend (React + Vite)
- **Port**: 5173 (development)
- **Framework**: React with Vite
- **Main Features**:
  - Interactive dashboard with scan button
  - Live capture duration control
  - Real-time results visualization
  - Attack distribution charts
  - Event history tracking

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Configuration

#### Backend Configuration
No additional configuration needed. The backend uses:
- Port: 8000
- CORS: Enabled for all origins (development mode)

#### Frontend Configuration
Create a `.env` file in the frontend directory (optional):

```env
VITE_API_URL=http://localhost:8000
```

## How It Works

### Live Network Scan Flow

1. **User Action**: User clicks "Start Security Scan" button on Dashboard
2. **Capture Duration**: User can set capture duration (default: 60 seconds)
3. **Backend Processing**:
   - Captures live network traffic using tshark/tcpdump
   - Processes packets with NFStreamer
   - Extracts flow features
   - Runs ML model predictions
   - Returns analysis results
4. **Frontend Display**:
   - Shows real-time scanning status
   - Displays prediction results
   - Shows attack distribution chart
   - Lists threats and warnings
   - Displays event history

### API Endpoints Used

#### POST `/scan/live?duration={seconds}`
Captures live network traffic and returns predictions.

**Response Format**:
```json
{
  "status": "success",
  "duration": 60,
  "total_flows": 150,
  "attack_counts": {
    "Benign": 140,
    "DDoS": 5,
    "PortScan": 5
  },
  "statistics": {
    "safe": 140,
    "warnings": 8,
    "threats": 2
  },
  "threats": [...],
  "warnings": [...],
  "output_file": "results/live_predictions_20260130_120000.csv",
  "timestamp": "2026-01-30T12:00:00"
}
```

## Features

### Dashboard
- **Scan Button**: Initiates live network capture
- **Duration Control**: Adjustable capture duration (10-300 seconds)
- **Results Display**: Shows safe flows, warnings, and threats
- **Attack Distribution**: Visual chart of attack types
- **Event History**: List of detected threats and warnings

### Live Monitoring (Demo Mode)
- **Real-time Visualization**: Shows simulated packet flow
- **Protocol Distribution**: TCP, UDP, ICMP breakdown
- **Security Alerts**: Real-time alert feed
- **Packet Feed**: Live packet table with details

## Requirements

### Backend Requirements
- Python 3.8+
- FastAPI
- NFStream
- scikit-learn
- pandas
- tshark (Wireshark CLI) or tcpdump

### Frontend Requirements
- Node.js 16+
- React 19
- Vite 7
- TailwindCSS
- Recharts (for charts)

## Troubleshooting

### Backend Issues

**"tshark not available"**
- Install Wireshark: https://www.wireshark.org/download.html
- Add tshark to PATH
- For Linux: `sudo apt-get install tshark`
- For macOS: `brew install wireshark`
- For Windows: Install Wireshark and add to PATH

**"Model not loaded"**
- Ensure model files exist in `backend/model/` directory
- Check model file names match configuration

**"No network flows captured"**
- Check network interface permissions
- Run with administrator/sudo privileges
- Verify network traffic is flowing

### Frontend Issues

**"Network Error"**
- Ensure backend is running on port 8000
- Check CORS configuration
- Verify API_URL in frontend config

**"Connection Refused"**
- Confirm backend server is running
- Check firewall settings
- Verify port 8000 is not blocked

## Development Tips

1. **Backend Development**:
   - Use `--reload` flag for auto-reload
   - Check logs in terminal for debugging
   - Test endpoints with `/docs` (Swagger UI)

2. **Frontend Development**:
   - Vite provides hot module replacement
   - Use browser DevTools for debugging
   - Check Network tab for API calls

3. **Testing**:
   - Backend has fallback to use existing `traffic.pcap` if live capture fails
   - Frontend shows error messages for failed requests
   - Use smaller duration values (10-30 seconds) for testing

## Security Considerations

### Production Deployment
1. **Backend**:
   - Configure CORS to allow only frontend domain
   - Use HTTPS
   - Add authentication/authorization
   - Rate limit API endpoints
   - Secure file upload/download endpoints

2. **Frontend**:
   - Use environment variables for API URL
   - Implement proper error handling
   - Add authentication
   - Enable CSP headers

## Next Steps

- [ ] Add WebSocket support for real-time packet streaming
- [ ] Implement user authentication
- [ ] Add historical data storage and retrieval
- [ ] Create admin dashboard for system configuration
- [ ] Add email/SMS alerts for critical threats
- [ ] Implement API rate limiting
- [ ] Add detailed packet inspection view
- [ ] Create export functionality for reports

## Support

For issues or questions:
1. Check the backend logs in terminal
2. Check browser console for frontend errors
3. Verify all dependencies are installed
4. Ensure required services (tshark) are available
