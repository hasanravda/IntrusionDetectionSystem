# Network Intrusion Detection System (NIDS)

A Machine Learning-based Network Intrusion Detection System (NIDS) that monitors and analyzes network traffic in real-time to identify malicious activities and security breaches. This system provides comprehensive intrusion detection and prevention capabilities using Python, Scapy library, and machine learning algorithms.

## Features

### Core Capabilities
- **Real-time Packet Capture**: Uses Scapy library for capturing and analyzing network packets
- **Machine Learning Detection**: Employs Random Forest and Gradient Boosting classifiers for accurate threat detection
- **Intrusion Prevention**: Auto-blocking malicious IPs (IPS functionality)
- **Detailed Packet Inspection**: Deep analysis of network packets with feature extraction
- **Analytics & Visualization**: Comprehensive statistics and traffic analysis
- **Alert Management**: Real-time alert generation with severity levels
- **Multi-protocol Support**: TCP, UDP, ICMP, and ARP protocol analysis

### Detection Features
- Real-time traffic analysis
- Flow-based feature extraction
- Configurable detection threshold
- Probability-based classification
- Alert severity levels (CRITICAL, HIGH, MEDIUM, LOW)

### Prevention Features
- Automatic IP blocking
- Configurable blocking threshold
- Block history tracking
- Manual IP blocking/unblocking
- iptables integration (Linux)

### Analytics
- Protocol distribution statistics
- Hourly traffic analysis
- Alert severity distribution
- Top source/destination IPs
- Comprehensive reporting

## Architecture

```
NetworkIntrusionDetectionSystem/
├── main.py                      # Main application entry point
├── requirements.txt             # Python dependencies
├── config.json                  # Configuration file
├── nids/                        # Core NIDS modules
│   ├── __init__.py
│   ├── packet_capture.py       # Packet capture using Scapy
│   ├── feature_extraction.py   # Feature extraction from packets
│   ├── ml_model.py             # Machine learning model
│   ├── detection_engine.py     # Real-time detection engine
│   ├── intrusion_prevention.py # IP blocking and prevention
│   ├── analytics.py            # Statistics and analytics
│   └── config.py               # Configuration management
├── models/                      # Trained ML models
├── logs/                        # Log files and reports
└── alerts/                      # Alert history
```

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Linux/macOS/Windows (with appropriate permissions)
- Root/Administrator privileges (for packet capture and IP blocking)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/hasanravda/NetworkIntrusionDetectionSystem.git
cd NetworkIntrusionDetectionSystem
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) On Linux, install libpcap for better packet capture:
```bash
sudo apt-get install libpcap-dev  # Debian/Ubuntu
# or
sudo yum install libpcap-devel    # RedHat/CentOS
```

## Usage

### Basic Usage

Run NIDS with default settings:
```bash
sudo python main.py
```

### Command Line Options

```bash
# Specify network interface
sudo python main.py -i eth0

# Enable automatic IP blocking
sudo python main.py --auto-block

# Set detection threshold
sudo python main.py --threshold 0.8

# Use custom configuration file
sudo python main.py -c my_config.json

# Show system status
python main.py --status

# Training mode (requires dataset)
python main.py --train --dataset data/uq_nids.csv
```

### Configuration

Edit `config.json` to customize NIDS behavior:

```json
{
  "network": {
    "interface": null,
    "bpf_filter": null
  },
  "detection": {
    "model_path": "models/nids_model.joblib",
    "threshold": 0.7,
    "feature_window_size": 100
  },
  "prevention": {
    "auto_block": false,
    "block_threshold": 5,
    "block_duration": 3600
  },
  "logging": {
    "level": "INFO",
    "file": "logs/nids.log",
    "console": true
  },
  "alerts": {
    "save_to_file": true,
    "alert_file": "alerts/alerts.json",
    "console_output": true
  },
  "analytics": {
    "enable": true,
    "report_interval": 300
  }
}
```

## Machine Learning Model

### Supported Datasets
- **UQ-NIDS Dataset**: University of Queensland Network Intrusion Detection System dataset
- Custom datasets in CSV format with appropriate features

### Feature Extraction
The system extracts 30+ features from each packet:
- Packet length and IP header information
- Protocol-specific features (TCP/UDP/ICMP)
- Port numbers and flags
- Flow-based statistics
- Temporal features

### Model Training
To train the model with your own dataset:

1. Prepare your dataset in CSV format with features and labels
2. Run training mode:
```bash
python main.py --train --dataset /path/to/dataset.csv
```

### Default Model
The system includes a pre-trained default model for demonstration purposes. For production use, train with your specific network traffic data.

## Intrusion Prevention System (IPS)

### Auto-blocking
When enabled, NIDS automatically blocks IPs that exceed the alert threshold:

```bash
sudo python main.py --auto-block
```

Configuration:
- `block_threshold`: Number of alerts before blocking (default: 5)
- `block_duration`: Duration to block IP in seconds (default: 3600)

### Manual IP Management
Blocked IPs are stored in `blocked_ips.txt` and can be managed programmatically through the `IntrusionPrevention` class.

### iptables Integration
On Linux systems, NIDS can integrate with iptables for actual traffic blocking (requires root privileges).

## Output and Alerts

### Alert Format
Alerts include:
- Alert ID and timestamp
- Severity level
- Source/destination IP and ports
- Protocol information
- Confidence score
- Human-readable description

### Alert Storage
- Console output with color coding
- JSON file: `alerts/alerts.json`
- Log file: `logs/nids.log`

### Analytics Reports
Generated periodically in `logs/`:
- Protocol distribution
- Hourly traffic statistics
- Alert severity distribution
- Top source/destination IPs

## Performance Considerations

- **Memory**: Depends on traffic volume and feature window size
- **CPU**: ML inference is optimized with scikit-learn
- **Disk**: Logs and alerts accumulate over time
- **Network**: Minimal overhead from packet capture

## Security Notes

1. **Privileges**: Packet capture requires elevated privileges (root/sudo)
2. **IP Blocking**: Test thoroughly before enabling auto-block in production
3. **False Positives**: Tune detection threshold to minimize false positives
4. **Model Updates**: Regularly retrain the model with current network data

## Troubleshooting

### Permission Denied
```bash
# Run with sudo for packet capture
sudo python main.py
```

### No Packets Captured
- Check network interface name
- Verify network traffic is flowing
- Check firewall rules

### Model Not Found
The system will create a default model automatically on first run.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the MIT License.

## References

- **Scapy**: https://scapy.net/
- **UQ-NIDS Dataset**: University of Queensland research datasets
- **scikit-learn**: https://scikit-learn.org/

## Authors

NIDS Development Team

## Acknowledgments

- University of Queensland for the NIDS dataset
- Scapy development team
- scikit-learn contributors