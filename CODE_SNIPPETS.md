# Python Code Snippets - Quick Reference

## 🚀 Quick Start Snippets

### 1. Basic Packet Capture
```python
from nids.packet_capture import PacketCapture
from queue import Queue

# Setup
packet_queue = Queue()
capture = PacketCapture(interface='eth0', packet_queue=packet_queue)

# Start capturing
capture.start_capture()

# Process packets
while True:
    if not packet_queue.empty():
        packet = packet_queue.get()
        print(f"Captured packet: {len(packet)} bytes")
```

### 2. ML-Based Detection
```python
from nids.ml_model import NIDSModel
from nids.feature_extraction import FeatureExtractor

# Load model
model = NIDSModel('models/nids_model.joblib')
model.load()

# Extract features and predict
extractor = FeatureExtractor()
features = extractor.extract_features(packet)
prediction = model.predict(features)
probability = model.predict_proba(features)

if prediction == 1:
    print(f"⚠️ THREAT DETECTED! Confidence: {probability:.2%}")
```

### 3. Train Custom Model
```python
from nids.ml_model import NIDSModel
import numpy as np

# Prepare data
X = np.random.randn(1000, 30)  # 1000 samples, 30 features
y = np.random.randint(0, 2, 1000)  # Binary labels

# Train
model = NIDSModel('my_model.joblib')
metrics = model.train(X, y, model_type='random_forest')
model.save()

print(f"Model accuracy: {metrics['accuracy']:.2%}")
```

### 4. Real-time Alert Processing
```python
from nids.detection_engine import DetectionEngine

# Initialize
detection = DetectionEngine(threshold=0.75)
detection.start(packet_queue)

# Monitor alerts
while True:
    if not detection.alert_queue.empty():
        alert = detection.alert_queue.get()
        
        print(f"Alert #{alert['alert_id']}")
        print(f"  Source: {alert['source_ip']}")
        print(f"  Severity: {alert['severity']}")
        print(f"  Confidence: {alert['probability']:.2%}")
```

### 5. Auto IP Blocking
```python
from nids.intrusion_prevention import IntrusionPrevention

# Setup with auto-blocking
prevention = IntrusionPrevention(
    auto_block=True,
    block_threshold=5  # Block after 5 alerts
)

# Process alerts
if prevention.process_alert(alert):
    print(f"🚫 Blocked {alert['source_ip']}")

# Manual blocking
prevention.block_ip('192.168.1.100', severity='HIGH')

# Check blocked IPs
blocked = prevention.get_blocked_ips()
print(f"Blocked IPs: {blocked}")
```

### 6. Traffic Analytics
```python
from nids.analytics import Analytics

# Initialize
analytics = Analytics()

# Update with packet info
packet_info = {
    'protocol': 'TCP',
    'src_ip': '192.168.1.10',
    'dst_ip': '8.8.8.8',
    'src_port': 50000,
    'dst_port': 443
}
analytics.update_traffic_stats(packet_info)

# Get statistics
protocols = analytics.get_protocol_distribution()
top_sources = analytics.get_top_sources(10)

# Generate report
analytics.print_summary()
analytics.save_report('report.json')
```

### 7. Packet Information Extraction
```python
from nids.packet_capture import extract_packet_info
from scapy.all import sniff

def packet_callback(packet):
    info = extract_packet_info(packet)
    print(f"{info['timestamp']}: {info['protocol']} "
          f"{info['src_ip']}:{info['src_port']} -> "
          f"{info['dst_ip']}:{info['dst_port']}")

sniff(prn=packet_callback, count=10)
```

### 8. Feature Extraction
```python
from nids.feature_extraction import FeatureExtractor

extractor = FeatureExtractor(window_size=100)

# Extract 30 features from packet
features = extractor.extract_features(packet)

# Get feature names
feature_names = extractor.get_feature_names()

# Display
for name, value in zip(feature_names, features):
    print(f"{name}: {value}")
```

### 9. Configuration Management
```python
from nids.config import Config

# Load configuration
config = Config('config.json')

# Get values
interface = config.get('network', 'interface')
threshold = config.get('detection', 'threshold')
auto_block = config.get('prevention', 'auto_block')

# Update values
config.set('detection', 'threshold', 0.85)
config.save()
```

### 10. Complete Detection Pipeline
```python
from queue import Queue
from nids.packet_capture import PacketCapture
from nids.detection_engine import DetectionEngine
from nids.intrusion_prevention import IntrusionPrevention
from nids.analytics import Analytics

# Setup
packet_queue = Queue()
capture = PacketCapture(packet_queue=packet_queue)
detection = DetectionEngine(threshold=0.7)
prevention = IntrusionPrevention(auto_block=True)
analytics = Analytics()

# Start
capture.start_capture()
detection.start(packet_queue)

# Process
while True:
    # Handle alerts
    if not detection.alert_queue.empty():
        alert = detection.alert_queue.get()
        
        # Update analytics
        analytics.update_alert_stats(alert)
        
        # Process for blocking
        prevention.process_alert(alert)
    
    # Get stats periodically
    stats = detection.get_stats()
    print(f"Packets: {stats['total_packets']}, "
          f"Threats: {stats['malicious_packets']}")
```

## 🔧 Advanced Patterns

### Custom Threat Scoring
```python
def calculate_threat_score(alert):
    score = alert['probability'] * 10
    
    # Severity multiplier
    severity_weights = {
        'CRITICAL': 5.0,
        'HIGH': 3.0,
        'MEDIUM': 2.0,
        'LOW': 1.0
    }
    score *= severity_weights[alert['severity']]
    
    # Port-based scoring
    if alert['destination_port'] in [22, 23, 3389]:
        score += 5.0  # SSH, Telnet, RDP
    
    return score
```

### Custom Alert Handler
```python
def handle_alert(alert):
    severity = alert['severity']
    source_ip = alert['source_ip']
    
    if severity == 'CRITICAL':
        # Send email notification
        send_email(f"CRITICAL threat from {source_ip}")
        
        # Log to SIEM
        log_to_siem(alert)
        
        # Block immediately
        prevention.block_ip(source_ip, severity)
    
    elif severity == 'HIGH':
        # Send SMS notification
        send_sms(f"HIGH threat from {source_ip}")
        
        # Increment counter
        threat_counter[source_ip] += 1
```

### Batch Packet Processing
```python
def process_packets_batch(packets, batch_size=100):
    results = []
    
    for i in range(0, len(packets), batch_size):
        batch = packets[i:i+batch_size]
        
        # Extract features for batch
        features_batch = [extractor.extract_features(p) for p in batch]
        
        # Predict for batch
        predictions = model.predict(features_batch)
        probabilities = model.predict_proba(features_batch)
        
        results.extend(zip(predictions, probabilities))
    
    return results
```

### Export to CSV
```python
import csv

def export_alerts_to_csv(alerts, filename='alerts.csv'):
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=alerts[0].keys())
        writer.writeheader()
        writer.writerows(alerts)
```

## 📊 Integration Examples

### With Flask Web API
```python
from flask import Flask, jsonify
from nids.detection_engine import DetectionEngine

app = Flask(__name__)
detection = DetectionEngine()

@app.route('/api/stats')
def get_stats():
    stats = detection.get_stats()
    return jsonify(stats)

@app.route('/api/alerts')
def get_alerts():
    alerts = detection.get_alerts(count=10)
    return jsonify(alerts)
```

### With Database (SQLite)
```python
import sqlite3

def save_alert_to_db(alert):
    conn = sqlite3.connect('nids.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO alerts (timestamp, severity, source_ip, 
                          destination_ip, protocol, probability)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (alert['timestamp'], alert['severity'], 
          alert['source_ip'], alert['destination_ip'],
          alert['protocol'], alert['probability']))
    
    conn.commit()
    conn.close()
```

### With Webhook
```python
import requests

def send_webhook(alert):
    webhook_url = 'https://your-webhook-url.com/alerts'
    
    payload = {
        'severity': alert['severity'],
        'source_ip': alert['source_ip'],
        'confidence': alert['probability'],
        'timestamp': alert['timestamp']
    }
    
    response = requests.post(webhook_url, json=payload)
    return response.status_code == 200
```

## 💡 Tips & Tricks

### 1. Performance Optimization
```python
# Use feature caching
feature_cache = {}

def get_cached_features(packet_hash):
    if packet_hash not in feature_cache:
        feature_cache[packet_hash] = extractor.extract_features(packet)
    return feature_cache[packet_hash]
```

### 2. Error Handling
```python
try:
    capture.start_capture()
except PermissionError:
    print("❌ Root privileges required")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    capture.stop_capture()
```

### 3. Graceful Shutdown
```python
import signal

def signal_handler(sig, frame):
    print("\nShutting down...")
    capture.stop_capture()
    detection.stop()
    analytics.save_report('final_report.json')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
```

---

**For more examples, see the `examples/` directory!**
