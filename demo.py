#!/usr/bin/env python3
"""
Demo Script for NIDS
Demonstrates NIDS functionality without requiring root privileges
"""

import sys
import time
from nids.ml_model import NIDSModel
from nids.feature_extraction import FeatureExtractor
from nids.detection_engine import DetectionEngine
from nids.intrusion_prevention import IntrusionPrevention
from nids.analytics import Analytics
import numpy as np


def simulate_network_traffic():
    """Simulate network traffic for demonstration"""
    print("="*60)
    print("NIDS Demo - Simulating Network Traffic")
    print("="*60)
    
    # Initialize components
    print("\n[1/5] Initializing ML Model...")
    model = NIDSModel()
    model._create_default_model()
    
    print("[2/5] Initializing Feature Extractor...")
    feature_extractor = FeatureExtractor()
    
    print("[3/5] Initializing Detection Engine...")
    detection = DetectionEngine()
    
    print("[4/5] Initializing Intrusion Prevention...")
    prevention = IntrusionPrevention(auto_block=True, block_threshold=3)
    
    print("[5/5] Initializing Analytics...")
    analytics = Analytics()
    
    print("\n" + "="*60)
    print("Simulating Network Packets")
    print("="*60 + "\n")
    
    # Simulate normal traffic
    print("Generating normal traffic samples...")
    for i in range(10):
        # Generate normal-looking features
        features = np.random.randn(30) * 0.5 + 1
        features = features.tolist()
        
        # Predict
        prediction = model.predict(features)
        probability = model.predict_proba(features)
        
        # Create mock packet info
        packet_info = {
            'timestamp': f'2024-01-01 10:00:{i:02d}',
            'src_ip': f'192.168.1.{10+i}',
            'dst_ip': '192.168.1.100',
            'src_port': 50000 + i,
            'dst_port': 80,
            'protocol': 'TCP',
            'length': 64 + i*10
        }
        
        analytics.update_traffic_stats(packet_info)
        
        if prediction == 1 and probability > 0.7:
            print(f"  ⚠ Packet {i+1}: MALICIOUS (Confidence: {probability:.2%})")
        else:
            print(f"  ✓ Packet {i+1}: Normal (Confidence: {1-probability:.2%})")
        
        time.sleep(0.1)
    
    # Simulate malicious traffic
    print("\nGenerating malicious traffic samples...")
    malicious_ip = '10.0.0.50'
    
    for i in range(5):
        # Generate malicious-looking features
        features = np.random.randn(30) * 1.5 + 2.5
        features = features.tolist()
        
        # Predict
        prediction = model.predict(features)
        probability = model.predict_proba(features)
        
        # Create mock packet info
        packet_info = {
            'timestamp': f'2024-01-01 10:01:{i:02d}',
            'src_ip': malicious_ip,
            'dst_ip': '192.168.1.100',
            'src_port': 60000 + i,
            'dst_port': 22,
            'protocol': 'TCP',
            'length': 512 + i*100
        }
        
        analytics.update_traffic_stats(packet_info)
        
        if prediction == 1 and probability > 0.7:
            alert = {
                'alert_id': i+1,
                'timestamp': packet_info['timestamp'],
                'severity': 'HIGH' if probability > 0.9 else 'MEDIUM',
                'probability': probability,
                'source_ip': malicious_ip,
                'destination_ip': packet_info['dst_ip'],
                'source_port': packet_info['src_port'],
                'destination_port': packet_info['dst_port'],
                'protocol': 'TCP'
            }
            
            analytics.update_alert_stats(alert)
            
            print(f"  🚨 Packet {i+1}: MALICIOUS DETECTED! (Confidence: {probability:.2%})")
            
            # Process alert for prevention
            if prevention.process_alert(alert):
                print(f"     → IP {malicious_ip} has been BLOCKED!")
        else:
            print(f"  ✓ Packet {i+1}: Normal (Confidence: {1-probability:.2%})")
        
        time.sleep(0.2)
    
    # Display results
    print("\n" + "="*60)
    print("DEMO RESULTS")
    print("="*60)
    
    # Analytics summary
    analytics.print_summary()
    
    # Blocked IPs
    blocked_ips = prevention.get_blocked_ips()
    if blocked_ips:
        print(f"\nBlocked IPs: {', '.join(blocked_ips)}")
    
    # Detection stats
    print("\nNote: This is a simulation using synthetic data.")
    print("In real deployment, NIDS will capture and analyze live network traffic.")
    print("\nTo run NIDS on live traffic, use: sudo python main.py")


def test_feature_extraction():
    """Test feature extraction"""
    print("\n" + "="*60)
    print("Testing Feature Extraction")
    print("="*60 + "\n")
    
    extractor = FeatureExtractor()
    feature_names = extractor.get_feature_names()
    
    print(f"Total features extracted: {len(feature_names)}")
    print("\nFeature names:")
    for i, name in enumerate(feature_names, 1):
        print(f"  {i}. {name}")


def main():
    """Main demo function"""
    print("\n")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║                                                           ║")
    print("║   Network Intrusion Detection System (NIDS) - DEMO       ║")
    print("║   ML-based Network Security Monitoring                   ║")
    print("║                                                           ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print("\n")
    
    try:
        # Test feature extraction
        test_feature_extraction()
        
        # Wait a moment
        time.sleep(1)
        
        # Simulate traffic
        simulate_network_traffic()
        
        print("\n" + "="*60)
        print("Demo completed successfully!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\nError during demo: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
