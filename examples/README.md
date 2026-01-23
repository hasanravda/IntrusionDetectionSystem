# NIDS Python Code Examples

This directory contains practical Python code examples demonstrating how to use the Network Intrusion Detection System (NIDS) library programmatically.

## 📋 Examples Overview

### 1. Basic Detection (`basic_detection.py`)
**Purpose**: Simple network traffic detection with packet capture and ML classification

**Features**:
- Basic packet capture setup
- Feature extraction from packets
- Real-time ML-based detection
- Simple statistics tracking

**Usage**:
```bash
sudo python3 examples/basic_detection.py
```

**Key Code**:
```python
from nids.packet_capture import PacketCapture
from nids.ml_model import NIDSModel
from nids.feature_extraction import FeatureExtractor

# Initialize components
capture = PacketCapture()
model = NIDSModel()
extractor = FeatureExtractor()

# Start capturing
capture.start_capture(packet_callback=callback)

# Analyze packets
features = extractor.extract_features(packet)
prediction = model.predict(features)
```

---

### 2. Custom Training (`custom_training.py`)
**Purpose**: Train custom ML models with your own dataset

**Features**:
- Create sample datasets
- Train Random Forest and Gradient Boosting models
- Load and train from CSV files
- Model evaluation and saving

**Usage**:
```bash
# Train with synthetic data
python3 examples/custom_training.py

# Train from CSV file
python3 examples/custom_training.py --csv dataset.csv
```

**Key Code**:
```python
from nids.ml_model import NIDSModel

# Create and train model
model = NIDSModel(model_path='custom_model.joblib')
metrics = model.train(X, y, model_type='random_forest')

# Save and use
model.save()
prediction = model.predict(features)
```

---

### 3. Alert Monitoring (`alert_monitoring.py`)
**Purpose**: Real-time alert monitoring with custom handlers

**Features**:
- Custom alert handling
- Interactive IP blocking
- Alert severity processing
- Session statistics

**Usage**:
```bash
sudo python3 examples/alert_monitoring.py
```

**Key Code**:
```python
from nids.detection_engine import DetectionEngine
from nids.intrusion_prevention import IntrusionPrevention

# Setup detection
detection = DetectionEngine(threshold=0.7)
prevention = IntrusionPrevention()

# Process alerts
while True:
    if not detection.alert_queue.empty():
        alert = detection.alert_queue.get()
        handle_alert(alert)
        prevention.block_ip(alert['source_ip'])
```

---

### 4. Auto Blocking (`auto_blocking.py`)
**Purpose**: Automated IP blocking with custom threat scoring

**Features**:
- Custom threat scoring algorithm
- Rule-based blocking decisions
- Cumulative threat tracking
- Port-based scoring

**Usage**:
```bash
sudo python3 examples/auto_blocking.py
```

**Key Code**:
```python
class CustomThreatResponse:
    def calculate_threat_score(self, alert):
        score = alert['probability'] * 10
        score *= severity_weights[alert['severity']]
        return score
    
    def should_block(self, ip, score):
        if score >= 50.0:
            return True, "High threat score"
        return False, None
```

---

### 5. Traffic Analytics (`traffic_analytics.py`)
**Purpose**: Live traffic statistics and analysis

**Features**:
- Live protocol distribution
- Top talkers (sources/destinations)
- Real-time statistics display
- Report generation

**Usage**:
```bash
sudo python3 examples/traffic_analytics.py
```

**Key Code**:
```python
from nids.analytics import Analytics

analytics = Analytics()

# Update stats
analytics.update_traffic_stats(packet_info)

# Get statistics
protocols = analytics.get_protocol_distribution()
top_sources = analytics.get_top_sources(10)

# Save report
analytics.save_report('report.json')
```

---

### 6. Packet Inspection (`packet_inspection.py`)
**Purpose**: Detailed packet analysis and inspection

**Features**:
- Deep packet inspection
- Layer-by-layer analysis (IP, TCP, UDP, ICMP)
- Payload examination
- Feature extraction visualization

**Usage**:
```bash
sudo python3 examples/packet_inspection.py
```

**Key Code**:
```python
from scapy.all import sniff, IP, TCP
from nids.feature_extraction import FeatureExtractor

def analyze_packet(packet):
    if IP in packet:
        ip = packet[IP]
        print(f"Source: {ip.src}, Dest: {ip.dst}")
        
        if TCP in packet:
            tcp = packet[TCP]
            print(f"Ports: {tcp.sport} -> {tcp.dport}")
            print(f"Flags: {tcp.flags}")

sniff(prn=analyze_packet, count=10)
```

---

### 7. NFStream Integration (`nfstream_integration.py`)
**Purpose**: Extract NetFlow features from pcap files using nfstream library

**Features**:
- Process pcap files with NFStreamer
- Extract 50+ NetFlow features
- Prepare data for NIDS training
- Compatible with NetFlow v3 datasets

**Usage**:
```bash
python3 examples/nfstream_integration.py capture.pcap -o features.csv
python3 train_netflow.py features.csv
```

**Key Code**:
```python
from nfstream import NFStreamer
import pandas as pd

# Create NFStreamer to process pcap
streamer = NFStreamer(source='capture.pcap')

# Extract flows
flows = []
for flow in streamer:
    flows.append({
        'src_ip': flow.src_ip,
        'dst_ip': flow.dst_ip,
        'protocol': flow.protocol,
        'bidirectional_packets': flow.bidirectional_packets,
        'bidirectional_bytes': flow.bidirectional_bytes,
        # ... more features
    })

df = pd.DataFrame(flows)
df.to_csv('features.csv', index=False)
```

---

## 🚀 Quick Start

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run a simple demo** (no root required):
```bash
python3 examples/custom_training.py
```

3. **Try packet capture** (requires root):
```bash
sudo python3 examples/basic_detection.py
```

4. **Train your own model**:
```bash
# Generate dataset
python3 generate_dataset.py -o my_dataset.csv

# Train model
python3 examples/custom_training.py --csv my_dataset.csv
```

---

## 📚 Code Patterns

### Pattern 1: Basic Setup
```python
from queue import Queue
from nids.packet_capture import PacketCapture
from nids.detection_engine import DetectionEngine

# Initialize
packet_queue = Queue()
capture = PacketCapture(packet_queue=packet_queue)
detection = DetectionEngine()

# Start
capture.start_capture()
detection.start(packet_queue)
```

### Pattern 2: Custom Callbacks
```python
def my_packet_handler(packet):
    info = extract_packet_info(packet)
    print(f"Captured: {info['src_ip']} -> {info['dst_ip']}")

capture.start_capture(packet_callback=my_packet_handler)
```

### Pattern 3: Alert Processing
```python
while True:
    if not detection.alert_queue.empty():
        alert = detection.alert_queue.get()
        
        if alert['severity'] == 'CRITICAL':
            # Take immediate action
            send_notification(alert)
            block_ip(alert['source_ip'])
```

### Pattern 4: Feature Extraction
```python
from nids.feature_extraction import FeatureExtractor

extractor = FeatureExtractor()
features = extractor.extract_features(packet)

# Features is a list of 30 values
# Use with ML model for prediction
prediction = model.predict(features)
```

---

## 🔧 Common Tasks

### Capture Packets from Specific Interface
```python
capture = PacketCapture(interface='eth0')
```

### Apply BPF Filter
```python
capture.start_capture(filter_str='tcp port 80')
```

### Change Detection Threshold
```python
detection = DetectionEngine(threshold=0.85)  # More strict
```

### Enable Auto-blocking
```python
prevention = IntrusionPrevention(
    auto_block=True,
    block_threshold=3  # Block after 3 alerts
)
```

### Save Analytics Report
```python
analytics.save_report('my_report.json')
```

---

## ⚠️ Important Notes

1. **Root Privileges**: Most examples require root/sudo for packet capture
2. **Network Interface**: Use `ip link show` or `ifconfig` to find your interface name
3. **Testing**: Use `demo.py` in the main directory for testing without root
4. **Models**: Train with real data for production use

---

## 🎯 Example Use Cases

### Security Monitoring
Use `alert_monitoring.py` to monitor network for threats and respond interactively.

### Automated Defense
Use `auto_blocking.py` to automatically block malicious IPs based on custom rules.

### Traffic Analysis
Use `traffic_analytics.py` to understand network traffic patterns.

### Model Development
Use `custom_training.py` to develop and test ML models with your data.

### Forensics
Use `packet_inspection.py` to perform detailed analysis of suspicious packets.

---

## 📖 Additional Resources

- Main documentation: `../README.md`
- Quick start guide: `../QUICKSTART.md`
- Implementation details: `../IMPLEMENTATION.md`
- Configuration: `../config.json`

---

## 🤝 Contributing

Feel free to create your own examples and share them!

---

**Note**: All examples are designed to be educational and demonstrate different aspects of the NIDS system. Adapt them to your specific needs and security requirements.
