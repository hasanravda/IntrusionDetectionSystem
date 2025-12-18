#!/usr/bin/env python3
"""
Example: Basic Network Traffic Detection

This example demonstrates how to use the NIDS library to perform
basic network traffic detection programmatically.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from queue import Queue
from nids.packet_capture import PacketCapture, extract_packet_info
from nids.feature_extraction import FeatureExtractor
from nids.ml_model import NIDSModel
import time


def packet_callback(packet):
    """Callback function for each captured packet"""
    info = extract_packet_info(packet)
    print(f"Captured: {info['protocol']} {info['src_ip']}:{info['src_port']} -> "
          f"{info['dst_ip']}:{info['dst_port']}")


def main():
    print("="*60)
    print("Basic Network Traffic Detection Example")
    print("="*60)
    
    # Initialize components
    packet_queue = Queue()
    capture = PacketCapture(interface=None, packet_queue=packet_queue)
    extractor = FeatureExtractor()
    model = NIDSModel()
    
    # Load or create model
    try:
        model.load()
        print("✓ Model loaded successfully")
    except:
        print("Creating default model...")
        model._create_default_model()
    
    # Start capturing (note: requires root privileges for real capture)
    print("\nStarting packet capture...")
    print("Note: This requires root/sudo privileges")
    print("Press Ctrl+C to stop\n")
    
    try:
        capture.start_capture(packet_callback=packet_callback)
        
        # Process packets for detection
        packet_count = 0
        malicious_count = 0
        
        while packet_count < 100:  # Process 100 packets
            if not packet_queue.empty():
                packet = packet_queue.get()
                
                # Extract features
                features = extractor.extract_features(packet)
                
                # Predict
                prediction = model.predict(features)
                probability = model.predict_proba(features)
                
                # Display results
                if prediction == 1:
                    malicious_count += 1
                    print(f"  ⚠️  MALICIOUS traffic detected (confidence: {probability:.2%})")
                
                packet_count += 1
            
            time.sleep(0.1)
        
        # Summary
        print(f"\n{'='*60}")
        print(f"Processed {packet_count} packets")
        print(f"Normal: {packet_count - malicious_count}")
        print(f"Malicious: {malicious_count}")
        print(f"{'='*60}")
        
    except KeyboardInterrupt:
        print("\nStopping...")
    except PermissionError:
        print("\n❌ Error: Packet capture requires root privileges")
        print("Run with: sudo python3 basic_detection.py")
    finally:
        capture.stop_capture()
        print("Capture stopped")


if __name__ == '__main__':
    main()
