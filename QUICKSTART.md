# Quick Start Guide

## Prerequisites
- Python 3.8+
- Root/sudo privileges for packet capture
- Network interface to monitor

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/hasanravda/NetworkIntrusionDetectionSystem.git
cd NetworkIntrusionDetectionSystem
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

## Running the Demo

Test the system without requiring root privileges:

```bash
python demo.py
```

This will demonstrate:
- ML model initialization
- Feature extraction
- Intrusion detection
- Automatic IP blocking
- Analytics and reporting

## Running NIDS on Live Traffic

**Important: Requires root/sudo privileges**

### Basic Usage

```bash
sudo python main.py
```

### With Specific Interface

```bash
sudo python main.py -i eth0
```

### Enable Auto-blocking

```bash
sudo python main.py --auto-block
```

### Custom Detection Threshold

```bash
sudo python main.py --threshold 0.8
```

## Training Your Own Model

If you have the UQ-NIDS dataset or your own labeled dataset:

```bash
python train_model.py /path/to/dataset.csv -o models/my_model.joblib
```

Dataset format:
- CSV file with features in columns
- Last column should be 'label' (0 for normal, 1 for attack)

## Configuration

Edit `config.json` to customize:

- Network interface
- Detection threshold
- Auto-blocking settings
- Logging preferences
- Analytics intervals

## Viewing Status

Check current NIDS status:

```bash
python main.py --status
```

## Troubleshooting

### "Permission denied" error
Run with sudo:
```bash
sudo python main.py
```

### "No module named 'scapy'" error
Install dependencies:
```bash
pip install -r requirements.txt
```

### No packets captured
- Verify correct network interface: `ip link show` or `ifconfig`
- Check if traffic is flowing on the interface
- Ensure no firewall is blocking packet capture

## Understanding Output

### Alert Severity Levels
- **CRITICAL**: 95%+ confidence of attack
- **HIGH**: 85-95% confidence
- **MEDIUM**: 75-85% confidence
- **LOW**: 70-75% confidence

### Blocked IPs
Blocked IPs are stored in `blocked_ips.txt` and can be manually edited.

### Logs and Reports
- Logs: `logs/nids.log`
- Alerts: `alerts/alerts.json`
- Analytics: `logs/analytics_report.json`

## Next Steps

1. Run the demo to understand the system
2. Test on live traffic (with caution)
3. Collect network data for training
4. Train custom model with your data
5. Fine-tune detection threshold
6. Enable auto-blocking in production

## Safety Notes

⚠️ **Before enabling auto-blocking in production:**
1. Test thoroughly in a safe environment
2. Verify false positive rate is acceptable
3. Have a way to quickly unblock IPs
4. Monitor blocked IPs regularly
5. Start with high threshold (0.9+) and adjust down

## Support

For issues, questions, or contributions, please open an issue on GitHub.
