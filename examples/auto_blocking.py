#!/usr/bin/env python3
"""
Example: Automated IP Blocking with Custom Rules

This example shows how to implement custom blocking rules
and automated threat response.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from queue import Queue
import time
from collections import defaultdict
from nids.packet_capture import PacketCapture
from nids.detection_engine import DetectionEngine
from nids.intrusion_prevention import IntrusionPrevention


class CustomThreatResponse:
    """Custom threat response with advanced rules"""
    
    def __init__(self):
        self.ip_threat_scores = defaultdict(float)
        self.ip_first_seen = {}
        self.blocked_ips = set()
        
    def calculate_threat_score(self, alert):
        """Calculate threat score based on alert properties"""
        score = 0.0
        
        # Base score from confidence
        score += alert['probability'] * 10
        
        # Severity multiplier
        severity_weights = {
            'CRITICAL': 5.0,
            'HIGH': 3.0,
            'MEDIUM': 2.0,
            'LOW': 1.0
        }
        score *= severity_weights.get(alert['severity'], 1.0)
        
        # Protocol-based scoring
        if alert['protocol'] == 'TCP':
            # Check for suspicious ports
            dst_port = alert.get('destination_port', 0)
            if dst_port in [22, 23, 3389]:  # SSH, Telnet, RDP
                score += 5.0
            elif dst_port < 1024:  # Privileged ports
                score += 2.0
        
        return score
    
    def should_block(self, ip, current_score):
        """Determine if IP should be blocked"""
        total_score = self.ip_threat_scores[ip]
        
        # Block if total threat score exceeds threshold
        if total_score >= 50.0:
            return True, "High cumulative threat score"
        
        # Block if single alert is critical
        if current_score >= 40.0:
            return True, "Critical threat detected"
        
        # Block if multiple alerts in short time
        alert_count = len([s for s in self.ip_threat_scores if s == ip])
        if alert_count >= 5:
            return True, "Repeated suspicious activity"
        
        return False, None
    
    def process_alert(self, alert, prevention):
        """Process alert with custom rules"""
        source_ip = alert.get('source_ip')
        
        if not source_ip or source_ip == 'Unknown':
            return
        
        # Track first seen time
        if source_ip not in self.ip_first_seen:
            self.ip_first_seen[source_ip] = time.time()
        
        # Calculate threat score
        threat_score = self.calculate_threat_score(alert)
        self.ip_threat_scores[source_ip] += threat_score
        
        # Log threat assessment
        print(f"\n📊 Threat Assessment for {source_ip}")
        print(f"   Current score: {threat_score:.2f}")
        print(f"   Cumulative score: {self.ip_threat_scores[source_ip]:.2f}")
        print(f"   Alert severity: {alert['severity']}")
        
        # Check if blocking is needed
        should_block, reason = self.should_block(source_ip, threat_score)
        
        if should_block and source_ip not in self.blocked_ips:
            print(f"   🚫 BLOCKING {source_ip}: {reason}")
            if prevention.block_ip(source_ip, alert['severity']):
                self.blocked_ips.add(source_ip)
                print(f"   ✓ IP blocked successfully")
            else:
                print(f"   ✗ Failed to block IP")
        elif should_block:
            print(f"   ℹ️  IP already blocked")
        else:
            print(f"   ✓ Below blocking threshold")


def main():
    print("="*60)
    print("Automated IP Blocking with Custom Rules Example")
    print("="*60)
    print("\nCustom Rules:")
    print("  • Block if cumulative threat score >= 50")
    print("  • Block if single critical threat (score >= 40)")
    print("  • Block if 5+ alerts from same IP")
    print("  • Higher scores for attacks on sensitive ports")
    print("\nNote: Requires root/sudo privileges")
    print("Press Ctrl+C to stop\n")
    
    # Initialize components
    packet_queue = Queue()
    capture = PacketCapture(interface=None, packet_queue=packet_queue)
    detection = DetectionEngine(threshold=0.65)  # Lower threshold
    prevention = IntrusionPrevention(auto_block=False)  # Manual control
    threat_response = CustomThreatResponse()
    
    try:
        # Start systems
        print("Starting packet capture...")
        capture.start_capture()
        
        print("Starting detection engine...")
        detection.start(packet_queue)
        
        print("Monitoring with custom rules...\n")
        
        # Main monitoring loop
        while True:
            # Process alerts
            if not detection.alert_queue.empty():
                alert = detection.alert_queue.get()
                threat_response.process_alert(alert, prevention)
            
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n\nStopping...")
    except PermissionError:
        print("\n❌ Error: Requires root privileges")
        print("Run with: sudo python3 auto_blocking.py")
    finally:
        capture.stop_capture()
        detection.stop()
        
        # Summary
        print(f"\n{'='*60}")
        print("Session Summary")
        print(f"{'='*60}")
        print(f"Total IPs tracked: {len(threat_response.ip_threat_scores)}")
        print(f"IPs blocked: {len(threat_response.blocked_ips)}")
        
        if threat_response.blocked_ips:
            print("\nBlocked IPs:")
            for ip in threat_response.blocked_ips:
                score = threat_response.ip_threat_scores[ip]
                print(f"  • {ip} (threat score: {score:.2f})")
        
        print(f"{'='*60}")


if __name__ == '__main__':
    main()
