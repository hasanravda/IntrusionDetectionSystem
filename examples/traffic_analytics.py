#!/usr/bin/env python3
"""
Example: Traffic Analytics and Visualization

This example demonstrates how to collect and analyze
network traffic statistics programmatically.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from queue import Queue
import time
from nids.packet_capture import PacketCapture, extract_packet_info
from nids.analytics import Analytics


def display_live_stats(analytics, capture):
    """Display live statistics"""
    print("\033[2J\033[H")  # Clear screen
    print("="*60)
    print("LIVE NETWORK TRAFFIC ANALYTICS")
    print("="*60)
    
    # Packet count
    print(f"\nTotal packets captured: {capture.get_packet_count()}")
    
    # Protocol distribution
    protocols = analytics.get_protocol_distribution()
    if protocols:
        print("\nProtocol Distribution:")
        total = sum(protocols.values())
        for proto, count in sorted(protocols.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total) * 100
            bar = "█" * int(percentage / 2)
            print(f"  {proto:10} {count:6} [{bar:50}] {percentage:.1f}%")
    
    # Top sources
    top_sources = analytics.get_top_sources(5)
    if top_sources:
        print("\nTop 5 Source IPs:")
        for ip, count in top_sources:
            print(f"  {ip:20} {count:6} packets")
    
    # Top destinations
    top_dests = analytics.get_top_destinations(5)
    if top_dests:
        print("\nTop 5 Destination IPs:")
        for ip, count in top_dests:
            print(f"  {ip:20} {count:6} packets")
    
    # Alert statistics
    alert_dist = analytics.get_alert_severity_distribution()
    if alert_dist:
        print("\nAlert Severity Distribution:")
        for severity, count in sorted(alert_dist.items(), key=lambda x: x[1], reverse=True):
            print(f"  {severity:10} {count:6}")
    
    print("\n" + "="*60)
    print("Press Ctrl+C to stop and save report")
    print("="*60)


def packet_analytics_callback(packet, analytics):
    """Callback to update analytics"""
    info = extract_packet_info(packet)
    analytics.update_traffic_stats(info)


def main():
    print("="*60)
    print("Traffic Analytics Example")
    print("="*60)
    print("\nCollecting network traffic statistics...")
    print("Note: Requires root/sudo privileges")
    print("Press Ctrl+C to stop\n")
    
    # Initialize components
    packet_queue = Queue()
    capture = PacketCapture(interface=None, packet_queue=packet_queue)
    analytics = Analytics()
    
    try:
        # Start capture
        capture.start_capture()
        
        last_update = time.time()
        update_interval = 2  # Update display every 2 seconds
        
        while True:
            # Process packets from queue
            while not packet_queue.empty():
                packet = packet_queue.get()
                packet_analytics_callback(packet, analytics)
            
            # Update display periodically
            current_time = time.time()
            if current_time - last_update >= update_interval:
                display_live_stats(analytics, capture)
                last_update = current_time
            
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\n\nStopping analytics collection...")
    except PermissionError:
        print("\n❌ Error: Requires root privileges")
        print("Run with: sudo python3 traffic_analytics.py")
    finally:
        capture.stop_capture()
        
        # Final summary
        print("\n" + "="*60)
        print("Final Statistics")
        print("="*60)
        
        analytics.print_summary()
        
        # Save report
        analytics.save_report('traffic_analytics_report.json')
        print("\n✓ Report saved to: logs/traffic_analytics_report.json")


if __name__ == '__main__':
    main()
