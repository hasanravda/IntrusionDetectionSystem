#!/usr/bin/env python3
"""
Example: Real-time Alert Monitoring

This example demonstrates how to monitor alerts in real-time
and perform custom actions when threats are detected.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from queue import Queue
import time
from nids.packet_capture import PacketCapture
from nids.detection_engine import DetectionEngine
from nids.intrusion_prevention import IntrusionPrevention


def alert_handler(alert):
    """Custom alert handler function"""
    print(f"\n🚨 ALERT #{alert['alert_id']}")
    print(f"   Severity: {alert['severity']}")
    print(f"   Source: {alert['source_ip']}:{alert['source_port']}")
    print(f"   Destination: {alert['destination_ip']}:{alert['destination_port']}")
    print(f"   Protocol: {alert['protocol']}")
    print(f"   Confidence: {alert['probability']:.2%}")
    print(f"   Description: {alert['description']}")
    
    # Custom action based on severity
    if alert['severity'] == 'CRITICAL':
        print("   ⚠️  CRITICAL THREAT - Immediate action required!")
        # Add custom action here (e.g., send email, trigger webhook, etc.)
    elif alert['severity'] == 'HIGH':
        print("   ⚠️  HIGH THREAT - Investigation recommended")


def main():
    print("="*60)
    print("Real-time Alert Monitoring Example")
    print("="*60)
    print("\nNote: This requires root/sudo privileges for packet capture")
    print("Press Ctrl+C to stop\n")
    
    # Initialize components
    packet_queue = Queue()
    capture = PacketCapture(interface=None, packet_queue=packet_queue)
    detection = DetectionEngine(threshold=0.7)
    prevention = IntrusionPrevention(auto_block=False)  # Manual blocking
    
    try:
        # Start capture
        print("Starting packet capture...")
        capture.start_capture()
        
        # Start detection
        print("Starting detection engine...")
        detection.start(packet_queue)
        
        print("Monitoring for threats...\n")
        
        alert_count = 0
        
        # Monitor alerts
        while True:
            # Check for new alerts
            if not detection.alert_queue.empty():
                alert = detection.alert_queue.get()
                alert_count += 1
                
                # Process alert with custom handler
                alert_handler(alert)
                
                # Ask user if they want to block the IP
                source_ip = alert['source_ip']
                if source_ip and source_ip != 'Unknown':
                    response = input(f"\n   Block {source_ip}? (y/n): ")
                    if response.lower() == 'y':
                        if prevention.block_ip(source_ip, alert['severity']):
                            print(f"   ✓ IP {source_ip} blocked")
                        else:
                            print(f"   ✗ Failed to block IP {source_ip}")
            
            # Display stats every 10 seconds
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\nStopping monitoring...")
    except PermissionError:
        print("\n❌ Error: Packet capture requires root privileges")
        print("Run with: sudo python3 alert_monitoring.py")
    finally:
        capture.stop_capture()
        detection.stop()
        
        # Final statistics
        stats = detection.get_stats()
        print(f"\n{'='*60}")
        print("Session Summary")
        print(f"{'='*60}")
        print(f"Total packets analyzed: {stats['total_packets']}")
        print(f"Normal traffic: {stats['normal_packets']}")
        print(f"Malicious traffic: {stats['malicious_packets']}")
        print(f"Alerts generated: {stats['alerts_generated']}")
        print(f"IPs blocked: {len(prevention.get_blocked_ips())}")
        print(f"{'='*60}")


if __name__ == '__main__':
    main()
